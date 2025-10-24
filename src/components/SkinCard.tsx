import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SkinCardProps {
  skin: {
    id: number;
    name: string;
    color: string;
    unlocked: boolean;
  };
  isActive: boolean;
  onSelect: () => void;
}

export const SkinCard = ({ skin, isActive, onSelect }: SkinCardProps) => {
  return (
    <Card className={`p-6 hover:scale-105 transition-transform duration-300 ${isActive ? 'ring-4 ring-primary' : ''}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full" style={{ backgroundColor: skin.color }}></div>
          {isActive && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Icon name="Check" size={16} />
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg">{skin.name}</h3>
        {skin.unlocked ? (
          <Button onClick={onSelect} variant={isActive ? 'default' : 'outline'} className="w-full">
            {isActive ? 'Выбран' : 'Выбрать'}
          </Button>
        ) : (
          <Button disabled className="w-full">
            <Icon name="Lock" size={16} className="mr-2" />
            Заблокирован
          </Button>
        )}
      </div>
    </Card>
  );
};
