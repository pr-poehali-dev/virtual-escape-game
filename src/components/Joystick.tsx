import { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
}

export const Joystick = ({ onMove }: JoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !joystickRef.current) return;

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = e.clientX - centerX;
      let deltaY = e.clientY - centerY;

      const maxDistance = 40;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }

      setPosition({ x: deltaX, y: deltaY });
      onMove({ x: deltaX / maxDistance, y: deltaY / maxDistance });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onMove]);

  return (
    <div
      ref={joystickRef}
      className="relative w-32 h-32 bg-muted rounded-full flex items-center justify-center cursor-pointer select-none touch-none"
      onPointerDown={() => setIsDragging(true)}
    >
      <div
        className="absolute w-12 h-12 bg-primary rounded-full transition-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  );
};
