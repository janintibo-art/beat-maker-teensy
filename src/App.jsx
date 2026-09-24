import React, { useState } from "react";
import "./App.css";
import Tutorial from "./pages/Tutorial";
import CodeEditor from "./pages/CodeEditor";
import Simulator from "./pages/Simulator";
import Components from "./pages/Components";
import CircuitBuilder from "./pages/CircuitBuilder";

function App() {
  const [currentPage, setCurrentPage] = useState("tutorials");
  const [tutorials] = useState([
    {
      id: 1,
      title: "Premiers pas avec Teensy",
      description: "Apprenez les bases du microcontrôleur Teensy",
      content: "Le Teensy est un système de développement complet à base de microcontrôleur, connecté en USB...",
      components: ["Teensy 4.1", "Câble USB"],
      difficulty: "Débutant"
    },
    {
      id: 2,
      title: "Construisez votre première boîte à rythme",
      description: "Créez une boîte à rythme simple à 4 pas",
      content: "Dans ce tutoriel, vous allez construire une boîte à rythme basique...",
      components: ["Teensy 4.1", "Jack audio", "Condensateurs", "Résistances"],
      difficulty: "Intermédiaire"
    },
    {
      id: 3,
      title: "Ajouter le support MIDI",
      description: "Contrôlez votre boîte à rythme avec MIDI",
      content: "Le MIDI (Musical Instrument Digital Interface) permet...",
      components: ["Teensy 4.1", "Jack MIDI", "Résistances"],
      difficulty: "Avancé"
    },
  ]);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">🥁 Beat Maker Teensy</div>
        <ul className="nav-menu">
          <li>
            <button
              className={currentPage === "tutorials" ? "active" : ""}
              onClick={() => setCurrentPage("tutorials")}
            >
              📚 Tutoriels
            </button>
          </li>
          <li>
            <button
              className={currentPage === "editor" ? "active" : ""}
              onClick={() => setCurrentPage("editor")}
            >
              ⚙️ Éditeur de code
            </button>
          </li>
          <li>
            <button
              className={currentPage === "simulator" ? "active" : ""}
              onClick={() => setCurrentPage("simulator")}
            >
              🎮 Simulateur
            </button>
          </li>
          <li>
            <button
              className={currentPage === "circuit" ? "active" : ""}
              onClick={() => setCurrentPage("circuit")}
            >
              🔧 Constructeur de circuit
            </button>
          </li>
          <li>
            <button
              className={currentPage === "components" ? "active" : ""}
              onClick={() => setCurrentPage("components")}
            >
              🧰 Composants
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {currentPage === "tutorials" && <Tutorial tutorials={tutorials} />}
        {currentPage === "editor" && <CodeEditor />}
        {currentPage === "simulator" && <Simulator />}
        {currentPage === "circuit" && <CircuitBuilder />}
        {currentPage === "components" && <Components />}
      </main>
    </div>
  );
}

export default App;
