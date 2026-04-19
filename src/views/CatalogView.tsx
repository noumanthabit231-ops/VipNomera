import React from 'react';
import { Search, SlidersHorizontal, Plus, Crown, PackageSearch } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';

export const CatalogView = ({ 
  phones, labels, searchQuery, setSearchQuery, 
  activeLabelFilter, setActiveLabelFilter, filteredPhones,
  setSelectedPhone, setView
}: any) => {

  return (
    <div className="pt-8 space-y-6 pb-20 animate-in fade-in duration-500 selection:bg-[#D4AF37]/30">
      
      {/* Шапка Кабинета в новом темном стиле */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">
            Exclusive
          </h1>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] pl-0.5">
            Номера
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] relative">
          <div className="absolute inset-0.5 bg-black rounded-full" /> {/* Внутренняя тень */}
          <Crown className="text-[#D4AF37] relative z-10" size={24} />
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
          className="w-full bg-[#111111] border border-gray-800 rounded-3xl py-4 pl-14 pr-12 text-white font-bold outline-none focus:border-[#D4AF37]/50 focus:bg-[#1A1A1A] transition-all placeholder:text-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="absolute inset-y-0 right-4 flex items-center px-4">
          <SlidersHorizontal className="text-gray-500 hover:text-[#D4AF37]" size={18} />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-2">
        <button 
          onClick={() => setActiveLabelFilter(null)}
          className={cn(
            "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
            !activeLabelFilter 
              ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
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
                ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                : "bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600"
            )}
          >
            {l.text}
          </button>
        ))}
      </div>

      {/* Кнопка заказа */}
      <div className="px-2 pt-2">
        <button 
          onClick={() => setView('order')}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/5 active:scale-95 transition-all shadow-[0_0_10px_rgba(212,175,55,0.05)]"
        >
          <PackageSearch size={18} />
          <span className="text-[11px] font-black uppercase tracking-widest pt-0.5">Заказать уникальный номер</span>
        </button>
      </div>

      {/* СЕТКА БОЛЬШИХ SIM-КАРТ (ДЕРЖАТЕЛЕЙ) */}
      <div className="grid grid-cols-1 gap-5 px-2">
        {filteredPhones.map((phone: any) => (
          
          // ВНЕШНИЙ ДЕРЖАТЕЛЬ SIM (Большая карта размером с кредитку)
          <div 
            key={phone.id} 
            className="relative overflow-hidden bg-black border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/70 group border-none transition-all duration-500 hover:shadow-[#D4AF37]/5 active:scale-[0.98]"
          >
            {/* Глубокий градиент пластика */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#111111] to-[#010101] group-hover:from-[#161616] group-hover:to-[#050505] transition-colors duration-500" />
            
            {/* Едва заметный диагональный блик */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-20 flex flex-col h-full">
              
              {/* ШАПКА ДЕРЖАТЕЛЯ */}
              <div className="flex justify-between items-start mb-10">
                
                {/* 👑 НОВАЯ ВЫЛАМЫВАЕМАЯ SIM-КАРТА (Матрешка Mini-Micro-Nano) 👑 */}
                <div className="relative border-2 border-dashed border-[#D4AF37]/40 rounded-xl bg-black px-1.5 pt-2 pb-1.5 hover:border-[#D4AF37]/80 transition-colors w-32 h-40">
                  
                  {/* Срез угла Mini-SIM (Стилизованный уголок на держателе) */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#111] transform rotate-45 translate-x-4 -translate-y-4 border-l border-b border-gray-800 z-10 transition-colors group-hover:border-[#D4AF37]/50"></div>
                  
                  <div className="relative z-20 space-y-2">
                    {/* Mini-SIM перфорация */}
                    <div className="w-full h-24 border border-dashed border-[#D4AF37]/30 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {/* Micro-SIM перфорация */}
                      <div className="w-full h-full border border-dashed border-[#D4AF37]/30 rounded flex items-center justify-center p-1 relative overflow-hidden">
                        {/* Nano-SIM со срезом и чипом */}
                        <div className="w-full h-full border border-[#D4AF37]/40 rounded-sm bg-gradient-to-br from-[#D4AF37]/20 to-transparent p-[1.5px] relative">
                          
                          {/* Срез угла Nano-SIM */}
                          <div className="absolute top-0 right-0 w-3 h-3 bg-black transform rotate-45 translate-x-1.5 -translate-y-1.5 border-l border-b border-[#D4AF37]/30 z-20"></div>
                          
                          {/* Золотой чип-сетка (как в коде) */}
                          <div className="w-full h-full relative grid grid-cols-2 grid-rows-3 gap-[1px] p-[1.5px] z-10">
                            <div className="border border-[#D4AF37]/30 rounded-[1px]" />
                            <div className="border border-[#D4AF37]/30 rounded-[1px]" />
                            <div className="border border-[#D4AF37]/30 rounded-[1px]" />
                            <div className="border border-[#D4AF37]/30 rounded-[1px]" />
                            <div className="border border-[#D4AF37]/30 rounded-[1px] col-span-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Фиктивный серийный номер на пластике */}
                    <p className="text-[#D4AF37] text-[6px] font-black uppercase text-center tracking-wider opacity-60">89701 1234F 67890 1</p>
                  </div>
                </div>
                
                {/* Бейдж статуса */}
                <div className={cn(
                  "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm",
                  phone.status === 'IN_STOCK' 
                    ? "bg-green-500/10 text-green-400 border-green-500/30" 
                    : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                )}>
                  {phone.status === 'IN_STOCK' ? 'В наличии' : 'Заказ'}
                </div>
              </div>

              {/* ИНФОРМАЦИЯ НА ПЛАСТИКЕ ДЕРЖАТЕЛЯ */}
              <div className="flex-1 space-y-4 mb-8">
                <div>
                  <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-2.5 opacity-90 pl-1">
                    VIP Номер
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-mono font-black text-white italic tracking-tight leading-none mb-1 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                    {phone.number}
                  </h3>
                </div>
                {/* Метки лота */}
                <div className="flex flex-wrap gap-2 pt-1 pl-1">
                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-[#D4AF37]/20">Exclusive</span>
                </div>
              </div>

              {/* НИЖНИЙ КОЛОНТИТУЛ ДЕРЖАТЕЛЯ */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-800/80">
                <span className="text-2xl sm:text-3xl font-black text-[#D4AF37] italic tracking-tight">
                  {phone.price.toLocaleString()} ₸
                </span>
                
                <button 
                  onClick={() => setSelectedPhone(phone)}
                  className="px-7 py-3 bg-[#D4AF37] hover:bg-[#B58B22] text-black text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95"
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
