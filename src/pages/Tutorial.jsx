import React, { useState } from 'react';

export default function Tutorial({ tutorials }) {
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  if (selectedTutorial) {
    return (
      <div className="tutorial-detail">
        <button
          onClick={() => setSelectedTutorial(null)}
          style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}
        >
          ← Back
        </button>
        <h2>{selectedTutorial.title}</h2>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>{selectedTutorial.description}</p>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="difficulty" style={{
            background: selectedTutorial.difficulty === 'Beginner' ? 'rgba(0, 255, 0, 0.2)' :
                       selectedTutorial.difficulty === 'Intermediate' ? 'rgba(255, 200, 0, 0.2)' :
                       'rgba(255, 0, 0, 0.2)',
            color: selectedTutorial.difficulty === 'Beginner' ? '#00ff00' :
                   selectedTutorial.difficulty === 'Intermediate' ? '#ffc800' :
                   '#ff0000'
          }}>
            {selectedTutorial.difficulty}
          </span>
        </div>

        <div className="components-list">
          <h4>📦 Required Components:</h4>
          <ul>
            {selectedTutorial.components.map((comp, idx) => (
              <li key={idx}>{comp}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem', lineHeight: '1.6' }}>
          <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>Content:</h3>
          <p>{selectedTutorial.content}</p>

          <h3 style={{ color: '#00d9ff', marginTop: '2rem', marginBottom: '1rem' }}>Next Steps:</h3>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Gather all required components</li>
            <li style={{ marginBottom: '0.5rem' }}>Review the schematic in the Components section</li>
            <li style={{ marginBottom: '0.5rem' }}>Copy the code from Code Editor</li>
            <li style={{ marginBottom: '0.5rem' }}>Upload to your Teensy board</li>
            <li>Test in the Simulator first</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-container">
      {tutorials.map((tutorial) => (
        <div
          key={tutorial.id}
          className="tutorial-card"
          onClick={() => setSelectedTutorial(tutorial)}
        >
          <h3>{tutorial.title}</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{tutorial.description}</p>
          <span className="difficulty" style={{
            background: tutorial.difficulty === 'Beginner' ? 'rgba(0, 255, 0, 0.2)' :
                       tutorial.difficulty === 'Intermediate' ? 'rgba(255, 200, 0, 0.2)' :
                       'rgba(255, 0, 0, 0.2)',
            color: tutorial.difficulty === 'Beginner' ? '#00ff00' :
                   tutorial.difficulty === 'Intermediate' ? '#ffc800' :
                   '#ff0000'
          }}>
            {tutorial.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
