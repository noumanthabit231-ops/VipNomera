import { motion } from 'framer-motion';
import { Phone, Label } from '../types';
import { cn } from '../cn'; // Используем твой готовый файл cn.ts

interface PhoneCardProps {
  phone: Phone;
  labels: Label[];
  onClick: () => void;
}

export function PhoneCard({ phone, labels, onClick }: PhoneCardProps) {
  return (
    <motion.div 
      layout
      onClick={onClick}
      className="bg-[#050505] border border-white/[0.05] rounded-xl p-6 cursor-pointer hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)] transition-all duration-500 group relative overflow-hidden flex flex-col"
    >
      {/* Метки (Labels) */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
        {(phone.label_ids || []).map(lid => {
  const label = labels.find(l => l.id === lid);
  return label ? (
    <span key={lid} style={{ color: label.color }}>{label.text}</span>
  ) : null;
})}
            <span 
              key={labelId} 
              className="text-[9px] uppercase tracking-widest px-2 py-0.5 border text-[#E8D9A8]"
              style={{ borderColor: `${label.color}40` }}
            >
              {label.text}
            </span>
          ) : null;
        })}
        {phone.status === 'ON_ORDER' && (
          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-orange-500/30 text-orange-500 bg-orange-500/5">
            Ожидание 24ч
          </span>
        )}
      </div>

      {/* Номер */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#B38728] mb-1">VIP Номер</p>
        <h3 className="text-2xl sm:text-3xl font-display text-white tracking-wider">
          {phone.number}
        </h3>
      </div>

      {/* Цена и кнопка */}
      <div className="pt-4 border-t border-white/[0.05] flex justify-between items-end mt-auto">
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-1">Стоимость</p>
          <p className="text-xl text-white font-display tracking-tighter">
            {phone.price.toLocaleString('ru-RU')} <span className="text-sm text-[#D4AF37]">₸</span>
          </p>
        </div>
        
        <button className="bg-gradient-to-r from-[#B38728] via-[#FDF5A6] to-[#B38728] text-black px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 hover:scale-105 transition-all">
          Выбрать
        </button>
      </div>
    </motion.div>
  );
}
