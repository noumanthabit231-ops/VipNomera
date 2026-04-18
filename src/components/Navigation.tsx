import { Crown, User, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  user: UserProfile | null;
  activeView: string;
  onNavigate: (view: 'catalog' | 'profile' | 'admin') => void;
  onLogout: () => void;
}

export function Navigation({ user, activeView, onNavigate, onLogout }: NavigationProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/[0.02] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Логотип */}
        <div 
          onClick={() => onNavigate('catalog')}
          className="cursor-pointer flex items-center gap-2"
        >
          <Crown className="text-[#D4AF37]" size={24} />
          <h1 className="text-xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FDF5A6] to-[#B38728] tracking-widest uppercase">
            Golden
          </h1>
        </div>

        {/* Меню навигации */}
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('catalog')}
            className={`text-[11px] uppercase tracking-widest transition-colors ${activeView === 'catalog' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-white'}`}
          >
            Каталог
          </button>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`text-[11px] uppercase tracking-widest transition-colors ${activeView === 'admin' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-white'}`}
                >
                  Админ-панель
                </button>
              )}
              
              <button 
                onClick={() => onNavigate('profile')}
                className={`text-[11px] uppercase tracking-widest flex items-center gap-2 transition-colors ${activeView === 'profile' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-white'}`}
              >
                <User size={14} /> Профиль
              </button>
              
              <button 
                onClick={onLogout}
                className="text-zinc-500 hover:text-red-500 transition-colors ml-4"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onNavigate('profile')} // Перекинет на авторизацию
              className="px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors"
            >
              Войти
            </button>
          )}
        </nav>

      </div>
    </header>
  );
}
