import React from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

// Piece Component
const Piece = ({ piece, position, onClick }) => {
  const color = piece.charAt(0) === 'w' ? '#e6e6e6' : '#333333';
  const pieceType = piece.charAt(1);
  
  // Different geometries for different pieces
  const getPieceGeometry = () => {
    switch(pieceType) {
      case 'P': // Pawn
        return <cylinderGeometry args={[0.2, 0.2, 0.6, 32]} />;
      case 'R': // Rook
        return <boxGeometry args={[0.3, 0.8, 0.3]} />;
      case 'N': // Knight
        return <coneGeometry args={[0.2, 0.8, 32]} />;
      case 'B': // Bishop
        return <cylinderGeometry args={[0.15, 0.3, 1, 32]} />;
      case 'Q': // Queen
        return <sphereGeometry args={[0.3, 32, 32]} />;
      case 'K': // King
        return <boxGeometry args={[0.3, 1.2, 0.3]} />;
      default:
        return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <mesh position={position} onClick={onClick}>
      {getPieceGeometry()}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

function Chessboard3D() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    updatePieces();
  }, [fen]);

  const updatePieces = () => {
    const newPieces = [];
    game.board().forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece) {
          newPieces.push({
            type: piece.color + piece.type.toUpperCase(),
            position: [colIndex - 3.5, 0.5, rowIndex - 3.5],
          });
        }
      });
    });
    setPieces(newPieces);
  };

  const handlePieceClick = (piece, pos) => {
    if (selectedPiece) {
      const from = selectedPiece;
      const to = pos;
      const move = game.move({ from, to });
      if (move) {
        setFen(game.fen());
        setSelectedPiece(null);
      }
    } else {
      setSelectedPiece(pos);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 10, 10], fov: 45 }}
        style={{ background: '#202020' }}
      >
        <PerspectiveCamera makeDefault position={[0, 10, 10]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} />
        
        {/* Chessboard */}
        <group position={[0, -1, 0]}>
          {/* Board base */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[9, 0.5, 9]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          {/* Checkerboard pattern */}
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

        {/* Chess pieces */}
        {pieces.map((piece, index) => (
          <Piece
            key={index}
            piece={piece.type}
            position={[
              piece.position[0],
              piece.position[1] - 0.7, // Adjust height to sit on board
              piece.position[2]
            ]}
            onClick={() => handlePieceClick(piece.type, piece.position)}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

export default Chessboard3D;
