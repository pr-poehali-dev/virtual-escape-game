import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LevelCard } from '@/components/LevelCard';
import { SkinCard } from '@/components/SkinCard';
import { GameCanvas } from '@/components/GameCanvas';
import { AuthModal } from '@/components/AuthModal';
import { LevelEditor } from '@/components/LevelEditor';
import Icon from '@/components/ui/icon';

const INITIAL_LEVELS = [
  {
    id: 1,
    name: 'Комната 1',
    difficulty: 1,
    image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png',
    completed: false,
    objects: [
      { x: 0, y: 0, width: 600, height: 20, type: 'wall' as const },
      { x: 0, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 580, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 0, y: 380, width: 600, height: 20, type: 'wall' as const },
      { x: 200, y: 150, width: 30, height: 30, type: 'key' as const },
      { x: 500, y: 300, width: 60, height: 80, type: 'door' as const },
      { x: 300, y: 100, width: 100, height: 20, type: 'obstacle' as const },
    ],
  },
  {
    id: 2,
    name: 'Комната 2',
    difficulty: 2,
    image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png',
    completed: false,
    objects: [
      { x: 0, y: 0, width: 600, height: 20, type: 'wall' as const },
      { x: 0, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 580, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 0, y: 380, width: 600, height: 20, type: 'wall' as const },
      { x: 450, y: 100, width: 30, height: 30, type: 'key' as const },
      { x: 50, y: 300, width: 60, height: 80, type: 'door' as const },
      { x: 200, y: 50, width: 200, height: 20, type: 'obstacle' as const },
      { x: 150, y: 200, width: 20, height: 150, type: 'obstacle' as const },
      { x: 400, y: 200, width: 20, height: 150, type: 'obstacle' as const },
    ],
  },
  {
    id: 3,
    name: 'Комната 3',
    difficulty: 3,
    image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png',
    completed: false,
    objects: [
      { x: 0, y: 0, width: 600, height: 20, type: 'wall' as const },
      { x: 0, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 580, y: 0, width: 20, height: 400, type: 'wall' as const },
      { x: 0, y: 380, width: 600, height: 20, type: 'wall' as const },
      { x: 300, y: 200, width: 30, height: 30, type: 'key' as const },
      { x: 520, y: 50, width: 60, height: 80, type: 'door' as const },
      { x: 100, y: 100, width: 150, height: 20, type: 'obstacle' as const },
      { x: 350, y: 100, width: 150, height: 20, type: 'obstacle' as const },
      { x: 100, y: 280, width: 150, height: 20, type: 'obstacle' as const },
      { x: 350, y: 280, width: 150, height: 20, type: 'obstacle' as const },
      { x: 250, y: 120, width: 20, height: 160, type: 'obstacle' as const },
      { x: 350, y: 120, width: 20, height: 160, type: 'obstacle' as const },
    ],
  },
];

