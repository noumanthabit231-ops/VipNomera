import { useState, useEffect, useMemo } from 'react';
import { 
  Search, User as UserIcon, Crown, ShoppingBag, Settings, 
  ChevronRight, X, LogOut, Smartphone, Plus, Trash2, 
  ExternalLink, MessageSquare, ShieldCheck, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from './supabase';
import { cn } from './cn';
import { Phone, Label, UserProfile } from './types';
import { PhoneCard } from './components/PhoneCard';
import { Navigation } from './components/Navigation';

/** --- Helpers --- */
const KEYS = { USERS: 'golden_v2_users', SESSION: 'golden_v2_session' };
const getStorage = <T,>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  try { return data ? JSON.parse(data) : fallback; } catch { return fallback; }
};
const setStorage = <T,>(key: string, data: T) => localStorage.setItem(key, JSON.stringify(data));

const INITIAL_ADMIN: UserProfile = {
  id: 'admin-root', email: 'admin@gold.kz', password: 'admin', role: 'ADMIN', subscription: 'ACTIVE'
};

/** --- Components --- */
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
    <motion.button whileTap={{ scale: 0.96 }} disabled={disabled} onClick={onClick} 
      className={cn("rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50", variants[variant], sizes[size], fullWidth && "w-full", className)}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = "", onClick }: any) => (
  <motion.div layout onClick={onClick} className={cn("bg-[#0F0F0F] border border-white/[0.05] rounded-3xl p-5", className)}>
    {children}
  </motion.div>
);

const BottomSheet = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
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

