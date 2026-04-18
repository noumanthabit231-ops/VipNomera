import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const AuthView = ({ onLoginSuccess }: any) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [code, setCode] = useState('');

  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleStartAuth = async () => {
    if (!phone) return alert("Введите номер");
    const newCode = generateCode();
    setCode(newCode);

    const { error } = await supabase
      .from('auth_codes')
      .insert([{ phone, code: newCode }]);

    if (!error) setStep('verify');
  };

  // Опрос базы на предмет подтверждения (Polling)
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
        // Здесь создаем сессию пользователя (например, записываем в localStorage)
        onLoginSuccess({ phone, role: 'USER' });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="pt-20 px-4 max-w-sm mx-auto text-center">
      {step === 'input' ? (
        <Card>
          <h2 className="text-2xl font-black mb-6 uppercase italic">Вход</h2>
          <input 
            placeholder="+7 (7xx) xxx-xx-xx" 
            className="w-full bg-gray-50 p-4 rounded-2xl mb-4 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button fullWidth onClick={handleStartAuth}>Получить код</Button>
        </Card>
      ) : (
        <Card className="border-[#D4AF37]/30">
          <h2 className="text-xl font-bold mb-4">Подтверждение</h2>
          <p className="text-sm text-gray-500 mb-6">
            Отправьте код <span className="text-2xl font-black text-gray-900 mx-2">{code}</span> 
            нашему боту в Telegram
          </p>
          <Button variant="outline" fullWidth onClick={() => window.open('https://t.me/твой_бот')}>
            Открыть Telegram
          </Button>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D4AF37]"></div>
            <span className="ml-3 text-xs text-gray-400 uppercase font-bold">Ожидание кода...</span>
          </div>
        </Card>
      )}
    </div>
  );
};
