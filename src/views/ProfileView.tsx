import React from 'react';
import { 
  User as UserIcon, 
  LogOut, 
  Crown, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';

interface ProfileViewProps {
  user: any;
  setView: (view: any) => void;
  setUser: (user: any) => void;
}

export const ProfileView = ({ user, setView, setUser }: ProfileViewProps) => {
  
  // Расчет оставшихся дней подписки
  const getDaysLeft = () => {
    if (!user?.expiry_date) return 0;
    const expiry = new Date(user.expiry_date);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    // Возвращаем количество полных дней
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = getDaysLeft();
  // Подписка активна, если статус ACTIVE и срок еще не вышел
  const isActive = user?.subscription === 'ACTIVE' && daysLeft > 0;

  const handleLogout = () => {
    localStorage.removeItem('golden_v2_session');
    setUser(null);
    // Полная перезагрузка для очистки всех стейтов
    window.location.reload();
  };

  return (
    <div className="pt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. ШАПКА ПРОФИЛЯ */}
      <div className="flex items-center gap-4 px-2">
        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm border border-gray-100">
          <UserIcon className="text-gray-400" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-1">
            {user?.full_name || 'Пользователь'}
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            +{user?.phone?.replace(/\D/g, '')}
          </p>
        </div>
      </div>

      {/* 2. ПЛАШКА СТАТУСА VIP (ГЛАВНЫЙ МОДУЛЬ) */}
      <Card className={cn(
        "p-6 relative overflow-hidden border-none shadow-2xl transition-all duration-500",
        isActive 
          ? "bg-gray-900 text-white" 
          : "bg-white border border-gray-100"
      )}>
        {/* Золотистое свечение для VIP */}
        {isActive && (
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl" />
        )}

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                isActive ? "text-[#D4AF37]" : "text-gray-400"
              )}>
                Ваш уровень доступа
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                  {isActive ? "VIP Статус" : "Базовый"}
                </h3>
                {isActive && <ShieldCheck size={20} className="text-[#D4AF37]" />}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-2xl transition-colors",
              isActive ? "bg-[#D4AF37]/10" : "bg-gray-50"
            )}>
              <Crown size={28} className={isActive ? "text-[#D4AF37]" : "text-gray-300"} />
            </div>
          </div>

          {isActive ? (
            /* Состояние: Подписка АКТИВНА */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[#D4AF37]" />
                  <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Истекает через:</span>
                </div>
                <span className="text-xl font-black text-[#D4AF37]">
                  {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
                </span>
              </div>
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest text-center">
                Вам доступны все номера и скрытые контакты
              </p>
            </div>
          ) : (
            /* Состояние: Подписки НЕТ */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <AlertCircle size={20} className="text-red-400 shrink-0" />
                <p className="text-[10px] font-bold uppercase leading-tight tracking-tight">
                  Активируйте подписку, чтобы разблокировать покупку номеров и просмотр контактов
                </p>
              </div>
              <Button 
                fullWidth 
                variant="primary" 
                className="py-5 shadow-xl shadow-[#D4AF37]/20 text-sm font-black uppercase italic"
                onClick={() => setView('subscription')}
              >
                Купить VIP доступ <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 3. НАСТРОЙКИ И УПРАВЛЕНИЕ */}
      <div className="space-y-3">
        <p className="px-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Управление</p>
        
        {/* Кнопка Админа: видна только если роль в базе 'ADMIN' */}
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setView('admin')}
            className="w-full flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Settings className="text-indigo-600" size={20} />
              </div>
              <div className="text-left">
                <span className="block font-black text-gray-900 uppercase text-[11px] tracking-tight leading-none mb-1">Админ-центр</span>
                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Управление каталогом</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>
        )}

        {/* Кнопка выхода */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="text-red-500" size={20} />
            </div>
            <div className="text-left">
              <span className="block font-black text-gray-900 uppercase text-[11px] tracking-tight leading-none mb-1">Завершить сеанс</span>
              <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Безопасный выход</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Футер */}
      <div className="pt-10 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
          <ShieldCheck size={12} className="text-gray-300" />
          <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.4em]">
            Golden Numbers Cloud v2.1
          </span>
        </div>
      </div>
    </div>
  );
};
