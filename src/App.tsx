import { useState, useEffect, useMemo } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from './supabase';
import { cn } from './cn';
import { Phone, Label, UserProfile } from './types';
import { PhoneCard } from './components/PhoneCard';
import { Navigation } from './components/Navigation';

/** --- Helpers --- */
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

const INITIAL_ADMIN: UserProfile = {
  id: 'admin-root',
  email: 'admin@gold.kz',
  password: 'admin',
  role: 'ADMIN',
  subscription: 'ACTIVE'
};

/** --- Shared UI Components --- */
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
  const [user, setUser] = useState<UserProfile | null>(() => getStorage(KEYS.SESSION, null));
  const [users, setUsers] = useState<UserProfile[]>(() => getStorage(KEYS.USERS, [INITIAL_ADMIN]));
  const [authData, setAuthData] = useState({ email: '', password: '', isLogin: true });

  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    setStorage(KEYS.SESSION, user);
    setStorage(KEYS.USERS, users);
  }, [user, users]);

  const fetchData = async () => {
    try {
      const [phonesRes, labelsRes] = await Promise.all([
        supabase.from('phones').select('*').order('created_at', { ascending: false }),
        supabase.from('labels').select('*').order('text')
      ]);
      if (phonesRes.data) setPhones(phonesRes.data);
      if (labelsRes.data) setLabels(labelsRes.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  const handleSavePhone = async (payload: any) => {
    const { id, ...data } = payload;
    let result;
    if (id) result = await supabase.from('phones').update(data).eq('id', id);
    else result = await supabase.from('phones').insert([data]);
    
    if (!result.error) {
      fetchData();
      return true;
    }
    return false;
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить этот номер из базы?')) {
      const { error } = await supabase.from('phones').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleAuth = () => {
    if (authData.isLogin) {
      const found = users.find(u => u.email === authData.email && u.password === authData.password);
      if (found) { setUser(found); setView('catalog'); }
      else alert('Неверные данные для входа');
    } else {
      if (users.find(u => u.email === authData.email)) return alert('Email уже зарегистрирован');
      const newUser: UserProfile = { 
        id: Math.random().toString(36).substr(2, 9), 
        email: authData.email, 
        password: authData.password, 
        role: 'USER', 
        subscription: 'INACTIVE' 
      };
      setUsers([...users, newUser]); 
      setUser(newUser); 
      setView('catalog');
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

  /** --- Sub-Views --- */
  const CatalogView = () => (
    <div className="pb-24 space-y-8">
      <div className="pt-4 px-2 text-center sm:text-left">
        <h1 className="text-4xl font-black italic gold-text tracking-tighter mb-2">GOLDEN</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Премиальный рынок мобильных номеров</p>
      </div>

      <div className="space-y-4 px-2">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37]" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по цифрам..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button 
            onClick={() => setActiveLabelFilter(null)}
            className={cn(
              "whitespace-nowrap px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeLabelFilter === null ? "bg-[#D4AF37] text-black" : "bg-white/5 text-gray-500"
            )}
          >
            Все
          </button>
          {labels.map(l => (
            <button 
              key={l.id}
              onClick={() => setActiveLabelFilter(l.id === activeLabelFilter ? null : l.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeLabelFilter === l.id ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
              )}
            >
              {l.text}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-4 px-2">
          {filteredPhones.length === 0 ? (
            <div className="py-20 text-center opacity-30 italic">Номера не найдены</div>
          ) : (
            filteredPhones.map((phone) => (
              <PhoneCard 
                key={phone.id} 
                phone={phone} 
                labels={labels} 
                onClick={() => setSelectedPhone(phone)} 
              />
            ))
          )}
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
          <h1 className="text-2xl font-black italic gold-text tracking-tighter">УПРАВЛЕНИЕ</h1>
          <Button variant="ghost" size="sm" onClick={() => setView('catalog')}><X size={20}/></Button>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl mx-2">
          {(['orders', 'phones', 'labels'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)} 
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                tab === t ? "bg-[#D4AF37] text-black shadow-lg" : "text-gray-500"
              )}
            >
              {t === 'orders' ? 'Заявки' : t === 'phones' ? 'Номера' : 'Метки'}
            </button>
          ))}
        </div>

        <div className="px-2 space-y-6">
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Запросы на подписку</h2>
              {users.filter(u => u.subscription === 'PENDING').length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-600 text-sm">
                  Нет ожидающих заявок
                </div>
              )}
              {users.filter(u => u.subscription === 'PENDING').map(u => (
                <Card key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">{u.email}</p>
                    <p className="text-[10px] text-yellow-500 font-black uppercase mt-1">Ожидает одобрения</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => approveUser(u.id)}>Одобрить</Button>
                </Card>
              ))}
            </div>
          )}

          {tab === 'phones' && (
            <div className="space-y-6">
              <Card className="border-[#D4AF37]/20 bg-[#0A0A0A]">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6">Добавить номер</h3>
                <div className="space-y-4">
                  <input placeholder="+7 (707) 777..." className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm" value={pn} onChange={e => setPn(e.target.value)} />
                  <input type="number" placeholder="Цена (₸)" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm" value={pr} onChange={e => setPr(e.target.value)} />
                  <select className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm" value={st} onChange={e => setSt(e.target.value as any)}>
                    <option value="IN_STOCK">В наличии</option>
                    <option value="ON_ORDER">На заказ (24ч)</option>
                  </select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {labels.map(l => (
                      <button 
                        key={l.id} 
                        onClick={() => setSl(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all", 
                          sl.includes(l.id) ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 text-gray-600"
                        )}
                      >
                        {l.text}
                      </button>
                    ))}
                  </div>
                  <Button fullWidth onClick={async () => { 
                    const success = await handleSavePhone({ number: pn, price: Number(pr), status: st, labelIds: sl }); 
                    if (success) { setPn(''); setPr(''); setSl([]); }
                  }}><Plus size={16}/> Опубликовать лот</Button>
                </div>
              </Card>

              <div className="space-y-3">
                {phones.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-mono text-sm text-white font-black">{p.number}</p>
                      <p className="text-[10px] text-[#D4AF37] font-bold uppercase">{p.price.toLocaleString()} ₸</p>
                    </div>
                    <button onClick={() => handleDeletePhone(p.id)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'labels' && (
            <div className="space-y-6">
              <Card className="border-[#D4AF37]/20 bg-[#0A0A0A]">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6">Создать метку</h3>
                <div className="space-y-4">
                  <input placeholder="Название (напр. VIP)" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm" value={lt} onChange={e => setLt(e.target.value.toUpperCase())} />
                  <div className="flex items-center gap-4 bg-black p-4 rounded-2xl border border-white/5">
                    <input type="color" className="w-10 h-10 bg-transparent cursor-pointer" value={lc} onChange={e => setLc(e.target.value)} />
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Выбор цвета метки</span>
                  </div>
                  <Button fullWidth onClick={async () => { 
                    await supabase.from('labels').insert([{ text: lt, color: lc }]);
                    setLt(''); fetchData();
                  }}><Plus size={16}/> Создать</Button>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                {labels.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg" style={{ backgroundColor: `${l.color}20`, color: l.color }}>{l.text}</span>
                    <button onClick={async () => { await supabase.from('labels').delete().eq('id', l.id); fetchData(); }} className="text-red-500/30 p-1"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /** --- Main Render --- */
  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      <Navigation 
        user={user} 
        activeView={view as any} 
        onNavigate={setView as any} 
        onLogout={() => { setUser(null); setView('catalog'); }} 
      />

      <main className="max-w-xl mx-auto px-4 mt-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'catalog' && <CatalogView />}
            {view === 'admin' && <AdminPanel />}
            {view === 'auth' && (
              <div className="pt-10 flex flex-col gap-8 max-w-sm mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black italic gold-text">ВХОД</h1>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">{authData.isLogin ? 'Закрытый рынок' : 'Регистрация'}</p>
                </div>
                <Card className="bg-[#111] p-8 border-white/10 shadow-2xl">
                  <div className="space-y-4">
                    <input type="email" placeholder="Email адрес" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
                    <input type="password" placeholder="Пароль" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                    <Button fullWidth size="lg" onClick={handleAuth}>{authData.isLogin ? 'Войти' : 'Создать аккаунт'}</Button>
                    <button onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors py-2 font-bold uppercase tracking-widest">
                      {authData.isLogin ? "Нет приглашения? Регистрация" : "Уже есть аккаунт? Вход"}
                    </button>
                  </div>
                </Card>
              </div>
            )}
            {view === 'profile' && user && (
              <div className="space-y-6 pt-4 animate-in">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-2xl font-black italic gold-text tracking-tighter uppercase">ЛИЧНЫЙ КАБИНЕТ</h1>
                  <Button variant="ghost" size="sm" onClick={() => setView('catalog')}><X size={20}/></Button>
                </div>
                <Card className="bg-[#111] p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center border-4 border-black shadow-2xl">
                      <UserIcon size={40} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic text-white tracking-tighter uppercase">{user.email.split('@')[0]}</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Статус: {user.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-5 bg-black rounded-2xl border border-white/5">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Подписка</span>
                      <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full", user.subscription === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500")}>
                        {user.subscription === 'ACTIVE' ? 'Активна' : user.subscription === 'PENDING' ? 'Ожидание' : 'Неактивна'}
                      </span>
                    </div>
                    {user.role === 'ADMIN' && <Button fullWidth variant="primary" onClick={() => setView('admin')}><Settings size={18}/> Админ-панель</Button>}
                    {user.subscription !== 'ACTIVE' && user.role !== 'ADMIN' && <Button fullWidth variant="outline" onClick={() => setView('subscription')}><Crown size={18}/> Активировать подписку</Button>}
                    <Button fullWidth variant="danger" onClick={() => { setUser(null); setView('catalog'); }}><LogOut size={18}/> Выйти из аккаунта</Button>
                  </div>
                </Card>
              </div>
            )}
            {view === 'subscription' && (
              <div className="pt-4 space-y-6 animate-in">
                <div className="text-center space-y-4 px-6">
                  <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37]/20">
                    <Crown size={48} className="text-[#D4AF37]" />
                  </div>
                  <h1 className="text-3xl font-black italic gold-text">VIP ДОСТУП</h1>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Эксклюзивные условия для участников закрытого клуба</p>
                </div>
                <div className="grid gap-4 px-2">
                  <Card className="bg-[#111]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]"><ShieldCheck size={20}/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Прямые сделки с владельцами</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]"><Zap size={20}/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Приоритет в бронировании 777</span>
                      </div>
                    </div>
                  </Card>
                  <div className="p-8 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[2.5rem] space-y-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Ежемесячный взнос</p>
                    <p className="text-4xl font-black text-white italic">5 000 ₸</p>
                    <div className="w-full h-px bg-[#D4AF37]/20" />
                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">Перевод через Kaspi на номер:<br/><span className="text-white text-lg select-all">+7 701 555 55 55</span></p>
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
                    {user?.subscription === 'PENDING' ? 'Ожидание проверки...' : 'Подтвердить оплату'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] glass rounded-3xl overflow-hidden shadow-2xl border-white/5 sm:bottom-8">
        <div className="flex items-center justify-around h-16 sm:h-20">
          <button onClick={() => setView('catalog')} className={cn("flex flex-col items-center gap-1 transition-all", view === 'catalog' ? "text-[#D4AF37]" : "text-gray-600 hover:text-gray-400")}>
            <Smartphone size={22} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Маркет</span>
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
              "w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center border-2 border-black rotate-45 transition-all group-hover:rotate-0 shadow-xl shadow-[#D4AF37]/20",
              user?.subscription === 'ACTIVE' || user?.role === 'ADMIN' ? "gold-gradient text-black" : "bg-[#1A1A1A] text-gray-600"
            )}>
              <div className="-rotate-45 group-hover:rotate-0 transition-transform"><ShoppingBag size={24} /></div>
            </div>
          </button>
          <button onClick={() => user ? setView('profile') : setView('auth')} className={cn("flex flex-col items-center gap-1 transition-all", (view === 'profile' || view === 'auth') ? "text-[#D4AF37]" : "text-gray-600 hover:text-gray-400")}>
            <UserIcon size={22} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Кабинет</span>
          </button>
        </div>
      </nav>

      <BottomSheet isOpen={!!selectedPhone} onClose={() => setSelectedPhone(null)} title="Информация о номере">
        {selectedPhone && (
          <div className="space-y-8 animate-in">
            <div className="bg-[#111] rounded-[2.5rem] p-10 text-center border border-white/5 shadow-inner">
              <h3 className="text-4xl font-mono font-black text-white mb-3 tracking-tighter select-all italic">{selectedPhone.number}</h3>
              <p className="text-3xl font-black gold-text italic">{selectedPhone.price.toLocaleString()} ₸</p>
            </div>
            {!user ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">Требуется авторизация</p>
                <Button fullWidth size="lg" onClick={() => { setView('auth'); setSelectedPhone(null); }}>Войти для покупки</Button>
              </div>
            ) : (user.subscription !== 'ACTIVE' && user.role !== 'ADMIN') ? (
              <div className="space-y-6">
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                  <p className="text-yellow-500/80 text-[10px] font-black uppercase mb-1">Доступ ограничен</p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase">Необходима VIP подписка для покупки</p>
                </div>
                <Button fullWidth size="lg" onClick={() => { setView('subscription'); setSelectedPhone(null); }}>Получить VIP статус</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="bg-white/5 p-4 border-white/10">
                    <ShieldCheck className="text-[#D4AF37] mb-2" size={18}/>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">Безопасность</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Гарантия Golden</p>
                  </Card>
                  <Card className="bg-white/5 p-4 border-white/10">
                    <Zap className="text-green-500 mb-2" size={18}/>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">Мгновенно</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Связь с менеджером</p>
                  </Card>
                </div>
                <Button 
                  fullWidth 
                  size="lg" 
                  className="py-5 shadow-2xl shadow-[#D4AF37]/40"
                  onClick={() => window.open('https://kaspi.kz', '_blank')}
                >
                  <ExternalLink size={20}/> Оплатить через Kaspi
                </Button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
