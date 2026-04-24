import React, { useState } from 'react';
import { Search, ArrowLeft, Send, CheckCircle2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase';
import { cn } from '../cn';

export const OrderNumberView = ({ user, setView, isLight = false }: any) => {
  const [desiredNumber, setDesiredNumber] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!desiredNumber.trim()) {
      setError('Введите желаемый номер');
      return;
    }
    setError('');
    setLoading(true);
    
    const cleanPhone = user?.phone?.replace(/\D/g, '') || '';
    
    const { error: supabaseError } = await supabase.from('custom_orders').insert([{
      user_phone: cleanPhone,
      user_name: user?.full_name || 'Клиент',
      desired_number: desiredNumber.trim(),
      budget: budget ? parseInt(budget) : null,
      status: 'PENDING'
    }]);

    setLoading(false);
    
    if (supabaseError) {
      console.error(supabaseError);
      setError('Ошибка при отправке заявки. Попробуйте позже.');
    } else {
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    setView('catalog');
  };

  // Стили для тем
  const bgClass = isLight ? 'bg-[#F4F4F6]' : 'bg-[#050505]';
  const cardBgClass = isLight ? 'bg-white border-gray-200' : 'bg-[#0F0F0F] border-gray-800';
  const textPrimaryClass = isLight ? 'text-black' : 'text-white';
  const textSecondaryClass = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputBgClass = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#1A1A1A] border-gray-800';
  const inputTextClass = isLight ? 'text-gray-900' : 'text-white';

  if (isSubmitted) {
    return (
      <div className={cn("min-h-screen pt-24 px-4 text-center animate-in zoom-in duration-500", bgClass)}>
        <div className="max-w-sm mx-auto">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className={cn("text-3xl font-black italic uppercase tracking-tighter mb-4", textPrimaryClass)}>Заявка принята</h2>
          <p className={cn("text-sm font-bold mb-8", textSecondaryClass)}>
            Мы начнем поиск номера <span className="text-[#D4AF37]">{desiredNumber}</span> и свяжемся с вами по номеру <strong>+{user?.phone?.replace(/\D/g, '')}</strong>
          </p>
          <Button fullWidth onClick={handleClose} className="py-5">
            Вернуться в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen pt-6 pb-24 px-4 animate-in slide-in-from-bottom-4", bgClass)}>
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setView('catalog')} 
          className={cn("w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95", 
            isLight ? "bg-white border border-gray-200 shadow-sm" : "bg-[#111] border border-gray-800"
          )}
        >
          <ArrowLeft size={18} className={textSecondaryClass} />
        </button>
        <h1 className={cn("text-xl font-black uppercase italic tracking-tighter", textPrimaryClass)}>Заказ номера</h1>
        <button 
          onClick={handleClose} 
          className={cn("w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95", 
            isLight ? "bg-white border border-gray-200 shadow-sm" : "bg-[#111] border border-gray-800"
          )}
        >
          <X size={18} className={textSecondaryClass} />
        </button>
      </div>

      <div className="max-w-sm mx-auto">
        <div className={cn("rounded-3xl border shadow-xl overflow-hidden", cardBgClass)}>
          <div className="p-6 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
                <Search size={28} className="text-[#D4AF37]" />
              </div>
            </div>
            
            <h2 className={cn("text-xl font-black uppercase text-center", textPrimaryClass)}>
              Индивидуальный подбор
            </h2>
            <p className={cn("text-xs text-center", textSecondaryClass)}>
              Не нашли подходящий номер? Оставьте заявку, и мы подберем для вас идеальный вариант.
            </p>
            
            <div className="space-y-5">
              <div>
                <label className={cn("text-[10px] font-black uppercase tracking-widest block mb-2", textSecondaryClass)}>
                  Желаемый номер
                </label>
                <input 
                  type="text" 
                  placeholder="777 000 77 77" 
                  className={cn("w-full rounded-2xl p-4 text-base font-bold outline-none transition-all focus:ring-2 ring-[#D4AF37]/30", inputBgClass, inputTextClass)}
                  value={desiredNumber}
                  onChange={(e) => setDesiredNumber(e.target.value)}
                />
              </div>
              
              <div>
                <label className={cn("text-[10px] font-black uppercase tracking-widest block mb-2", textSecondaryClass)}>
                  Бюджет (₸)
                </label>
                <input 
                  type="number" 
                  placeholder="Например: 500000" 
                  className={cn("w-full rounded-2xl p-4 text-base font-bold outline-none transition-all focus:ring-2 ring-[#D4AF37]/30", inputBgClass, inputTextClass)}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <p className={cn("text-[9px] font-bold text-center mb-4", textSecondaryClass)}>
                  Свяжемся с вами по номеру: <span className="text-[#D4AF37]">+{user?.phone?.replace(/\D/g, '')}</span>
                </p>
                <Button 
                  fullWidth 
                  size="lg" 
                  className="py-5 shadow-lg bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black hover:opacity-90 transition-opacity" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  <Send size={18} className="mr-2" /> {loading ? 'Отправка...' : 'Оставить заявку'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
