import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EditorObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'key' | 'door' | 'obstacle';
}

interface LevelEditorProps {
  objects: EditorObject[];
  onObjectsChange: (objects: EditorObject[]) => void;
  onSave: () => void;
}

export const LevelEditor = ({ objects, onObjectsChange, onSave }: LevelEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<'wall' | 'key' | 'door' | 'obstacle' | null>(null);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    objects.forEach((obj, index) => {
      if (obj.type === 'wall') {
        ctx.fillStyle = selectedObjectIndex === index ? '#6B7280' : '#4A5568';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'key') {
        const keyX = obj.x + obj.width / 2;
        const keyY = obj.y + obj.height / 2;
        
        ctx.fillStyle = selectedObjectIndex === index ? '#FFC107' : '#FFD700';
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
        ctx.fillStyle = selectedObjectIndex === index ? '#FF8A65' : '#FF6B35';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'obstacle') {
        ctx.fillStyle = selectedObjectIndex === index ? '#8B95A5' : '#718096';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }

      if (selectedObjectIndex === index) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
      }
    });
  }, [objects, selectedObjectIndex]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 20) * 20;
    const y = Math.floor((e.clientY - rect.top) / 20) * 20;

    const clickedIndex = objects.findIndex(
      (obj) => x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height
    );

    if (clickedIndex !== -1) {
      setSelectedObjectIndex(clickedIndex);
      setSelectedTool(null);
    } else if (selectedTool) {
      const newObject: EditorObject = {
        x,
        y,
        width: selectedTool === 'key' ? 30 : selectedTool === 'door' ? 60 : 100,
        height: selectedTool === 'key' ? 30 : selectedTool === 'door' ? 80 : 20,
        type: selectedTool,
      };
      onObjectsChange([...objects, newObject]);
    } else {
      setSelectedObjectIndex(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedIndex = objects.findIndex(
      (obj) => x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height
    );

    if (clickedIndex !== -1) {
      setSelectedObjectIndex(clickedIndex);
      setIsDragging(true);
      setDragOffset({
        x: x - objects[clickedIndex].x,
        y: y - objects[clickedIndex].y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedObjectIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - dragOffset.x) / 20) * 20;
    const y = Math.floor((e.clientY - rect.top - dragOffset.y) / 20) * 20;

    const updatedObjects = [...objects];
    updatedObjects[selectedObjectIndex] = {
      ...updatedObjects[selectedObjectIndex],
      x: Math.max(0, Math.min(x, 600 - updatedObjects[selectedObjectIndex].width)),
      y: Math.max(0, Math.min(y, 400 - updatedObjects[selectedObjectIndex].height)),
    };
    onObjectsChange(updatedObjects);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const deleteSelectedObject = () => {
    if (selectedObjectIndex !== null) {
      onObjectsChange(objects.filter((_, index) => index !== selectedObjectIndex));
      setSelectedObjectIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">Инструменты</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setSelectedTool('key')}
            variant={selectedTool === 'key' ? 'default' : 'outline'}
            className="w-full"
          >
            <Icon name="Key" size={20} className="mr-2" />
            Ключ
          </Button>
          <Button
            onClick={() => setSelectedTool('door')}
            variant={selectedTool === 'door' ? 'default' : 'outline'}
            className="w-full"
          >
            <Icon name="DoorOpen" size={20} className="mr-2" />
            Дверь
          </Button>
          <Button
            onClick={() => setSelectedTool('obstacle')}
            variant={selectedTool === 'obstacle' ? 'default' : 'outline'}
            className="w-full"
          >
            <Icon name="Box" size={20} className="mr-2" />
            Препятствие
          </Button>
          <Button
            onClick={() => setSelectedTool('wall')}
            variant={selectedTool === 'wall' ? 'default' : 'outline'}
            className="w-full"
          >
            <Icon name="Minus" size={20} className="mr-2" />
            Стена
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Холст редактора</h3>
          {selectedObjectIndex !== null && (
            <Button size="sm" variant="destructive" onClick={deleteSelectedObject}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Кликни на инструмент, затем кликни на холст чтобы добавить объект. Перетаскивай объекты для перемещения.
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-primary rounded-lg cursor-pointer"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={objects.length === 0} className="flex-1">
          <Icon name="Save" size={20} className="mr-2" />
          Сохранить уровень
        </Button>
        <Button onClick={() => onObjectsChange([])} variant="outline">
          <Icon name="RotateCcw" size={20} className="mr-2" />
          Очистить
        </Button>
      </div>
    </div>
  );
};
