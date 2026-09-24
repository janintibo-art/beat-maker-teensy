import React, { useState, useEffect, useRef } from 'react';

export default function Simulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [pads, setPads] = useState(Array(16).fill(false));
  const [currentStep, setCurrentStep] = useState(0);
  const audioContextRef = useRef(null);
  const scheduleRef = useRef(null);

  const noteFrequencies = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
  };

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

  return (
    <div className="simulator-container">
      <h2>🎮 Interactive Simulator</h2>

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
              {isRunning ? '⏸️ Stop' : '▶️ Play'}
            </button>
          </div>

          <div style={{ textAlign: 'right', color: '#00d9ff' }}>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>Current Step</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentStep + 1} / 16</p>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>16-Step Sequencer</h3>
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
        <button onClick={clearGrid}>🗑️ Clear</button>
        <button onClick={randomize}>🎲 Randomize</button>
      </div>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>📖 How to Use</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Click pads</strong> to enable/disable steps</li>
          <li><strong>Play button</strong> starts/stops the sequencer</li>
          <li><strong>Tempo slider</strong> adjusts playback speed</li>
          <li><strong>Clear button</strong> resets all steps</li>
          <li><strong>Randomize button</strong> generates random patterns</li>
        </ul>
      </div>
    </div>
  );
}
