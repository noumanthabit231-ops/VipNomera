'use client';

import React, { useMemo } from 'react';
import { 
  Search, SlidersHorizontal, Crown, PackageSearch, 
  TrendingUp, FileText, Sun, Moon
} from 'lucide-react';
import { cn } from '../cn';

export const CatalogView = ({ 
  user, isLoading, phones, labels, searchQuery, setSearchQuery, 
  activeLabelFilter, setActiveLabelFilter, filteredPhones,
  setSelectedPhone, setView, userOrders, isLight, toggleTheme
}: any) => {

  const isVIP = user?.subscription === 'ACTIVE' || user?.role === 'ADMIN';

  const stats = useMemo(() => {
    return {
      total: phones?.length || 0
    };
  }, [phones]);

  return (
    <div className="pt-6 space-y-5 pb-24 animate-in fade-in duration-700">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div className="flex items-center justify-between px-4">
        <div className="relative">
          <div className="absolute -left-2 -top-1 w-8 h-8 bg-[#D4AF37]/10 blur-2xl rounded-full" />
          <h1 className={cn("text-3xl font-extrabold tracking-tight leading-none mb-1 relative z-10", isLight ? "text-black" : "text-white")}>
            Exclusive
          </h1>
          <div className="flex items-center gap-2 pl-0.5">
            <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse" />
            <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.3em]">Catalog 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className={cn("relative w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95", isLight ? "bg-white border border-gray-200 shadow-sm" : "bg-[#0A0A0A] border border-white/5")}
          >
            {isLight ? <Moon className="text-gray-500" size={18} /> : <Sun className="text-gray-500" size={18} />}
          </button>

          {user && (
            <button onClick={() => setView('my_orders')} className={cn("relative w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95", isLight ? "bg-white border border-gray-200 shadow-sm" : "bg-[#0A0A0A] border border-white/5")}>
              <FileText className="text-gray-500" size={18} />
              {userOrders?.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">{userOrders.length}</span>}
            </button>
          )}

          <button onClick={() => setView('profile')} className="group relative w-12 h-12 flex items-center justify-center transition-transform active:scale-90">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-2xl rotate-3 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
            <div className="absolute inset-0.5 bg-[#050505] rounded-[14px] z-10" />
            <Crown className="text-[#D4AF37] relative z-20 group-hover:scale-110 transition-transform" size={22} />
          </button>
        </div>
      </div>

      {/* ИНФО-БАР (ТОЛЬКО ВСЕГО) */}
      <div className="px-4">
        <div className={cn("w-full border rounded-xl p-3 flex items-center justify-between px-6", isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#0A0A0A] border-white/5")}>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Всего номеров в базе</span>
          <span className={cn("text-lg font-bold", isLight ? "text-black" : "text-white")}>{stats.total}</span>
        </div>
      </div>

      {/* ПОИСК */}
      <div className="relative group px-4">
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none"><Search className="text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={18} /></div>
        <input type="text" placeholder="Поиск по цифрам..." className={cn("w-full border-2 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none transition-all", isLight ? "bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-[#D4AF37]" : "bg-[#0F0F0F] border-gray-900 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/30")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <div className="absolute inset-y-0 right-6 flex items-center">
          <div className={cn("h-6 w-[1px] mr-2", isLight ? "bg-gray-200" : "bg-gray-800")} />
          <button className="p-2 text-gray-500 hover:text-[#D4AF37] transition-colors"><SlidersHorizontal size={18} /></button>
        </div>
      </div>

      {/* ФИЛЬТРЫ */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4">
        <button onClick={() => setActiveLabelFilter(null)} className={cn("px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wide whitespace-nowrap transition-all border", !activeLabelFilter ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/10" : (isLight ? "bg-white border-gray-200 text-gray-500" : "bg-[#0A0A0A] border-gray-800 text-gray-500"))}>Все номера</button>
        {labels.map((l: any) => (
          <button key={l.id} onClick={() => setActiveLabelFilter(l.id)} className={cn("px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wide whitespace-nowrap transition-all border", activeLabelFilter === l.id ? (isLight ? "bg-black border-black text-white" : "bg-white border-white text-black") : (isLight ? "bg-white border-gray-200 text-gray-500" : "bg-[#0A0A0A] border-gray-800 text-gray-500"))}>{l.text}</button>
        ))}
      </div>

      {/* БАННЕР VIP */}
      <div className="px-4">
        <button onClick={() => isVIP ? setView('order') : setView('profile')} className={cn("w-full flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all relative overflow-hidden group active:scale-95", isVIP ? "border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]" : (isLight ? "border-gray-200 bg-white text-gray-600 shadow-sm" : "border-gray-900 bg-[#070707] text-gray-400"))}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          <div className="flex items-center gap-2 mb-0.5">{isVIP ? <TrendingUp size={14} /> : <Lock size={14} />}<span className="text-[11px] font-bold tracking-wide">{isVIP ? "Персональный подбор" : "VIP заказ заблокирован"}</span></div>
          <span className="text-[9px] font-medium opacity-60 tracking-wide">{isVIP ? "Найдем любой номер под ваши критерии" : "Доступно только владельцам подписки"}</span>
        </button>
      </div>

      {/* СЕТКА НОМЕРОВ */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative"><div className="w-14 h-14 border-2 border-[#D4AF37]/10 border-t-[#D4AF37] rounded-full animate-spin" /><Crown className="absolute inset-0 m-auto text-[#D4AF37] opacity-20" size={20} /></div>
          <div className="flex flex-col items-center"><p className="text-[#D4AF37] font-bold tracking-wide text-[10px] animate-pulse">Синхронизация базы...</p></div>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 border", isLight ? "bg-white border-gray-200" : "bg-[#0F0F0F] border-white/5")}><PackageSearch size={24} className="text-gray-400" /></div>
          <p className="text-gray-500 font-bold tracking-wide text-xs">Совпадений не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 px-2 sm:gap-3 sm:px-4">
          {filteredPhones.map((phone: any, index: number) => {
            const isSold = phone.status === 'SOLD';

            return (
              <div 
                key={phone.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "relative aspect-[3/4] border rounded-xl overflow-hidden group transition-all animate-in fade-in slide-in-from-bottom-2",
                  isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#0A0A0A] border-white/5",
                  isSold ? "opacity-60 grayscale-[30%]" : ""
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-b transition-colors", isLight ? "from-transparent to-gray-50 group-hover:from-gray-50" : "from-[#111] to-black group-hover:from-[#161616]")} />
                
                {isSold && (
                   <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="text-red-500 font-bold tracking-widest text-[10px] border-2 border-red-500 px-2 py-0.5 rotate-[-15deg]">ПРОДАНО</span>
                   </div>
                )}

                <div className="absolute top-0 left-0 right-0 h-1 z-20">
                   <div className={cn("h-full w-full transition-colors", isSold ? "bg-red-500" : "bg-[#D4AF37]")} />
                </div>

                <div className="absolute top-2 left-0 right-0 px-1.5 flex justify-between items-start z-30">
                  <div className="flex flex-col gap-0.5">
                     {phone.label_ids?.slice(0, 1).map((id: string) => {
                       const label = labels.find((l: any) => l.id === id);
                       return label && <div key={id} className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]" style={{ backgroundColor: label.color }} />;
                     })}
                  </div>
                </div>

                <div className="relative z-10 h-full flex flex-col p-2 pt-4">
                  <div className="mb-auto opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className={cn("w-5 h-7 rounded-[2px] border relative overflow-hidden", isLight ? "bg-gray-100 border-gray-300" : "bg-gradient-to-br from-gray-800 to-black border-white/10")} style={{ clipPath: 'polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%)' }}>
                      <div className="absolute bottom-1 left-1 w-3 h-3 bg-[#D4AF37]/20 rounded-sm" />
                    </div>
                  </div>

                  <div className="mt-2">
                    <h3 className={cn(
                      "text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-colors", 
                      isLight ? "text-gray-900 group-hover:text-[#D4AF37]" : "text-white group-hover:text-[#D4AF37]"
                    )}>
                      {phone.number}
                    </h3>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] font-bold text-[#D4AF37]">
                        {phone.price.toLocaleString()} ₸
                      </span>
                    </div>
                  </div>

                  <button 
                    disabled={isSold}
                    onClick={() => {
                      if (!isSold) {
                         isVIP ? setSelectedPhone(phone) : setView('profile');
                      }
                    }}
                    className={cn(
                      "mt-2 w-full py-1.5 rounded-lg text-[8px] font-bold tracking-wide transition-all z-40 relative",
                      isSold ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
                      isVIP ? "bg-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.2)]" : 
                      (isLight ? "bg-gray-100 text-gray-500 border border-gray-200" : "bg-[#151515] text-gray-500 border border-white/5")
                    )}
                  >
                    {isSold ? 'Продано' : isVIP ? 'Купить' : 'VIP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-10 flex flex-col items-center justify-center opacity-20 select-none">
         <Crown size={12} className={cn("mb-2", isLight ? "text-black" : "text-[#D4AF37]")} />
         <span className={cn("text-[8px] font-medium tracking-widest", isLight ? "text-black" : "text-white")}>Конец списка</span>
      </div>
    </div>
  );
};
