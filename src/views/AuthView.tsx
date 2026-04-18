import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ShieldCheck, ArrowLeft, RefreshCcw } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = () => {
  const [mode, setMode] = useState<'register' | 'restore'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleStartAuth = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (mode === 'register' && !name.trim()) return alert("Введите имя");
    if (cleanPhone.length < 10) return alert("Введите корректный номер");
    
    setLoading(true);
    const newCode = generateCode();
    setCode(newCode);

    const { error } = await supabase
      .from('auth_codes')
      .insert([{ 
        phone: cleanPhone, 
        code: newCode,
        is_verified: false,
        name: mode === 'register' ? name.trim() : 'Клиент'
      }]);

    setLoading(false);
    if (!error) setStep('verify');
    else alert("Ошибка. Попробуйте еще раз.");
  };

  useEffect(() => {
  if (step !== 'verify') return;

  const cleanPhone = phone.replace(/\D/g, '');
  const interval = setInterval(async () => {
    // Теперь запрашиваем ВСЕ поля сразу после подтверждения в боте
    const { data, error } = await supabase
      .from('auth_codes')
      .select('is_verified, name, role, subscription, expiry_date, tg_user_id')
      .eq('phone', cleanPhone)
      .eq('code', code)
      .single();

    if (data?.is_verified) {
      clearInterval(interval);
      
      // Формируем полный объект пользователя сразу!
      const userData = { 
        phone: cleanPhone, 
        full_name: data.name, 
        role: data.role || 'USER', // Забираем роль из базы
        subscription: data.subscription || 'INACTIVE',
        expiry_date: data.expiry_date,
        tg_user_id: data.tg_user_id,
        id: `user_${Date.now()}`
      };

      localStorage.setItem('golden_v2_session', JSON.stringify(userData));
      window.location.reload(); // Перезагрузка, чтобы App увидел новые данные
    }
  }, 2000);

  return () => clearInterval(interval);
}, [step, phone, code]);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in duration-700">
      {step === 'phone' ? (
        <Card className="p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/30" />
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
            {mode === 'register' ? <Smartphone size={28} /> : <RefreshCcw size={28} className="text-[#D4AF37]" />}
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">
            {mode === 'register' ? 'Аккаунт' : 'Вход'}
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Авторизация для покупки</p>
          
          <div className="space-y-4">
            {mode === 'register' && (
              <input 
                type="text" placeholder="Ваше имя" 
                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-gray-900 font-bold text-center outline-none focus:ring-2 ring-[#D4AF37]/10 transition-all"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            )}
            <input 
              type="tel" placeholder="+7 (7xx) xxx-xx-xx" 
              className="w-full bg-gray-50 border-none rounded-2xl p-5 text-gray-900 font-bold text-center outline-none focus:ring-2 ring-[#D4AF37]/10 transition-all"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
            <Button fullWidth size="lg" className="py-5 shadow-lg" disabled={loading} onClick={handleStartAuth}>
              {loading ? "Загрузка..." : "Продолжить"}
            </Button>
            <button 
              onClick={() => setMode(mode === 'register' ? 'restore' : 'register')}
              className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest pt-4"
            >
              {mode === 'register' ? '✨ У меня уже есть аккаунт' : '👤 Создать новый аккаунт'}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="p-10 border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl font-black text-gray-900 mb-1 uppercase italic">Код: {code}</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase mb-8">Запустите бота для подтверждения</p>
          <Button fullWidth size="lg" className="py-6" onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}>
            <ExternalLink size={20} className="mr-2" /> Перейти в Telegram
          </Button>
          <button onClick={() => setStep('phone')} className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <ArrowLeft size={14} className="inline mr-1" /> Назад
          </button>
        </Card>
      )}
    </div>
  );
};
