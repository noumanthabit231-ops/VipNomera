import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../cn';
import { supabase } from '../supabase'; // Убедись, что путь верный

export const AdminView = ({ 
  phones, labels, users, approveUser, fetchData, handleSavePhone, handleDeletePhone, setView,
  pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc
}: any) => {
  const [tab, setTab] = useState<'orders' | 'phones' | 'labels'>('phones');

  return (
    <div className="pb-24 space-y-8 pt-4 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Управление</h1>
        <button onClick={() => setView('catalog')} className="p-2 text-gray-400"><X size={24}/></button>
      </div>
      
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-[2rem]">
        {(['orders', 'phones', 'labels'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3.5 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all", tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
            {t === 'orders' ? 'Заявки' : t === 'phones' ? 'Номера' : 'Метки'}
          </button>
        ))}
      </div>

      {tab === 'phones' && (
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <input placeholder="Номер телефона" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 text-sm outline-none" value={pn} onChange={e => setPn(e.target.value)} />
              <input type="number" placeholder="Стоимость" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 text-sm outline-none" value={pr} onChange={e => setPr(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setSt('IN_STOCK')} className={cn("py-4 rounded-2xl text-[11px] font-black uppercase border-2 transition-all", st === 'IN_STOCK' ? "border-[#D4AF37] text-[#D4AF37]" : "border-gray-50 text-gray-400")}>В наличии</button>
                 <button onClick={() => setSt('ON_ORDER')} className={cn("py-4 rounded-2xl text-[11px] font-black uppercase border-2 transition-all", st === 'ON_ORDER' ? "border-orange-400 text-orange-600" : "border-gray-50 text-gray-400")}>На заказ</button>
              </div>
              <Button fullWidth onClick={handleSavePhone}><Plus size={20}/> Создать лот</Button>
            </div>
          </Card>
          {phones.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="font-bold text-gray-900">{p.number}</div>
              <button onClick={() => handleDeletePhone(p.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
