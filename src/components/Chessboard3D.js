import React from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

// Add these helper functions at the top of the file
const positionToSquare = (position) => {
  const file = String.fromCharCode(97 + Math.round(position[0] + 3.5));
  const rank = 8 - Math.round(position[2] + 3.5);
  return `${file}${rank}`;
};

const squareToPosition = (square) => {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1]);
  return [file - 3.5, 0.5, rank - 3.5];
};

// Piece Component with geometric shapes
const Piece = ({ piece, position, onClick, isSelected }) => {
  const color = piece.charAt(0) === 'w' ? '#e6e6e6' : '#333333';
  const pieceType = piece.charAt(1);
  
  const handleClick = (event) => {
    event.stopPropagation();
    onClick();
  };

  // Different geometries for different pieces
  const getPieceGeometry = () => {
    switch(pieceType) {
      case 'P': // Pawn
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.2, 0.25, 0.3, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.3, 0]} onClick={handleClick}>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case 'R': // Rook
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.25, 0.25, 0.4, 4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.4, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case 'N': // Knight
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.25, 0.25, 0.3, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.4, 0.1]} rotation={[-Math.PI / 4, 0, 0]} onClick={handleClick}>
              <coneGeometry args={[0.2, 0.6, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case 'B': // Bishop
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.25, 0.25, 0.3, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.4, 0]} onClick={handleClick}>
              <coneGeometry args={[0.15, 0.8, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.8, 0]} onClick={handleClick}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case 'Q': // Queen
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.4, 0]} onClick={handleClick}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.7, 0]} onClick={handleClick}>
              <coneGeometry args={[0.2, 0.4, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case 'K': // King
        return (
          <group>
            <mesh position={[0, 0, 0]} onClick={handleClick}>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.5, 0]} onClick={handleClick}>
              <boxGeometry args={[0.2, 0.8, 0.2]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.7, 0]} onClick={handleClick}>
              <boxGeometry args={[0.5, 0.15, 0.15]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh onClick={handleClick}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };

  return (
    <group
      position={position}
      scale={isSelected ? 1.2 : 1}
    >
      {getPieceGeometry()}
    </group>
  );
};

