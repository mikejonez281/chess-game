import logo from './logo.svg';
import './App.css';

import ChessGame from "./components/ChessGame";

console.log("✅ App.js loaded"); // Add this!

function App() {
  return (
    <div className="App">
      <h1>React Chess Game</h1>
      <ChessGame />
    </div>
  );
}

export default App;

