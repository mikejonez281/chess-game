import React, { useState, useEffect } from "react";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";

function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [aiThinking, setAiThinking] = useState(false);

  const makeAIMove = () => {
    const gameCopy = new Chess(game.fen());
    const possibleMoves = gameCopy.legal_moves; // Corrected: no parentheses

    if (possibleMoves.length === 0) return; // Game over

    // Random AI move
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    gameCopy.move(randomMove); // Make the move on the copy of the game state

    setTimeout(() => {
      setGame(gameCopy); // Update the game state
      setAiThinking(false); // AI is done thinking
    }, 500);
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    try {
      const gameCopy = new Chess(game.fen());
      let move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Promote pawns to queens
      });

      if (!move) {
        console.warn(`⚠️ Invalid move: ${sourceSquare} -> ${targetSquare}`);
        return;
      }

      setGame(gameCopy); // Update game state with the player move
      setAiThinking(true); // Set AI thinking state

      // AI moves after a delay
      setTimeout(() => makeAIMove(), 1000);
    } catch (error) {
      console.error("❌ Error processing move:", error);
    }
  };

  return (
    <div className="chessboard-container">
      <Chessboard position={game.fen()} onDrop={onDrop} />
      {aiThinking && <p>🤖 AI is thinking...</p>}
    </div>
  );
}

export default ChessBoard;
