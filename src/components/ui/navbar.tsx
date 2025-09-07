import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Languages, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: '📊' },
    { name: t('nav.employees'), href: '/employees', icon: '👥' },
    { name: t('nav.records'), href: '/records', icon: '📝' },
    { name: t('nav.reports'), href: '/reports', icon: '📈' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'te' ? 'en' : 'te');
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-hover shadow-elevated border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-foreground telugu-text">
                వేతన నిర్వహణ
              </h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-white text-white'
                      : 'border-transparent text-primary-foreground/80 hover:text-white hover:border-white/50'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors telugu-text`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'te' ? 'English' : 'తెలుగు'}
            </Button>
            
            <span className="text-primary-foreground/80 text-sm">
              {user?.username}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('nav.logout')}
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-hover">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-primary-foreground/80 hover:bg-white/10 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium telugu-text`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="border-t border-white/20 pt-4 mt-4">
              <div className="flex items-center justify-between px-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  {language === 'te' ? 'English' : 'తెలుగు'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}