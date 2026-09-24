import React, { useState } from 'react';

const DEFAULT_CODE = `#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <SerialFlash.h>

// GUItool: begin automatically generated code
AudioSynthWaveform      waveform1;
AudioSynthWaveform      waveform2;
AudioMixer4              mixer1;
AudioMixer4              mixer2;
AudioOutputI2S           i2s1;

AudioConnection patchCord1(waveform1, 0, mixer1, 0);
AudioConnection patchCord2(waveform2, 0, mixer1, 1);
AudioConnection patchCord3(mixer1, 0, i2s1, 0);
AudioConnection patchCord4(mixer1, 0, i2s1, 1);

AudioControlSGTL5000 sgtl5000_1;
// GUItool: end automatically generated code

void setup() {
  Serial.begin(115200);

  AudioMemory(120);

  sgtl5000_1.enable();
  sgtl5000_1.volume(0.5);

  waveform1.begin(WAVEFORM_SINE);
  waveform1.frequency(440);
  waveform1.amplitude(0.3);

  waveform2.begin(WAVEFORM_SQUARE);
  waveform2.frequency(880);
  waveform2.amplitude(0.2);

  mixer1.gain(0, 0.5);
  mixer1.gain(1, 0.5);
}

void loop() {
  delay(100);
}`;

export default function CodeEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState('');
  const [board, setBoard] = useState('teensy41');

  const handleCompile = async () => {
    setStatus('⏳ Compilation en cours...');
    try {
      if (window.teensyAPI) {
        const result = await window.teensyAPI.compileSketch(code, board);
        setStatus('✅ Compilation réussie !');
      }
    } catch (error) {
      setStatus('❌ Échec de la compilation : ' + error.message);
    }
  };

  const handleUpload = async () => {
    setStatus('⏳ Téléversement vers le Teensy...');
    try {
      if (window.teensyAPI) {
        const result = await window.teensyAPI.uploadTeensy(code, board);
        setStatus('✅ Téléversement réussi !');
      }
    } catch (error) {
      setStatus('❌ Échec du téléversement : ' + error.message);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setStatus('');
  };

  return (
    <div className="editor-container">
      <div className="editor-panel">
        <h3>⚙️ Éditeur de code</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#00d9ff', marginRight: '1rem' }}>
            Carte :
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              style={{
                marginLeft: '0.5rem',
                padding: '0.3rem',
                background: '#0a0e27',
                color: '#00d9ff',
                border: '1px solid #00d9ff',
                borderRadius: '3px'
              }}
            >
              <option value="teensy41">Teensy 4.1</option>
              <option value="teensy40">Teensy 4.0</option>
              <option value="teensy36">Teensy 3.6</option>
              <option value="teensy35">Teensy 3.5</option>
            </select>
          </label>
        </div>
        <textarea
          className="code-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
        <div className="button-group">
          <button onClick={handleCompile}>🔨 Compiler</button>
          <button onClick={handleUpload}>🚀 Téléverser</button>
          <button onClick={handleReset}>🔄 Réinitialiser</button>
        </div>
      </div>

      <div className="editor-panel">
        <h3>📊 Référence et sortie</h3>
        <div style={{
          flex: 1,
          background: '#0a0e27',
          border: '1px solid #333',
          borderRadius: '5px',
          padding: '1rem',
          overflow: 'auto',
          marginBottom: '1rem'
        }}>
          <div style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            <p><strong>Référence bibliothèque audio :</strong></p>
            <p>• AudioSynthWaveform - Génère des ondes sinus/carrées</p>
            <p>• AudioSynthNoisePink - Générateur de bruit rose</p>
            <p>• AudioMixer4 - Mixe jusqu'à 4 entrées audio</p>
            <p>• AudioOutputI2S - Sortie via I2S (DAC)</p>
            <p>• AudioControlSGTL5000 - Contrôle du codec audio</p>
            <br />
            <p><strong>Fréquences courantes (Hz) :</strong></p>
            <p>• C4 : 262 | D4 : 294 | E4 : 330 | F4 : 349</p>
            <p>• G4 : 392 | A4 : 440 | B4 : 494 | C5 : 523</p>
            <br />
            <p><strong>Formes d'onde :</strong></p>
            <p>• WAVEFORM_SINE</p>
            <p>• WAVEFORM_SQUARE</p>
            <p>• WAVEFORM_SAWTOOTH</p>
            <p>• WAVEFORM_TRIANGLE</p>
          </div>
        </div>

        {status && (
          <div className={`status ${
            status.includes('✅') ? 'success' :
            status.includes('❌') ? 'error' :
            'info'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
