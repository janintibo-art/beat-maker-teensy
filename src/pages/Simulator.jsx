import React, { useState, useEffect, useRef } from 'react';

const AUTOSAVE_KEY = 'beat-maker-teensy-autosave';

export default function Simulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [pads, setPads] = useState(Array(16).fill(false));
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('mon-pattern');
  const [saveStatus, setSaveStatus] = useState('');
  const audioContextRef = useRef(null);
  const scheduleRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  const noteFrequencies = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
  };

  // --- AUTOSAVE: load on mount ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.pads) && data.pads.length === 16) {
          setPads(data.pads);
        }
        if (typeof data.tempo === 'number') {
          setTempo(data.tempo);
        }
        if (data.name) {
          setProjectName(data.name);
        }
      }
    } catch (err) {
      // Ignore corrupted autosave data
    } finally {
      hasLoadedRef.current = true;
    }
  }, []);

  // --- AUTOSAVE: save on every change (debounced) ---
  useEffect(() => {
    if (!hasLoadedRef.current) return; // Don't overwrite before initial load completes

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data = {
          name: projectName,
          tempo: tempo,
          pads: pads,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        setSaveStatus('💾 Sauvegardé automatiquement');
        setTimeout(() => setSaveStatus(''), 1500);
      } catch (err) {
        // localStorage might be unavailable (private mode, quota, etc.) - fail silently
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [pads, tempo, projectName]);

  const playNote = (frequency, duration = 0.1) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  };

  useEffect(() => {
    if (!isRunning) {
      if (scheduleRef.current) clearInterval(scheduleRef.current);
      return;
    }

    const stepDuration = (60 / tempo / 4) * 1000;

    scheduleRef.current = setInterval(() => {
      setCurrentStep(step => {
        const nextStep = (step + 1) % 16;

        if (pads[nextStep]) {
          const noteIndex = Math.floor(nextStep / 4) % Object.keys(noteFrequencies).length;
          const notes = Object.keys(noteFrequencies);
          playNote(noteFrequencies[notes[noteIndex]], 0.1);
        }

        return nextStep;
      });
    }, stepDuration);

    return () => {
      if (scheduleRef.current) clearInterval(scheduleRef.current);
    };
  }, [isRunning, tempo, pads]);

  const togglePad = (index) => {
    const newPads = [...pads];
    newPads[index] = !newPads[index];
    setPads(newPads);
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  const clearGrid = () => {
    setPads(Array(16).fill(false));
    setCurrentStep(0);
  };

  const randomize = () => {
    const newPads = Array(16).fill(false).map(() => Math.random() > 0.5);
    setPads(newPads);
  };

  // --- EXPORT ---
  const exportProject = () => {
    const projectData = {
      appName: 'beat-maker-teensy',
      version: '1.0',
      name: projectName || 'mon-pattern',
      tempo: tempo,
      pads: pads,
      createdAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- IMPORT ---
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!Array.isArray(data.pads) || data.pads.length !== 16) {
          alert('Fichier invalide : le pattern doit contenir 16 pas.');
          return;
        }

        setPads(data.pads);
        setTempo(typeof data.tempo === 'number' ? data.tempo : 120);
        setProjectName(data.name || 'pattern-importe');
        setCurrentStep(0);
        setIsRunning(false);
      } catch (err) {
        alert('Erreur : ce fichier n\'est pas un projet valide (JSON invalide).');
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported later if needed
    event.target.value = '';
  };

  return (
    <div className="simulator-container">
      <h2>🎮 Simulateur interactif</h2>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem' }}>
              Tempo (BPM)
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{tempo} BPM</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={togglePlay} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              {isRunning ? '⏸️ Stop' : '▶️ Lecture'}
            </button>
          </div>

          <div style={{ textAlign: 'right', color: '#00d9ff' }}>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>Pas actuel</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentStep + 1} / 16</p>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>Séquenceur 16 pas</h3>
      <div className="simulator-grid">
        {pads.map((isPad, idx) => (
          <div
            key={idx}
            className={`pad ${isPad ? 'active' : ''} ${idx === currentStep ? 'active' : ''}`}
            onClick={() => togglePad(idx)}
            style={{
              opacity: idx === currentStep && isRunning ? 1 : 0.8,
              boxShadow: idx === currentStep && isRunning ? 'inset 0 0 20px rgba(0, 217, 255, 0.5)' : 'none'
            }}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      <div className="button-group" style={{ marginTop: '2rem' }}>
        <button onClick={clearGrid}>🗑️ Effacer</button>
        <button onClick={randomize}>🎲 Aléatoire</button>
      </div>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#00d9ff', margin: 0 }}>💾 Sauvegarder / Charger un projet</h3>
          <span style={{ color: '#4ade80', fontSize: '0.85rem', opacity: saveStatus ? 1 : 0, transition: 'opacity 0.3s' }}>
            {saveStatus}
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem' }}>
            Nom du projet
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="mon-pattern"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #00d9ff',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff'
            }}
          />
        </div>

        <div className="button-group">
          <button onClick={exportProject}>💾 Exporter (.json)</button>
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
          Votre pattern est sauvegardé automatiquement sur cet appareil (même après fermeture de l'app).
          Utilisez "Exporter" pour le transférer vers un autre appareil (PC ↔ téléphone).
        </p>
      </div>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>📖 Comment utiliser</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Cliquez sur les pads</strong> pour activer/désactiver les pas</li>
          <li><strong>Le bouton Lecture</strong> démarre/arrête le séquenceur</li>
          <li><strong>Le curseur de tempo</strong> ajuste la vitesse de lecture</li>
          <li><strong>Le bouton Effacer</strong> réinitialise tous les pas</li>
          <li><strong>Le bouton Aléatoire</strong> génère un pattern aléatoire</li>
          <li><strong>La sauvegarde automatique</strong> conserve votre travail même après fermeture de l'app</li>
          <li><strong>Exporter/Importer</strong> sauvegarde ou charge votre pattern en fichier .json</li>
        </ul>
      </div>
    </div>
  );
}
