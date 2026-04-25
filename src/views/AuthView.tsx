import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useGoldenApp } from '../hooks/useGoldenApp';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = () => {
  const { setUser, setView } = useGoldenApp();
  const [mode, setMode] = useState<'register' | 'restore'>('register');
  const [name, setName] = useState('');
  const [part1, setPart1] = useState(''); // 3 цифры
  const [part2, setPart2] = useState(''); // 3 цифры
  const [part3, setPart3] = useState(''); // 2 цифры
  const [part4, setPart4] = useState(''); // 2 цифры
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);

  const getFullPhoneDigits = () => {
    const digits = part1 + part2 + part3 + part4;
    if (digits.length !== 10) return null;
    return '7' + digits; // 11 цифр для БД
  };

  const handlePartChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, nextRef?: React.RefObject<HTMLInputElement>) => {
    const digits = value.replace(/\D/g, '');
    setter(digits);
    if (digits.length === (setter === setPart1 || setter === setPart2 ? 3 : 2) && nextRef) {
      nextRef.current?.focus();
    }
  };

  const generateSessionToken = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleStartAuth = async () => {
    const fullPhone = getFullPhoneDigits();
    if (!fullPhone) {
      alert('Введите 10 цифр номера');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      alert("Пожалуйста, введите ваше имя");
      return;
    }
    setLoading(true);
    const sessionToken = generateSessionToken();
    setCode(sessionToken);

    if (mode === 'register') {
      const { error } = await supabase
        .from('auth_codes')
        .insert([{
          phone: fullPhone,
          code: sessionToken,
          is_verified: false,
          name: name.trim()
        }]);
      setLoading(false);
      if (!error) setStep('verify');
      else alert("Ошибка при регистрации: " + error.message);
    } else {
      // Режим входа – обновляем существующую запись
      const { error } = await supabase
        .from('auth_codes')
        .update({ code: sessionToken, is_verified: false })
        .eq('phone', fullPhone);
      setLoading(false);
      if (!error) setStep('verify');
      else alert("Пользователь не найден. Проверьте номер или зарегистрируйтесь.");
    }
  };

  useEffect(() => {
    if (step !== 'verify') return;
    const fullPhone = getFullPhoneDigits();
    if (!fullPhone) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('auth_codes')
        .select('is_verified, name, role, subscription, expiry_date, tg_user_id')
        .eq('phone', fullPhone)
        .eq('code', code)
        .single();
      if (data?.is_verified) {
        clearInterval(interval);
        const userData = {
          phone: fullPhone,
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
  }, [step, part1, part2, part3, part4, code, name, mode, setUser, setView]);

  const displayedPhone = fullPhoneDigits ? `+7 ${part1} ${part2} ${part3} ${part4}` : '+7 ___ ___ __ __';

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
          <div className="space-y-6">
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
              <div className="text-gray-500 text-xs mb-2 text-left">Введите номер телефона:</div>
              <div className="flex items-center gap-1 justify-center flex-wrap">
                <span className="text-2xl font-bold text-gray-900 dark:text-white mr-1">+7</span>
                <input
                  ref={inputRef1}
                  type="text"
                  maxLength={3}
                  className="w-12 sm:w-14 h-12 text-center bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-xl text-lg font-bold focus:border-[#D4AF37] outline-none"
                  value={part1}
                  onChange={(e) => handlePartChange(e.target.value, setPart1, inputRef2)}
                />
                <span className="text-xl">-</span>
                <input
                  ref={inputRef2}
                  type="text"
                  maxLength={3}
                  className="w-12 sm:w-14 h-12 text-center bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-xl text-lg font-bold focus:border-[#D4AF37] outline-none"
                  value={part2}
                  onChange={(e) => handlePartChange(e.target.value, setPart2, inputRef3)}
                />
                <span className="text-xl">-</span>
                <input
                  ref={inputRef3}
                  type="text"
                  maxLength={2}
                  className="w-10 sm:w-12 h-12 text-center bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-xl text-lg font-bold focus:border-[#D4AF37] outline-none"
                  value={part3}
                  onChange={(e) => handlePartChange(e.target.value, setPart3, inputRef4)}
                />
                <span className="text-xl">-</span>
                <input
                  ref={inputRef4}
                  type="text"
                  maxLength={2}
                  className="w-10 sm:w-12 h-12 text-center bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-xl text-lg font-bold focus:border-[#D4AF37] outline-none"
                  value={part4}
                  onChange={(e) => handlePartChange(e.target.value, setPart4)}
                />
              </div>
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
              onClick={() => {
                setMode(mode === 'register' ? 'restore' : 'register');
                setName('');
                setPart1(''); setPart2(''); setPart3(''); setPart4('');
              }}
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
