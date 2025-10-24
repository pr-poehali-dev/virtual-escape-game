import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LevelCardProps {
  level: {
    id: number;
    name: string;
    difficulty: number;
    image: string;
    completed?: boolean;
  };
  onPlay: () => void;
}

export const LevelCard = ({ level, onPlay }: LevelCardProps) => {
  const stars = Array(3)
    .fill(0)
    .map((_, i) => i < level.difficulty);

  return (
    <Card className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
        <img src={level.image} alt={level.name} className="w-full h-full object-cover" />
        {level.completed && (
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-2">
            <Icon name="Check" size={20} />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-xl">{level.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Сложность:</span>
          <div className="flex gap-1">
            {stars.map((filled, i) => (
              <Icon key={i} name={filled ? 'Star' : 'Star'} size={16} className={filled ? 'fill-accent text-accent' : 'text-muted'} />
            ))}
          </div>
        </div>
        <Button onClick={onPlay} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          Играть
        </Button>
      </div>
    </Card>
  );
};
