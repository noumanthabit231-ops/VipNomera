import { useState, useMemo } from 'react';
import { 
  Smartphone, 
  User as UserIcon, 
  ExternalLink,
  Crown,
  Lock,
  ChevronRight,
  MessageSquare,
  ShoppingBag
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

const KASPI_PAY_LINK = "https://pay.kaspi.kz/pay/nlgccild";

export default function App() {
  const { 
    view, 
    setView, 
    user, 
    setUser,
    selectedPhone, 
    setSelectedPhone, 
    ...state 
  } = useGoldenApp() as any;

  // Проверка прав доступа (Админ или Активный VIP с неистекшим сроком)
  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    
    const isActive = user.subscription === 'ACTIVE';
    const isNotExpired = user.expiry_date ? new Date(user.expiry_date) > new Date() : false;
    
    return isActive && isNotExpired;
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <main className="max-w-xl mx-auto px-5 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (user ? 'auth' : 'noauth')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ГЕЙТ 1: Если не залогинен — только вход */}
            {!user ? (
              <AuthView />
            ) : (
              <>
                {/* Каталог виден всем авторизованным (Soft Gate) */}
                {view === 'catalog' && (
                  <CatalogView {...state} setSelectedPhone={setSelectedPhone} />
                )}

                {/* Админка */}
                {view === 'admin' && user.role === 'ADMIN' && (
                  <AdminView {...state} setView={setView} />
                )}
                
                {/* Кабинет (Там теперь плашка со сроком и покупкой) */}
                {view === 'profile' && (
                  <ProfileView user={user} setView={setView} setUser={setUser} />
                )}

                {/* Экран покупки подписки */}
                {view === 'subscription' && (
                  <SubscriptionView 
                    setView={setView} 
                    user={user}
                    onNotify={() => state.sendPaymentNotification(user)} 
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Навигация */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex items-center justify-around h-20">
          <button 
            onClick={() => setView('catalog')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all", 
              view === 'catalog' ? "text-[#D4AF37]" : "text-gray-300"
            )}
          >
            <Smartphone size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Маркет</span>
          </button>
          
          <button 
            onClick={() => setView(user ? 'profile' : 'auth')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all", 
              (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-300"
            )}
          >
            <UserIcon size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {user ? 'Кабинет' : 'Войти'}
            </span>
          </button>
        </div>
      </nav>

      {/* МОДАЛКА ОФОРМЛЕНИЯ НОМЕРА */}
      <BottomSheet 
        isOpen={!!selectedPhone} 
        onClose={() => setSelectedPhone(null)} 
        title="Оформление заказа"
      >
        {selectedPhone && (
          <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 rounded-[2.5rem] py-10 px-4 border border-gray-100 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-gray-900">
                <ShoppingBag size={140} />
              </div>
              
              <h3 className="text-3xl sm:text-5xl font-mono font-bold text-gray-900 tracking-tighter mb-4 italic leading-none relative z-10">
                {selectedPhone.number}
              </h3>
              <p className="text-3xl font-black text-[#D4AF37] italic relative z-10">
                {selectedPhone.price.toLocaleString()} ₸
              </p>
            </div>
            
            <div className="space-y-3">
              {hasAccess ? (
                <>
                  {/* ДЛЯ VIP: Кнопка оплаты и Кнопка подтверждения */}
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg shadow-xl shadow-[#D4AF37]/20" 
                    onClick={() => window.open(KASPI_PAY_LINK, '_blank')}
                  >
                    <ExternalLink size={20} className="mr-2" /> Оплатить через Kaspi
                  </Button>

                  <Button 
                    fullWidth 
                    variant="outline" 
                    className="py-6 border-gray-100 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all"
                    onClick={async () => {
                      const ok = await state.sendPurchaseNotification(user, selectedPhone);
                      if (ok) {
                        alert("Заявка на номер отправлена! Администратор проверит оплату и свяжется с вами.");
                        setSelectedPhone(null);
                      }
                    }}
                  >
                    <MessageSquare size={18} className="mr-2" /> Я оплатил, свяжитесь со мной
                  </Button>
                </>
              ) : (
                /* ДЛЯ ОБЫЧНЫХ: Кнопка перехода на покупку VIP */
                <div className="space-y-4">
                  <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl flex items-center justify-center gap-2 border border-orange-100">
                    <Lock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Покупка доступна только VIP</span>
                  </div>
                  <Button 
                    fullWidth 
                    size="lg" 
                    variant="primary"
                    className="py-6 text-lg shadow-xl" 
                    onClick={() => {
                      setSelectedPhone(null);
                      setView('subscription');
                    }}
                  >
                    <Crown size={20} className="mr-2" /> Открыть VIP доступ
                  </Button>
                </div>
              )}
              
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-2">
                {hasAccess ? "Подтвердите покупку после перевода средств" : "Активируйте подписку для бронирования"}
              </p>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
