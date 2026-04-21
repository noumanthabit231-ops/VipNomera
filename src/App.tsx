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
import { BottomSheet } from './components/ui/BottomSheet';
import { Button } from './components/ui/Button';
import { cn } from './cn';
import { OrderNumberView } from './views/OrderNumberView';

const KASPI_PAY_LINK = import.meta.env.VITE_KASPI_LINK || "https://pay.kaspi.kz/pay/nlgccild";

export default function App() {
  const { 
    view, setView, user, setUser, selectedPhone, setSelectedPhone, 
    isLoading, userOrders, createOrder, ...state 
  } = useGoldenApp() as any;

  // Локальные состояния для шторки покупки
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [isOrderSending, setIsOrderSending] = useState(false);

  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const isActive = user.subscription === 'ACTIVE';
    const isNotExpired = user.expiry_date ? new Date(user.expiry_date) > new Date() : false;
    return isActive && isNotExpired;
  }, [user]);

  const handleConfirmPurchase = async () => {
    if (isOrderSending) return;
    setIsOrderSending(true);
    
    // 1. Сохраняем в БД
    const success = await createOrder(selectedPhone, 'PURCHASE');
    
    if (success) {
      // 2. Отправляем в ТГ
      await state.sendPurchaseNotification(user, selectedPhone);
      alert("Ваша заявка принята! Менеджер свяжется с вами в ближайшее время.");
      setSelectedPhone(null);
      setIsHowToOpen(false);
    } else {
      alert("Ошибка при отправке заявки. Пожалуйста, попробуйте позже.");
    }
    setIsOrderSending(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37]/30">
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
            {/* 🌟 КАТАЛОГ 🌟 */}
            {view === 'catalog' && (
              <CatalogView 
                {...state} isLoading={isLoading} user={user} 
                userOrders={userOrders} setSelectedPhone={setSelectedPhone} setView={setView} 
              />
            )}
            
            {/* 🌟 МОИ ЗАЯВКИ (ЭКРАН) 🌟 */}
            {view === 'my_orders' && (
               <div className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <button onClick={() => setView('catalog')} className="text-gray-500 uppercase font-black text-[10px] mb-8 flex items-center gap-2 tracking-widest hover:text-white transition-colors">
                   ← Назад в маркет
                 </button>
                 
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Мои заявки</h2>
                    <div className="bg-[#D4AF37]/10 px-4 py-1 rounded-full border border-[#D4AF37]/20">
                       <span className="text-[#D4AF37] font-black text-xs uppercase">{userOrders.length}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                   {userOrders.length === 0 ? (
                     <div className="py-20 text-center">
                        <FileText size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
                        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">У вас пока нет активных заявок</p>
                     </div>
                   ) : (
                     userOrders.map((o: any) => (
                       <div key={o.id} className="relative group">
                          <div className="absolute inset-0 bg-[#D4AF37]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative p-6 bg-[#111] border border-gray-800 rounded-[2.5rem] flex justify-between items-center transition-all hover:border-[#D4AF37]/30">
                            <div>
                              <p className="text-[#D4AF37] font-black text-xl tracking-tighter leading-none mb-1">{o.phone_number}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">
                                  {new Date(o.created_at).toLocaleDateString('ru-RU')}
                                </span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                <span className="text-[8px] text-[#D4AF37] uppercase font-black tracking-widest">
                                  {o.type === 'PURCHASE' ? 'Покупка' : 'Заказ'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-black text-sm mb-1">{o.price.toLocaleString()} ₸</div>
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                                 <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                 <span className="text-[7px] text-green-500 font-black uppercase tracking-widest">Обработка</span>
                              </div>
                            </div>
                          </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
            )}

            {/* ОСТАЛЬНЫЕ ВЬЮ */}
            {view === 'auth' && !user && <AuthView />}
            {view === 'order' && (user ? <OrderNumberView user={user} setView={setView} /> : <AuthView />)}
            {view === 'admin' && user?.role === 'ADMIN' && <AdminView {...state} setView={setView} />}
            {view === 'profile' && user && <ProfileView user={user} setView={setView} setUser={setUser} sendPaymentNotification={state.sendPaymentNotification} />}
            {view === 'subscription' && (user ? <SubscriptionView setView={setView} user={user} onNotify={() => state.sendPaymentNotification(user)} /> : <AuthView />)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-sm bg-[#111111]/95 rounded-[2.5rem] border border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/5 backdrop-blur-md">
        <div className="flex items-center justify-around h-20">
          <button 
            onClick={() => setView('catalog')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", 
              view === 'catalog' ? "text-[#D4AF37] scale-110" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Smartphone size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Маркет</span>
          </button>
          
          <button 
            onClick={() => setView(user ? 'profile' : 'auth')} 
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all duration-300", 
              (view === 'profile' || view === 'auth') ? "text-[#D4AF37] scale-110" : "text-gray-500 hover:text-gray-300"
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
        onClose={() => { setSelectedPhone(null); setIsHowToOpen(false); }} 
        title="Оформление заказа"
      >
        {selectedPhone && (
          <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300 bg-[#0A0A0A] p-2 rounded-t-3xl -mx-4 -mb-4 pb-10">
            
            <div className="bg-[#111] rounded-[2.5rem] py-10 px-4 border border-[#D4AF37]/30 relative overflow-hidden shadow-2xl shadow-[#D4AF37]/5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
              
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Выбранный лот</p>
              <h3 className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tighter mb-4 leading-none">{selectedPhone.number}</h3>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-5 py-2.5 rounded-full border border-[#D4AF37]/20">
                <ShieldCheck size={18} className="text-[#D4AF37]" />
                <span className="text-2xl font-black text-[#D4AF37]">{selectedPhone.price.toLocaleString()} ₸</span>
              </div>
            </div>
            
            <div className="space-y-3 px-2">
              {hasAccess ? (
                <>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-[#F14635] text-white hover:opacity-90 border-none shadow-[0_10px_20px_rgba(241,70,53,0.1)] font-black uppercase tracking-tight rounded-2xl" 
                    onClick={() => window.open(KASPI_PAY_LINK, '_blank')}
                  >
                    <ExternalLink size={20} className="mr-2" /> Оплатить через Kaspi
                  </Button>

                  <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#0F0F0F] transition-all">
                    <button 
                      onClick={() => setIsHowToOpen(!isHowToOpen)} 
                      className="w-full p-5 flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-widest hover:bg-white/5 transition-colors"
                    >
                      Что делать дальше? 
                      <ChevronDown size={14} className={cn("transition-transform duration-300", isHowToOpen ? "rotate-180" : "")}/>
                    </button>
                    
                    {isHowToOpen && (
                      <div className="p-6 text-left text-[11px] text-gray-400 space-y-5 border-t border-gray-800 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-black text-[9px]">1</div>
                           <p>Совершите перевод суммы <b className="text-white">{selectedPhone.price.toLocaleString()} ₸</b> в приложении Kaspi по кнопке выше.</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-black text-[9px]">2</div>
                           <p>После завершения платежа вернитесь сюда и нажмите кнопку <b>«Я оплатил»</b>.</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-black text-[9px]">3</div>
                           <p>Ваша заявка попадет в систему, и администратор свяжется с вами для оформления номера.</p>
                        </div>
                        
                        <Button 
                          fullWidth 
                          className="py-5 bg-[#D4AF37] text-black hover:bg-[#B58B22] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#D4AF37]/10 transition-all active:scale-95 mt-2"
                          onClick={handleConfirmPurchase}
                          disabled={isOrderSending}
                        >
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
                    <span className="text-[10px] font-black uppercase tracking-widest">Бронирование доступно только для VIP</span>
                  </div>
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="py-6 text-lg bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black hover:opacity-90 border-none font-black uppercase rounded-2xl shadow-xl shadow-[#D4AF37]/10" 
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
