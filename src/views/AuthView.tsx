import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = ({ onLoginSuccess }: any) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleStartAuth = async () => {
    if (phone.length < 10) return alert("Введите корректный номер");
    setLoading(true);
    
    const newCode = generateCode();
    setCode(newCode);

    const { error } = await supabase
      .from('auth_codes')
      .insert([{ phone, code: newCode }]);

    setLoading(false);
    if (!error) setStep('verify');
    else alert("Ошибка. Попробуйте снова.");
  };

  // Опрос базы данных (Polling)
  useEffect(() => {
    if (step !== 'verify') return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('auth_codes')
        .select('is_verified')
        .eq('phone', phone)
        .eq('code', code)
        .single();

      if (data?.is_verified) {
        clearInterval(interval);
        // Сохраняем сессию локально
        const userData = { phone, role: 'USER', id: Date.now().toString() };
        localStorage.setItem('golden_v2_session', JSON.stringify(userData));
        window.location.reload(); // Перезагружаем для входа
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, phone, code]);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {step === 'phone' ? (
        <Card className="p-10">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Smartphone className="text-gray-900" size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase italic">Вход</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Введите номер для доступа</p>
          
          <div className="space-y-4">
            <input 
              type="tel"
              placeholder="+7 (7xx) xxx-xx-xx" 
              className="w-full bg-gray-50 border-none rounded-2xl p-5 text-gray-900 font-bold outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all text-center"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button fullWidth size="lg" disabled={loading} onClick={handleStartAuth}>
              {loading ? "Загрузка..." : "Получить код в Telegram"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-10 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-[#D4AF37]" size={28} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Подтверждение</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Запустите бота для входа</p>

          <div className="bg-gray-50 rounded-[2rem] py-8 mb-8 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Ваш код</span>
            <span className="text-5xl font-mono font-black text-gray-900 tracking-[0.2em]">{code}</span>
          </div>

          <Button fullWidth size="lg" className="py-6" onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}>
            <ExternalLink size={20} className="mr-2" /> Запустить бота
          </Button>
          
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Ожидаем сигнал...</span>
          </div>
        </Card>
      )}
      
      <div className="mt-10 flex items-center justify-center gap-2 text-gray-300">
        <ShieldCheck size={16} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Безопасная авторизация</span>
      </div>
    </div>
  );
};