export default function App() {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'subscription'>('catalog');
  const [user, setUser] = useState<UserProfile | null>(() => getStorage(KEYS.SESSION, null));
  const [users, setUsers] = useState<UserProfile[]>(() => getStorage(KEYS.USERS, [INITIAL_ADMIN]));
  const [authData, setAuthData] = useState({ email: '', password: '', isLogin: true });
  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);

  // Состояния для админки
  const [pn, setPn] = useState('');
  const [pr, setPr] = useState('');
  const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
  const [sl, setSl] = useState<string[]>([]);
  const [lt, setLt] = useState('');
  const [lc, setLc] = useState('#D4AF37');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    setStorage(KEYS.SESSION, user);
    setStorage(KEYS.USERS, users);
  }, [user, users]);

  const fetchData = async () => {
    const [pRes, lRes] = await Promise.all([
      supabase.from('phones').select('*').order('created_at', { ascending: false }),
      supabase.from('labels').select('*').order('text')
    ]);
    if (pRes.data) setPhones(pRes.data);
    if (lRes.data) setLabels(lRes.data);
  };

  const handleSavePhone = async (payload: any) => {
    const { id, ...data } = payload;
    const result = id ? await supabase.from('phones').update(data).eq('id', id) : await supabase.from('phones').insert([data]);
    if (!result.error) { fetchData(); return true; }
    return false;
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить номер?')) {
      const { error } = await supabase.from('phones').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleAuth = () => {
    if (authData.isLogin) {
      const found = users.find(u => u.email === authData.email && u.password === authData.password);
      if (found) { setUser(found); setView('catalog'); }
      else alert('Ошибка входа');
    } else {
      if (users.find(u => u.email === authData.email)) return alert('Email занят');
      const newUser: UserProfile = { id: Math.random().toString(36).substr(2, 9), email: authData.email, password: authData.password, role: 'USER', subscription: 'INACTIVE' };
      setUsers([...users, newUser]); setUser(newUser); setView('catalog');
    }
  };

  const approveUser = (uid: string) => {
    const updated = users.map(u => u.id === uid ? { ...u, subscription: 'ACTIVE' as const } : u);
    setUsers(updated);
    if (user?.id === uid) setUser({ ...user, subscription: 'ACTIVE' });
  };

  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = activeLabelFilter ? (p.labelIds || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  const Catalog = () => (
    <div className="pb-24 space-y-6">
      <div className="pt-4 px-2 text-center">
        <h1 className="text-4xl font-black italic gold-text tracking-tighter mb-1">GOLDEN</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Premium Numbers Market</p>
      </div>

      <div className="space-y-4 px-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
          <input type="text" placeholder="Поиск номера..." className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#D4AF37]/50" 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button onClick={() => setActiveLabelFilter(null)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest", !activeLabelFilter ? "bg-[#D4AF37] text-black" : "bg-white/5 text-gray-500")}>Все</button>
          {labels.map(l => (
            <button key={l.id} onClick={() => setActiveLabelFilter(l.id === activeLabelFilter ? null : l.id)} 
              className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeLabelFilter === l.id ? "bg-white text-black" : "bg-white/5 text-gray-500")}
            >{l.text}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {filteredPhones.map((phone) => (
          <PhoneCard key={phone.id} phone={phone} labels={labels} onClick={() => setSelectedPhone(phone)} />
        ))}
      </div>
    </div>
  );

  const AdminPanel = () => {
    const [tab, setTab] = useState<'orders' | 'phones' | 'labels'>('orders');
    return (
      <div className="pb-24 space-y-6 pt-4 px-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black italic gold-text uppercase">Control Center</h1>
          <Button variant="ghost" size="sm" onClick={() => setView('catalog')}><X size={20}/></Button>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
          {(['orders', 'phones', 'labels'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest", tab === t ? "bg-[#D4AF37] text-black" : "text-gray-500")}>
              {t === 'orders' ? 'Заявки' : t === 'phones' ? 'Номера' : 'Метки'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="space-y-4">
            {users.filter(u => u.subscription === 'PENDING').map(u => (
              <Card key={u.id} className="flex items-center justify-between">
                <div><p className="font-bold text-sm">{u.email}</p><p className="text-[10px] text-yellow-500 font-black uppercase mt-1">Ожидает проверки</p></div>
                <Button variant="primary" size="sm" onClick={() => approveUser(u.id)}>Одобрить</Button>
              </Card>
            ))}
          </div>
        )}

        {tab === 'phones' && (
          <div className="space-y-6">
            <Card className="border-[#D4AF37]/20 bg-[#0A0A0A]">
              <div className="space-y-4">
                <input placeholder="Номер" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm" value={pn} onChange={e => setPn(e.target.value)} />
                <input type="number" placeholder="Цена (₸)" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm" value={pr} onChange={e => setPr(e.target.value)} />
                <div className="flex flex-wrap gap-2">
                  {labels.map(l => (
                    <button key={l.id} onClick={() => setSl(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border", sl.includes(l.id) ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/10 text-gray-600")}
                    >{l.text}</button>
                  ))}
                </div>
                <Button fullWidth onClick={async () => { if (await handleSavePhone({ number: pn, price: Number(pr), status: st, labelIds: sl })) { setPn(''); setPr(''); setSl([]); } }}>Добавить номер</Button>
              </div>
            </Card>
            {phones.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div><p className="font-mono text-sm font-black">{p.number}</p><p className="text-[10px] text-[#D4AF37]">{p.price.toLocaleString()} ₸</p></div>
                <button onClick={() => handleDeletePhone(p.id)} className="text-red-500/30 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}

        {tab === 'labels' && (
          <div className="space-y-6">
            <Card className="border-[#D4AF37]/20 bg-[#0A0A0A]">
              <div className="space-y-4">
                <input placeholder="Название метки" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm" value={lt} onChange={e => setLt(e.target.value.toUpperCase())} />
                <input type="color" className="w-full h-10 bg-transparent cursor-pointer" value={lc} onChange={e => setLc(e.target.value)} />
                <Button fullWidth onClick={async () => { await supabase.from('labels').insert([{ text: lt, color: lc }]); setLt(''); fetchData(); }}>Создать метку</Button>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              {labels.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black uppercase" style={{ color: l.color }}>{l.text}</span>
                  <button onClick={async () => { await supabase.from('labels').delete().eq('id', l.id); fetchData(); }} className="text-red-500/30"><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      <main className="max-w-xl mx-auto px-4 min-h-screen pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {view === 'catalog' && <Catalog />}
            {view === 'admin' && <AdminPanel />}
            {view === 'auth' && (
              <div className="pt-20 space-y-8 max-w-sm mx-auto text-center">
                <h1 className="text-4xl font-black gold-text italic">LOGIN</h1>
                <Card className="bg-[#111] p-8 space-y-4 border-white/10">
                  <input placeholder="Email" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                  <Button fullWidth size="lg" onClick={handleAuth}>{authData.isLogin ? 'Войти' : 'Регистрация'}</Button>
                  <button onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} className="text-xs text-gray-500 uppercase tracking-widest font-black">{authData.isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт'}</button>
                </Card>
              </div>
            )}
            {view === 'profile' && user && (
              <div className="pt-4 space-y-6">
                <h1 className="text-2xl font-black italic gold-text px-2 uppercase tracking-tighter">Account</h1>
                <Card className="bg-[#111] p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black border-4 border-black"><UserIcon size={32} /></div>
                    <div><p className="font-black italic text-lg uppercase">{user.email.split('@')[0]}</p><p className="text-[10px] text-zinc-500 uppercase">{user.role}</p></div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-white/5">
                      <span className="text-xs font-bold text-gray-400">ПОДПИСКА</span>
                      <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full", user.subscription === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500")}>
                        {user.subscription === 'ACTIVE' ? 'Активна' : 'Проверка'}
                      </span>
                    </div>
                    {user.role === 'ADMIN' && <Button fullWidth variant="primary" onClick={() => setView('admin')}><Settings size={18}/> Админ-панель</Button>}
                    <Button fullWidth variant="danger" onClick={() => { setUser(null); setView('catalog'); }}><LogOut size={18}/> Выйти</Button>
                  </div>
                </Card>
              </div>
            )}
            {view === 'subscription' && (
              <div className="pt-4 space-y-8 text-center px-4">
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/20"><Crown size={40} className="text-[#D4AF37]" /></div>
                <h1 className="text-3xl font-black gold-text italic">VIP ACCESS</h1>
                <div className="bg-[#111] p-10 rounded-[2.5rem] border border-[#D4AF37]/20 space-y-4">
                  <p className="text-4xl font-black italic">5 000 ₸</p>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">Kaspi Gold:<br/><span className="text-white text-lg select-all">+7 701 555 55 55</span></p>
                  <Button fullWidth size="lg" disabled={user?.subscription === 'PENDING'} onClick={() => { if (!user) return; const updatedUsers = users.map(u => u.id === user.id ? { ...u, subscription: 'PENDING' as const } : u); setUsers(updatedUsers); setUser({ ...user, subscription: 'PENDING' }); }}>
                    {user?.subscription === 'PENDING' ? 'Ожидание...' : 'Я оплатил'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Мобильное меню внизу (Убрана средняя кнопка) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm glass rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-around h-16">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1 transition-all", view === 'catalog' ? "text-[#D4AF37]" : "text-gray-500")}>
            <Smartphone size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">Каталог</span>
          </button>
          <button onClick={() => user ? setView('profile') : setView('auth')} className={cn("flex flex-col items-center gap-1 transition-all", (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-500")}>
            <UserIcon size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">Кабинет</span>
          </button>
        </div>
      </nav>

      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="Информация">
        {selectedPhone && (
          <div className="space-y-8 py-4 text-center">
            <div className="bg-[#111] rounded-[2rem] p-10 border border-white/5">
              <h3 className="text-4xl font-mono font-black italic text-white tracking-tighter mb-2">{selectedPhone.number}</h3>
              <p className="text-3xl font-black gold-text italic">{selectedPhone.price.toLocaleString()} ₸</p>
            </div>
            {!user || (user.subscription !== 'ACTIVE' && user.role !== 'ADMIN') ? (
              <div className="space-y-4">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-loose">Для покупки премиального номера<br/>необходим активный VIP статус</p>
                <Button fullWidth size="lg" onClick={() => { setView(!user ? 'auth' : 'subscription'); setSelectedPhone(null); }}>
                  {!user ? 'Войти' : 'Активировать VIP'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button fullWidth size="lg" className="py-5" onClick={() => window.open('https://kaspi.kz', '_blank')}>
                  <ExternalLink size={20}/> К ОПЛАТЕ (KASPI)
                </Button>
                <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-zinc-500">
                  <MessageSquare size={16}/> Связаться с менеджером
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
