import { 
  Search, 
  User as UserIcon, 
  Crown, 
  ShoppingBag, 
  Settings, 
  ChevronRight, 
  X, 
  LogOut, 
  Smartphone,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from './supabase';
import { cn } from './cn';
import { Phone, Label, UserProfile } from './types';
import { PhoneCard } from './components/PhoneCard';
import { Navigation } from './components/Navigation';

/** --- Local Storage Helpers --- */
const KEYS = {
  USERS: 'golden_v2_users',
  SESSION: 'golden_v2_session'
};

const getStorage = <T,>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/** --- Constants & Mock Data --- */
const INITIAL_ADMIN: UserProfile = {
  id: 'admin-root',
  email: 'admin@gold.kz',
  password: 'admin',
  role: 'ADMIN',
  subscription: 'ACTIVE'
};


const Button = ({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, disabled = false, className = "" }: any) => {
  const variants: any = {
    primary: "bg-[#D4AF37] text-black hover:bg-[#FFD700] shadow-lg shadow-[#D4AF37]/10",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    outline: "border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10",
    ghost: "text-gray-400 hover:text-white",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
  };
  const sizes: any = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base font-bold"
  };
  
  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      onClick={onClick} 
      className={cn(
        "rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = "", onClick }: any) => (
  <motion.div 
    layout
    onClick={onClick}
    className={cn("bg-[#0F0F0F] border border-white/[0.05] rounded-3xl p-5", className)}
  >
    {children}
  </motion.div>
);

const BottomSheet = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-white/10 rounded-t-[2.5rem] overflow-hidden"
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-4" onClick={onClose} />
          <div className="px-6 pb-12 pt-2 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400"><X size={20}/></button>
            </div>
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/** --- Main Application --- */

export default function App() {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'subscription'>('catalog');
  
  // Авторизация
  const [user, setUser] = useState<UserProfile | null>(() => getStorage(KEYS.SESSION, null));
  const [users, setUsers] = useState<UserProfile[]>(() => getStorage(KEYS.USERS, [INITIAL_ADMIN]));
  const [authData, setAuthData] = useState({ email: '', password: '', isLogin: true });

  // Данные из Supabase
  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  
  // Состояния UI
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);

  // Загрузка данных при старте
  useEffect(() => {
    fetchData();
  }, []);

  // Синхронизация сессии
  useEffect(() => {
    setStorage(KEYS.SESSION, user);
    setStorage(KEYS.USERS, users);
  }, [user, users]);

  // --- SUPABASE ФУНКЦИИ ---
  const fetchData = async () => {
    try {
      const [phonesRes, labelsRes] = await Promise.all([
        supabase.from('phones').select('*').order('created_at', { ascending: false }),
        supabase.from('labels').select('*').order('text')
      ]);
      
      if (phonesRes.data) setPhones(phonesRes.data);
      if (labelsRes.data) setLabels(labelsRes.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  const handleSavePhone = async (payload: any) => {
    const { id, ...data } = payload;
    let result;
    
    if (id) {
      result = await supabase.from('phones').update(data).eq('id', id);
    } else {
      result = await supabase.from('phones').insert([data]);
    }

    if (!result.error) {
      fetchData(); 
      return true;
    }
    return false;
  };

  const handleDeletePhone = async (id: string) => {
    const { error } = await supabase.from('phones').delete().eq('id', id);
    if (!error) fetchData();
  };

  // --- ЛОКАЛЬНЫЕ ФУНКЦИИ ---
  const handleAuth = () => {
    if (authData.isLogin) {
      const found = users.find(u => u.email === authData.email && u.password === authData.password);
      if (found) { setUser(found); setView('catalog'); }
      else alert('Invalid credentials');
    } else {
      if (users.find(u => u.email === authData.email)) return alert('Email exists');
      const newUser: UserProfile = { id: Math.random().toString(36).substr(2, 9), email: authData.email, password: authData.password, role: 'USER', subscription: 'INACTIVE' };
      setUsers([...users, newUser]); setUser(newUser); setView('catalog');
    }
  };

  const approveUser = (uid: string) => {
    const updated = users.map(u => u.id === uid ? { ...u, subscription: 'ACTIVE' as const } : u);
    setUsers(updated);
    if (user?.id === uid) setUser({ ...user, subscription: 'ACTIVE' });
  };

  // Filtered List
  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      // Проверка наличия массива labelIds перед фильтрацией (защита от ошибок типизации из БД)
      const matchesLabel = activeLabelFilter ? (p.labelIds || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  // Далее идет ваш return () и остальной JSX код...

  const Catalog = () => (
    <div className="pb-24 space-y-8">
      {/* Header Info */}
      <div className="pt-4 px-2">
        <h1 className="text-4xl font-black italic gold-text tracking-tighter mb-2">GOLDEN</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Premium Mobile Numbers Market</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 px-2">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search numbers..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button 
            onClick={() => setActiveLabelFilter(null)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeLabelFilter === null ? "bg-[#D4AF37] text-black" : "bg-white/5 text-gray-500"
            )}
          >
            All
          </button>
          {labels.map(l => (
            <button 
              key={l.id}
              onClick={() => setActiveLabelFilter(l.id === activeLabelFilter ? null : l.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent",
                activeLabelFilter === l.id ? "border-white/20 text-white shadow-xl" : "bg-white/5 text-gray-500"
              )}
              style={activeLabelFilter === l.id ? { backgroundColor: l.color } : {}}
            >
              {l.text}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-4 px-2">
          {filteredPhones.length === 0 ? (
            <div className="py-20 text-center opacity-30 italic">No numbers found</div>
          ) : filteredPhones.map((phone) => (
            <Card 
              key={phone.id} 
              className="group active:scale-[0.98] transition-transform" 
              onClick={() => setSelectedPhone(phone)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1.5">
                    {phone.labelIds.map(lid => {
                      const label = labels.find(l => l.id === lid);
                      return label ? (
                        <span key={lid} className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase" style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}30` }}>
                          {label.text}
                        </span>
                      ) : null;
                    })}
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-lg font-black uppercase border",
                      phone.status === 'IN_STOCK' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {phone.status === 'IN_STOCK' ? 'Ready' : '24h'}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-700 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-mono font-bold text-white tracking-tighter">{phone.number}</h3>
                    <p className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest font-black">Private Reserve</p>
                  </div>
                  <div className="text-right">
                    <p className="gold-text text-xl font-black italic">{phone.price.toLocaleString()} ₸</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );

  const AdminPanel = () => {
    const [tab, setTab] = useState<'orders' | 'phones' | 'labels'>('orders');
    const [pn, setPn] = useState('');
    const [pr, setPr] = useState('');
    const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
    const [sl, setSl] = useState<string[]>([]);
    const [lt, setLt] = useState('');
    const [lc, setLc] = useState('#D4AF37');

    return (
      <div className="pb-24 space-y-8 animate-in pt-4">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-black italic gold-text tracking-tighter">CONTROL CENTER</h1>
          <Button variant="ghost" size="sm" onClick={() => setView('catalog')}><X size={20}/></Button>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl mx-2">
          {(['orders', 'phones', 'labels'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)} 
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                tab === t ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20" : "text-gray-500"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-2 space-y-6">
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-1">Subscription Requests</h2>
              {users.filter(u => u.subscription === 'PENDING').length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-600 text-sm">
                  Zero pending requests
                </div>
              )}
              {users.filter(u => u.subscription === 'PENDING').map(u => (
                <Card key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{u.email}</p>
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Zap size={10}/> Awaiting Approval
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => approveUser(u.id)}>Approve</Button>
                </Card>
              ))}
            </div>
          )}

          {tab === 'phones' && (
            <div className="space-y-6">
              <Card className="border-[#D4AF37]/20 bg-[#151515]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Register Number</h3>
                <div className="space-y-4">
                  <input placeholder="+7 (___) ___ __ __" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm" value={pn} onChange={e => setPn(e.target.value)} />
                  <input type="number" placeholder="Price (₸)" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm" value={pr} onChange={e => setPr(e.target.value)} />
                  <select className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm appearance-none" value={st} onChange={e => setSt(e.target.value as any)}>
                    <option value="IN_STOCK">Immediate Stock</option>
                    <option value="ON_ORDER">On-Demand Order</option>
                  </select>
                  {/* Блок с кнопками меток и кнопкой добавления */}
            {/* Блок выбора меток и кнопка добавления */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Присвоить метки:</p>
                <div className="flex flex-wrap gap-2">
                  {labels.map(l => (
                    <button 
                      key={l.id} 
                      onClick={() => setSl(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all duration-300", 
                        sl.includes(l.id) ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5" : "border-white/10 text-zinc-600 hover:border-white/20"
                      )}
                      style={sl.includes(l.id) ? { borderColor: l.color, color: l.color } : {}}
                    >
                      {l.text}
                    </button>
                  ))}
                </div>
              
                <Button 
                  fullWidth 
                  className="mt-6 py-4 shadow-xl shadow-[#D4AF37]/5" 
                  onClick={async () => { 
                    // Вызов функции сохранения в Supabase
                    const success = await handleSavePhone({ 
                      number: pn, 
                      price: Number(pr), 
                      status: st, 
                      labelIds: sl 
                    }); 
                    
                    if (success) {
                      setPn(''); 
                      setPr(''); 
                      setSl([]); 
                    }
                  }}
                >
                  <Plus size={16}/> Опубликовать в базу
                </Button>
              </div>

{/* Список активных номеров для управления */}
<div className="space-y-3 mt-10">
  <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold px-1 mb-4">Управление активами</h3>
  {phones.length === 0 ? (
    <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl text-zinc-700 text-xs">
      База данных пуста
    </div>
  ) : (
    phones.map(p => (
      <div key={p.id} className="flex items-center justify-between p-5 bg-[#080808] rounded-2xl border border-white/[0.03] group hover:border-white/10 transition-colors">
        <div className="flex flex-col">
          <span className="font-display text-sm text-white tracking-widest">{p.number}</span>
          <span className="text-[10px] text-[#B38728] font-bold uppercase tracking-widest mt-1">
            {p.price.toLocaleString('ru-RU')} ₸
          </span>
        </div>
        
        <button 
          onClick={() => handleDeletePhone(p.id)} 
          className="p-2 text-zinc-800 hover:text-red-500 transition-all duration-300 transform hover:scale-110"
          title="Удалить из базы"
        >
          <Trash2 size={18}/>
        </button>
      </div>
    ))
  )}
</div>

          {tab === 'labels' && (
            <div className="space-y-6">
              <Card className="border-[#D4AF37]/20 bg-[#151515]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Tag Creation</h3>
                <div className="space-y-4">
                  <input placeholder="Tag Label (e.g. ULTRA)" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm uppercase font-black" value={lt} onChange={e => setLt(e.target.value.toUpperCase())} />
                  <div className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/5">
                    <input type="color" className="w-12 h-12 bg-transparent border-none cursor-pointer p-0" value={lc} onChange={e => setLc(e.target.value)} />
                    <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-center py-3 rounded-xl" style={{ backgroundColor: `${lc}20`, color: lc, border: `1px solid ${lc}40` }}>
                      Color Preview
                    </div>
                  </div>
                  <Button fullWidth onClick={() => { addLabel(lt, lc); setLt(''); }}><Plus size={16}/> Create Tag</Button>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {labels.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg" style={{ backgroundColor: `${l.color}20`, color: l.color }}>{l.text}</span>
                    <button onClick={() => setLabels(labels.filter(x => x.id !== l.id))} className="text-red-500/30 hover:text-red-500 p-1"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /** --- Layout Structure --- */

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-[#D4AF37] selection:text-black pb-32">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('catalog')}>
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-xl shadow-[#D4AF37]/20">
              <Crown size={20} className="text-black" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-tighter italic">GOLDEN</span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Official Store</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div 
                className="flex items-center gap-2 bg-white/5 pl-2 pr-4 py-2 rounded-2xl border border-white/5 cursor-pointer active:scale-95 transition-all"
                onClick={() => setView('profile')}
              >
                <div className={cn("w-2 h-2 rounded-full", user.subscription === 'ACTIVE' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500 animate-pulse")} />
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{user.role}</span>
              </div>
            )}
            {!user && (
              <button 
                className="gold-text text-[10px] font-black uppercase tracking-widest border border-[#D4AF37]/30 px-5 py-2.5 rounded-2xl hover:bg-[#D4AF37]/10 transition-all active:scale-95" 
                onClick={() => setView('auth')}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* View Content */}
      <main className="max-w-xl mx-auto px-4 mt-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'catalog' && <Catalog />}
            {view === 'admin' && <AdminPanel />}
            {view === 'auth' && (
              <div className="pt-10 flex flex-col gap-8 max-w-sm mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black italic gold-text">ACCESS</h1>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">{authData.isLogin ? 'Private Lounge' : 'Join the Elite'}</p>
                </div>
                <Card className="bg-[#111] p-8 border-white/10 shadow-2xl">
                  <div className="space-y-4">
                    <input type="email" placeholder="Email Address" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
                    <input type="password" placeholder="Password" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                    <Button fullWidth size="lg" onClick={handleAuth}>{authData.isLogin ? 'Sign In' : 'Create Reserve'}</Button>
                    <button onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors py-2 font-bold uppercase tracking-widest">
                      {authData.isLogin ? "Need an invitation?" : "Already an owner?"}
                    </button>
                  </div>
                </Card>
                <div className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest opacity-50">
                  Demo: admin@gold.kz / admin
                </div>
              </div>
            )}
            {view === 'profile' && user && (
              <div className="space-y-6 pt-4 animate-in">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-2xl font-black italic gold-text tracking-tighter uppercase">Ownership</h1>
                  <Button variant="ghost" size="sm" onClick={() => setView('catalog')}><X size={20}/></Button>
                </div>
                
                <Card className="bg-[#111] p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 gold-gradient rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 border-4 border-black">
                      <UserIcon size={40} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic text-white tracking-tighter">{user.email.split('@')[0]}</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{user.role} Status</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-5 bg-black rounded-[1.5rem] border border-white/5">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Subscription</span>
                      <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full", user.subscription === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500 animate-pulse")}>
                        {user.subscription}
                      </span>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Button fullWidth variant="primary" onClick={() => setView('admin')}><Settings size={18}/> Global Control</Button>
                    )}
                    
                    {user.subscription !== 'ACTIVE' && user.role !== 'ADMIN' && (
                      <Button fullWidth variant="outline" onClick={() => setView('subscription')}><Crown size={18}/> Unlock Private Catalog</Button>
                    )}

                    <Button fullWidth variant="danger" onClick={() => { setUser(null); setView('catalog'); }}><LogOut size={18}/> Sign Out</Button>
                  </div>
                </Card>
              </div>
            )}
            {view === 'subscription' && (
              <div className="pt-4 space-y-6 animate-in">
                <div className="text-center space-y-4 px-6">
                  <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/10">
                    <Crown size={48} className="text-[#D4AF37]" />
                  </div>
                  <h1 className="text-3xl font-black italic gold-text">VIP ACCESS</h1>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                    Exclusive privilege for premium market members
                  </p>
                </div>

                <div className="grid gap-4 px-2">
                  <Card className="bg-[#111]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]"><ShieldCheck size={20}/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Verified Transactions</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]"><Zap size={20}/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Priority Selection</span>
                      </div>
                    </div>
                  </Card>

                  <div className="p-8 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[2.5rem] space-y-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Monthly Contribution</p>
                    <p className="text-4xl font-black text-white">5 000 ₸</p>
                    <div className="w-full h-px bg-[#D4AF37]/20" />
                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                      Transfer via Kaspi to <span className="text-white select-all">+7 701 555 55 55</span>
                    </p>
                  </div>

                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={() => {
                      if (!user) return;
                      const updated = users.map(u => u.id === user.id ? { ...u, subscription: 'PENDING' as const } : u);
                      setUsers(updated); setUser({ ...user, subscription: 'PENDING' });
                    }} 
                    disabled={user?.subscription === 'PENDING'}
                  >
                    {user?.subscription === 'PENDING' ? 'Awaiting Approval...' : 'Confirm Payment'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] glass rounded-3xl overflow-hidden shadow-2xl border-white/5 sm:bottom-8">
        <div className="flex items-center justify-around h-16 sm:h-20">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1 transition-all", view === 'catalog' ? "text-[#D4AF37]" : "text-gray-600 hover:text-gray-400")}>
            <Smartphone size={22} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Market</span>
          </button>
          
          <button 
            onClick={() => {
              if (!user) setView('auth');
              else if (user.subscription !== 'ACTIVE' && user.role !== 'ADMIN') setView('subscription');
              else setView('catalog');
            }}
            className="group relative -mt-4 transition-transform active:scale-90"
          >
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 border-2 border-black rotate-45 transition-all group-hover:rotate-0",
              user?.subscription === 'ACTIVE' || user?.role === 'ADMIN' ? "gold-gradient text-black" : "bg-[#1A1A1A] text-gray-600"
            )}>
              <div className="-rotate-45 group-hover:rotate-0 transition-transform">
                <ShoppingBag size={24} />
              </div>
            </div>
          </button>

          <button onClick={() => user ? setView('profile') : setView('auth')} className={cn("flex flex-col items-center gap-1 transition-all", (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-600 hover:text-gray-400")}>
            <UserIcon size={22} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Account</span>
          </button>
        </div>
      </nav>

      {/* Number Detail Sheet */}
      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="Asset Authentication">
        {selectedPhone && (
          <div className="space-y-8 animate-in">
            <div className="bg-[#111] rounded-[2.5rem] p-10 text-center border border-white/5 shadow-inner">
              <h3 className="text-4xl font-mono font-black text-white mb-3 tracking-tighter select-all">{selectedPhone.number}</h3>
              <p className="text-3xl font-black gold-text italic">{selectedPhone.price.toLocaleString()} ₸</p>
              <div className="flex justify-center gap-2 mt-6">
                {selectedPhone.labelIds.map(lid => {
                  const label = labels.find(l => l.id === lid);
                  return label ? (
                    <span key={lid} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}>{label.text}</span>
                  ) : null;
                })}
              </div>
            </div>

            {!user ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">Ownership Authentication Required</p>
                <Button fullWidth size="lg" onClick={() => { setView('auth'); setSelectedPhone(null); }}>Login to Access</Button>
              </div>
            ) : (user.subscription !== 'ACTIVE' && user.role !== 'ADMIN') ? (
              <div className="space-y-6">
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                   <p className="text-yellow-500/80 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-1">Status Restricted</p>
                   <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">VIP subscription is mandatory for premium acquisitions</p>
                </div>
                <Button fullWidth size="lg" onClick={() => { setView('subscription'); setSelectedPhone(null); }}>Acquire VIP Status</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <div className="text-[#D4AF37] mb-1"><ShieldCheck size={18}/></div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">Safe Deal</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Secured by Golden</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <div className="text-green-500 mb-1"><Zap size={18}/></div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">Instant Link</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Direct Manager Access</p>
                  </div>
                </div>
                <Button 
                  fullWidth 
                  size="lg" 
                  className="py-5 shadow-2xl shadow-[#D4AF37]/40"
                  onClick={() => window.open('https://kaspi.kz', '_blank')}
                >
                  <ExternalLink size={20}/> PAY & CLAIM NOW
                </Button>
                <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={16}/> Direct Inquiry
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
