import { useState, useMemo } from 'react';
import { 
  Smartphone, 
  User as UserIcon, 
  ExternalLink,
  Crown,
  Lock,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGoldenApp } from './hooks/useGoldenApp';
import { CatalogView } from './views/CatalogView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { ProfileView } from './views/ProfileView';
import { SubscriptionView } from './views/SubscriptionView';
import { BottomSheet } from './components/ui/BottomSheet';
import { Button } from './components/ui/Button';
import { cn } from './cn';
import { OrderNumberView } from './views/OrderNumberView';

const KASPI_PAY_LINK = import.meta.env.VITE_KASPI_LINK || "https://pay.kaspi.kz/pay/nlgccild";

export default function App() {
  const { 
    view, 
    setView, 
    user, 
    setUser,
    selectedPhone, 
    setSelectedPhone,
    isLoading, // 🌟 ЯВНО ДОСТАЕМ ИНДИКАТОР ЗАГРУЗКИ 🌟
    ...state 
  } = useGoldenApp() as any;

  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const isActive = user.subscription === 'ACTIVE';
    const isNotExpired = user.expiry_date ? new Date(user.expiry_date) > new Date() : false;
    return isActive && isNotExpired;
  }, [user]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37]/30">
      <main className="max-w-xl mx-auto px-5 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          {/* ОПТИМИЗАЦИЯ ДЛЯ МОБИЛЬНЫХ: Только opacity */}
          <motion.div
            key={view + (user ? '-auth' : '-guest')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="will-change-opacity"
          >
            {/* 🌟 ОБЯЗАТЕЛЬНО ПЕРЕДАЕМ isLoading и user ЯВНО 🌟 */}
            {view === 'catalog' && (
              <CatalogView 
                {...state} 
                isLoading={isLoading} 
                user={user} 
                setSelectedPhone={setSelectedPhone} 
                setView={setView} 
              />
            )}
            
            {view === 'auth' && !user && <AuthView />}
            {view === 'order' && (user ? <OrderNumberView user={user} setView={setView} /> : <AuthView />)}
            {view === 'admin' && user?.role === 'ADMIN' && <AdminView {...state} setView={setView} />}
            {view === 'profile' && user && <ProfileView user={user} setView={setView} setUser={setUser} sendPaymentNotification={state.sendPaymentNotification} />}
            {view === 'subscription' && (user ? <SubscriptionView setView={setView} user={user} onNotify={() => state.sendPaymentNotification(user)} /> : <AuthView />)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm bg-[#111111]/95 rounded-[2.5rem] border border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5">
        <div className="flex items-center justify-around h-20">
          <button 
            onClick={() => setView('catalog')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", 
              view === 'catalog' ? "text-[#D4AF37]" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Smartphone size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Маркет</span>
          </button>
          
          <button 
            onClick={() => setView(user ? 'profile' : 'auth')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", 
              (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <UserIcon size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {user ? 'Кабинет' : 'Войти'}
            </span>
          </button>
        </div>
      </nav>

      {/* ШТОРКА ОФОРМЛЕНИЯ ЗАКАЗА */}
      <BottomSheet 
        isOpen={!!selectedPhone} 
        onClose={() => setSelectedPhone(null)} 
        title="Оформление заказа"
      >
        {selectedPhone && (
          <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300 bg-[#0A0A0A] p-2 rounded-t-3xl -mx-4 -mb-4">
            
            <div className="bg-[#111] rounded-[2rem] py-10 px-4 border border-[#D4AF37]/30 relative overflow-hidden shadow-2xl shadow-[#D4AF37]/5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
              
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                Выбранный лот
              </p>
              <h3 className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tighter mb-4 leading-none">
                {selectedPhone.number}
              </h3>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/20">
                <ShieldCheck size={16} className="text-[#D4AF37]" />
                <span className="text-xl font-black text-[#D4AF37]">
                  {selectedPhone.price.toLocaleString()} ₸
                </span>
              </div>
            </div>
            
            <div className="space-y-3 px-2">
              {hasAccess ? (
                <>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 border-none shadow-[0_0_20px_rgba(212,175,55,0.2)] font-black uppercase tracking-tight" 
                    onClick={() => window.open(KASPI_PAY_LINK, '_blank')}
                  >
                    <ExternalLink size={20} className="mr-2" /> Оплатить через Kaspi
                  </Button>

                  <Button 
                    fullWidth 
                    variant="outline" 
                    className="py-6 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-bold uppercase text-xs"
                    onClick={async () => {
                      const ok = await state.sendPurchaseNotification(user, selectedPhone);
                      if (ok) {
                        alert("Заявка отправлена! Ожидайте сообщения от менеджера.");
                        setSelectedPhone(null);
                      } else {
                        alert("Ошибка отправки. Попробуйте позже.");
                      }
                    }}
                  >
                    <MessageSquare size={16} className="mr-2" /> Подтвердить оплату
                  </Button>
                </>
              ) : user ? (
                <div className="space-y-4">
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/20">
                    <Lock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Доступно только для VIP</span>
                  </div>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 border-none font-black uppercase" 
                    onClick={() => {
                      setSelectedPhone(null);
                      setView('profile'); // Изменил с 'subscription' на 'profile'
                    }}
                  >
                    <Crown size={20} className="mr-2" /> Открыть VIP доступ
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#111] text-gray-400 p-4 rounded-2xl flex items-center justify-center gap-2 border border-gray-800">
                    <UserIcon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Требуется авторизация</span>
                  </div>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-white text-black hover:bg-gray-200 border-none font-black uppercase tracking-tight" 
                    onClick={() => {
                      setSelectedPhone(null);
                      setView('auth');
                    }}
                  >
                    Войти для покупки
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
