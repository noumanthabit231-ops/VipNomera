import { ChevronRight } from 'lucide-react';
import { cn } from '../cn';
import { Phone, Label } from '../types';

interface PhoneCardProps {
  phone: Phone;
  labels: Label[];
  onClick: () => void;
}

export const PhoneCard = ({ phone, labels, onClick }: PhoneCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group active:scale-[0.98] transition-all bg-[#0F0F0F] border border-white/[0.05] rounded-3xl p-5 cursor-pointer hover:border-[#D4AF37]/30"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-1.5">
            {/* Отрисовка меток из Supabase (label_ids) */}
            {(phone.label_ids || []).map((lid) => {
              const label = labels.find((l) => l.id === lid);
              return label ? (
                <span 
                  key={lid} 
                  className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase" 
                  style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}30` }}
                >
                  {label.text}
                </span>
              ) : null;
            })}

            {/* Статус: На заказ (24h) */}
            {phone.status === 'ON_ORDER' && (
              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-orange-500/30 text-orange-500 bg-orange-500/5 rounded-lg font-black">
                24h
              </span>
            )}

            {/* Статус: В наличии (Ready) */}
            {phone.status === 'IN_STOCK' && (
              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-green-500/30 text-green-500 bg-green-500/5 rounded-lg font-black">
                Ready
              </span>
            )}
          </div>
          <ChevronRight size={18} className="text-gray-700 group-hover:text-[#D4AF37] transition-colors" />
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-mono font-bold text-white tracking-tighter italic">{phone.number}</h3>
            <p className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest font-black">Private Reserve</p>
          </div>
          <div className="text-right">
            <p className="gold-text text-xl font-black italic">
              {phone.price?.toLocaleString('ru-RU')} ₸
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
