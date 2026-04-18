import React from 'react';
import { Crown, CheckCircle2, ExternalLink, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const KASPI_PAY_LINK = "https://pay.kaspi.kz/pay/nlgccild";

export const SubscriptionView = ({ setView, user }: any) => {
  return (
    <div className="pt-10 space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Шапка */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/10">
          <Crown size={40} className="text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">VIP Доступ</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Разблокируйте эксклюзивные номера</p>
      </div>

      {/* Карточка тарифа */}
      <Card className="p-8 border-[#D4AF37]/20 relative overflow-hidden bg-white">
        {/* Декор на фоне */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        
        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Тариф</p>
              <h3 className="text-3xl font-black text-gray-900 italic">Навсегда</h3>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#D4AF37] leading-none">5 000 ₸</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">единоразово</p>
            </div>
          </div>

          <div className="space-y-4 py-6 border-y border-gray-50">
            {[
              "Доступ ко всем «Золотым» номерам",
              "Прямая связь с владельцем",
              "Бронирование номера на 24 часа",
              "Приоритетная поддержка"
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
              <ExternalLink size={20} className="mr-2" /> Оплатить через Kaspi
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="py-6 border-gray-100 text-gray-400"
              onClick={() => {
                alert("Уведомление отправлено! Администратор проверит оплату в течение 15 минут.");
                // Тут можно вызвать sendPaymentNotification из твоего хука
              }}
            >
              <MessageSquare size={18} className="mr-2" /> Я оплатил
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <p className="text-[10px] text-gray-400 text-center font-bold uppercase leading-relaxed px-4">
          После оплаты ваш аккаунт будет активирован вручную. Если возникли вопросы, пишите в поддержку.
        </p>
      </div>

      {/* Кнопка назад в кабинет, если нужно */}
      <button 
        onClick={() => setView('profile')}
        className="block mx-auto text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
      >
        Вернуться в кабинет
      </button>
    </div>
  );
};
