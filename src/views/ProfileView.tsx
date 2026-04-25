import React, { useState } from 'react';
import { 
  Crown, ShieldCheck, Lock, LogOut, 
  ChevronLeft, Star, Clock, CheckCircle2,
  Settings, User as UserIcon, ChevronDown, CreditCard, MessageCircle
} from 'lucide-react';
import { cn } from '../cn';

const getDaysDiff = (expiryStr: string) => {
  if (!expiryStr) return null;
  const today = new Date();
  const expiry = new Date(expiryStr);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
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

export const ProfileView = ({ user, setView, setUser, isLight }: any) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isVIP = user?.subscription === 'ACTIVE' || isAdmin;
  const daysLeft = getDaysDiff(user?.expiry_date);

  const kaspiPaymentLink = import.meta.env.VITE_KASPI_LINK || 'https://kaspi.kz/';

  const sendPaymentNotification = async () => {
    const cleanPhone = user?.phone?.replace(/\D/g, '');
    if (!cleanPhone) return false;

    const text = `🔔 *Новая заявка на VIP*\n👤 Клиент: ${user?.full_name || 'Аноним'}\n📱 Телефон: +${user?.phone}\n💰 Сумма: 5 000 ₸\n📅 Дата: ${new Date().toLocaleString()}`;
    
    // Две кнопки: подтвердить и связаться (Telegram)
    const replyMarkup = {
  inline_keyboard: [
    [
      { text: "✅ Подтвердить VIP", url: `https://inlksftwkjuiulmrhyso.supabase.co/functions/v1/confirm-vip?confirm=${cleanPhone}` },
      { text: "📞 Связаться", url: `https://t.me/+${cleanPhone}` }
    ]
  ]
};

    const targets = [
      { token: import.meta.env.VITE_TG_BOT_TOKEN, chatId: import.meta.env.VITE_TG_CHAT_ID },
      { token: import.meta.env.VITE_TG_BOT_TOKEN2, chatId: import.meta.env.VITE_TG_CHAT_ID2 }
    ];

    let success = false;
    for (const { token, chatId } of targets) {
      if (!token || !chatId) continue;
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
          })
        });
        const data = await res.json();
        if (data.ok) success = true;
      } catch (err) {
        console.error(err);
      }
    }
    return success;
  };

  const handleLogout = () => {
    localStorage.removeItem('golden_v2_session');
    setUser(null);
    setView('catalog');
  };

  const handleBuyVip = async () => {
    setIsSending(true);
    const success = await sendPaymentNotification();
    setIsSending(false);
    if (success) {
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } else {
      alert("Ошибка отправки. Попробуйте позже.");
    }
  };

  const contactManager = () => {
    window.open('https://wa.me/77077977767', '_blank');
  };

  const bgClass = isLight ? "bg-white" : "bg-[#050505]";
  const cardBgClass = isLight ? "bg-gray-50 border-gray-200" : "bg-[#0A0A0A] border-gray-800";
  const textPrimaryClass = isLight ? "text-black" : "text-white";
  const textSecondaryClass = isLight ? "text-gray-600" : "text-gray-400";
  const borderClass = isLight ? "border-gray-200" : "border-gray-800";

  return (
    <div className={cn("min-h-screen pt-6 pb-24 px-4 animate-in fade-in duration-500", bgClass)}>
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setView('catalog')} className="w-10 h-10 flex items-center justify-center bg-[#111] border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <h1 className={cn("text-xl font-black uppercase tracking-widest", textPrimaryClass)}>Кабинет</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-full border border-gray-800 flex items-center justify-center mb-4 relative shadow-lg">
          <UserIcon size={32} className="text-gray-500" />
          {isVIP && (
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#050505] shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              <Star size={12} className="fill-black" />
            </div>
          )}
        </div>
        <h2 className={cn("text-2xl font-black tracking-tight", textPrimaryClass)}>{user?.full_name || 'Аноним'}</h2>
        <p className="text-[#D4AF37] font-bold text-sm tracking-[0.2em] uppercase mt-1">+{user?.phone}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-3 ml-2">Уровень доступа</h3>
        
        {isAdmin && (
          <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#020617] rounded-[2rem] border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Crown size={80} /></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Crown size={20} /></div>
              <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Владелец</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Безлимитный<br/>доступ</h3>
            <p className="text-gray-400 text-xs font-medium mb-4 relative z-10 w-3/4">Вам доступны все скрытые функции и панель управления системой.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setView('admin')} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)] active:scale-95">
                <Settings size={16} /> Открыть Админ-панель
              </button>
              <button onClick={contactManager} className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#20b859] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-md active:scale-95">
                <MessageCircle size={16} /> Связаться с менеджером
              </button>
            </div>
          </div>
        )}

        {!isAdmin && isVIP && (
          <div className="p-6 bg-gradient-to-br from-[#1A1500] to-[#0A0800] rounded-[2rem] border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#D4AF37]"><ShieldCheck size={80} /></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl"><ShieldCheck size={20} /></div>
                <span className="text-sm font-black text-[#D4AF37] uppercase tracking-widest">Premium</span>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Активен</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-6 relative z-10">Вам доступны все покупки и бронирования</h3>
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
            <button onClick={contactManager} className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20b859] text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-all shadow-md active:scale-95">
              <MessageCircle size={16} /> Связаться с менеджером
            </button>
          </div>
        )}

        {!isAdmin && !isVIP && (
          <div className={cn("p-6 rounded-[2rem] border relative overflow-hidden", cardBgClass, borderClass)}>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white"><Lock size={80} /></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2 bg-gray-800 text-gray-400 rounded-xl"><Lock size={20} /></div>
              <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Базовый</span>
            </div>
            <h3 className={cn("text-2xl font-black mb-2 relative z-10", textPrimaryClass)}>Покупки недоступны</h3>
            <p className={cn("text-xs font-medium mb-6 relative z-10 w-5/6 leading-relaxed", textSecondaryClass)}>
              Вы можете просматривать каталог номеров, но для <b>оформления заказа и бронирования</b> необходимо приобрести VIP-статус.
            </p>
            <div className="p-4 bg-[#111] rounded-2xl border border-gray-800 mb-6 relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Стоимость</span>
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">30 дней</span>
              </div>
              <div className="text-2xl font-black italic tracking-tighter text-white">5 000 ₸</div>
            </div>
            <a 
              href={kaspiPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 mb-3 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all bg-[#F14635] text-white hover:bg-[#D93D2E] active:scale-95 shadow-[0_10px_25px_rgba(241,70,53,0.2)] relative z-10"
            >
              <CreditCard size={18} /> Оплатить через Kaspi
            </a>
            <button 
              onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
              className="w-full flex items-center justify-between p-4 bg-[#111] border border-gray-800 rounded-2xl relative z-10 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Что делать после оплаты?</span>
              <ChevronDown size={16} className={cn("transition-transform", isInstructionsOpen ? "rotate-180" : "")} />
            </button>
            {isInstructionsOpen && (
              <div className="p-5 bg-[#151515] border border-gray-800 rounded-2xl mt-2 relative z-10 animate-in slide-in-from-top-2">
                <ol className="text-xs text-gray-400 font-medium mb-5 space-y-3 list-decimal pl-4">
                  <li>Совершите перевод на сумму <b className="text-white">5 000 ₸</b> по кнопке Kaspi выше.</li>
                  <li>После успешного перевода нажмите кнопку <b className="text-white">«Я оплатил»</b> ниже.</li>
                  <li>Ожидайте проверки. Администратор моментально активирует ваш VIP статус.</li>
                </ol>
                <button 
                  onClick={handleBuyVip}
                  disabled={isSending || isSent}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all",
                    isSent ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 active:scale-95 shadow-[0_5px_15px_rgba(212,175,55,0.2)]"
                  )}
                >
                  {isSending ? <span className="animate-pulse">Отправка...</span> : isSent ? <><CheckCircle2 size={16} /> Заявка у администратора</> : <><CheckCircle2 size={16} className="text-black" /> Я оплатил</>}
                </button>
              </div>
            )}
            <button onClick={contactManager} className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20b859] text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-all shadow-md active:scale-95">
              <MessageCircle size={16} /> Связаться с менеджером
            </button>
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 text-gray-500 hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest">
        <LogOut size={16} /> Выйти из аккаунта
      </button>
    </div>
  );
};
