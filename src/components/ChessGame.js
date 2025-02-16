import { useState } from "react";
import Chessboard2D from "./Chessboard2D";
import Chessboard3D from "./Chessboard3D";

console.log("✅ ChessGame loaded"); // Add this!

function ChessGame() {
  const [viewMode, setViewMode] = useState("2D");

  return (
    <div>
      <button onClick={() => setViewMode("2D")}>Switch to 2D</button>
      <button onClick={() => setViewMode("3D")}>Switch to 3D</button>

      {viewMode === "2D" ? <Chessboard2D /> : <Chessboard3D />}
    </div>
  );
}

export default ChessGame;
