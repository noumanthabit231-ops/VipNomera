import { useState, useMemo } from 'react';
import { 
  Smartphone, User as UserIcon, Crown, 
  Lock, MessageSquare, FileText, CheckCircle2, X
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

export default function App() {
  const { 
    view, setView, user, setUser, selectedPhone, setSelectedPhone, 
    isLoading, userOrders, createOrder, isLight, toggleTheme, ...state 
  } = useGoldenApp() as any;

  const [isOrderSending, setIsOrderSending] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'error' | 'success' } | null>(null);

  const showToast = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000); 
  };

  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const isActive = user.subscription === 'ACTIVE';
    const isNotExpired = user.expiry_date ? new Date(user.expiry_date) > new Date() : false;
    return isActive && isNotExpired;
  }, [user]);

  // Упрощенный выбор номера без блокировок
  const handleSelectPhoneWrapper = async (phone: any) => {
    if (phone.status === 'SOLD') {
      showToast("Лот недоступен", "Этот номер уже продан.");
      return;
    }
    setSelectedPhone(phone);
  };

  // 🌟 ЛОГИКА WHATSAPP (ПРЯМАЯ СВЯЗЬ) 🌟
  const handleWhatsAppOrder = async () => {
    if (isOrderSending || !selectedPhone) return;
    setIsOrderSending(true);
    
    try {
      // Создаем запись в базе для истории (вкладка "Заявки" у админа)
      await createOrder(selectedPhone, 'PURCHASE');
      
      const message = `Здравствуйте! Хочу приобрести номер: ${selectedPhone.number}`;
      const whatsappUrl = `https://wa.me/77077977767?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');

      showToast("Заявка создана", "Переходим в WhatsApp...", "success");
      setSelectedPhone(null);
    } catch (error) {
      showToast("Ошибка", "Не удалось создать заявку. Попробуйте еще раз.");
    } finally {
      setIsOrderSending(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen selection:bg-[#D4AF37]/30 transition-colors duration-500",
      isLight ? "bg-[#F4F4F6] text-black" : "bg-[#050505] text-white"
    )}>
      
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm border rounded-2xl p-4 shadow-2xl flex items-start gap-4",
              isLight ? "bg-white border-gray-200" : "bg-[#1A1A1A] border-gray-800"
            )}
          >
            <div className={cn("p-2 rounded-full", toast.type === 'error' ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500")}>
               {toast.type === 'error' ? <Lock size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-[10px] tracking-widest mb-1 uppercase">
                 {toast.title}
               </h4>
               <p className={cn("text-xs leading-tight", isLight ? "text-gray-500" : "text-gray-400")}>
                 {toast.message}
               </p>
            </div>
            <button onClick={() => setToast(null)} className={cn("transition-colors mt-0.5", isLight ? "text-gray-400 hover:text-gray-700" : "text-gray-600 hover:text-white")}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-xl mx-auto px-5 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (user ? '-auth' : '-guest')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="will-change-opacity"
          >
            {view === 'catalog' && (
              <CatalogView 
                {...state} isLoading={isLoading} user={user} 
                userOrders={userOrders} setSelectedPhone={handleSelectPhoneWrapper} setView={setView} 
                isLight={isLight} toggleTheme={toggleTheme}
              />
            )}
            
            {view === 'my_orders' && (
               <div className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <button onClick={() => setView('catalog')} className={cn("font-bold text-[10px] mb-8 flex items-center gap-2 tracking-widest transition-colors uppercase", isLight ? "text-gray-500 hover:text-black" : "text-gray-500 hover:text-white")}>
                   ← Назад в маркет
                 </button>
                 
                 <div className="flex items-center justify-between mb-8">
                    <h2 className={cn("text-3xl font-extrabold tracking-tight", isLight ? "text-black" : "text-white")}>Мои заявки</h2>
                    <div className="bg-[#D4AF37]/10 px-4 py-1 rounded-full border border-[#D4AF37]/20">
                       <span className="text-[#D4AF37] font-bold text-xs">{userOrders.length}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                   {userOrders.length === 0 ? (
                     <div className="py-20 text-center">
                        <FileText size={48} className={cn("mx-auto mb-4 opacity-20", isLight ? "text-gray-400" : "text-gray-800")} />
                        <p className={cn("font-bold text-xs tracking-wide", isLight ? "text-gray-500" : "text-gray-600")}>Активных заявок пока нет</p>
                     </div>
                   ) : (
                     userOrders.map((o: any) => (
                       <div key={o.id} className={cn(
                        "p-6 border rounded-[2.5rem] flex justify-between items-center",
                        isLight ? "bg-white border-gray-200" : "bg-[#111] border-gray-800"
                      )}>
                        <div>
                          <p className="text-[#D4AF37] font-bold text-xl tracking-tight mb-1">{o.phone_number}</p>
                          <p className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">{o.type === 'PURCHASE' ? 'Покупка' : 'Заказ'}</p>
                        </div>
                        <div className="text-right">
                          <div className={cn("font-bold text-sm mb-1", isLight ? "text-black" : "text-white")}>{o.price.toLocaleString()} ₸</div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                             <span className="text-[8px] text-green-500 font-bold uppercase">Активна</span>
                          </div>
                        </div>
                      </div>
                     ))
                   )}
                 </div>
               </div>
            )}

            {view === 'auth' && !user && <AuthView />}
            {view === 'order' && (user ? <OrderNumberView user={user} setView={setView} /> : <AuthView />)}
            {view === 'admin' && user?.role === 'ADMIN' && <AdminView {...state} setView={setView} isLight={isLight} />}
            {view === 'profile' && user && <ProfileView user={user} setView={setView} setUser={setUser} />}
            {view === 'subscription' && (user ? <SubscriptionView setView={setView} user={user} /> : <AuthView />)}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm rounded-[2.5rem] border backdrop-blur-md",
        isLight ? "bg-white/90 border-gray-200 shadow-xl shadow-gray-200/50" : "bg-[#111111]/95 border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5"
      )}>
        <div className="flex items-center justify-around h-20">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all", view === 'catalog' ? "text-[#D4AF37] scale-110" : "text-gray-500")}>
            <Smartphone size={24} /><span className="text-[10px] font-bold uppercase tracking-wide">Маркет</span>
          </button>
          <button onClick={() => setView(user ? 'profile' : 'auth')} className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all", (view === 'profile' || view === 'auth') ? "text-[#D4AF37] scale-110" : "text-gray-500")}>
            <UserIcon size={24} /><span className="text-[10px] font-bold uppercase tracking-wide">{user ? 'Кабинет' : 'Войти'}</span>
          </button>
        </div>
      </nav>

      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="Оформление заказа">
        {selectedPhone && (
          <div className={cn(
            "space-y-8 text-center p-2 rounded-t-3xl -mx-4 -mb-4 pb-10",
            isLight ? "bg-[#F4F4F6]" : "bg-[#0A0A0A]"
          )}>
            <div className={cn(
              "rounded-[2.5rem] py-10 px-4 border relative overflow-hidden",
              isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#111] border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5"
            )}>
              <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Выбранный лот</p>
              <h3 className={cn("text-4xl sm:text-5xl font-extrabold tracking-tight mb-4", isLight ? "text-black" : "text-white")}>
                {selectedPhone.number}
              </h3>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-5 py-2.5 rounded-full border border-[#D4AF37]/20">
                <span className="text-2xl font-bold text-[#D4AF37]">{selectedPhone.price.toLocaleString()} ₸</span>
              </div>
            </div>
            
            <div className="space-y-4 px-2">
              {hasAccess ? (
                <>
                  <p className={cn("text-xs font-medium px-6", isLight ? "text-gray-500" : "text-gray-400")}>
                    Для завершения покупки нажмите кнопку ниже — откроется чат с менеджером в WhatsApp.
                  </p>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-[#25D366] text-white hover:opacity-90 border-none font-bold rounded-2xl shadow-xl shadow-[#25D366]/10" 
                    onClick={handleWhatsAppOrder}
                    disabled={isOrderSending}
                  >
                    <MessageSquare size={22} className="mr-2" /> 
                    {isOrderSending ? "Связь..." : "Написать в WhatsApp"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 text-red-400 p-5 rounded-2xl flex items-center justify-center gap-2 border border-red-500/20">
                    <Lock size={16} />
                    <span className="text-xs font-bold tracking-wide">Покупка доступна только для VIP</span>
                  </div>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-[#D4AF37] text-black border-none font-bold rounded-2xl shadow-xl shadow-[#D4AF37]/10" 
                    onClick={() => { setSelectedPhone(null); setView('profile'); }}
                  >
                    <Crown size={22} className="mr-2" /> Открыть VIP доступ
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
