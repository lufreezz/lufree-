import { useEffect, useRef } from 'react';
import { GameEngine } from './game/GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new GameEngine(canvasRef.current);
      gameRef.current.start();
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 p-4">
      <div className="relative shadow-2xl rounded-lg overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-black block max-w-full h-auto"
          style={{ maxHeight: '90vh', touchAction: 'none' }}
        />
        <div className="absolute top-2 right-2 text-white/50 text-xs font-mono pointer-events-none">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
