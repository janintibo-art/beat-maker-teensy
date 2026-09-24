import React, { useState, useRef, useEffect } from 'react';

const AUTOSAVE_KEY = 'beat-maker-teensy-circuit-autosave';

// Each component defines pins as fractions of its own width/height,
// so pin dots stay correctly placed regardless of component size.
const COMPONENT_LIBRARY = [
  {
    type: 'teensy41', label: 'Teensy 4.1', color: '#0d6efd', width: 160, height: 70, icon: '🧠',
    pins: [
      { label: 'GND', dxFrac: 0.12, dyFrac: 1 },
      { label: '3V3', dxFrac: 0.38, dyFrac: 1 },
      { label: 'IN', dxFrac: 0.62, dyFrac: 1 },
      { label: 'OUT', dxFrac: 0.88, dyFrac: 1 },
    ],
  },
  {
    type: 'speaker', label: 'Haut-parleur', color: '#fd7e14', width: 90, height: 90, icon: '🔊',
    pins: [
      { label: '+', dxFrac: 0.25, dyFrac: 1 },
      { label: '-', dxFrac: 0.75, dyFrac: 1 },
    ],
  },
  {
    type: 'button', label: 'Bouton poussoir', color: '#dc3545', width: 70, height: 70, icon: '🔘',
    pins: [
      { label: 'A', dxFrac: 0.25, dyFrac: 1 },
      { label: 'B', dxFrac: 0.75, dyFrac: 1 },
    ],
  },
  {
    type: 'potentiometer', label: 'Potentiomètre', color: '#6f42c1', width: 80, height: 80, icon: '🎛️',
    pins: [
      { label: 'GND', dxFrac: 0.15, dyFrac: 1 },
      { label: 'WIP', dxFrac: 0.5, dyFrac: 1 },
      { label: 'VCC', dxFrac: 0.85, dyFrac: 1 },
    ],
  },
  {
    type: 'resistor', label: 'Résistance', color: '#c9a06a', width: 90, height: 40, icon: '➖',
    pins: [
      { label: '1', dxFrac: 0.03, dyFrac: 0.5 },
      { label: '2', dxFrac: 0.97, dyFrac: 0.5 },
    ],
  },
  {
    type: 'capacitor', label: 'Condensateur', color: '#20c997', width: 60, height: 60, icon: '⏺️',
    pins: [
      { label: '+', dxFrac: 0.25, dyFrac: 1 },
      { label: '-', dxFrac: 0.75, dyFrac: 1 },
    ],
  },
  {
    type: 'led', label: 'LED', color: '#ffc107', width: 50, height: 50, icon: '💡',
    pins: [
      { label: '+', dxFrac: 0.3, dyFrac: 1 },
      { label: '-', dxFrac: 0.7, dyFrac: 1 },
    ],
  },
  {
    type: 'midijack', label: 'Jack MIDI', color: '#6c757d', width: 70, height: 70, icon: '🔌',
    pins: [
      { label: 'SIG', dxFrac: 0.3, dyFrac: 1 },
      { label: 'GND', dxFrac: 0.7, dyFrac: 1 },
    ],
  },
];

function getLib(type) {
  return COMPONENT_LIBRARY.find(l => l.type === type) || COMPONENT_LIBRARY[0];
}

function pinAbsolutePosition(component, pinIndex) {
  const lib = getLib(component.type);
  const pin = lib.pins[pinIndex];
  if (!pin) return { x: component.x, y: component.y };
  return {
    x: component.x + pin.dxFrac * lib.width,
    y: component.y + pin.dyFrac * lib.height,
  };
}

let nextId = 1;
let nextWireId = 1;

