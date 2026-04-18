import React from 'react';
import { User as UserIcon, LogOut, Settings, Crown, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';

export const ProfileView = ({ user, setView, setUser }: any) => {
  // Определяем, что выводить в заголовок: часть почты или номер телефона
  const displayName = user?.email 
    ? user.email.split('@')[0] 
    : (user?.phone || "Клиент");

  return (
    <div className="pt-4 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-gray-900 px-2 uppercase tracking-tighter italic">Кабинет</h1>
      
      <Card className="p-8 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-900 border-4 border-white shadow-sm">
            {user?.email ? <UserIcon size={36} /> : <Smartphone size={36} />}
          </div>
          <div>
            <h3 className="text-xl font-black italic text-gray-900 tracking-tighter uppercase break-all">
              {displayName}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
              ID: {user?.id?.slice(-6) || "Gold-User"}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-gray-50">
          <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Подписка</span>
            <span className={cn(
              "text-[9px] font-black uppercase px-3 py-1 rounded-full",
              user?.subscription === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600 animate-pulse"
            )}>
              {user?.subscription === 'ACTIVE' ? 'Активна' : 'Ожидание'}
            </span>
          </div>
          
          {user?.role === 'ADMIN' && (
            <Button fullWidth variant="primary" onClick={() => setView('admin')}>
              <Settings size={18}/> Админ-панель
            </Button>
          )}

          <Button fullWidth variant="danger" onClick={() => { 
            localStorage.removeItem('golden_v2_session'); 
            setUser(null); 
            setView('catalog'); 
          }}>
            <LogOut size={18}/> Выйти
          </Button>
        </div>
      </Card>
    </div>
  );
};
