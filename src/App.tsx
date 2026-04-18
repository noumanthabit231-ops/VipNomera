import { useState, useMemo } from 'react';
import { 
  Smartphone, 
  User as UserIcon, 
  ExternalLink,
  Crown,
  Lock
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

  // Железная проверка доступа
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
            {/* ГЕЙТ 1: Если нет пользователя — показываем только авторизацию */}
            {!user ? (
              <AuthView />
            ) : (
              <>
                {/* ГЕЙТ 2: Если пользователь есть, но нет доступа — показываем оплату */}
                {view === 'catalog' && (
                  hasAccess ? (
                    <CatalogView {...state} setSelectedPhone={setSelectedPhone} />
                  ) : (
                    <SubscriptionView 
                      setView={setView} 
                      user={user}
                      onNotify={() => state.sendPaymentNotification(user)} 
                    />
                  )
                )}

                {/* Админка (доступна только с ролью ADMIN) */}
                {view === 'admin' && user.role === 'ADMIN' && (
                  <AdminView {...state} setView={setView} />
                )}
                
                {/* Личный кабинет */}
                {view === 'profile' && (
                  <ProfileView user={user} setView={setView} setUser={setUser} />
                )}

                {/* Экран подписки */}
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
            <div className="relative">
              <Smartphone size={24} />
              {!hasAccess && user && (
                <Lock size={10} className="absolute -top-1 -right-1 text-red-400" />
              )}
            </div>
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

      {/* Модалка с информацией */}
      <BottomSheet 
        isOpen={!!selectedPhone} 
        onClose={() => setSelectedPhone(null)} 
        title="О номере"
      >
        {selectedPhone && (
          <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 rounded-[2.5rem] py-10 px-4 border border-gray-100">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-gray-900 tracking-tighter mb-4 italic break-all leading-none">
                {selectedPhone.number}
              </h3>
              <p className="text-3xl font-black text-[#D4AF37] italic">
                {selectedPhone.price.toLocaleString()} ₸
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                fullWidth 
                size="lg" 
                className="py-6 text-lg shadow-xl" 
                onClick={() => window.open(KASPI_PAY_LINK, '_blank')}
              >
                <ExternalLink size={24}/> Купить через Kaspi
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