function Chessboard3D() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    updatePieces();
  }, [fen]);

  const updatePieces = () => {
    const newPieces = [];
    game.board().forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece) {
          // Calculate the square in chess notation (e.g., 'e2')
          const file = String.fromCharCode(97 + colIndex); // 'a' through 'h'
          const rank = 8 - rowIndex; // 1 through 8
          const square = `${file}${rank}`;
          
          newPieces.push({
            type: piece.color + piece.type.toUpperCase(),
            position: [colIndex - 3.5, 0.5, rowIndex - 3.5],
            square: square
          });
        }
      });
    });
    setPieces(newPieces);
  };

  const makeAIMove = () => {
    setThinking(true);
    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        // Evaluate positions and choose best move
        const move = moves.reduce((best, current) => {
          game.move(current);
          const evaluation = evaluatePosition(game);
          game.undo();
          
          if (!best || evaluation > best.evaluation) {
            return { move: current, evaluation };
          }
          return best;
        }, null);

        game.move(move.move);
        setFen(game.fen());
      }
      setThinking(false);
    }, 500);
  };

  const evaluatePosition = (game) => {
    const pieceValues = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0
    };

    let score = 0;
    
    // Material evaluation
    game.board().forEach(row => {
      row.forEach(piece => {
        if (piece) {
          const value = pieceValues[piece.type.toLowerCase()];
          score += piece.color === 'w' ? -value : value;
        }
      });
    });

    // Position evaluation
    const center = ['d4', 'd5', 'e4', 'e5'];
    center.forEach(square => {
      const piece = game.get(square);
      if (piece) {
        score += piece.color === 'b' ? 0.2 : -0.2;
      }
    });

    return score;
  };

  const handlePieceClick = (piece, position, square) => {
    if (thinking || game.turn() !== 'w') return;

    const clickedSquare = square || positionToSquare(position);
    console.log('Clicked square:', clickedSquare);

    if (selectedPiece) {
      // If clicking the same piece, deselect it
      if (selectedPiece.square === clickedSquare) {
        setSelectedPiece(null);
        return;
      }

      // Try to make the move
      try {
        const move = {
          from: selectedPiece.square,
          to: clickedSquare,
          promotion: 'q'
        };

        console.log('Attempting move:', move);
        const result = game.move(move);
        
        if (result) {
          console.log('Move successful:', result);
          setFen(game.fen());
          updatePieces();
          setSelectedPiece(null);
          setTimeout(() => makeAIMove(), 300);
        } else {
          // If clicking another white piece, select it instead
          if (piece.charAt(0) === 'w') {
            const legalMoves = game.moves({ 
              square: clickedSquare, 
              verbose: true 
            });
            setSelectedPiece({
              type: piece,
              position,
              square: clickedSquare,
              legalMoves
            });
          } else {
            setSelectedPiece(null);
          }
        }
      } catch (error) {
        console.error('Invalid move:', error);
        setSelectedPiece(null);
      }
    } else {
      // Selecting a new piece
      if (piece.charAt(0) === 'w') {
        const legalMoves = game.moves({ 
          square: clickedSquare, 
          verbose: true 
        });
        
        if (legalMoves.length > 0) {
          setSelectedPiece({
            type: piece,
            position,
            square: clickedSquare,
            legalMoves
          });
          console.log('Selected piece:', clickedSquare, 'Legal moves:', legalMoves);
        }
      }
    }
  };

  // Add visual indicators for legal moves
  const LegalMoveIndicator = ({ square }) => {
    const position = squareToPosition(square);
    return (
      <mesh position={[position[0], 0.3, position[2]]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial 
          color="#00ff00" 
          transparent={true} 
          opacity={0.5} 
        />
      </mesh>
    );
  };

  // Add this to make squares clickable for moves
  const SquareOverlay = ({ square, onClick }) => {
    const position = squareToPosition(square);
    return (
      <mesh 
        position={[position[0], 0.27, position[2]]}
        onClick={onClick}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial 
          transparent={true}
          opacity={0.0}
        />
      </mesh>
    );
  };

  // Add this debug log to check squares
  useEffect(() => {
    console.log('Current board state:', game.board());
    console.log('Current pieces:', pieces);
  }, [pieces]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 10, 7], fov: 45 }}
        style={{ background: '#202020' }}
      >
        <PerspectiveCamera makeDefault position={[0, 10, 7]} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <pointLight position={[-5, 8, -5]} intensity={0.5} />
        
        <group position={[0, -1, 0]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[9, 0.5, 9]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          {Array.from({ length: 8 }, (_, i) =>
            Array.from({ length: 8 }, (_, j) => (
              <mesh
                key={`${i}-${j}`}
                position={[
                  i - 3.5,
                  0.26,
                  j - 3.5
                ]}
              >
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial 
                  color={(i + j) % 2 === 0 ? '#ffffff' : '#4d4d4d'} 
                />
              </mesh>
            ))
          )}
        </group>

        {Array.from({ length: 8 }, (_, i) =>
          Array.from({ length: 8 }, (_, j) => {
            const square = `${String.fromCharCode(97 + i)}${8 - j}`;
            return (
              <SquareOverlay
                key={square}
                square={square}
                onClick={(e) => {
                  e.stopPropagation();
                  const piece = pieces.find(p => p.square === square);
                  if (piece) {
                    handlePieceClick(piece.type, piece.position, square);
                  } else if (selectedPiece) {
                    handlePieceClick(null, null, square);
                  }
                }}
              />
            );
          })
        )}

        {selectedPiece?.legalMoves?.map((move, index) => (
          <LegalMoveIndicator key={index} square={move.to} />
        ))}

        {pieces.map((piece, index) => (
          <Piece
            key={index}
            piece={piece.type}
            position={[
              piece.position[0],
              piece.position[1] - 0.7,
              piece.position[2]
            ]}
            isSelected={selectedPiece?.square === piece.square}
            onClick={() => handlePieceClick(
              piece.type,
              piece.position,
              piece.square
            )}
          />
        ))}
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          target={[0, 0, 0]}
        />
      </Canvas>
      {thinking && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px'
        }}>
          AI is thinking...
        </div>
      )}
    </div>
  );
}

export default Chessboard3D;
