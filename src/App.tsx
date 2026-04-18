import { useState } from 'react';
import { Smartphone, User as UserIcon, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGoldenApp } from './hooks/useGoldenApp';
import { CatalogView } from './views/CatalogView';
import { AdminView } from './views/AdminView';
import { BottomSheet } from './components/ui/BottomSheet';
import { Button } from './components/ui/Button';
import { cn } from './cn';

const KASPI_PAY_LINK = "https://pay.kaspi.kz/pay/nlgccild";

export default function App() {
  const { view, setView, user, selectedPhone, setSelectedPhone, ...state } = useGoldenApp() as any;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <main className="max-w-xl mx-auto px-5 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          {view === 'catalog' && <CatalogView {...state} setSelectedPhone={setSelectedPhone} />}
          {view === 'admin' && <AdminView {...state} setView={setView} />}
          {/* Добавь остальные вьюхи сюда (AuthView, ProfileView) */}
        </AnimatePresence>
      </main>

      {/* Навигация */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex items-center justify-around h-20">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1.5 flex-1", view === 'catalog' ? "text-[#D4AF37]" : "text-gray-300")}>
            <Smartphone size={24} />
            <span className="text-[10px] font-bold uppercase">Маркет</span>
          </button>
          <button onClick={() => setView(user ? 'profile' : 'auth')} className={cn("flex flex-col items-center gap-1.5 flex-1", (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-300")}>
            <UserIcon size={24} />
            <span className="text-[10px] font-bold uppercase">Кабинет</span>
          </button>
        </div>
      </nav>

      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="О номере">
        {selectedPhone && (
          <div className="space-y-10 text-center">
            <div className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100">
              <h3 className="text-5xl font-mono font-bold text-gray-900 tracking-tighter mb-4 italic">{selectedPhone.number}</h3>
              <p className="text-4xl font-black text-[#D4AF37] italic">{selectedPhone.price.toLocaleString()} ₸</p>
            </div>
            <Button fullWidth size="lg" className="py-6 text-lg" onClick={() => window.open(KASPI_PAY_LINK, '_blank')}>
              <ExternalLink size={24}/> Купить через Kaspi
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
