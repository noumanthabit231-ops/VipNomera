import React, { useState } from 'react';
import { Search, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase';

export const OrderNumberView = ({ user, setView }: any) => {
  const [desiredNumber, setDesiredNumber] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!desiredNumber) return alert('Введите желаемый номер');
    
    setLoading(true);
    const cleanPhone = user?.phone?.replace(/\D/g, '') || '';
    
    const { error } = await supabase.from('custom_orders').insert([{
      user_id: user?.id,
      user_phone: cleanPhone,
      user_name: user?.full_name || 'Клиент',
      desired_number: desiredNumber,
      budget: budget
    }]);

    setLoading(false);
    
    if (!error) {
      setIsSubmitted(true);
    } else {
      alert('Ошибка при отправке заявки');
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-24 px-4 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Заявка принята</h2>
        <p className="text-gray-500 text-sm font-bold mb-8">
          Мы начнем поиск номера {desiredNumber} и свяжемся с вами по номеру +{user?.phone}
        </p>
        <Button fullWidth onClick={() => setView('catalog')} className="py-5">
          Вернуться в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-8 space-y-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 px-2">
        <button onClick={() => setView('catalog')} className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Заказ номера</h1>
      </div>

      <Card className="p-6 border-none shadow-xl">
        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-6">
          <Search size={24} className="text-[#D4AF37]" />
        </div>
        
        <h2 className="text-lg font-black uppercase mb-6">Параметры поиска</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
              Какой номер ищете?
            </label>
            <input 
              type="text" 
              placeholder="Например: 777 000 77 77" 
              className="w-full bg-gray-50 rounded-2xl p-5 text-gray-900 font-bold outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all"
              value={desiredNumber}
              onChange={(e) => setDesiredNumber(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
              Желаемый бюджет (₸)
            </label>
            <input 
              type="number" 
              placeholder="Например: 500000" 
              className="w-full bg-gray-50 rounded-2xl p-5 text-gray-900 font-bold outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase text-center mb-4">
              Свяжемся с вами по номеру: +{user?.phone?.replace(/\D/g, '')}
            </p>
            <Button fullWidth size="lg" className="py-5 shadow-lg" onClick={handleSubmit} disabled={loading}>
              <Send size={18} className="mr-2" /> {loading ? 'Отправка...' : 'Оставить заявку'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
