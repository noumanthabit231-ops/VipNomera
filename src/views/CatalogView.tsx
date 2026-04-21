import React from 'react';
import { Search, SlidersHorizontal, Crown, PackageSearch, Lock } from 'lucide-react';
import { cn } from '../cn';

export const CatalogView = ({ 
  user,
  isLoading, // 🌟 ПРИНИМАЕМ ИНДИКАТОР ЗАГРУЗКИ ИЗ APP.TSX 🌟
  phones, labels, searchQuery, setSearchQuery, 
  activeLabelFilter, setActiveLabelFilter, filteredPhones,
  setSelectedPhone, setView
}: any) => {

  // Проверяем статус (Админ или VIP)
  const isVIP = user?.subscription === 'ACTIVE' || user?.role === 'ADMIN';

  return (
    <div className="pt-8 space-y-6 pb-20 animate-in fade-in duration-500 selection:bg-[#D4AF37]/30">
      
      {/* Шапка */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">
            Exclusive
          </h1>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] pl-0.5">
            Номера
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)] relative cursor-pointer" onClick={() => setView('profile')}>
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

      {/* Спецзаказ */}
      <div className="px-2">
        <button 
          onClick={() => isVIP ? setView('order') : setView('profile')}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.98]",
            isVIP 
              ? "border-dashed border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 bg-[#D4AF37]/5" 
              : "border-gray-800 text-gray-500 bg-[#0A0A0A]"
          )}
        >
          {isVIP ? <PackageSearch size={18} /> : <Lock size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">
            {isVIP ? "Сделать индивидуальный заказ" : "Индивидуальный заказ (Нужен VIP)"}
          </span>
        </button>
      </div>

      {/* 🌟 БЛОК ЗАГРУЗКИ / СЕТКА КАРТОЧЕК 🌟 */}
      {isLoading ? (
        // ЭТОТ БЛОК ПОКАЗЫВАЕТСЯ, ПОКА ДАННЫЕ ЛЕТЯТ ИЗ SUPABASE
        <div className="flex flex-col items-center justify-center py-32 opacity-80">
          <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-6" />
          <p className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
            Загрузка каталога...
          </p>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center px-4">
          <Search size={40} className="mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-[10px]">Ничего не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-2">
          {filteredPhones.map((phone: any) => (
            <div 
              key={phone.id} 
              className="relative overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] group transition-all duration-500 hover:border-[#D4AF37]/40 flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#080808] to-[#050505] group-hover:from-[#161616] transition-colors duration-500" />
              
              <div className="absolute top-3 right-0 flex flex-col items-end gap-1.5 z-30">
                <div className={cn(
                  "px-2 py-1 rounded-l text-[7px] font-black uppercase tracking-widest border-y border-l border-r-0 shadow-lg",
                  phone.status === 'IN_STOCK' ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/40" : "bg-[#111] text-gray-500 border-white/5"
                )}>
                  {phone.status === 'IN_STOCK' ? 'В наличии' : 'Бронь'}
                </div>
                {phone.label_ids && phone.label_ids.map((labelId: string) => {
                  const label = labels.find((l: any) => l.id === labelId);
                  if (!label) return null;
                  return (
                    <div key={label.id} className="px-2 py-1 rounded-l text-[7px] font-black uppercase tracking-widest shadow-lg border-y border-l border-r-0"
                      style={{ backgroundColor: label.color, color: '#000', borderColor: `${label.color}`, boxShadow: `0 2px 8px ${label.color}40` }}>
                      {label.text}
                    </div>
                  );
                })}
              </div>

              <div className="relative z-20 flex flex-col h-full flex-grow">
                <div className="flex justify-start items-start mb-4">
                  <div className="relative w-10 h-14 bg-[#111] flex items-center justify-center shadow-lg border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all" style={{ borderRadius: '6px', clipPath: 'polygon(0 0, 70% 0, 100% 18%, 100% 100%, 0 100%)'}}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-white/[0.02] to-transparent" />
                    <div className="w-6 h-7 bg-gradient-to-br from-[#F9D423] via-[#D4AF37] to-[#8C7323] rounded-[3px] p-[1px] relative z-10">
                      <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-[1px] bg-black/50 rounded-[2px] overflow-hidden">
                         <div className="bg-[#D4AF37]/80" /><div className="bg-[#D4AF37]/80" />
                         <div className="bg-[#D4AF37]/80" /><div className="bg-[#D4AF37]/80" />
                         <div className="bg-[#D4AF37]/80 col-span-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[#D4AF37]/60 text-[6px] font-black uppercase tracking-[0.2em] mb-1 pl-0.5">Premium</p>
                  <h3 className="text-lg sm:text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFEFA1] via-[#D4AF37] to-[#B58B22] leading-none drop-shadow-md truncate">
                    {phone.number}
                  </h3>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-white/5 mt-auto">
                  <div className="flex flex-col items-start pl-0.5">
                    <span className="text-[7px] font-black text-[#D4AF37] uppercase tracking-widest opacity-60 mb-0.5">Стоимость</span>
                    <span className="text-sm font-black italic tracking-tight text-white">{phone.price.toLocaleString()} ₸</span>
                  </div>
                  
                  {isVIP ? (
                    <button 
                      onClick={() => setSelectedPhone(phone)}
                      className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B58B22] text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_10px_rgba(212,175,55,0.2)] active:scale-95 mt-1"
                    >
                      Забронировать
                    </button>
                  ) : (
                    <button 
                      onClick={() => setView('profile')}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#1A1A1A] text-gray-500 border border-gray-800 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all hover:text-[#D4AF37] hover:border-[#D4AF37]/50 active:scale-95 mt-1"
                    >
                      <Lock size={10} className="mb-0.5" /> Нужен VIP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
