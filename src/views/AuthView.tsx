import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useGoldenApp } from '../hooks/useGoldenApp';
import { cn } from '../cn';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = () => {
  const { setUser, setView, isLight } = useGoldenApp();
  const [mode, setMode] = useState<'register' | 'restore'>('register');
  const [name, setName] = useState('');
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [part4, setPart4] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);

  const getPhone11 = () => {
    const digits = part1 + part2 + part3 + part4;
    if (digits.length !== 10) return null;
    return '7' + digits;
  };

  const getDisplayPhone = () => {
    const p1 = part1 || '___';
    const p2 = part2 || '___';
    const p3 = part3 || '__';
    const p4 = part4 || '__';
    return `+7 ${p1} ${p2} ${p3} ${p4}`;
  };

  const handlePartChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, maxLen: number, nextRef?: React.RefObject<HTMLInputElement>) => {
    const digits = value.replace(/\D/g, '').slice(0, maxLen);
    setter(digits);
    if (digits.length === maxLen && nextRef) nextRef.current?.focus();
  };

  const generateSessionToken = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleStartAuth = async () => {
    const phone11 = getPhone11();
    if (!phone11) {
      alert('Введите 10 цифр номера');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }
    setLoading(true);
    const sessionToken = generateSessionToken();
    setCode(sessionToken);

    if (mode === 'register') {
      const { error } = await supabase
        .from('auth_codes')
        .insert([{ phone: phone11, code: sessionToken, is_verified: false, name: name.trim() }]);
      setLoading(false);
      if (!error) setStep('verify');
      else alert('Ошибка при регистрации: ' + error.message);
    } else {
      const { error } = await supabase
        .from('auth_codes')
        .update({ code: sessionToken, is_verified: false })
        .eq('phone', phone11);
      setLoading(false);
      if (!error) setStep('verify');
      else alert('Пользователь не найден. Проверьте номер или зарегистрируйтесь.');
    }
  };

  useEffect(() => {
    if (step !== 'verify') return;
    const phone11 = getPhone11();
    if (!phone11) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('auth_codes')
        .select('is_verified, name, role, subscription, expiry_date, tg_user_id')
        .eq('phone', phone11)
        .eq('code', code)
        .single();
      if (data?.is_verified) {
        clearInterval(interval);
        setUser({
          phone: phone11,
          full_name: data.name || (mode === 'register' ? name : 'Пользователь'),
          role: data.role || 'USER',
          subscription: data.subscription || 'INACTIVE',
          expiry_date: data.expiry_date,
          tg_user_id: data.tg_user_id,
        });
        setView('catalog');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [step, part1, part2, part3, part4, code, name, mode, setUser, setView]);

  const cardBg = isLight ? 'bg-white' : 'bg-[#0F0F0F]';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputBg = isLight ? 'bg-gray-100' : 'bg-[#1A1A1A]';
  const inputBorder = isLight ? 'border-gray-300' : 'border-gray-700';
  const iconBg = isLight ? 'bg-gray-100' : 'bg-[#1A1A1A]';
  const iconBorder = isLight ? 'border-gray-200' : 'border-gray-800';
  const titleClass = cn("text-3xl font-black uppercase italic tracking-tighter", textPrimary);
  const subtitleClass = cn("text-[10px] font-bold uppercase tracking-[0.2em]", textSecondary);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
      {step === 'phone' ? (
        <div className={cn("p-8 rounded-[2rem] border shadow-2xl relative overflow-hidden", cardBg, isLight ? 'border-gray-200' : 'border-gray-800')}>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/30" />
          <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border", iconBg, iconBorder)}>
            {mode === 'register' ? <Smartphone className={isLight ? "text-gray-800" : "text-gray-300"} size={28} /> : <RefreshCcw className="text-[#D4AF37]" size={28} />}
          </div>
          <h2 className={titleClass}>{mode === 'register' ? 'Аккаунт' : 'Вход'}</h2>
          <p className={subtitleClass}>{mode === 'register' ? 'Создание профиля' : 'Восстановление доступа'}</p>
          <div className="space-y-6 mt-8">
            {mode === 'register' && (
              <input type="text" placeholder="Ваше имя" className={cn("w-full rounded-2xl p-4 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50", inputBg, textPrimary, inputBorder, "placeholder:text-gray-400")} value={name} onChange={e => setName(e.target.value)} />
            )}
            <div>
              <div className={cn("text-xs mb-2 text-left", textSecondary)}>Введите номер телефона:</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className={cn("text-2xl font-bold", textPrimary)}>+7</span>
                <input ref={inputRef1} type="text" maxLength={3} className={cn("w-12 sm:w-14 h-12 text-center rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50", inputBg, textPrimary, inputBorder)} value={part1} onChange={e => handlePartChange(e.target.value, setPart1, 3, inputRef2)} />
                <span className={cn("text-xl", textSecondary)}>-</span>
                <input ref={inputRef2} type="text" maxLength={3} className={cn("w-12 sm:w-14 h-12 text-center rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50", inputBg, textPrimary, inputBorder)} value={part2} onChange={e => handlePartChange(e.target.value, setPart2, 3, inputRef3)} />
                <span className={cn("text-xl", textSecondary)}>-</span>
                <input ref={inputRef3} type="text" maxLength={2} className={cn("w-10 sm:w-12 h-12 text-center rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50", inputBg, textPrimary, inputBorder)} value={part3} onChange={e => handlePartChange(e.target.value, setPart3, 2, inputRef4)} />
                <span className={cn("text-xl", textSecondary)}>-</span>
                <input ref={inputRef4} type="text" maxLength={2} className={cn("w-10 sm:w-12 h-12 text-center rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/50", inputBg, textPrimary, inputBorder)} value={part4} onChange={e => handlePartChange(e.target.value, setPart4, 2)} />
              </div>
            </div>
            <Button fullWidth size="lg" className="py-5 shadow-lg shadow-[#D4AF37]/10" disabled={loading} onClick={handleStartAuth}>
              {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Продолжить'}
            </Button>
            <button onClick={() => { setMode(mode === 'register' ? 'restore' : 'register'); setName(''); setPart1(''); setPart2(''); setPart3(''); setPart4(''); }} className="text-[10px] font-black uppercase tracking-widest pt-4 hover:opacity-70 transition-opacity text-[#D4AF37]">
              {mode === 'register' ? '✨ У меня уже есть аккаунт' : '👤 Создать новый аккаунт'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={cn("p-8 rounded-[2rem] border shadow-2xl relative overflow-hidden", cardBg, isLight ? 'border-gray-200' : 'border-gray-800')}>
            <div className="w-16 h-16 bg-[#2AABEE]/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-[#2AABEE]/20">
              <MessageSquare className="text-[#2AABEE]" size={28} />
            </div>
            <h2 className={titleClass}>Остался 1 шаг</h2>
            <p className={subtitleClass}>{getDisplayPhone()}</p>
            <div className={cn("rounded-[2rem] p-6 mb-8 border", inputBg, inputBorder)}>
              <p className={cn("text-xs font-bold leading-relaxed", textSecondary)}>Перейдите в Telegram и нажмите кнопку <br /><span className={textPrimary}>«📱 Подтвердить номер»</span></p>
            </div>
            <Button fullWidth size="lg" className="py-6 text-lg bg-[#2AABEE] hover:bg-[#229ED9] text-white shadow-xl shadow-[#2AABEE]/20 border-none" onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}>
              <ExternalLink size={20} className="mr-2" /> Открыть Telegram
            </Button>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", isLight ? "bg-gray-400" : "bg-gray-600")} />
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]", isLight ? "bg-gray-400" : "bg-gray-600")} />
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]", isLight ? "bg-gray-400" : "bg-gray-600")} />
              </div>
              <span className={cn("text-[10px] font-black uppercase tracking-[0.15em]", textSecondary)}>Ожидаем подтверждения</span>
            </div>
          </div>
          <button onClick={() => setStep('phone')} className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[#D4AF37]">
            <ArrowLeft size={14} className={textSecondary} />
            <span className={textSecondary}>Изменить номер</span>
          </button>
        </div>
      )}
    </div>
  );
};
