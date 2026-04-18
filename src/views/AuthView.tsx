import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ShieldCheck, ArrowLeft, RefreshCcw } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../cn';

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
    
    if (mode === 'register' && !name.trim()) return alert("Пожалуйста, введите ваше имя");
    if (cleanPhone.length < 10) return alert("Введите корректный номер телефона");
    
    setLoading(true);
    const newCode = generateCode();
    setCode(newCode);

    // При восстановлении имени в запросе нет, но мы сохраняем запись для сверки кода
    const { error } = await supabase
      .from('auth_codes')
      .insert([{ 
        phone: cleanPhone, 
        code: newCode,
        is_verified: false,
        name: mode === 'register' ? name.trim() : 'Пользователь'
      }]);

    setLoading(false);
    if (!error) {
      setStep('verify');
    } else {
      alert("Ошибка. Попробуйте другой номер или позже.");
    }
  };

  const resetView = () => {
    setStep('phone');
    setLoading(false);
  };

  useEffect(() => {
    if (step !== 'verify') return;

    const cleanPhone = phone.replace(/\D/g, '');
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('auth_codes')
        .select('is_verified, name')
        .eq('phone', cleanPhone)
        .eq('code', code)
        .single();

      if (data?.is_verified) {
        clearInterval(interval);
        const userData = { 
          phone: cleanPhone, 
          full_name: data.name, 
          role: 'USER', 
          id: `user_${Date.now()}`,
          subscription: 'INACTIVE' 
        };
        localStorage.setItem('golden_v2_session', JSON.stringify(userData));
        window.location.reload(); 
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, phone, code]);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in duration-700">
      {step === 'phone' ? (
        <Card className="p-10 shadow-2xl bg-white border-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
          
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
            {mode === 'register' ? <Smartphone size={28} /> : <RefreshCcw size={28} className="text-[#D4AF37]" />}
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">
            {mode === 'register' ? 'Создать аккаунт' : 'Войти'}
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
            {mode === 'register' ? 'Премиальный доступ' : 'Восстановление доступа'}
          </p>
          
          <div className="space-y-4">
            {mode === 'register' && (
              <input 
                type="text"
                placeholder="Ваше имя" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 text-gray-900 font-bold outline-none focus:border-[#D4AF37]/20 transition-all text-center"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            
            <input 
              type="tel"
              placeholder="+7 (7xx) xxx-xx-xx" 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 text-gray-900 font-bold outline-none focus:border-[#D4AF37]/20 transition-all text-center"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button fullWidth size="lg" className="py-5 shadow-lg shadow-[#D4AF37]/10" disabled={loading} onClick={handleStartAuth}>
              {loading ? "Загрузка..." : "Продолжить"}
            </Button>

            <div className="pt-6 mt-4 border-t border-gray-50 space-y-3">
              <button 
                onClick={() => setMode(mode === 'register' ? 'restore' : 'register')}
                className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                {mode === 'register' ? '✨ У меня уже есть аккаунт' : '👤 Создать новый аккаунт'}
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-10 border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-[#D4AF37]" size={28} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-1 uppercase italic tracking-tighter">Подтверждение</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">
               +{phone.replace(/\D/g, '')}
            </p>

            <div className="bg-gray-50 rounded-[2.5rem] py-8 mb-8 border border-gray-100 shadow-inner">
              <span className="text-5xl font-mono font-black text-gray-900 tracking-[0.25em]">{code}</span>
            </div>

            <Button fullWidth size="lg" className="py-6" onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}>
              <ExternalLink size={20} className="mr-2" /> Запустить бота
            </Button>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex gap-1.5 italic">
                 <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest animate-pulse text-center">Ожидаем сигнал от Telegram</span>
              </div>
            </div>
          </Card>

          <button onClick={resetView} className="flex items-center justify-center gap-2 mx-auto text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Назад
          </button>
        </div>
      )}
    </div>
  );
};
