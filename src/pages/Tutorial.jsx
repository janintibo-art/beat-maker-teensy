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
          ← Retour
        </button>
        <h2>{selectedTutorial.title}</h2>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>{selectedTutorial.description}</p>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="difficulty" style={{
            background: selectedTutorial.difficulty === 'Débutant' ? 'rgba(0, 255, 0, 0.2)' :
                       selectedTutorial.difficulty === 'Intermédiaire' ? 'rgba(255, 200, 0, 0.2)' :
                       'rgba(255, 0, 0, 0.2)',
            color: selectedTutorial.difficulty === 'Débutant' ? '#00ff00' :
                   selectedTutorial.difficulty === 'Intermédiaire' ? '#ffc800' :
                   '#ff0000'
          }}>
            {selectedTutorial.difficulty}
          </span>
        </div>

        <div className="components-list">
          <h4>📦 Composants nécessaires :</h4>
          <ul>
            {selectedTutorial.components.map((comp, idx) => (
              <li key={idx}>{comp}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem', lineHeight: '1.6' }}>
          <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>Contenu :</h3>
          <p>{selectedTutorial.content}</p>

          <h3 style={{ color: '#00d9ff', marginTop: '2rem', marginBottom: '1rem' }}>Étapes suivantes :</h3>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Rassemblez tous les composants nécessaires</li>
            <li style={{ marginBottom: '0.5rem' }}>Consultez le schéma dans la section Composants</li>
            <li style={{ marginBottom: '0.5rem' }}>Copiez le code depuis l'Éditeur de code</li>
            <li style={{ marginBottom: '0.5rem' }}>Téléversez-le sur votre carte Teensy</li>
            <li>Testez d'abord dans le Simulateur</li>
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
            background: tutorial.difficulty === 'Débutant' ? 'rgba(0, 255, 0, 0.2)' :
                       tutorial.difficulty === 'Intermédiaire' ? 'rgba(255, 200, 0, 0.2)' :
                       'rgba(255, 0, 0, 0.2)',
            color: tutorial.difficulty === 'Débutant' ? '#00ff00' :
                   tutorial.difficulty === 'Intermédiaire' ? '#ffc800' :
                   '#ff0000'
          }}>
            {tutorial.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
