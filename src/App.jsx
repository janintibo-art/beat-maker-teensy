import React, { useState } from 'react';
import './App.css';
import Tutorial from './pages/Tutorial';
import CodeEditor from './pages/CodeEditor';
import Simulator from './pages/Simulator';
import Components from './pages/Components';

function App() {
  const [currentPage, setCurrentPage] = useState('tutorials');
  const [tutorials] = useState([
    {
      id: 1,
      title: 'Getting Started with Teensy',
      description: 'Learn the basics of Teensy microcontroller',
      content: 'Teensy is a complete USB-based microcontroller development system...',
      components: ['Teensy 4.1', 'USB Cable'],
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'Build Your First Drum Machine',
      description: 'Create a simple 4-step drum machine',
      content: 'In this tutorial, you will build a basic drum machine...',
      components: ['Teensy 4.1', 'Audio Jack', 'Capacitors', 'Resistors'],
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      title: 'Add MIDI Support',
      description: 'Control your drum machine with MIDI',
      content: 'MIDI (Musical Instrument Digital Interface) allows...',
      components: ['Teensy 4.1', 'MIDI Jack', 'Resistors'],
      difficulty: 'Advanced'
    },
  ]);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">🥁 Beat Maker Teensy</div>
        <ul className="nav-menu">
          <li>
            <button
              className={currentPage === 'tutorials' ? 'active' : ''}
              onClick={() => setCurrentPage('tutorials')}
            >
              📚 Tutorials
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'editor' ? 'active' : ''}
              onClick={() => setCurrentPage('editor')}
            >
              ⚙️ Code Editor
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'simulator' ? 'active' : ''}
              onClick={() => setCurrentPage('simulator')}
            >
              🎮 Simulator
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'components' ? 'active' : ''}
              onClick={() => setCurrentPage('components')}
            >
              🔧 Components
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {currentPage === 'tutorials' && <Tutorial tutorials={tutorials} />}
        {currentPage === 'editor' && <CodeEditor />}
        {currentPage === 'simulator' && <Simulator />}
        {currentPage === 'components' && <Components />}
      </main>
    </div>
  );
}

export default App;
