import React from 'react';
import { Search, SlidersHorizontal, Plus, Crown, PackageSearch } from 'lucide-react';
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
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)] relative">
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
          className="w-full bg-[#0F0F0F] border-2 border-gray-800/50 rounded-2xl py-4 pl-14 pr-12 text-white font-bold outline-none focus:border-[#D4AF37]/40 focus:bg-[#151515] transition-all placeholder:text-gray-700 shadow-inner"
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
              ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_10px_20px_rgba(212,175,55,0.15)]" 
              : "bg-[#0A0A0A] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
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
                ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_10px_20px_rgba(212,175,55,0.15)]" 
                : "bg-[#0A0A0A] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
            )}
          >
            {l.text}
          </button>
        ))}
      </div>

      {/* Кнопка спецзаказа */}
      <div className="px-2">
        <button 
          onClick={() => setView('order')}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-dashed border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 active:scale-[0.98] transition-all bg-[#D4AF37]/5"
        >
          <PackageSearch size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Сделать индивидуальный заказ</span>
        </button>
      </div>

      {/* СЕТКА LUXURY SIM-КАРТ */}
      <div className="grid grid-cols-1 gap-5 px-2">
        {filteredPhones.map((phone: any) => (
          
          <div 
            key={phone.id} 
            className="relative overflow-hidden bg-[#0A0A0A] border-2 border-white/5 rounded-[1.8rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group transition-all duration-500 hover:border-[#D4AF37]/30 active:scale-[0.98]"
          >
            {/* Премиальный градиент фона */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#080808] to-[#050505] group-hover:from-[#161616] group-hover:via-[#0A0A0A] transition-colors duration-500" />
            
            {/* Тонкий золотой отблеск по контуру на ховере */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(45deg,transparent_25%,rgba(212,175,55,0.03)_50%,transparent_75%)]" />

            <div className="relative z-20 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-6">
                
                {/* 💳 ВЫРАЗИТЕЛЬНАЯ SIM КАРТА */}
                <div 
                  className="relative w-16 h-24 bg-[#111] flex items-center justify-center shadow-2xl border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all"
                  style={{ 
                    borderRadius: '10px', 
                    clipPath: 'polygon(0 0, 70% 0, 100% 18%, 100% 100%, 0 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black via-white/[0.02] to-transparent" />

                  {/* 🌟 ЖИРНЫЙ ЗОЛОТОЙ ЧИП */}
                  <div className="w-10 h-12 bg-gradient-to-br from-[#F9D423] via-[#D4AF37] to-[#8C7323] rounded-md p-[1.5px] relative shadow-[0_0_15px_rgba(212,175,55,0.2)] z-10 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                    
                    <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-[1px] bg-black/50 rounded-[4px] overflow-hidden">
                      <div className="bg-gradient-to-br from-[#F9D423] to-[#D4AF37] opacity-95"></div>
                      <div className="bg-gradient-to-bl from-[#F9D423] to-[#D4AF37] opacity-95"></div>
                      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B58B22] opacity-95"></div>
                      <div className="bg-gradient-to-l from-[#D4AF37] to-[#B58B22] opacity-95"></div>
                      <div className="bg-gradient-to-tr from-[#B58B22] to-[#8C7323] opacity-95"></div>
                      <div className="bg-gradient-to-tl from-[#B58B22] to-[#8C7323] opacity-95"></div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 border-[1px] border-black/40 rounded-full z-10"></div>
                  </div>
                </div>
                
                {/* Бейдж статуса */}
                <div className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 shadow-lg",
                  phone.status === 'IN_STOCK' 
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/40 shadow-[#D4AF37]/5" 
                    : "bg-[#111] text-gray-500 border-white/5"
                )}>
                  {phone.status === 'IN_STOCK' ? 'В наличии' : 'Бронь'}
                </div>
              </div>

              {/* НОМЕР (Жирный золотой градиент) */}
              <div className="mb-6">
                <p className="text-[#D4AF37]/60 text-[9px] font-black uppercase tracking-[0.5em] mb-2 pl-1">
                  Premium Number
                </p>
                <h3 className="text-[2.8rem] sm:text-[3.2rem] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFEFA1] via-[#D4AF37] to-[#B58B22] leading-none drop-shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
                  {phone.number}
                </h3>
              </div>

              {/* ФУТЕР: Цена и Кнопка */}
              <div className="flex items-center justify-between pt-5 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest opacity-60 mb-1">Стоимость</span>
                  <span className="text-[1.7rem] font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                    {phone.price.toLocaleString()} ₸
                  </span>
                </div>
                
                <button 
                  onClick={() => setSelectedPhone(phone)}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B58B22] hover:from-[#FFEFA1] hover:to-[#D4AF37] text-black text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_25px_rgba(212,175,55,0.2)] active:scale-95"
                >
                  Оформить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
