import { useEffect, useRef, useState } from 'react';
import { Joystick } from './Joystick';

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
  const [joystickDirection, setJoystickDirection] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const keyCollectSoundRef = useRef<HTMLAudioElement | null>(null);
  const doorOpenSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBeep = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    keyCollectSoundRef.current = {
      play: () => {
        createBeep(800, 0.2);
        setTimeout(() => createBeep(1000, 0.15), 100);
      }
    } as any;

    doorOpenSoundRef.current = {
      play: () => {
        createBeep(600, 0.3);
        setTimeout(() => createBeep(400, 0.2), 150);
        setTimeout(() => createBeep(500, 0.25), 300);
      }
    } as any;
  }, []);

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
        const keyX = obj.x + obj.width / 2;
        const keyY = obj.y + obj.height / 2;
        
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(keyX, keyY - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillRect(keyX - 2, keyY - 2, 4, 12);
        ctx.strokeRect(keyX - 2, keyY - 2, 4, 12);
        
        ctx.fillRect(keyX - 2, keyY + 8, 6, 2);
        ctx.strokeRect(keyX - 2, keyY + 8, 6, 2);
      } else if (obj.type === 'door') {
        ctx.fillStyle = keyCollected ? '#FECDC4' : '#FF6B35';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'obstacle') {
        ctx.fillStyle = '#718096';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
    });

    ctx.fillStyle = playerSkin;
    ctx.fillRect(player.x - 15, player.y - 25, 30, 50);
    ctx.beginPath();
    ctx.arc(player.x, player.y - 35, 15, 0, Math.PI * 2);
    ctx.fill();
  }, [player, gameObjects, keyCollected, playerSkin]);

  useEffect(() => {
    const movePlayer = (deltaX: number, deltaY: number) => {
      const newX = player.x + deltaX;
      const newY = player.y + deltaY;

      const collisionWithWall = gameObjects.some(
        (obj) =>
          (obj.type === 'wall' || obj.type === 'obstacle') &&
          newX + 15 > obj.x &&
          newX - 15 < obj.x + obj.width &&
          newY + 25 > obj.y &&
          newY - 35 < obj.y + obj.height
      );

      if (!collisionWithWall && newX >= 15 && newX <= 585 && newY >= 35 && newY <= 375) {
        setPlayer({ x: newX, y: newY });

        gameObjects.forEach((obj, index) => {
          if (obj.type === 'key' && !obj.collected) {
            const distance = Math.sqrt(
              Math.pow(newX - (obj.x + obj.width / 2), 2) + Math.pow(newY - (obj.y + obj.height / 2), 2)
            );
            if (distance < 35) {
              setKeyCollected(true);
              keyCollectSoundRef.current?.play();
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
              doorOpenSoundRef.current?.play();
              setTimeout(() => onLevelComplete(), 300);
            }
          }
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 5;

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          movePlayer(0, -speed);
          break;
        case 'arrowdown':
        case 's':
          movePlayer(0, speed);
          break;
        case 'arrowleft':
        case 'a':
          movePlayer(-speed, 0);
          break;
        case 'arrowright':
        case 'd':
          movePlayer(speed, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gameObjects, keyCollected, onLevelComplete]);

  useEffect(() => {
    if (joystickDirection.x === 0 && joystickDirection.y === 0) return;

    const interval = setInterval(() => {
      const speed = 3;
      const deltaX = joystickDirection.x * speed;
      const deltaY = joystickDirection.y * speed;
      
      const newX = player.x + deltaX;
      const newY = player.y + deltaY;

      const collisionWithWall = gameObjects.some(
        (obj) =>
          (obj.type === 'wall' || obj.type === 'obstacle') &&
          newX + 15 > obj.x &&
          newX - 15 < obj.x + obj.width &&
          newY + 25 > obj.y &&
          newY - 35 < obj.y + obj.height
      );

      if (!collisionWithWall && newX >= 15 && newX <= 585 && newY >= 35 && newY <= 375) {
        setPlayer({ x: newX, y: newY });

        gameObjects.forEach((obj, index) => {
          if (obj.type === 'key' && !obj.collected) {
            const distance = Math.sqrt(
              Math.pow(newX - (obj.x + obj.width / 2), 2) + Math.pow(newY - (obj.y + obj.height / 2), 2)
            );
            if (distance < 35) {
              setKeyCollected(true);
              keyCollectSoundRef.current?.play();
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
              doorOpenSoundRef.current?.play();
              setTimeout(() => onLevelComplete(), 300);
            }
          }
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [joystickDirection, player, gameObjects, keyCollected, onLevelComplete]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas ref={canvasRef} width={600} height={400} className="border-4 border-primary rounded-lg shadow-2xl" />
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
          {keyCollected ? '🔑 Ключ собран!' : '🎯 Найди ключ'}
        </div>
      </div>
      {isMobile && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Управляй джойстиком</p>
          <Joystick onMove={setJoystickDirection} />
        </div>
      )}
      {!isMobile && (
        <p className="text-muted-foreground">Управление: W/A/S/D или стрелки</p>
      )}
    </div>
  );
};