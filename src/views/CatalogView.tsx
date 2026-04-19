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
      
      {/* Шапка Кабинета */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">
            Exclusive
          </h1>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] pl-0.5">
            Номера
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] relative">
          <div className="absolute inset-0.5 bg-black rounded-full" />
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
          className="w-full bg-[#111] border-2 border-gray-800 rounded-2xl py-4 pl-14 pr-12 text-white font-bold outline-none focus:border-[#D4AF37]/50 focus:bg-[#1A1A1A] transition-all placeholder:text-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="absolute inset-y-0 right-4 flex items-center px-4">
          <SlidersHorizontal className="text-gray-500 hover:text-[#D4AF37]" size={18} />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-1">
        <button 
          onClick={() => setActiveLabelFilter(null)}
          className={cn(
            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2",
            !activeLabelFilter 
              ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
              : "bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
          )}
        >
          Все лоты
        </button>
        {labels.map((l: any) => (
          <button 
            key={l.id}
            onClick={() => setActiveLabelFilter(l.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2",
              activeLabelFilter === l.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                : "bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
            )}
          >
            {l.text}
          </button>
        ))}
      </div>

      {/* Кнопка заказа (стала компактнее) */}
      <div className="px-2">
        <button 
          onClick={() => setView('order')}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 active:scale-[0.98] transition-all bg-[#D4AF37]/5"
        >
          <PackageSearch size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Сделать спецзаказ</span>
        </button>
      </div>

      {/* СЕТКА COMPACT SIM-КАРТ */}
      <div className="grid grid-cols-1 gap-4 px-2">
        {filteredPhones.map((phone: any) => (
          
          <div 
            key={phone.id} 
            className="relative overflow-hidden bg-[#0A0A0A] border-2 border-gray-800/80 rounded-[1.5rem] p-5 shadow-2xl group transition-all duration-300 hover:border-[#D4AF37]/40 active:scale-[0.98]"
          >
            {/* Градиент */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#050505] group-hover:from-[#161616] group-hover:to-[#0A0A0A] transition-colors duration-500" />

            <div className="relative z-20 flex flex-col h-full">
              
              {/* ВЕРХНЯЯ ЧАСТЬ: SIM-карта и Статус */}
              <div className="flex justify-between items-start mb-5">
                
                {/* Компактная "выламываемая" SIM */}
                <div className="relative border-2 border-[#D4AF37]/50 rounded-lg bg-[#050505] w-[4.5rem] h-24 p-1 flex items-center justify-center group-hover:border-[#D4AF37] transition-colors shadow-inner">
                  
                  {/* Срез угла (Mini-SIM) */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-[#111] transform rotate-45 translate-x-3 -translate-y-3 border-l-2 border-b-2 border-gray-800 z-10 group-hover:border-[#D4AF37]/40 transition-colors"></div>
                  
                  {/* Чип (Матрешка) */}
                  <div className="w-full h-full border-2 border-dashed border-[#D4AF37]/30 rounded-md flex items-center justify-center p-0.5 relative z-20">
                    <div className="w-full h-full border border-[#D4AF37]/50 rounded-sm bg-gradient-to-br from-[#D4AF37]/20 to-transparent p-[1px] relative flex items-center justify-center">
                      <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1 border-l border-b border-[#D4AF37]/40 z-20"></div>
                      <div className="w-full h-[60%] grid grid-cols-2 grid-rows-3 gap-[1px] opacity-80">
                        <div className="border border-[#D4AF37]/50" />
                        <div className="border border-[#D4AF37]/50" />
                        <div className="border border-[#D4AF37]/50" />
                        <div className="border border-[#D4AF37]/50" />
                        <div className="border border-[#D4AF37]/50 col-span-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Строгий бейдж (без зеленого цвета) */}
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border-2",
                  phone.status === 'IN_STOCK' 
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30" 
                    : "bg-gray-800/50 text-gray-400 border-gray-700"
                )}>
                  {phone.status === 'IN_STOCK' ? 'В наличии' : 'Предзаказ'}
                </div>
              </div>

              {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: НОМЕР (Золотой градиент) */}
              <div className="mb-5">
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1 pl-1">
                  VIP Серия
                </p>
                <h3 className="text-4xl sm:text-[2.5rem] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#F9D423] via-[#D4AF37] to-[#B58B22] drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">
                  {phone.number}
                </h3>
              </div>

              {/* НИЖНЯЯ ЧАСТЬ: Цена и Кнопка */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-900">
                {/* Теперь цена белая, чтобы контрастировать с золотым номером */}
                <span className="text-2xl font-black text-white italic tracking-tight">
                  {phone.price.toLocaleString()} ₸
                </span>
                
                <button 
                  onClick={() => setSelectedPhone(phone)}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B58B22] hover:opacity-90 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
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
