import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useGoldenApp } from '../hooks/useGoldenApp';

const BOT_USERNAME = "vipvipnumbers_bot";

// Приводит номер к каноническому виду: 10 цифр без +7
const toCanonical = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('7') && digits.length === 11) digits = digits.slice(1);
  if (digits.length > 10) digits = digits.slice(-10);
  return digits;
};

// Форматирует для отображения: +7 777 777 77 77
const formatDisplay = (digits: string): string => {
  if (!digits) return '+7';
  const d = digits.padStart(10, '0').slice(0, 10);
  return `+7 ${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,8)} ${d.slice(8,10)}`;
};

export const AuthView = () => {
  const { setUser, setView } = useGoldenApp();
  const [mode, setMode] = useState<'register' | 'restore'>('register');
  const [name, setName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneRaw(digits);
  };

  const generateSessionToken = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleStartAuth = async () => {
    if (phoneRaw.length !== 10) {
      alert('Введите 10 цифр номера (например, 7767777777)');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      alert("Пожалуйста, введите ваше имя");
      return;
    }
    
    setLoading(true);
    const sessionToken = generateSessionToken();
    setCode(sessionToken);

    const { error } = await supabase
      .from('auth_codes')
      .insert([{ 
        phone: phoneRaw,
        code: sessionToken,
        is_verified: false,
        name: mode === 'register' ? name.trim() : 'Клиент'
      }]);

    setLoading(false);
    if (!error) {
      setStep('verify');
    } else {
      console.error(error);
      alert("Ошибка соединения с базой. Попробуйте еще раз.");
    }
  };

  useEffect(() => {
    if (step !== 'verify') return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('auth_codes')
        .select('is_verified, name, role, subscription, expiry_date, tg_user_id')
        .eq('phone', phoneRaw)
        .eq('code', code)
        .single();

      if (data?.is_verified) {
        clearInterval(interval);
        const userData = {
          phone: phoneRaw,
          full_name: data.name || (mode === 'register' ? name : 'Пользователь'),
          role: data.role || 'USER',
          subscription: data.subscription || 'INACTIVE',
          expiry_date: data.expiry_date,
          tg_user_id: data.tg_user_id,
        };
        setUser(userData);
        setView('catalog');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, phoneRaw, code, name, mode, setUser, setView]);

  const displayedPhone = formatDisplay(phoneRaw);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
      {step === 'phone' ? (
        <Card className="p-10 shadow-2xl relative overflow-hidden bg-white dark:bg-[#0F0F0F] dark:border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/30" />
          <div className="w-16 h-16 bg-gray-50 dark:bg-[#1A1A1A] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800 shadow-inner">
            {mode === 'register' ? (
              <Smartphone className="text-gray-900 dark:text-white" size={28} />
            ) : (
              <RefreshCcw className="text-[#D4AF37]" size={28} />
            )}
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase italic tracking-tighter">
            {mode === 'register' ? 'Аккаунт' : 'Вход'}
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
            {mode === 'register' ? 'Создание профиля' : 'Восстановление доступа'}
          </p>
          <div className="space-y-4">
            {mode === 'register' && (
              <input 
                type="text" 
                placeholder="Ваше имя" 
                className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-2 border-transparent rounded-2xl p-5 text-gray-900 dark:text-white font-bold text-center outline-none focus:border-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#0F0F0F] transition-all text-lg"
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <div>
              <div className="text-gray-500 text-xs mb-1">Введите номер без +7 (10 цифр):</div>
              <input 
                type="tel" 
                placeholder="7767777777" 
                className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-2 border-transparent rounded-2xl p-5 text-gray-900 dark:text-white font-bold text-center outline-none focus:border-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#0F0F0F] transition-all text-lg"
                value={phoneRaw} 
                onChange={handlePhoneChange}
              />
              <div className="text-xs text-gray-400 mt-1">Пример: 776 777 77 77</div>
            </div>
            <Button 
              fullWidth 
              size="lg" 
              className="py-5 shadow-lg shadow-[#D4AF37]/10" 
              disabled={loading} 
              onClick={handleStartAuth}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Загрузка...
                </div>
              ) : "Продолжить"}
            </Button>
            <button 
              onClick={() => setMode(mode === 'register' ? 'restore' : 'register')}
              className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest pt-4 hover:opacity-70 transition-opacity"
            >
              {mode === 'register' ? '✨ У меня уже есть аккаунт' : '👤 Создать новый аккаунт'}
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-10 border-[#D4AF37]/30 shadow-2xl relative overflow-hidden bg-white dark:bg-[#0F0F0F]">
            <div className="w-16 h-16 bg-[#2AABEE]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-[#2AABEE]/20">
              <MessageSquare className="text-[#2AABEE]" size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 uppercase italic tracking-tighter">Остался 1 шаг</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              {displayedPhone}
            </p>
            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-[2rem] p-6 mb-8 border border-gray-100 dark:border-gray-800 shadow-inner">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                Перейдите в Telegram и нажмите кнопку <br/><span className="text-gray-900 dark:text-white">«📱 Подтвердить номер»</span>
              </p>
            </div>
            <Button 
              fullWidth 
              size="lg" 
              className="py-6 text-lg bg-[#2AABEE] hover:bg-[#229ED9] text-white shadow-xl shadow-[#2AABEE]/20 border-none" 
              onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}
            >
              <ExternalLink size={20} className="mr-2" /> Открыть Telegram
            </Button>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">Ожидаем подтверждения</span>
            </div>
          </Card>
          <button 
            onClick={() => setStep('phone')}
            className="flex items-center justify-center gap-2 mx-auto text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft size={14} /> Изменить номер
          </button>
        </div>
      )}
    </div>
  );
};
