import { useState } from 'react';
import { 
  Smartphone, 
  User as UserIcon, 
  ShieldCheck, 
  ExternalLink,
  Plus,
  Trash2,
  X,
  Search,
  Settings,
  Crown,
  LogOut,
  ChevronRight,
  ShoppingBag,
  MessageSquare,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGoldenApp } from './hooks/useGoldenApp';
import { CatalogView } from './views/CatalogView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView'; // Убедись, что файл создан
import { ProfileView } from './views/ProfileView'; // Убедись, что файл создан
import { BottomSheet } from './components/ui/BottomSheet';
import { Button } from './components/ui/Button';
import { cn } from './cn';

const KASPI_PAY_LINK = "https://pay.kaspi.kz/pay/nlgccild";

export default function App() {
  // Вытаскиваем всё из нашего хука
  const { 
    view, 
    setView, 
    user, 
    setUser,
    selectedPhone, 
    setSelectedPhone, 
    ...state 
  } = useGoldenApp() as any;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <main className="max-w-xl mx-auto px-5 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Рендерим вьюхи в зависимости от состояния */}
            {view === 'catalog' && (
              <CatalogView {...state} setSelectedPhone={setSelectedPhone} />
            )}
            
            {view === 'admin' && (
              <AdminView {...state} setView={setView} />
            )}
            
            {view === 'auth' && (
              <AuthView {...state} />
            )}
            
            {view === 'profile' && user && (
              <ProfileView user={user} setView={setView} setUser={setUser} />
            )}

            {view === 'subscription' && (
              <div className="pt-10 space-y-8 text-center px-4">
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/20 shadow-2xl">
                  <Crown size={40} className="text-[#D4AF37]" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">VIP Access</h1>
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <p className="text-4xl font-black text-gray-900 italic">5 000 ₸</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Оплата через Kaspi Pay</p>
                  <Button fullWidth size="lg" onClick={() => window.open(KASPI_PAY_LINK, '_blank')}>
                    <ExternalLink size={18} /> Перейти к оплате
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Навигация */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex items-center justify-around h-20">
          <button 
            onClick={() => setView('catalog')} 
            className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all", view === 'catalog' ? "text-[#D4AF37]" : "text-gray-300")}
          >
            <Smartphone size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Маркет</span>
          </button>
          <button 
            onClick={() => setView(user ? 'profile' : 'auth')} 
            className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all", (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-300")}
          >
            <UserIcon size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Кабинет</span>
          </button>
        </div>
      </nav>

      {/* Модалка с инфой о номере */}
      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="О номере">
  {selectedPhone && (
    <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-gray-50 rounded-[2.5rem] py-10 px-4 border border-gray-100">
        {/* Адаптивный размер текста: уменьшается на мобилках */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-gray-900 tracking-tighter mb-4 italic break-all select-all leading-none">
          {selectedPhone.number}
        </h3>
        <p className="text-3xl font-black text-[#D4AF37] italic">
          {selectedPhone.price.toLocaleString()} ₸
        </p>
        <div className="mt-6 flex justify-center">
          <span className={cn(
            "px-5 py-2 rounded-full text-[10px] font-black uppercase border-2",
            selectedPhone.status === 'IN_STOCK' ? "border-green-100 text-green-600 bg-white" : "border-orange-100 text-orange-600 bg-white"
          )}>
            {selectedPhone.status === 'IN_STOCK' ? '• В наличии' : '• Ожидание 24 часа'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button fullWidth size="lg" className="py-6 text-lg shadow-xl" onClick={() => window.open(KASPI_PAY_LINK, '_blank')}>
          <ExternalLink size={24}/> Купить через Kaspi
        </Button>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Безопасный платеж через Kaspi Pay
        </p>
      </div>
    </div>
  )}
</BottomSheet>
        )}
      </BottomSheet>
    </div>
  );
}