const SKINS = [
  { id: 1, name: 'Оранжевый', color: '#FF6B35', unlocked: true },
  { id: 2, name: 'Мятный', color: '#FECDC4', unlocked: true },
  { id: 3, name: 'Жёлтый', color: '#FFE66D', unlocked: true },
  { id: 4, name: 'Фиолетовый', color: '#9b87f5', unlocked: false },
  { id: 5, name: 'Синий', color: '#0EA5E9', unlocked: false },
  { id: 6, name: 'Розовый', color: '#D946EF', unlocked: false },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [activeSkin, setActiveSkin] = useState(1);
  const [levels, setLevels] = useState(INITIAL_LEVELS);
  const [customLevels, setCustomLevels] = useState<any[]>([]);
  const [editorObjects, setEditorObjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [communityLevels] = useState([
    { id: 101, name: 'Лабиринт судьбы', difficulty: 3, image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png', completed: false, author: 'Player_123', objects: [] },
    { id: 102, name: 'Тёмная комната', difficulty: 2, image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png', completed: false, author: 'MasterEscape', objects: [] },
    { id: 103, name: 'Испытание огнём', difficulty: 3, image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png', completed: false, author: 'ProGamer', objects: [] },
    { id: 104, name: 'Комната загадок', difficulty: 1, image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png', completed: false, author: 'NoobMaster', objects: [] },
    { id: 105, name: 'Подземелье', difficulty: 2, image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png', completed: false, author: 'DarkKnight', objects: [] },
  ]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');
    if (storedUserId && storedUsername) {
      setUserId(parseInt(storedUserId));
      setUsername(storedUsername);
      loadProgress(parseInt(storedUserId));
    }
  }, []);

  const loadProgress = async (uid: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/39c924ad-9456-485a-9e5a-3a32e2185c4d', {
        headers: { 'X-User-Id': uid.toString() },
      });
      const data = await response.json();
      if (data.progress) {
        setLevels((prev) =>
          prev.map((level) => {
            const progress = data.progress.find((p: any) => p.level_id === level.id);
            return progress ? { ...level, completed: progress.completed } : level;
          })
        );
      }
    } catch (err) {
      console.error('Failed to load progress', err);
    }
  };

  const handleLogin = (uid: number, uname: string) => {
    setUserId(uid);
    setUsername(uname);
    loadProgress(uid);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUserId(null);
    setUsername(null);
    setLevels(INITIAL_LEVELS);
  };

  const handlePlayLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    setActiveTab('game');
  };

  const handleLevelComplete = async () => {
    if (currentLevel) {
      setLevels((prev) => prev.map((level) => (level.id === currentLevel ? { ...level, completed: true } : level)));
      
      if (userId) {
        try {
          await fetch('https://functions.poehali.dev/39c924ad-9456-485a-9e5a-3a32e2185c4d', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': userId.toString(),
            },
            body: JSON.stringify({ action: 'complete_level', level_id: currentLevel }),
          });
        } catch (err) {
          console.error('Failed to save progress', err);
        }
      }
      
      setCurrentLevel(null);
      setActiveTab('menu');
    }
  };

  const handleBackToMenu = () => {
    setCurrentLevel(null);
    setActiveTab('menu');
  };

  const saveCustomLevel = () => {
    const newLevel = {
      id: levels.length + customLevels.length + 1,
      name: `Уровень игрока ${customLevels.length + 1}`,
      difficulty: 2,
      image: 'https://v3b.fal.media/files/b/zebra/9of2d78_G1F1egSaGUhgV_output.png',
      completed: false,
      objects: [
        { x: 0, y: 0, width: 600, height: 20, type: 'wall' as const },
        { x: 0, y: 0, width: 20, height: 400, type: 'wall' as const },
        { x: 580, y: 0, width: 20, height: 400, type: 'wall' as const },
        { x: 0, y: 380, width: 600, height: 20, type: 'wall' as const },
        ...editorObjects,
      ],
    };
    setCustomLevels([...customLevels, newLevel]);
    setEditorObjects([]);
  };

  const currentLevelData = levels.find((l) => l.id === currentLevel);

  if (activeTab === 'game' && currentLevelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-8">
        <Button onClick={handleBackToMenu} variant="outline" className="mb-4 self-start">
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <h2 className="text-3xl font-bold mb-6">{currentLevelData.name}</h2>
        <GameCanvas level={currentLevelData} playerSkin={SKINS.find((s) => s.id === activeSkin)?.color || '#FF6B35'} onLevelComplete={handleLevelComplete} />
        <p className="mt-4 text-muted-foreground">Используй стрелки или WASD для управления</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            {userId ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">👤 {username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)}>
                <Icon name="User" size={20} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">KEY WORLD</h1>
          <p className="text-xl text-muted-foreground">Найди ключ, открой дверь, сбеги из комнаты!</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card">
            <TabsTrigger value="menu" className="text-lg">
              <Icon name="Play" size={20} className="mr-2" />
              Играть
            </TabsTrigger>
            <TabsTrigger value="skins" className="text-lg">
              <Icon name="Palette" size={20} className="mr-2" />
              Скины
            </TabsTrigger>
            <TabsTrigger value="editor" className="text-lg">
              <Icon name="Pencil" size={20} className="mr-2" />
              Редактор
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Уровни разработчика</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Icon name="Users" size={20} className="mr-2" />
                    Уровни игроков
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Пользовательские уровни</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Поиск уровней по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {communityLevels
                        .filter((level) => level.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((level) => (
                          <LevelCard key={level.id} level={level} onPlay={() => handlePlayLevel(level.id)} />
                        ))}
                    </div>
                    {communityLevels.filter((level) => level.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="SearchX" size={48} className="mx-auto mb-4" />
                        <p>Уровни не найдены</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => (
                <LevelCard key={level.id} level={level} onPlay={() => handlePlayLevel(level.id)} />
              ))}
            </div>

            {customLevels.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Мои уровни</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customLevels.map((level) => (
                    <LevelCard key={level.id} level={level} onPlay={() => handlePlayLevel(level.id)} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="skins">
            <h2 className="text-3xl font-bold mb-6">Коллекция скинов</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {SKINS.map((skin) => (
                <SkinCard key={skin.id} skin={skin} isActive={activeSkin === skin.id} onSelect={() => skin.unlocked && setActiveSkin(skin.id)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <h2 className="text-3xl font-bold mb-6">Редактор уровней</h2>
            <LevelEditor 
              objects={editorObjects} 
              onObjectsChange={setEditorObjects}
              onSave={saveCustomLevel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;