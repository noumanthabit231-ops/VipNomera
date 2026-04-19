import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2, Save, Tag, Inbox } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../cn';
import { supabase } from '../supabase';

export const AdminView = ({ 
  phones, labels, fetchData, setView,
  pn, setPn, pr, setPr, st, setSt, sl, setSl
}: any) => {
  const [tab, setTab] = useState<'orders' | 'phones' | 'labels'>('phones');
  
  // Состояния для редактирования
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPn, setEditPn] = useState('');
  const [editPr, setEditPr] = useState('');
  const [editSt, setEditSt] = useState('');
  const [editSl, setEditSl] = useState<string[]>([]);

  // Состояния для заявок и меток
  const [orders, setOrders] = useState<any[]>([]);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#D4AF37');

  // Загрузка заявок
  useEffect(() => {
    if (tab === 'orders') {
      supabase.from('custom_orders').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setOrders(data || []));
    }
  }, [tab]);

  // Управление номерами
  const handleSaveEdit = async () => {
    await supabase.from('phones').update({ 
      number: editPn, 
      price: Number(editPr), 
      status: editSt, 
      label_ids: editSl 
    }).eq('id', editingId);
    setEditingId(null);
    fetchData();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditPn(p.number);
    setEditPr(p.price.toString());
    setEditSt(p.status);
    setEditSl(p.label_ids || []);
  };

  const handleCreatePhone = async () => {
    if (!pn || !pr) return alert('Заполните номер и цену');
    await supabase.from('phones').insert([{ number: pn, price: Number(pr), status: st, label_ids: sl }]);
    setPn(''); setPr(''); setSl([]);
    fetchData();
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить номер?')) {
      await supabase.from('phones').delete().eq('id', id);
      fetchData();
    }
  };

  // Управление метками
  const handleCreateLabel = async () => {
    if (!newLabelText) return;
    await supabase.from('labels').insert([{ text: newLabelText, color: newLabelColor }]);
    setNewLabelText('');
    fetchData();
  };

  const handleDeleteLabel = async (id: string) => {
    await supabase.from('labels').delete().eq('id', id);
    fetchData();
  };

  // Переключение меток при создании/редактировании
  const toggleLabel = (labelId: string, isEditing: boolean) => {
    const currentList = isEditing ? editSl : sl;
    const setter = isEditing ? setEditSl : setSl;
    if (currentList.includes(labelId)) {
      setter(currentList.filter(id => id !== labelId));
    } else {
      setter([...currentList, labelId]);
    }
  };

  return (
    <div className="pb-24 space-y-8 pt-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Админ-центр</h1>
        <button onClick={() => setView('profile')} className="p-2 text-gray-400 bg-white rounded-full shadow-sm"><X size={20}/></button>
      </div>
      
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-[2rem]">
        {(['orders', 'phones', 'labels'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")}>
            {t === 'orders' ? 'Заявки' : t === 'phones' ? 'Номера' : 'Метки'}
          </button>
        ))}
      </div>

      {/* ВКЛАДКА: НОМЕРА */}
      {tab === 'phones' && (
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Создать новый лот</h3>
            <div className="space-y-4">
              <input placeholder="Номер телефона" className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-indigo-100" value={pn} onChange={e => setPn(e.target.value)} />
              <input type="number" placeholder="Стоимость (₸)" className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-indigo-100" value={pr} onChange={e => setPr(e.target.value)} />
              
              {/* Выбор статуса */}
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setSt('IN_STOCK')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all", st === 'IN_STOCK' ? "border-green-500 text-green-600 bg-green-50" : "border-gray-50 text-gray-400")}>В наличии</button>
                 <button onClick={() => setSt('ON_ORDER')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all", st === 'ON_ORDER' ? "border-orange-400 text-orange-600 bg-orange-50" : "border-gray-50 text-gray-400")}>На заказ</button>
              </div>

              {/* Выбор меток */}
              {labels.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Прикрепить метки:</p>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((l: any) => (
                      <button 
                        key={l.id} 
                        onClick={() => toggleLabel(l.id, false)}
                        className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border", sl.includes(l.id) ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-500")}
                      >
                        {l.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button fullWidth onClick={handleCreatePhone} className="mt-2 py-4"><Plus size={18} className="mr-1"/> Добавить номер</Button>
            </div>
          </Card>

          {/* Список номеров */}
          <div className="space-y-3">
            {phones.map((p: any) => (
              <div key={p.id} className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                {editingId === p.id ? (
                  <div className="space-y-4">
                    <input className="w-full bg-gray-50 rounded-xl p-3 font-bold" value={editPn} onChange={e => setEditPn(e.target.value)} />
                    <input type="number" className="w-full bg-gray-50 rounded-xl p-3 font-bold" value={editPr} onChange={e => setEditPr(e.target.value)} />
                    <select className="w-full bg-gray-50 rounded-xl p-3 font-bold uppercase text-[10px]" value={editSt} onChange={e => setEditSt(e.target.value)}>
                      <option value="IN_STOCK">В наличии</option>
                      <option value="ON_ORDER">На заказ</option>
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {labels.map((l: any) => (
                        <button key={l.id} onClick={() => toggleLabel(l.id, true)} className={cn("px-2 py-1 rounded-md text-[9px] font-bold border", editSl.includes(l.id) ? "bg-indigo-100 border-indigo-200 text-indigo-700" : "bg-gray-50 text-gray-400")}>
                          {l.text}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button fullWidth onClick={handleSaveEdit} className="py-3"><Save size={16}/> Сохранить</Button>
                      <button onClick={() => setEditingId(null)} className="px-4 bg-gray-100 rounded-xl text-gray-500"><X size={16}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-gray-900 text-lg italic tracking-tight">{p.number}</div>
                      <div className="text-[#D4AF37] font-bold text-sm">{p.price.toLocaleString()} ₸</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeletePhone(p.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><Trash2 size={16}/></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ВКЛАДКА: ЗАЯВКИ */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 && <div className="text-center p-10 text-gray-400 font-bold text-sm">Заявок пока нет</div>}
          {orders.map(o => (
            <Card key={o.id} className="p-5 border-none shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ищет номер:</p>
                  <p className="text-xl font-black italic">{o.desired_number}</p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{o.status}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Бюджет:</span><span className="font-black">{o.budget ? `${o.budget} ₸` : 'Не указан'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Клиент:</span><span className="font-black">{o.user_name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Связь:</span><span className="font-black">+{o.user_phone}</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button fullWidth onClick={() => window.open(`https://wa.me/${o.user_phone}`, '_blank')} className="bg-green-500 text-white hover:bg-green-600 py-3">Написать в WA</Button>
                <Button fullWidth onClick={() => window.open(`https://t.me/+${o.user_phone}`, '_blank')} className="bg-blue-500 text-white hover:bg-blue-600 py-3">В Telegram</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ВКЛАДКА: МЕТКИ */}
      {tab === 'labels' && (
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Новая метка</h3>
            <div className="flex gap-2">
              <input type="color" className="w-14 h-14 rounded-2xl border-none p-1 bg-gray-50" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} />
              <input placeholder="Текст метки" className="flex-1 bg-gray-50 rounded-2xl p-4 font-bold outline-none" value={newLabelText} onChange={e => setNewLabelText(e.target.value)} />
            </div>
            <Button fullWidth className="mt-4 py-4" onClick={handleCreateLabel}><Plus size={18}/> Добавить</Button>
          </Card>
          <div className="flex flex-wrap gap-2">
            {labels.map((l: any) => (
              <div key={l.id} className="flex items-center gap-2 pl-4 pr-1 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                <span className="text-[10px] font-bold uppercase" style={{ color: l.color }}>{l.text}</span>
                <button onClick={() => handleDeleteLabel(l.id)} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><X size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
