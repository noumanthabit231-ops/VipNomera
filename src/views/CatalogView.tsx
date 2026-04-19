import React from 'react';
import { Search, SlidersHorizontal, Plus, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';

export const CatalogView = ({ 
  phones, labels, searchQuery, setSearchQuery, 
  activeLabelFilter, setActiveLabelFilter, filteredPhones,
  setSelectedPhone, setView
}: any) => {

  return (
    <div className="pt-8 space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Шапка */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            Exclusive
          </h1>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Номера
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          <Crown className="text-black" size={24} />
        </div>
      </div>

      {/* Поиск */}
      <div className="relative group px-2">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Найти номер..." 
          className="w-full bg-[#111111] border border-gray-800 rounded-3xl py-4 pl-14 pr-12 text-white font-bold outline-none focus:border-[#D4AF37]/50 focus:bg-[#1A1A1A] transition-all placeholder:text-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="absolute inset-y-0 right-4 flex items-center px-4">
          <SlidersHorizontal className="text-gray-500" size={18} />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-2">
        <button 
          onClick={() => setActiveLabelFilter(null)}
          className={cn(
            "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
            !activeLabelFilter 
              ? "bg-[#D4AF37] border-[#D4AF37] text-black" 
              : "bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600"
          )}
        >
          Все лоты
        </button>
        {labels.map((l: any) => (
          <button 
            key={l.id}
            onClick={() => setActiveLabelFilter(l.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              activeLabelFilter === l.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-black" 
                : "bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600"
            )}
          >
            {l.text}
          </button>
        ))}
      </div>

      {/* Кнопка заказа */}
      <div className="px-2">
        <button 
          onClick={() => setView('order')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
        >
          <Plus size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Заказать уникальный номер</span>
        </button>
      </div>

      {/* СЕТКА SIM-КАРТ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
        {filteredPhones.map((phone: any) => (
          // САМА SIM-КАРТА
          <div 
            key={phone.id} 
            className="relative overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-gray-800 hover:border-[#D4AF37]/50 rounded-[2rem] p-6 transition-all duration-300 group shadow-lg shadow-black/50"
          >
            {/* Блик на карточке */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Срезанный правый верхний угол (эффект SIM) */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#050505] transform rotate-45 translate-x-8 -translate-y-8 border-l border-b border-gray-800 group-hover:border-[#D4AF37]/50 transition-colors z-10"></div>

            <div className="relative z-20 flex flex-col h-full">
              
              {/* Шапка SIM: Чип и Статус */}
              <div className="flex justify-between items-start mb-6">
                {/* CSS-рисунок золотого чипа */}
                <div className="w-10 h-12 border border-[#D4AF37]/40 rounded-md relative grid grid-cols-2 grid-rows-3 gap-[1px] bg-gradient-to-br from-[#D4AF37]/20 to-transparent p-[2px]">
                  <div className="border border-[#D4AF37]/30 rounded-[2px]" />
                  <div className="border border-[#D4AF37]/30 rounded-[2px]" />
                  <div className="border border-[#D4AF37]/30 rounded-[2px]" />
                  <div className="border border-[#D4AF37]/30 rounded-[2px]" />
                  <div className="border border-[#D4AF37]/30 rounded-[2px] col-span-2" />
                </div>
                
                {/* Бейдж статуса */}
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm",
                  phone.status === 'IN_STOCK' 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                  {phone.status === 'IN_STOCK' ? 'В наличии' : 'Ожидание'}
                </div>
              </div>

              {/* Информация о номере */}
              <div className="flex-1">
                <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.4em] mb-2 opacity-80">
                  VIP Номер
                </p>
                <h3 className="text-[28px] font-mono font-black text-white tracking-tighter mb-4 drop-shadow-md">
                  {phone.number}
                </h3>
              </div>

              {/* Футер карточки с кнопкой */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-lg font-black text-[#D4AF37]">
                  {phone.price.toLocaleString()} ₸
                </span>
                
                <button 
                  onClick={() => setSelectedPhone(phone)}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B58B22] text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  Купить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
