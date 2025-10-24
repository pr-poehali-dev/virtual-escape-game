import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userId: number, username: string) => void;
}

export const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (action: 'register' | 'login') => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/18409b7e-c623-4a6f-bb30-dc5000b2dcaa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка');
        setLoading(false);
        return;
      }

      localStorage.setItem('user_id', data.user_id.toString());
      localStorage.setItem('username', data.username);
      onLogin(data.user_id, data.username);
      onClose();
      setUsername('');
      setPassword('');
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Вход в аккаунт</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Войти</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Никнейм</Label>
              <Input
                id="login-username"
                placeholder="Введите никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Пароль</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={() => handleAuth('login')}
              disabled={loading || !username || !password}
              className="w-full"
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="register-username">Никнейм</Label>
              <Input
                id="register-username"
                placeholder="Придумайте никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Пароль</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Придумайте пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={() => handleAuth('register')}
              disabled={loading || !username || !password}
              className="w-full"
            >
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
