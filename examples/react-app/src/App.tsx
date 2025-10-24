import React from "react";
import { createPersister } from "qortex-react/persister";
import "./App.css";




export default function App() {
  const persister = createPersister('local');

  return (
    <div className="app">
      <h1>D-Query Test App</h1>


      <div style={{ marginBottom: '20px' }}>
        <h2>Component 1 (First, Enabled)</h2>
      </div>

    </div>
  );
}
