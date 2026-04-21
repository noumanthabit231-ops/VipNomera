import React, { useState } from 'react';
import { 
  Crown, ShieldCheck, Lock, LogOut, 
  ChevronLeft, Star, Clock, CheckCircle2,
  Settings, User as UserIcon
} from 'lucide-react';
import { cn } from '../cn';

// Функция для подсчета дней
const getDaysDiff = (expiryStr: string) => {
  if (!expiryStr) return null;
  const today = new Date();
  const expiry = new Date(expiryStr);
  today.setHours(0, 0, 0, 0); expiry.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getWord = (n: number) => {
    const last = n % 10, lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
    if (last === 1) return 'день';
    if (last >= 2 && last <= 4) return 'дня';
    return 'дней';
  };

  return { count: diffDays, word: getWord(Math.abs(diffDays)) };
};

export const ProfileView = ({ user, setView, sendPaymentNotification }: any) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isVIP = user?.subscription === 'ACTIVE' || isAdmin;
  const daysLeft = getDaysDiff(user?.expiry_date);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(); 
  };

  const handleBuyVip = async () => {
    setIsSending(true);
    const success = await sendPaymentNotification(user, "VIP Подписка (30 дней)");
    setIsSending(false);
    
    if (success) {
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } else {
      alert("Ошибка сети. Попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-6 pb-24 px-4 animate-in fade-in duration-500 selection:bg-[#D4AF37]/30">
      
      {/* Шапка */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setView('catalog')}
          className="w-10 h-10 flex items-center justify-center bg-[#111] border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-widest">Кабинет</h1>
        <div className="w-10 h-10" /> 
      </div>

      {/* Данные пользователя */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-full border border-gray-800 flex items-center justify-center mb-4 relative shadow-lg">
          <UserIcon size={32} className="text-gray-500" />
          {isVIP && (
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#050505] shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              <Star size={12} className="fill-black" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">{user?.full_name || 'Аноним'}</h2>
        <p className="text-[#D4AF37] font-bold text-sm tracking-[0.2em] uppercase mt-1">+{user?.phone}</p>
      </div>

      {/* 🌟 УМНАЯ КАРТОЧКА СТАТУСА 🌟 */}
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-3 ml-2">Уровень доступа</h3>
        
        {/* КАРТОЧКА: ВЛАДЕЛЕЦ */}
        {isAdmin && (
          <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#020617] rounded-[2rem] border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Crown size={80} />
            </div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Crown size={20} /></div>
              <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Владелец</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Безлимитный<br/>доступ</h3>
            <p className="text-gray-400 text-xs font-medium mb-6 relative z-10 w-3/4">Вам доступны все скрытые функции и панель управления системой.</p>
            
            <button 
              onClick={() => setView('admin')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)] active:scale-95"
            >
              <Settings size={16} /> Открыть Админ-панель
            </button>
          </div>
        )}

        {/* КАРТОЧКА: VIP КЛИЕНТ */}
        {!isAdmin && isVIP && (
          <div className="p-6 bg-gradient-to-br from-[#1A1500] to-[#0A0800] rounded-[2rem] border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#D4AF37]">
              <ShieldCheck size={80} />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl"><ShieldCheck size={20} /></div>
                <span className="text-sm font-black text-[#D4AF37] uppercase tracking-widest">Premium</span>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Активен</span>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-6 relative z-10">Доступ к закрытому каталогу открыт</h3>

            {daysLeft && (
              <div className="flex items-center justify-between p-4 bg-black/40 border border-[#D4AF37]/20 rounded-2xl relative z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock size={16} className="text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Осталось времени:</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{daysLeft.count}</span>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">{daysLeft.word}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* КАРТОЧКА: ОБЫЧНЫЙ ЮЗЕР (НЕТ VIP) */}
        {!isAdmin && !isVIP && (
          <div className="p-6 bg-[#0A0A0A] rounded-[2rem] border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
              <Lock size={80} />
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2 bg-gray-800 text-gray-400 rounded-xl"><Lock size={20} /></div>
              <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Базовый</span>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Доступ ограничен</h3>
            <p className="text-gray-400 text-xs font-medium mb-6 relative z-10 w-5/6 leading-relaxed">
              Чтобы увидеть эксклюзивные и скрытые VIP-номера, необходимо приобрести подписку.
            </p>

            <div className="p-4 bg-[#111] rounded-2xl border border-gray-800 mb-6 relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Стоимость</span>
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">30 дней</span>
              </div>
              <div className="text-2xl font-black italic tracking-tighter text-white">20 000 ₸</div>
            </div>

            <button 
              onClick={handleBuyVip}
              disabled={isSending || isSent}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all relative z-10",
                isSent 
                  ? "bg-green-500/10 text-green-500 border border-green-500/30" 
                  : "bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 active:scale-95 shadow-[0_10px_25px_rgba(212,175,55,0.2)]"
              )}
            >
              {isSending ? (
                <span className="animate-pulse">Отправка запроса...</span>
              ) : isSent ? (
                <><CheckCircle2 size={16} /> Заявка на рассмотрении</>
              ) : (
                <><Star size={16} className="fill-black" /> Приобрести VIP</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 text-gray-500 hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <LogOut size={16} /> Выйти из аккаунта
      </button>

    </div>
  );
};
