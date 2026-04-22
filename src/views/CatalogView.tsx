'use client';

import React, { useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Crown, 
  PackageSearch, 
  Lock, 
  Zap, 
  Flame, 
  CheckCheck, 
  History,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '../cn';

/**
 * CatalogView - Основной экран витрины номеров
 * Сетка переведена в 3 колонки для максимальной информативности
 */
export const CatalogView = ({ 
  user,
  isLoading,
  phones, 
  labels, 
  searchQuery, 
  setSearchQuery, 
  activeLabelFilter, 
  setActiveLabelFilter, 
  filteredPhones,
  setSelectedPhone, 
  setView,
  userOrders // 🌟 ДОБАВЛЕНО: Заявки пользователя
}: any) => {

  // Проверка статуса доступа (VIP или Админ)
  const isVIP = user?.subscription === 'ACTIVE' || user?.role === 'ADMIN';

  // Статистика для верхней панели
  const stats = useMemo(() => {
    return {
      total: phones?.length || 0,
      new: phones?.filter((p: any) => p.status === 'IN_STOCK').length || 0,
      exclusive: labels?.find((l: any) => l.text.toLowerCase().includes('vip'))?.id
    };
  }, [phones, labels]);

  return (
    <div className="pt-6 space-y-5 pb-24 animate-in fade-in duration-700 selection:bg-[#D4AF37]/30">
      
      {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: ЗАГОЛОВОК И ПРОФИЛЬ */}
      <div className="flex items-center justify-between px-4">
        <div className="relative">
          <div className="absolute -left-2 -top-1 w-8 h-8 bg-[#D4AF37]/10 blur-2xl rounded-full" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1 relative z-10">
            Exclusive
          </h1>
          <div className="flex items-center gap-2 pl-0.5">
            <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse" />
            <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.4em]">
              Catalog 2026
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 🌟 ДОБАВЛЕНО: Кнопка "Мои заявки" */}
          {user && (
            <button 
              onClick={() => setView('my_orders')}
              className="relative w-10 h-10 flex items-center justify-center bg-[#0A0A0A] border border-white/5 rounded-xl transition-all active:scale-95 hover:border-[#D4AF37]/30"
            >
              <FileText className="text-gray-500" size={18} />
              {userOrders?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                  {userOrders.length}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={() => setView('profile')}
            className="group relative w-12 h-12 flex items-center justify-center transition-transform active:scale-90"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-2xl rotate-3 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
            <div className="absolute inset-0.5 bg-[#050505] rounded-[14px] z-10" />
            <Crown className="text-[#D4AF37] relative z-20 group-hover:scale-110 transition-transform" size={22} />
          </button>
        </div>
      </div>

      {/* 2. ИНФО-БАР (STATS) */}
      <div className="grid grid-cols-3 gap-2 px-4">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
          <span className="text-[8px] font-bold text-gray-500 uppercase">Всего</span>
          <span className="text-sm font-black text-white italic">{stats.total}</span>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
          <span className="text-[8px] font-bold text-[#D4AF37] uppercase flex items-center gap-1">
            <Zap size={8} /> Свободно
          </span>
          <span className="text-sm font-black text-white italic">{stats.new}</span>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
          <span className="text-[8px] font-bold text-gray-500 uppercase">Online</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]" />
            <span className="text-[10px] font-black text-white tracking-tighter">LIVE</span>
          </div>
        </div>
      </div>

      {/* 3. ПОИСКОВАЯ СИСТЕМА */}
      <div className="relative group px-4">
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
          <Search className="text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Поиск по цифрам..." 
          className="w-full bg-[#0F0F0F] border-2 border-gray-900 rounded-2xl py-4 pl-12 pr-12 text-sm text-white font-bold outline-none focus:border-[#D4AF37]/30 transition-all placeholder:text-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-6 flex items-center">
          <div className="h-6 w-[1px] bg-gray-800 mr-2" />
          <button className="p-2 text-gray-500 hover:text-[#D4AF37] transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* 4. КАТЕГОРИИ (ФИЛЬТРЫ) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4">
        <button 
          onClick={() => setActiveLabelFilter(null)}
          className={cn(
            "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
            !activeLabelFilter 
              ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/10" 
              : "bg-[#0A0A0A] border-gray-800 text-gray-500 hover:border-gray-700"
          )}
        >
          Все номера
        </button>
        {labels.map((l: any) => (
          <button 
            key={l.id}
            onClick={() => setActiveLabelFilter(l.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              activeLabelFilter === l.id 
                ? "bg-white border-white text-black" 
                : "bg-[#0A0A0A] border-gray-800 text-gray-500 hover:border-gray-700"
            )}
          >
            {l.text}
          </button>
        ))}
      </div>

      {/* 5. ИНДИВИДУАЛЬНЫЙ ЗАКАЗ (BANNER) */}
      <div className="px-4">
        <button 
          onClick={() => isVIP ? setView('order') : setView('profile')}
          className={cn(
            "w-full flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all relative overflow-hidden group active:scale-95",
            isVIP 
              ? "border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]" 
              : "border-gray-900 bg-[#070707] text-gray-600"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          <div className="flex items-center gap-2 mb-0.5">
            {isVIP ? <TrendingUp size={14} /> : <Lock size={14} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {isVIP ? "Персональный подбор" : "VIP Order Locked"}
            </span>
          </div>
          <span className="text-[7px] font-bold opacity-50 uppercase tracking-widest">
            {isVIP ? "Найдем любой номер под ваши критерии" : "Доступно только владельцам подписки"}
          </span>
        </button>
      </div>

      {/* 6. ЛИСТИНГ: ЗАГРУЗКА ИЛИ СЕТКА */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-14 h-14 border-2 border-[#D4AF37]/10 border-t-[#D4AF37] rounded-full animate-spin" />
            <Crown className="absolute inset-0 m-auto text-[#D4AF37] opacity-20" size={20} />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[9px] animate-pulse">
              Синхронизация базы...
            </p>
            <span className="text-gray-700 text-[7px] uppercase mt-1 font-bold">Securing connection</span>
          </div>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[#0F0F0F] rounded-full flex items-center justify-center mb-4 border border-white/5">
            <PackageSearch size={24} className="text-gray-700" />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-[9px]">Совпадений не найдено</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-[#D4AF37] text-[8px] font-black uppercase border-b border-[#D4AF37]/30 pb-0.5">
            Сбросить поиск
          </button>
        </div>
      ) : (
        /* СЕТКА В 3 СТОЛБИКА */
        <div className="grid grid-cols-3 gap-2 px-2 sm:gap-3 sm:px-4">
          {filteredPhones.map((phone: any, index: number) => {
            
            // 🌟 ДОБАВЛЕНО: Логика статусов брони
            const isPending = phone.status === 'PENDING';
            const isSold = phone.status === 'SOLD';
            const cleanUserPhone = user?.phone?.replace(/\D/g, '');
            const isLockedByMe = phone.locked_by === cleanUserPhone;
            const isWaitingAdmin = phone.user_confirmed_at !== null;
            const isLockExpired = phone.locked_at && !isWaitingAdmin && (new Date().getTime() - new Date(phone.locked_at).getTime() > 7 * 60000);
            const isActuallyLocked = isPending && !isLockExpired;

            return (
              <div 
                key={phone.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "relative aspect-[3/4] bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden group transition-all animate-in fade-in slide-in-from-bottom-2",
                  (isSold || (isActuallyLocked && !isLockedByMe)) ? "opacity-60 grayscale-[30%]" : ""
                )}
              >
                {/* Фон-градиент */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black group-hover:from-[#161616] transition-colors" />
                
                {/* 🌟 ДОБАВЛЕНО: Оверлей SOLD */}
                {isSold && (
                   <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="text-red-500 font-black uppercase tracking-widest text-[10px] border-2 border-red-500 px-2 py-0.5 rotate-[-15deg]">SOLD</span>
                   </div>
                )}

                {/* 🌟 ДОБАВЛЕНО: Индикатор брони (если кто-то другой смотрит или ждем админа) */}
                {isActuallyLocked && !isSold && (
                   <div className="absolute top-7 left-0 right-0 z-20 flex justify-center pointer-events-none">
                     <span className={cn(
                       "text-[5px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg text-center", 
                       isWaitingAdmin ? "bg-orange-500 text-black" : "bg-[#D4AF37] text-black animate-pulse"
                     )}>
                       {isWaitingAdmin ? "WAITING" : "PENDING"}
                     </span>
                   </div>
                )}

                {/* Верхняя плашка статуса (цвет меняется от статуса) */}
                <div className="absolute top-0 left-0 right-0 h-1 z-20">
                   <div className={cn(
                     "h-full w-full transition-colors",
                     isSold ? "bg-red-500" : isActuallyLocked ? "bg-orange-500" : "bg-[#D4AF37]"
                   )} />
                </div>

                {/* Теги */}
                <div className="absolute top-2 left-0 right-0 px-1.5 flex justify-between items-start z-30">
                  <div className="flex flex-col gap-0.5">
                     {phone.label_ids?.slice(0, 1).map((id: string) => {
                       const label = labels.find((l: any) => l.id === id);
                       return label && (
                         <div key={id} className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]" 
                              style={{ backgroundColor: label.color }} />
                       );
                     })}
                  </div>
                  {isActuallyLocked && !isLockedByMe && <Lock size={8} className="text-orange-500/50" />}
                </div>

                {/* Тело карточки */}
                <div className="relative z-10 h-full flex flex-col p-2 pt-4">
                  {/* Иконка сим-карты (минимализм) */}
                  <div className="mb-auto opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-5 h-7 bg-gradient-to-br from-gray-800 to-black rounded-[2px] border border-white/10 relative overflow-hidden" 
                         style={{ clipPath: 'polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%)' }}>
                      <div className="absolute bottom-1 left-1 w-3 h-3 bg-[#D4AF37]/20 rounded-sm" />
                    </div>
                  </div>

                  {/* Номер телефона */}
                  <div className="mt-2">
                    <h3 className="text-[10px] sm:text-xs font-black italic tracking-tighter text-white group-hover:text-[#D4AF37] transition-colors break-words leading-tight">
                      {phone.number}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[6px] font-black text-[#D4AF37] uppercase tracking-tighter">
                        {phone.price.toLocaleString()} ₸
                      </span>
                    </div>
                  </div>

                  {/* 🌟 ОБНОВЛЕНО: Кнопка действия (учитывает бронь и проданные) */}
                  <button 
                    disabled={isSold || (isActuallyLocked && !isLockedByMe)}
                    onClick={() => {
                      if (!isActuallyLocked || isLockedByMe) {
                         isVIP ? setSelectedPhone(phone) : setView('profile');
                      }
                    }}
                    className={cn(
                      "mt-2 w-full py-1.5 rounded-lg text-[7px] font-black uppercase tracking-tighter transition-all z-40 relative",
                      isSold 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : (isActuallyLocked && !isLockedByMe)
                          ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                          : isVIP 
                            ? "bg-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                            : "bg-[#151515] text-gray-500 border border-white/5"
                    )}
                  >
                    {isSold ? 'SOLD' : (isActuallyLocked && !isLockedByMe) ? 'IN CART' : isVIP ? 'BUY' : 'VIP'}
                  </button>
                </div>
                
                {/* Эффект свечения при наведении */}
                <div className="absolute inset-0 pointer-events-none border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/20 rounded-xl transition-all" />
              </div>
            );
          })}
        </div>
      )}

      {/* ФУТЕР ДЛЯ СКРОЛЛА */}
      <div className="pt-10 flex flex-col items-center justify-center opacity-20 select-none">
         <Crown size={12} className="text-[#D4AF37] mb-2" />
         <span className="text-[6px] font-black text-white uppercase tracking-[0.5em]">End of Collection</span>
      </div>
    </div>
  );
};
