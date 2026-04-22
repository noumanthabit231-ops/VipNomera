import { useState, useMemo } from 'react';
import { 
  Smartphone, User as UserIcon, ExternalLink, Crown, 
  Lock, MessageSquare, ShieldCheck, ChevronDown, FileText, CheckCircle2, X
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
    view, setView, user, setUser, selectedPhone, setSelectedPhone, 
    isLoading, userOrders, createOrder, isLight, toggleTheme, ...state 
  } = useGoldenApp() as any;

  const [isHowToOpen, setIsHowToOpen] = useState(false);
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

  const handleSelectPhoneWrapper = async (phone: any) => {
    const locked = await state.tryLockPhone(phone.id);
    if (locked) {
      setSelectedPhone(phone); 
    } else {
      showToast(
        "Доступ ограничен", 
        "Этот номер сейчас оформляет другой клиент. Пожалуйста, подождите завершения его сессии."
      );
    }
  };

  const handleStartPayment = async () => {
    await state.extendLockToPayment(selectedPhone.id);
    window.open(KASPI_PAY_LINK, '_blank');
    setIsHowToOpen(true);
  };

  const handleFinalConfirm = async () => {
    if (isOrderSending) return;
    setIsOrderSending(true);
    
    const success = await createOrder(selectedPhone, 'PURCHASE');
    if (success) {
      await state.sendPurchaseNotification(user, selectedPhone);
      showToast(
        "Успешно!", 
        "Заявка отправлена. Номер закреплен за вами на 30 минут, пока администратор проверяет оплату.",
        "success"
      );
      setSelectedPhone(null);
      setIsHowToOpen(false);
    } else {
      showToast("Ошибка", "Ошибка при отправке заявки. Пожалуйста, попробуйте позже.");
    }
    setIsOrderSending(false);
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
               <h4 className={cn("font-bold uppercase text-[10px] tracking-widest mb-1", isLight ? "text-black" : "text-white")}>
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
                 <button onClick={() => setView('catalog')} className={cn("uppercase font-bold text-[10px] mb-8 flex items-center gap-2 tracking-widest transition-colors", isLight ? "text-gray-500 hover:text-black" : "text-gray-500 hover:text-white")}>
                   ← Назад в маркет
                 </button>
                 
                 <div className="flex items-center justify-between mb-8">
                    {/* 🌟 Убрал italic и uppercase у заголовка */}
                    <h2 className={cn("text-3xl font-extrabold tracking-tight", isLight ? "text-black" : "text-white")}>Мои заявки</h2>
                    <div className="bg-[#D4AF37]/10 px-4 py-1 rounded-full border border-[#D4AF37]/20">
                       <span className="text-[#D4AF37] font-bold text-xs">{userOrders.length}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                   {userOrders.length === 0 ? (
                     <div className="py-20 text-center">
                        <FileText size={48} className={cn("mx-auto mb-4 opacity-20", isLight ? "text-gray-400" : "text-gray-800")} />
                        <p className={cn("font-bold text-xs tracking-wide", isLight ? "text-gray-500" : "text-gray-600")}>У вас пока нет активных заявок</p>
                     </div>
                   ) : (
                     userOrders.map((o: any) => (
                       <div key={o.id} className="relative group">
                          <div className="absolute inset-0 bg-[#D4AF37]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className={cn(
                            "relative p-6 border rounded-[2.5rem] flex justify-between items-center transition-all hover:border-[#D4AF37]/30",
                            isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#111] border-gray-800"
                          )}>
                            <div>
                              <p className="text-[#D4AF37] font-bold text-xl tracking-tight leading-none mb-1">{o.phone_number}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-medium tracking-wide">
                                  {new Date(o.created_at).toLocaleDateString('ru-RU')}
                                </span>
                                <span className={cn("w-1 h-1 rounded-full", isLight ? "bg-gray-300" : "bg-gray-700")} />
                                <span className="text-[9px] text-[#D4AF37] font-bold tracking-wide">
                                  {o.type === 'PURCHASE' ? 'Покупка' : 'Заказ'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn("font-bold text-sm mb-1", isLight ? "text-black" : "text-white")}>{o.price.toLocaleString()} ₸</div>
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                                 <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                 <span className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Обработка</span>
                              </div>
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
            {view === 'admin' && user?.role === 'ADMIN' && <AdminView {...state} setView={setView} />}
            {view === 'profile' && user && <ProfileView user={user} setView={setView} setUser={setUser} sendPaymentNotification={state.sendPaymentNotification} />}
            {view === 'subscription' && (user ? <SubscriptionView setView={setView} user={user} onNotify={() => state.sendPaymentNotification(user)} /> : <AuthView />)}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm rounded-[2.5rem] border backdrop-blur-md",
        isLight ? "bg-white/90 border-gray-200 shadow-xl shadow-gray-200/50" : "bg-[#111111]/95 border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5"
      )}>
        <div className="flex items-center justify-around h-20">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", view === 'catalog' ? "text-[#D4AF37] scale-110" : (isLight ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"))}>
            <Smartphone size={24} /><span className="text-[10px] font-bold tracking-wide">Маркет</span>
          </button>
          <button onClick={() => setView(user ? 'profile' : 'auth')} className={cn("flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", (view === 'profile' || view === 'auth') ? "text-[#D4AF37] scale-110" : (isLight ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"))}>
            <UserIcon size={24} /><span className="text-[10px] font-bold tracking-wide">{user ? 'Кабинет' : 'Войти'}</span>
          </button>
        </div>
      </nav>

      <BottomSheet isOpen={!!selectedPhone} onClose={() => { setSelectedPhone(null); setIsHowToOpen(false); }} title="Оформление заказа">
        {selectedPhone && (
          <div className={cn(
            "space-y-8 text-center animate-in fade-in zoom-in duration-300 p-2 rounded-t-3xl -mx-4 -mb-4 pb-10",
            isLight ? "bg-[#F4F4F6]" : "bg-[#0A0A0A]"
          )}>
            <div className={cn(
              "rounded-[2.5rem] py-10 px-4 border relative overflow-hidden",
              isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#111] border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5"
            )}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
              <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Выбранный лот</p>
              {/* 🌟 Убрал font-mono и font-black, сделал классический жирный шрифт */}
              <h3 className={cn("text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-none", isLight ? "text-black" : "text-white")}>{selectedPhone.number}</h3>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-5 py-2.5 rounded-full border border-[#D4AF37]/20">
                <ShieldCheck size={18} className="text-[#D4AF37]" />
                <span className="text-2xl font-bold text-[#D4AF37]">{selectedPhone.price.toLocaleString()} ₸</span>
              </div>
            </div>
            
            <div className="space-y-3 px-2">
              {hasAccess ? (
                <>
                  <Button fullWidth size="lg" className="py-6 text-lg bg-[#F14635] text-white hover:opacity-90 border-none shadow-[0_10px_20px_rgba(241,70,53,0.1)] font-bold tracking-wide rounded-2xl" onClick={handleStartPayment}>
                    <ExternalLink size={20} className="mr-2" /> Оплатить через Kaspi
                  </Button>

                  <div className={cn("border rounded-2xl overflow-hidden transition-all", isLight ? "bg-white border-gray-200" : "bg-[#0F0F0F] border-gray-800")}>
                    <button onClick={() => setIsHowToOpen(!isHowToOpen)} className={cn("w-full p-5 flex justify-between items-center text-[11px] font-bold tracking-wide transition-colors", isLight ? "text-gray-600 hover:bg-gray-50" : "text-gray-400 hover:bg-white/5")}>
                      Что делать дальше? <ChevronDown size={14} className={cn("transition-transform duration-300", isHowToOpen ? "rotate-180" : "")}/>
                    </button>
                    {isHowToOpen && (
                      <div className={cn("p-6 text-left text-sm space-y-5 border-t animate-in slide-in-from-top-2 duration-300", isLight ? "border-gray-100 text-gray-700" : "border-gray-800 text-gray-300")}>
                        <div className="flex gap-3">
                           <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-bold text-[10px]">1</div>
                           <p>Совершите перевод суммы <b className={isLight ? "text-black" : "text-white"}>{selectedPhone.price.toLocaleString()} ₸</b> в приложении Kaspi по кнопке выше.</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-bold text-[10px]">2</div>
                           <p>После завершения платежа вернитесь сюда и нажмите кнопку <b>«Я оплатил»</b>.</p>
                        </div>
                        <Button fullWidth className="py-5 bg-[#D4AF37] text-black hover:bg-[#B58B22] font-bold tracking-wide rounded-xl shadow-xl shadow-[#D4AF37]/10 transition-all active:scale-95 mt-2" onClick={handleFinalConfirm} disabled={isOrderSending}>
                          {isOrderSending ? "Отправка..." : "Я оплатил"}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 text-red-400 p-5 rounded-2xl flex items-center justify-center gap-2 border border-red-500/20">
                    <Lock size={16} />
                    <span className="text-xs font-bold tracking-wide">Бронирование доступно только для VIP</span>
                  </div>
                  <Button fullWidth size="lg" className="py-6 text-lg bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 border-none font-bold rounded-2xl shadow-xl shadow-[#D4AF37]/10" onClick={() => { setSelectedPhone(null); setView('profile'); }}>
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
