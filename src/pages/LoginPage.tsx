import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        toast({
          title: t('common.error'),
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'te' ? 'en' : 'te');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary to-primary-hover rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight telugu-text">
            {t('login.welcome')}
          </h1>
        </div>

        <Card className="card-elevated">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl telugu-text">{t('login.title')}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="ml-2"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === 'te' ? 'English' : 'తెలుగు'}
              </Button>
            </div>
            <CardDescription className="telugu-text">
              Demo credentials: admin/admin123 or manager/manager123
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="telugu-text">
                  {t('login.username')}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full"
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="telugu-text">
                  {t('login.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  placeholder="admin123"
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : t('login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground telugu-text">
          <p>Demo Application - Replace with your MongoDB backend</p>
        </div>
      </div>
    </div>
  );
}