export default function CircuitBuilder() {
  const [placed, setPlaced] = useState([]);
  const [wires, setWires] = useState([]);
  const [circuitName, setCircuitName] = useState('mon-montage');
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('edit'); // 'edit' | 'simulate'
  const [pendingWire, setPendingWire] = useState(null); // { compId, pinIndex }
  const [pressedButtons, setPressedButtons] = useState(new Set());
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
        if (Array.isArray(data.wires)) {
          setWires(data.wires);
          const maxWireId = data.wires.reduce((m, w) => Math.max(m, w.id || 0), 0);
          nextWireId = maxWireId + 1;
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
        const data = { name: circuitName, components: placed, wires, savedAt: new Date().toISOString() };
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
  }, [placed, wires, circuitName]);

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
    setWires(prev => prev.filter(w => w.from.compId !== id && w.to.compId !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearCanvas = () => {
    if (window.confirm('Effacer tout le montage (composants et fils) ?')) {
      setPlaced([]);
      setWires([]);
      setSelectedId(null);
      setPendingWire(null);
    }
  };

  const removeWire = (wireId) => {
    setWires(prev => prev.filter(w => w.id !== wireId));
  };

  // --- Pointer-based drag for moving components (edit mode only) ---
  const handleComponentPointerDown = (e, item) => {
    if (mode !== 'edit') return;
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

  // --- Wiring (edit mode): click a pin, then click another pin to connect ---
  const handlePinClick = (e, compId, pinIndex) => {
    e.stopPropagation();
    if (mode !== 'edit') return;

    if (!pendingWire) {
      setPendingWire({ compId, pinIndex });
      return;
    }

    if (pendingWire.compId === compId && pendingWire.pinIndex === pinIndex) {
      setPendingWire(null); // clicked same pin again: cancel
      return;
    }

    const newWire = {
      id: nextWireId++,
      from: { compId: pendingWire.compId, pinIndex: pendingWire.pinIndex },
      to: { compId, pinIndex },
    };
    setWires(prev => [...prev, newWire]);
    setPendingWire(null);
  };

  // --- Simulation: pressing a button lights up connected LEDs (component-level connectivity) ---
  const toggleButtonPress = (compId) => {
    if (mode !== 'simulate') return;
    setPressedButtons(prev => {
      const next = new Set(prev);
      if (next.has(compId)) next.delete(compId);
      else next.add(compId);
      return next;
    });
  };

  const litLedIds = React.useMemo(() => {
    if (mode !== 'simulate' || pressedButtons.size === 0) return new Set();
    // Build adjacency graph at component level from wires
    const adjacency = new Map();
    wires.forEach(w => {
      if (!adjacency.has(w.from.compId)) adjacency.set(w.from.compId, new Set());
      if (!adjacency.has(w.to.compId)) adjacency.set(w.to.compId, new Set());
      adjacency.get(w.from.compId).add(w.to.compId);
      adjacency.get(w.to.compId).add(w.from.compId);
    });

    const reached = new Set();
    const queue = [...pressedButtons];
    const visited = new Set(queue);
    while (queue.length) {
      const current = queue.shift();
      const neighbors = adjacency.get(current);
      if (!neighbors) continue;
      neighbors.forEach(n => {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
          const comp = placed.find(c => c.id === n);
          if (comp && comp.type === 'led') reached.add(n);
        }
      });
    }
    return reached;
  }, [mode, pressedButtons, wires, placed]);

  // --- EXPORT ---
  const exportCircuit = () => {
    const data = {
      appName: 'beat-maker-teensy',
      type: 'circuit',
      version: '2.0',
      name: circuitName || 'mon-montage',
      components: placed,
      wires: wires,
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

        const loadedWires = Array.isArray(data.wires) ? data.wires : [];
        setWires(loadedWires);
        const maxWireId = loadedWires.reduce((m, w) => Math.max(m, w.id || 0), 0);
        nextWireId = maxWireId + 1;

        setCircuitName(data.name || 'montage-importe');
        setPendingWire(null);
        setPressedButtons(new Set());
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
      <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
        Glissez les composants depuis la palette, reliez leurs broches avec des fils, puis testez en mode simulation.
      </p>

      <div className="button-group" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => { setMode('edit'); setPressedButtons(new Set()); }}
          style={{ opacity: mode === 'edit' ? 1 : 0.6, fontWeight: mode === 'edit' ? 'bold' : 'normal' }}
        >
          ✏️ Mode édition
        </button>
        <button
          onClick={() => { setMode('simulate'); setPendingWire(null); }}
          style={{ opacity: mode === 'simulate' ? 1 : 0.6, fontWeight: mode === 'simulate' ? 'bold' : 'normal' }}
        >
          🧪 Mode simulation
        </button>
      </div>

      {mode === 'edit' && (
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
          {pendingWire
            ? '🔵 Cliquez sur une deuxième broche pour créer le fil (ou recliquez sur la même pour annuler).'
            : 'Cliquez sur une broche (petit cercle) pour démarrer un fil, glissez un composant pour le déplacer.'}
        </p>
      )}
      {mode === 'simulate' && (
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
          🧪 Cliquez sur un bouton poussoir pour le "presser" — les LED reliées par un chemin de fils s'allument.
        </p>
      )}

      <div className="circuit-layout">
        {/* Palette */}
        <div className="circuit-palette" style={{
          background: 'rgba(0, 217, 255, 0.1)',
          padding: '1rem',
          borderRadius: '10px',
        }}>
          <h3 style={{ color: '#00d9ff', fontSize: '1rem', marginBottom: '1rem' }}>Composants</h3>
          {COMPONENT_LIBRARY.map((libItem) => (
            <button
              key={libItem.type}
              onClick={() => addComponent(libItem)}
              disabled={mode !== 'edit'}
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
                cursor: mode === 'edit' ? 'pointer' : 'not-allowed',
                opacity: mode === 'edit' ? 1 : 0.5,
              }}
            >
              <span>{libItem.icon}</span>
              <span>{libItem.label}</span>
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '1rem' }}>
            Cliquez pour ajouter, puis glissez sur le plan de travail.
          </p>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="circuit-canvas"
          style={{
            position: 'relative',
            background: 'rgba(0,0,0,0.4)',
            border: '2px dashed rgba(0, 217, 255, 0.3)',
            borderRadius: '10px',
            minHeight: '420px',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            if (e.target === canvasRef.current) {
              setSelectedId(null);
              setPendingWire(null);
            }
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

          {/* Wires layer */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {wires.map((wire) => {
              const fromComp = placed.find(c => c.id === wire.from.compId);
              const toComp = placed.find(c => c.id === wire.to.compId);
              if (!fromComp || !toComp) return null;
              const p1 = pinAbsolutePosition(fromComp, wire.from.pinIndex);
              const p2 = pinAbsolutePosition(toComp, wire.to.pinIndex);
              return (
                <g key={wire.id}>
                  <line
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="#00d9ff" strokeWidth="2.5"
                  />
                  {mode === 'edit' && (
                    <circle
                      cx={(p1.x + p2.x) / 2}
                      cy={(p1.y + p2.y) / 2}
                      r="7"
                      fill="#dc3545"
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); removeWire(wire.id); }}
                    />
                  )}
                </g>
              );
            })}
            {pendingWire && (() => {
              const comp = placed.find(c => c.id === pendingWire.compId);
              if (!comp) return null;
              const p = pinAbsolutePosition(comp, pendingWire.pinIndex);
              return <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#4ade80" strokeWidth="2" />;
            })()}
          </svg>

          {placed.map((item) => {
            const libItem = getLib(item.type);
            const isSelected = selectedId === item.id;
            const isPressed = pressedButtons.has(item.id);
            const isLit = litLedIds.has(item.id);
            const isButton = item.type === 'button';
            const isLed = item.type === 'led';

            return (
              <div key={item.id}>
                <div
                  onPointerDown={(e) => handleComponentPointerDown(e, item)}
                  onClick={(e) => {
                    if (mode === 'simulate' && isButton) {
                      e.stopPropagation();
                      toggleButtonPress(item.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: item.x,
                    top: item.y,
                    width: libItem.width,
                    height: libItem.height,
                    background: isLed && isLit ? '#fff3b0' : (isButton && isPressed ? '#ff6b6b' : libItem.color),
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    cursor: mode === 'edit' ? 'grab' : (isButton ? 'pointer' : 'default'),
                    userSelect: 'none',
                    touchAction: 'none',
                    boxShadow: isLit
                      ? '0 0 18px 6px rgba(255, 230, 100, 0.9)'
                      : (isSelected ? '0 0 0 3px #00d9ff, 0 4px 10px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.4)'),
                    padding: '4px',
                    transition: 'background 0.15s, box-shadow 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{libItem.icon}</span>
                  <span>{libItem.label}</span>
                  {isSelected && mode === 'edit' && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); removeComponent(item.id); }}
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

                {/* Pins */}
                {libItem.pins.map((pin, pinIndex) => {
                  const pos = pinAbsolutePosition(item, pinIndex);
                  const isPinPending = pendingWire && pendingWire.compId === item.id && pendingWire.pinIndex === pinIndex;
                  return (
                    <div
                      key={pinIndex}
                      onClick={(e) => handlePinClick(e, item.id, pinIndex)}
                      onPointerDown={(e) => e.stopPropagation()}
                      title={pin.label}
                      style={{
                        position: 'absolute',
                        left: pos.x - 6,
                        top: pos.y - 6,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isPinPending ? '#4ade80' : '#fff',
                        border: '2px solid #00d9ff',
                        cursor: mode === 'edit' ? 'crosshair' : 'default',
                        zIndex: 2,
                      }}
                    />
                  );
                })}
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
          Votre montage (composants + fils) est sauvegardé automatiquement sur cet appareil.
        </p>
      </div>
    </div>
  );
}
