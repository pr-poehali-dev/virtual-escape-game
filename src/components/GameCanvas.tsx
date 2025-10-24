import { useEffect, useRef, useState } from 'react';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'player' | 'key' | 'door' | 'wall' | 'obstacle';
  collected?: boolean;
}

interface GameCanvasProps {
  level: {
    id: number;
    objects: GameObject[];
  };
  playerSkin: string;
  onLevelComplete: () => void;
}

export const GameCanvas = ({ level, playerSkin, onLevelComplete }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: 50, y: 50 });
  const [keyCollected, setKeyCollected] = useState(false);
  const [gameObjects, setGameObjects] = useState(level.objects);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameObjects.forEach((obj) => {
      if (obj.type === 'wall') {
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'key' && !obj.collected) {
        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'door') {
        ctx.fillStyle = keyCollected ? '#FECDC4' : '#FF6B35';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'obstacle') {
        ctx.fillStyle = '#718096';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
    });

    ctx.fillStyle = playerSkin;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }, [player, gameObjects, keyCollected, playerSkin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 5;
      let newX = player.x;
      let newY = player.y;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newY -= speed;
          break;
        case 'ArrowDown':
        case 's':
          newY += speed;
          break;
        case 'ArrowLeft':
        case 'a':
          newX -= speed;
          break;
        case 'ArrowRight':
        case 'd':
          newX += speed;
          break;
      }

      const collisionWithWall = gameObjects.some(
        (obj) =>
          (obj.type === 'wall' || obj.type === 'obstacle') &&
          newX + 20 > obj.x &&
          newX - 20 < obj.x + obj.width &&
          newY + 20 > obj.y &&
          newY - 20 < obj.y + obj.height
      );

      if (!collisionWithWall && newX >= 20 && newX <= 580 && newY >= 20 && newY <= 380) {
        setPlayer({ x: newX, y: newY });

        gameObjects.forEach((obj, index) => {
          if (obj.type === 'key' && !obj.collected) {
            const distance = Math.sqrt(
              Math.pow(newX - (obj.x + obj.width / 2), 2) + Math.pow(newY - (obj.y + obj.height / 2), 2)
            );
            if (distance < 35) {
              setKeyCollected(true);
              setGameObjects((prev) => {
                const updated = [...prev];
                updated[index] = { ...updated[index], collected: true };
                return updated;
              });
            }
          }

          if (obj.type === 'door' && keyCollected) {
            const distance = Math.sqrt(
              Math.pow(newX - (obj.x + obj.width / 2), 2) + Math.pow(newY - (obj.y + obj.height / 2), 2)
            );
            if (distance < 50) {
              onLevelComplete();
            }
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gameObjects, keyCollected, onLevelComplete]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={600} height={400} className="border-4 border-primary rounded-lg shadow-2xl" />
      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
        {keyCollected ? '🔑 Ключ собран!' : '🎯 Найди ключ'}
      </div>
    </div>
  );
};
