import React, { useState, useRef, useEffect } from 'react';

const AUTOSAVE_KEY = 'beat-maker-teensy-circuit-autosave';

const COMPONENT_LIBRARY = [
  { type: 'teensy41', label: 'Teensy 4.1', color: '#0d6efd', width: 160, height: 70, icon: '🧠' },
  { type: 'speaker', label: 'Haut-parleur', color: '#fd7e14', width: 90, height: 90, icon: '🔊' },
  { type: 'button', label: 'Bouton poussoir', color: '#dc3545', width: 70, height: 70, icon: '🔘' },
  { type: 'potentiometer', label: 'Potentiomètre', color: '#6f42c1', width: 80, height: 80, icon: '🎛️' },
  { type: 'resistor', label: 'Résistance', color: '#c9a06a', width: 90, height: 40, icon: '➖' },
  { type: 'capacitor', label: 'Condensateur', color: '#20c997', width: 60, height: 60, icon: '⏺️' },
  { type: 'led', label: 'LED', color: '#ffc107', width: 50, height: 50, icon: '💡' },
  { type: 'midijack', label: 'Jack MIDI', color: '#6c757d', width: 70, height: 70, icon: '🔌' },
];

let nextId = 1;

export default function CircuitBuilder() {
  const [placed, setPlaced] = useState([]);
  const [circuitName, setCircuitName] = useState('mon-montage');
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragState = useRef(null);
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // --- AUTOSAVE: load on mount ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.components)) {
          setPlaced(data.components);
          const maxId = data.components.reduce((m, c) => Math.max(m, c.id || 0), 0);
          nextId = maxId + 1;
        }
        if (data.name) setCircuitName(data.name);
      }
    } catch (err) {
      // ignore corrupted data
    } finally {
      hasLoadedRef.current = true;
    }
  }, []);

  // --- AUTOSAVE: save on change (debounced) ---
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data = { name: circuitName, components: placed, savedAt: new Date().toISOString() };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        setSaveStatus('💾 Sauvegardé automatiquement');
        setTimeout(() => setSaveStatus(''), 1500);
      } catch (err) {
        // ignore
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [placed, circuitName]);

  const addComponent = (libItem) => {
    const canvas = canvasRef.current;
    const canvasWidth = canvas ? canvas.clientWidth : 600;
    const newItem = {
      id: nextId++,
      type: libItem.type,
      x: Math.max(10, Math.round(canvasWidth / 2 - libItem.width / 2) + (placed.length % 5) * 15),
      y: 20 + (placed.length % 6) * 20,
    };
    setPlaced(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const removeComponent = (id) => {
    setPlaced(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearCanvas = () => {
    if (window.confirm('Effacer tout le montage ?')) {
      setPlaced([]);
      setSelectedId(null);
    }
  };

  // --- Pointer-based drag (works for mouse and touch) ---
  const handlePointerDown = (e, item) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    dragState.current = {
      id: item.id,
      offsetX: e.clientX - canvasRect.left - item.x,
      offsetY: e.clientY - canvasRect.top - item.y,
    };
    setSelectedId(item.id);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const { id, offsetX, offsetY } = dragState.current;
    let newX = e.clientX - canvasRect.left - offsetX;
    let newY = e.clientY - canvasRect.top - offsetY;
    newX = Math.max(0, Math.min(newX, canvasRect.width - 20));
    newY = Math.max(0, Math.min(newY, canvasRect.height - 20));

    setPlaced(prev => prev.map(c => (c.id === id ? { ...c, x: newX, y: newY } : c)));
  };

  const handlePointerUp = () => {
    dragState.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // --- EXPORT ---
  const exportCircuit = () => {
    const data = {
      appName: 'beat-maker-teensy',
      type: 'circuit',
      version: '1.0',
      name: circuitName || 'mon-montage',
      components: placed,
      createdAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name}.circuit.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- IMPORT ---
  const triggerImport = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.components)) {
          alert('Fichier invalide : montage introuvable.');
          return;
        }
        setPlaced(data.components);
        const maxId = data.components.reduce((m, c) => Math.max(m, c.id || 0), 0);
        nextId = maxId + 1;
        setCircuitName(data.name || 'montage-importe');
      } catch (err) {
        alert("Erreur : ce fichier n'est pas un montage valide (JSON invalide).");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="circuit-builder-container">
      <h2>🔧 Constructeur de circuit</h2>
      <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
        Glissez les composants depuis la palette pour visualiser votre montage avant de souder.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        {/* Palette */}
        <div style={{
          background: 'rgba(0, 217, 255, 0.1)',
          padding: '1rem',
          borderRadius: '10px',
        }}>
          <h3 style={{ color: '#00d9ff', fontSize: '1rem', marginBottom: '1rem' }}>Composants</h3>
          {COMPONENT_LIBRARY.map((libItem) => (
            <button
              key={libItem.type}
              onClick={() => addComponent(libItem)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                marginBottom: '0.5rem',
                padding: '0.5rem',
                fontSize: '0.85rem',
                textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${libItem.color}`,
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <span>{libItem.icon}</span>
              <span>{libItem.label}</span>
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '1rem' }}>
            Cliquez pour ajouter un composant, puis glissez-le sur le plan de travail.
          </p>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            position: 'relative',
            background: 'rgba(0,0,0,0.4)',
            border: '2px dashed rgba(0, 217, 255, 0.3)',
            borderRadius: '10px',
            minHeight: '420px',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            if (e.target === canvasRef.current) setSelectedId(null);
          }}
        >
          {placed.length === 0 && (
            <p style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.4,
              textAlign: 'center',
            }}>
              Plan de travail vide.<br />Ajoutez un composant depuis la palette.
            </p>
          )}
          {placed.map((item) => {
            const libItem = COMPONENT_LIBRARY.find(l => l.type === item.type) || COMPONENT_LIBRARY[0];
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item)}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: libItem.width,
                  height: libItem.height,
                  background: libItem.color,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  boxShadow: isSelected ? '0 0 0 3px #00d9ff, 0 4px 10px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.4)',
                  padding: '4px',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{libItem.icon}</span>
                <span>{libItem.label}</span>
                {isSelected && (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(item.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.8rem',
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                    title="Supprimer"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="button-group" style={{ marginTop: '1.5rem' }}>
        <button onClick={clearCanvas}>🗑️ Tout effacer</button>
      </div>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#00d9ff', margin: 0 }}>💾 Sauvegarder / Charger un montage</h3>
          <span style={{ color: '#4ade80', fontSize: '0.85rem', opacity: saveStatus ? 1 : 0, transition: 'opacity 0.3s' }}>
            {saveStatus}
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem' }}>
            Nom du montage
          </label>
          <input
            type="text"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            placeholder="mon-montage"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #00d9ff',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
            }}
          />
        </div>

        <div className="button-group">
          <button onClick={exportCircuit}>💾 Exporter (.json)</button>
          <button onClick={triggerImport}>📂 Importer</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.8rem' }}>
          Votre montage est sauvegardé automatiquement sur cet appareil. Utilisez "Exporter" pour le transférer vers un autre appareil.
        </p>
      </div>
    </div>
  );
}
