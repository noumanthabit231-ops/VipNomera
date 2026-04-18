import React from 'react';
import { 
  User as UserIcon, 
  LogOut, 
  Crown, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle
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
  
  // Расчет оставшихся дней
  const getDaysLeft = () => {
    if (!user?.expiry_date) return 0;
    const expiry = new Date(user.expiry_date);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getDaysLeft();
  const isActive = user?.subscription === 'ACTIVE' && daysLeft > 0;

  const handleLogout = () => {
    localStorage.removeItem('golden_v2_session');
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="pt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Шапка профиля */}
      <div className="flex items-center gap-4 px-2">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
          <UserIcon className="text-gray-400" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">
            {user?.full_name || 'Клиент'}
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            +{user?.phone?.replace(/\D/g, '')}
          </p>
        </div>
      </div>

      {/* ПЛАШКА ПОДПИСКИ (BANNER) */}
      <Card className={cn(
        "p-6 relative overflow-hidden border-none shadow-2xl",
        isActive 
          ? "bg-gray-900 text-white" 
          : "bg-white border border-gray-100"
      )}>
        {/* Декор фона для активной подписки */}
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
                Статус доступа
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">
                  {isActive ? "VIP Активен" : "Доступ ограничен"}
                </h3>
                {isActive && <ShieldCheck size={18} className="text-[#D4AF37]" />}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-2xl",
              isActive ? "bg-[#D4AF37]/10" : "bg-gray-50"
            )}>
              <Crown size={24} className={isActive ? "text-[#D4AF37]" : "text-gray-300"} />
            </div>
          </div>

          {isActive ? (
            /* Вид когда подписка ЕСТЬ */
            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[#D4AF37]" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-tight">Осталось времени:</span>
              </div>
              <span className="text-lg font-black text-[#D4AF37]">
                {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
              </span>
            </div>
          ) : (
            /* Вид когда подписки НЕТ */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-[11px] font-bold uppercase leading-tight tracking-tight">
                  Активируйте VIP, чтобы разблокировать возможность покупки номеров
                </p>
              </div>
              <Button 
                fullWidth 
                variant="primary" 
                className="py-5 shadow-xl shadow-[#D4AF37]/20"
                onClick={() => setView('subscription')}
              >
                Купить VIP доступ <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Дополнительные действия */}
      <div className="space-y-3">
        <p className="px-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">Настройки</p>
        
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setView('admin')}
            className="w-full flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-indigo-600" size={20} />
              </div>
              <span className="font-bold text-gray-900 uppercase text-xs tracking-tight">Панель администратора</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        )}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
              <LogOut className="text-red-500" size={20} />
            </div>
            <span className="font-bold text-gray-900 uppercase text-xs tracking-tight">Выйти из аккаунта</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>

      <div className="pt-6 text-center">
        <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">
          Golden Numbers v2.0
        </p>
      </div>
    </div>
  );
};
