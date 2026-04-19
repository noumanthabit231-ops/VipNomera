import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, X, Edit2, Save, 
  MessageSquare, Send, CheckCircle2, Inbox 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';
import { supabase } from '../supabase';

export const AdminView = ({ 
  phones, labels, fetchData, setView,
  pn, setPn, pr, setPr, st, setSt, sl, setSl
}: any) => {
  const [tab, setTab] = useState<'orders' | 'phones' | 'labels'>('phones');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPn, setEditPn] = useState('');
  const [editPr, setEditPr] = useState('');
  const [editSt, setEditSt] = useState('');
  const [editSl, setEditSl] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#D4AF37');

  // Получение заявок (фильтруем архивированные)
  const fetchOrders = async () => {
    const { data } = await supabase
      .from('custom_orders')
      .select('*')
      .neq('status', 'ARCHIVED')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    if (tab === 'orders') {
      fetchOrders();
    }
  }, [tab]);

  // --- ЛОГИКА ЗАЯВОК ---
  const handleArchiveOrder = async (id: string) => {
    // Оптимистичное удаление из списка
    setOrders(prev => prev.filter(o => o.id !== id));
    
    const { error } = await supabase
      .from('custom_orders')
      .update({ status: 'ARCHIVED' })
      .eq('id', id);

    if (error) {
      alert("Ошибка при архивации: " + error.message);
      fetchOrders(); // Если ошибка - возвращаем как было
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Удалить заявку навсегда?')) {
      setOrders(prev => prev.filter(o => o.id !== id)); // Оптимистичное удаление
      await supabase.from('custom_orders').delete().eq('id', id);
    }
  };

  // --- ЛОГИКА НОМЕРОВ ---
  const startEdit = (p: any) => {
    setEditingId(p.id); 
    setEditPn(p.number); 
    setEditPr(p.price.toString());
    setEditSt(p.status); 
    setEditSl(p.label_ids || []);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);

    // ⚡️ 1. МГНОВЕННО МЕНЯЕМ В ИНТЕРФЕЙСЕ
    const phoneToUpdate = phones.find((p: any) => p.id === editingId);
    if (phoneToUpdate) {
      phoneToUpdate.number = editPn;
      phoneToUpdate.price = Number(editPr);
      phoneToUpdate.status = editSt;
      phoneToUpdate.label_ids = editSl; 
    }

    // ⚡️ 2. Отправляем в базу
    const { error } = await supabase.from('phones').update({ 
      number: editPn, 
      price: Number(editPr), 
      status: editSt, 
      label_ids: editSl 
    }).eq('id', editingId);

    if (error) {
      alert("Ошибка при сохранении в БД: " + error.message);
    } else {
      setEditingId(null);
    }
    
    setIsSaving(false);
  };

  const handleCreatePhone = async () => {
    if (!pn || !pr) return alert('Заполните номер и цену');
    
    const { error } = await supabase.from('phones').insert([{ 
      number: pn, 
      price: Number(pr), 
      status: st, 
      label_ids: sl 
    }]);

    if (error) {
      alert("Ошибка при создании: " + error.message);
    } else {
      setPn(''); setPr(''); setSl([]);
      if (fetchData) await fetchData();
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить номер?')) {
      await supabase.from('phones').delete().eq('id', id);
      if (fetchData) await fetchData();
    }
  };

  // --- ЛОГИКА МЕТОК ---
  const handleCreateLabel = async () => {
    if (!newLabelText) return;
    const { error } = await supabase.from('labels').insert([{ text: newLabelText, color: newLabelColor }]);
    if (error) alert("Ошибка: " + error.message);
    else { setNewLabelText(''); if (fetchData) await fetchData(); }
  };

  const handleDeleteLabel = async (id: string) => {
    await supabase.from('labels').delete().eq('id', id);
    if (fetchData) await fetchData();
  };

  const toggleLabel = (labelId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditSl(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]);
    } else {
      setSl(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]);
    }
  };

  const inputClass = "w-full bg-[#1A1A1A] border-2 border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-gray-600";

  return (
    <div className="pb-24 space-y-8 pt-4 animate-in fade-in selection:bg-[#D4AF37]/30">
      
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Админ-центр</h1>
        <button onClick={() => setView('profile')} className="p-2 text-gray-400 bg-[#111] hover:bg-gray-800 rounded-full transition-colors border border-gray-800"><X size={20}/></button>
      </div>
      
      {/* Навигация */}
      <div className="flex gap-2 bg-[#111] p-1.5 rounded-[2rem] border border-gray-800 mx-2">
        {(['orders', 'phones', 'labels'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", tab === t ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20" : "text-gray-500 hover:text-gray-300")}>
            {t === 'orders' ? 'Заявки' : t === 'phones' ? 'Номера' : 'Метки'}
          </button>
        ))}
      </div>

      <div className="px-2">
        
        {/* ВКЛАДКА: НОМЕРА */}
        {tab === 'phones' && (
          <div className="space-y-6">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-gray-800 shadow-2xl shadow-black">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4">Создать новый лот</h3>
              <div className="space-y-4">
                <input placeholder="Номер (например: 777 000 77 77)" className={inputClass} value={pn} onChange={e => setPn(e.target.value)} />
                <input type="number" placeholder="Стоимость (₸)" className={inputClass} value={pr} onChange={e => setPr(e.target.value)} />
                
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setSt('IN_STOCK')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all", st === 'IN_STOCK' ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10" : "border-gray-800 text-gray-500 bg-[#1A1A1A]")}>В наличии</button>
                   <button onClick={() => setSt('ON_ORDER')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all", st === 'ON_ORDER' ? "border-orange-500/50 text-orange-400 bg-orange-500/10" : "border-gray-800 text-gray-500 bg-[#1A1A1A]")}>Предзаказ</button>
                </div>

                {labels.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3">Прикрепить метки:</p>
                    <div className="flex flex-wrap gap-2">
                      {labels.map((l: any) => (
                        <button key={l.id} onClick={() => toggleLabel(l.id, false)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border", sl.includes(l.id) ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : "border-gray-800 bg-[#1A1A1A] text-gray-500 hover:border-gray-600")}>{l.text}</button>
                      ))}
                    </div>
                  </div>
                )}

                <Button fullWidth onClick={handleCreatePhone} className="mt-2 py-5 bg-[#D4AF37] text-black hover:bg-[#B58B22] border-none"><Plus size={18} className="mr-1"/> Добавить номер</Button>
              </div>
            </div>

            <div className="space-y-4">
              {phones.map((p: any) => (
                <div key={p.id} className="p-5 bg-[#111] rounded-[1.5rem] border border-gray-800 shadow-lg">
                  {editingId === p.id ? (
                    <div className="space-y-4">
                      <input className={inputClass} value={editPn} onChange={e => setEditPn(e.target.value)} />
                      <input type="number" className={inputClass} value={editPr} onChange={e => setEditPr(e.target.value)} />
                      <select className={cn(inputClass, "uppercase text-[10px]")} value={editSt} onChange={e => setEditSt(e.target.value)}>
                        <option value="IN_STOCK">В наличии</option>
                        <option value="ON_ORDER">На заказ</option>
                      </select>
                      
                      {labels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {labels.map((l: any) => (
                            <button key={l.id} onClick={() => toggleLabel(l.id, true)} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold border", editSl.includes(l.id) ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : "border-gray-800 bg-[#1A1A1A] text-gray-500")}>{l.text}</button>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button fullWidth disabled={isSaving} onClick={handleSaveEdit} className="py-4 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                          {isSaving ? 'Сохранение...' : <><Save size={16} className="mr-2"/> Сохранить</>}
                        </Button>
                        <button onClick={() => setEditingId(null)} className="px-5 bg-[#1A1A1A] border border-gray-800 rounded-xl text-gray-400 hover:text-white"><X size={16}/></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-white text-xl italic tracking-tighter mb-1">{p.number}</div>
                        <div className="text-[#D4AF37] font-bold text-sm">{p.price.toLocaleString()} ₸</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="w-12 h-12 bg-[#1A1A1A] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl flex items-center justify-center transition-all"><Edit2 size={18}/></button>
                        <button onClick={() => handleDeletePhone(p.id)} className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-all"><Trash2 size={18}/></button>
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
            {orders.length === 0 && (
              <div className="text-center p-16 text-gray-700 font-black uppercase tracking-widest border-2 border-dashed border-gray-900 rounded-[2.5rem]">
                <Inbox size={40} className="mx-auto mb-4 opacity-20" />
                Новых заявок нет
              </div>
            )}
            
            {orders.map(o => (
              <div key={o.id} className="p-6 bg-[#0F0F0F] rounded-[2.2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/20" />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[9px] font-black uppercase text-[#D4AF37] tracking-[0.3em] mb-2">Индивидуальный заказ</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">{o.desired_number}</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteOrder(o.id)}
                    className="p-3 bg-red-500/5 text-red-900 hover:text-red-500 rounded-2xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#151515] p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Бюджет</p>
                    <p className="text-sm font-black text-white">{o.budget ? `${Number(o.budget).toLocaleString()} ₸` : 'Не указан'}</p>
                  </div>
                  <div className="bg-[#151515] p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Клиент</p>
                    <p className="text-sm font-black text-white truncate">{o.user_name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => window.open(`https://wa.me/${o.user_phone.replace(/\D/g, '')}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl border border-[#25D366]/20 font-black uppercase text-[10px] tracking-widest hover:bg-[#25D366]/20 transition-all"
                  >
                    <MessageSquare size={16} /> WhatsApp
                  </button>
                  
                  <button 
                    onClick={() => window.open(`https://t.me/+${o.user_phone.replace(/\D/g, '')}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0088CC]/10 text-[#0088CC] rounded-2xl border border-[#0088CC]/20 font-black uppercase text-[10px] tracking-widest hover:bg-[#0088CC]/20 transition-all"
                  >
                    <Send size={16} /> Telegram
                  </button>

                  <button 
                    onClick={() => handleArchiveOrder(o.id)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#D4AF37] text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#D4AF37]/10 hover:opacity-90 active:scale-[0.98] transition-all mt-1"
                  >
                    <CheckCircle2 size={16} /> В отработанные
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ВКЛАДКА: МЕТКИ */}
        {tab === 'labels' && (
          <div className="space-y-6">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4">Создать метку</h3>
              <div className="flex gap-3 mb-4">
                <input type="color" className="w-16 h-16 rounded-2xl border-2 border-gray-800 p-1 bg-[#1A1A1A] cursor-pointer" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} />
                <input placeholder="Например: VIP, Парные..." className={inputClass} value={newLabelText} onChange={e => setNewLabelText(e.target.value)} />
              </div>
              <Button fullWidth className="py-5 bg-[#D4AF37] text-black hover:bg-[#B58B22] border-none" onClick={handleCreateLabel}><Plus size={18} className="mr-1"/> Добавить метку</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {labels.map((l: any) => (
                <div key={l.id} className="flex items-center gap-3 pl-5 pr-2 py-2 bg-[#1A1A1A] border border-gray-800 rounded-xl shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: l.color }}>{l.text}</span>
                  <button onClick={() => handleDeleteLabel(l.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
