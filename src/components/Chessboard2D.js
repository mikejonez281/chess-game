import { useState, useEffect } from 'react';
import Chessground from 'react-chessground';
import 'react-chessground/dist/styles/chessground.css';
import { Chess } from 'chess.js';

function Chessboard2D() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [dests, setDests] = useState(new Map());

  // Calculate legal moves
  const calculateDests = () => {
    const newDests = new Map();
    const moves = game.moves({ verbose: true });
    
    moves.forEach(move => {
      const from = move.from;
      if (!newDests.has(from)) {
        newDests.set(from, []);
      }
      newDests.get(from).push(move.to);
    });
    
    return newDests;
  };

  // AI move function
  const makeAiMove = () => {
    // Get all possible moves
    const moves = game.moves();
    
    // If game is over, do nothing
    if (moves.length === 0) return;
    
    // Make a random move
    const randomIndex = Math.floor(Math.random() * moves.length);
    const move = game.move(moves[randomIndex]);
    
    // Update the board
    setFen(game.fen());
  };

  useEffect(() => {
    setDests(calculateDests());
  }, [fen]);

  const onMove = (from, to) => {
    try {
      const move = game.move({ from, to });
      if (move) {
        setFen(game.fen());
        // Make AI move after a short delay
        setTimeout(makeAiMove, 300);
      }
    } catch (error) {
      console.log('Invalid move:', error);
    }
  };

  return (
    <div style={{ width: '400px', height: '400px' }}>
      <Chessground
        width="100%"
        height="100%"
        fen={fen}
        onMove={onMove}
        movable={{
          free: false,
          color: 'white', // Restrict player to white pieces
          dests: dests,
          showDests: true,
        }}
        turnColor={game.turn() === 'w' ? 'white' : 'black'}
      />
    </div>
  );
}

export default Chessboard2D;