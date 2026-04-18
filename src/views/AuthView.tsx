import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ShieldCheck, ArrowLeft, User as UserIcon } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = () => {
  const [name, setName] = useState(''); // Новое поле для имени
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleStartAuth = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Валидация
    if (!name.trim()) return alert("Пожалуйста, введите ваше имя");
    if (cleanPhone.length < 10) return alert("Введите корректный номер телефона");
    
    setLoading(true);
    const newCode = generateCode();
    setCode(newCode);

    // Сохраняем имя в auth_codes (убедись, что добавил колонку 'name' в таблицу в Supabase)
    const { error } = await supabase
      .from('auth_codes')
      .insert([{ 
        phone: cleanPhone, 
        code: newCode,
        is_verified: false,
        name: name.trim() // Передаем имя
      }]);

    setLoading(false);
    if (!error) {
      setStep('verify');
    } else {
      alert("Ошибка сервера. Попробуйте позже.");
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setLoading(false);
  };

  useEffect(() => {
    if (step !== 'verify') return;

    const cleanPhone = phone.replace(/\D/g, '');
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('auth_codes')
        .select('is_verified')
        .eq('phone', cleanPhone)
        .eq('code', code)
        .single();

      if (data?.is_verified) {
        clearInterval(interval);
        const userData = { 
          phone: cleanPhone, 
          full_name: name.trim(), // Сохраняем имя в сессию
          role: 'USER', 
          id: `user_${Date.now()}`,
          subscription: 'INACTIVE' 
        };
        localStorage.setItem('golden_v2_session', JSON.stringify(userData));
        window.location.reload(); 
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, phone, code, name]);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
      {step === 'phone' ? (
        <Card className="p-10 shadow-2xl shadow-gray-200/50">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
            <Smartphone className="text-gray-900" size={28} />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Вход</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Премиальный доступ</p>
          
          <div className="space-y-4">
            {/* ПОЛЕ ИМЕНИ */}
            <div className="relative group">
              <input 
                type="text"
                placeholder="Ваше имя" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 text-gray-900 font-bold outline-none focus:border-[#D4AF37]/20 focus:bg-white transition-all text-center text-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* ПОЛЕ ТЕЛЕФОНА */}
            <div className="relative group">
              <input 
                type="tel"
                placeholder="+7 (7xx) xxx-xx-xx" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 text-gray-900 font-bold outline-none focus:border-[#D4AF37]/20 focus:bg-white transition-all text-center text-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button 
              fullWidth 
              size="lg" 
              className="py-5 shadow-lg shadow-[#D4AF37]/20" 
              disabled={loading} 
              onClick={handleStartAuth}
            >
              {loading ? "Загрузка..." : "Продолжить"}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-10 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10 relative overflow-hidden">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
              <MessageSquare className="text-[#D4AF37]" size={28} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-1 uppercase italic tracking-tighter">Подтверждение</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              Для <span className="text-gray-900">{name}</span> (+{phone.replace(/\D/g, '')})
            </p>

            <div className="bg-gray-50 rounded-[2.5rem] py-8 mb-8 border border-gray-100 shadow-inner group transition-all">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] block mb-3 opacity-60">Код для бота</span>
              <span className="text-5xl font-mono font-black text-gray-900 tracking-[0.25em] block">
                {code}
              </span>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              className="py-6 text-lg" 
              onClick={() => window.open(`https://t.me/${BOT_USERNAME}?start=${code}`, '_blank')}
            >
              <ExternalLink size={20} className="mr-2" /> Запустить бота
            </Button>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">Ожидаем сигнал</span>
            </div>
          </Card>

          <button 
            onClick={handleChangeNumber}
            className="flex items-center justify-center gap-2 mx-auto text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Назад
          </button>
        </div>
      )}
    </div>
  );
};
