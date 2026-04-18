import React from 'react'; // Добавили для стабильности
import { Search } from 'lucide-react';
import { cn } from '../cn';
import { PhoneCard } from '../components/PhoneCard';

export const CatalogView = ({ filteredPhones, labels, searchQuery, setSearchQuery, activeLabelFilter, setActiveLabelFilter, setSelectedPhone }: any) => (
  <div className="space-y-8 animate-in">
    <div className="pt-6 text-center">
      <h1 className="text-5xl font-black italic text-gray-900 tracking-tighter mb-2">GOLDEN</h1>
      <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.4em]">Эксклюзивные номера Казахстана</p>
    </div>

    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
        <input 
          type="text" 
          placeholder="Поиск номера..." 
          className="w-full bg-white border-none rounded-[2rem] py-5 pl-14 pr-6 text-gray-900 shadow-sm focus:ring-4 ring-gray-100 transition-all outline-none" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button 
          onClick={() => setActiveLabelFilter(null)} 
          className={cn("px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap", !activeLabelFilter ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20" : "bg-white text-gray-400")}
        >
          Все
        </button>
        {(labels || []).map((l: any) => (
          <button 
            key={l.id} 
            onClick={() => setActiveLabelFilter(l.id === activeLabelFilter ? null : l.id)} 
            className={cn("px-6 py-2.5 rounded-full text-xs font-bold transition-all bg-white whitespace-nowrap", activeLabelFilter === l.id ? "text-gray-900 ring-2 ring-gray-900" : "text-gray-400")}
          >
            {l.text}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-5">
      {(filteredPhones || []).map((phone: any) => (
        <PhoneCard key={phone.id} phone={phone} labels={labels} onClick={() => setSelectedPhone(phone)} />
      ))}
    </div>
  </div>
);
