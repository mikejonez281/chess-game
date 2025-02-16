import React, { useState, useEffect } from "react";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";

function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [aiThinking, setAiThinking] = useState(false);

  const makeAIMove = () => {
    setTimeout(() => {
      setGame((prevGame) => {
        const gameCopy = new Chess(prevGame.fen());
  
        // 🛑 Ensure it's AI's turn before making a move
        if (gameCopy.turn() !== "b") {
          console.warn("🛑 AI should only move as Black!");
          setAiThinking(false); // Unlock player if AI cannot move
          return prevGame;
        }
  
        const possibleMoves = gameCopy.moves();
  
        // 🛑 If no moves are available, stop and unlock player
        if (!possibleMoves.length) {
          console.warn("⚠️ No legal moves available. Game over?");
          setAiThinking(false);
          return prevGame;
        }
  
        // AI selects a random move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        gameCopy.move(randomMove);
  
        console.log(`🤖 AI played: ${randomMove}`);
  
        // ✅ Unlock player moves after AI plays
        setAiThinking(false);
  
        return gameCopy;
      });
    }, 500);
  };
  
  

  const onDrop = ({ sourceSquare, targetSquare }) => {
    try {
      if (aiThinking) {
        console.warn("🚫 AI is thinking. Please wait.");
        return;
      }
  
      setGame((prevGame) => {
        const gameCopy = new Chess(prevGame.fen());
  
        // 🛑 Ensure it's White's turn before allowing a move
        if (gameCopy.turn() !== "w") {
          console.warn("🚫 It's not your turn!");
          return prevGame;
        }
  
        // 🛑 Validate move by checking if (from, to) exists in legal moves
        const possibleMoves = gameCopy.moves({ verbose: true });
        const isValidMove = possibleMoves.some(
          (move) => move.from === sourceSquare && move.to === targetSquare
        );
  
        if (!isValidMove) {
          console.warn(`⚠️ Invalid move: ${sourceSquare} -> ${targetSquare}`);
          return prevGame; // Prevents runtime errors
        }
  
        // Make the move
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Always promote to queen
        });
  
        console.log(`✅ Player moved: ${move.san}`);
  
        // ✅ Lock player moves, AI is now thinking
        setAiThinking(true);
  
        // AI moves after a delay
        setTimeout(() => makeAIMove(), 500);
  
        return gameCopy;
      });
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
