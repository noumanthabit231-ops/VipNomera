import React, { useState } from 'react';
import { Crown, CheckCircle2, ExternalLink, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';
import { supabase } from '../supabase';

const KASPI_PAY_LINK = "https://pay.kaspi.kz/pay/nlgccild";

export const SubscriptionView = ({ setView, user, onNotify }: any) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePaidNotification = async () => {
    if (sent) return;
    setLoading(true);
    try {
      const cleanPhone = user?.phone?.replace(/\D/g, '') || '';
      
      // 1. Сохраняем в Supabase
      const { error } = await supabase.from('custom_orders').insert([{
        user_phone: cleanPhone,
        user_name: user?.full_name || user?.name || 'Клиент',
        desired_number: '🔥 ОПЛАТА VIP ПОДПИСКИ (Kaspi) 🔥',
        budget: 3500,
        status: 'NEW'
      }]);

      if (error) {
        alert("Ошибка БД: " + error.message + " (Вам нужно выполнить SQL запрос в Supabase для разрешения записи)");
        setLoading(false);
        return;
      }

      // 2. Отправляем в Telegram
      if (typeof onNotify === 'function') {
        await onNotify();
      }

      setSent(true);
      alert("Заявка отправлена администратору! Доступ будет активирован после проверки оплаты.");
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка. Проверьте интернет-соединение.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/10">
          <Crown size={40} className="text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter text-center">VIP Доступ</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">Доступ к базе золотых номеров</p>
      </div>

      <Card className="p-8 border-[#D4AF37]/20 relative overflow-hidden bg-white">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-[#D4AF37]" />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Период</p>
              </div>
              <h3 className="text-3xl font-black text-gray-900 italic">30 Дней</h3>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#D4AF37] leading-none">3 500 ₸</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 text-right">в месяц</p>
            </div>
          </div>

          <div className="space-y-4 py-6 border-y border-gray-50">
            {[
              "Полный доступ к каталогу номеров",
              "Просмотр скрытых контактов",
              "Уведомления о новых лотах",
              "Персональный менеджер"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <div className="bg-green-50 p-1 rounded-full">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button 
              fullWidth 
              size="lg" 
              className="py-6 text-lg shadow-xl shadow-[#D4AF37]/20" 
              onClick={() => window.open(KASPI_PAY_LINK, '_blank')}
            >
              <ExternalLink size={20} className="mr-2" /> Оплатить подписку
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className={cn(
                "py-6 border-gray-100 transition-all",
                sent ? "text-green-500 bg-green-50/50 border-green-200" : "text-gray-400"
              )}
              onClick={handlePaidNotification}
              disabled={loading || sent}
            >
              {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : sent ? (
                <CheckCircle2 size={18} className="mr-2" />
              ) : (
                <MessageSquare size={18} className="mr-2" />
              )}
              {sent ? "Заявка отправлена" : "Я оплатил"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <p className="text-[10px] text-gray-400 text-center font-bold uppercase leading-relaxed px-4">
          Подписка активируется на 30 календарных дней с момента подтверждения платежа.
        </p>
      </div>

      <button 
        onClick={() => setView('profile')}
        className="block mx-auto text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
      >
        Вернуться в профиль
      </button>
    </div>
  );
};
