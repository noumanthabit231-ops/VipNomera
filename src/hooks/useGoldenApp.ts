import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { 
  SESSION: 'golden_v2_session',
  PHONES_CACHE: 'golden_v2_phones_cache',
  LABELS_CACHE: 'golden_v2_labels_cache',
  THEME: 'golden_v2_theme'
};

export const useGoldenApp = () => {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'my_orders'>('catalog');
  
  const [isLight, setIsLight] = useState(() => localStorage.getItem(KEYS.THEME) === 'light');
  
  const toggleTheme = () => {
    setIsLight(prev => {
      const next = !prev;
      localStorage.setItem(KEYS.THEME, next ? 'light' : 'dark');
      return next;
    });
  };

  const [user, setUser] = useState<UserProfile | null>(() => {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  });

  const [phones, setPhones] = useState<Phone[]>(() => {
    const cached = localStorage.getItem(KEYS.PHONES_CACHE);
    return cached ? JSON.parse(cached) : [];
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    const cached = localStorage.getItem(KEYS.LABELS_CACHE);
    return cached ? JSON.parse(cached) : [];
  });

  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(phones.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  const [pn, setPn] = useState('');
  const [pr, setPr] = useState('');
  const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
  const [sl, setSl] = useState<string[]>([]);

  // Прямая проверка доступности номера
  const tryLockPhone = async (phoneId: string) => {
    const phone = phones.find(p => p.id === phoneId);
    if (!phone || phone.status === 'SOLD') return false;
    return true; 
  };

  const createOrder = async (phoneData: any, type: 'PURCHASE' | 'ORDER') => {
    if (!user?.phone) return false;
    const cleanPhone = user.phone.replace(/\D/g, '');
    const { error } = await supabase.from('orders').insert([{
      user_phone: cleanPhone,
      phone_number: phoneData.number,
      price: phoneData.price,
      type: type
    }]);
    if (!error) {
      await fetchUserOrders();
      return true;
    }
    return false;
  };

  const fetchData = useCallback(async () => {
    if (phones.length === 0) setIsLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from('phones').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('labels').select('*').order('created_at', { ascending: true }) 
      ]);
      
      if (pRes.data) {
        setPhones(pRes.data);
        localStorage.setItem(KEYS.PHONES_CACHE, JSON.stringify(pRes.data));
      }
      if (lRes.data) {
        setLabels(lRes.data);
        localStorage.setItem(KEYS.LABELS_CACHE, JSON.stringify(lRes.data));
      }
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  const fetchUserOrders = useCallback(async () => {
    if (!user?.phone) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_phone', user.phone.replace(/\D/g, ''))
      .order('created_at', { ascending: false });
    if (data) setUserOrders(data);
  }, [user?.phone]);

  const refreshUserData = useCallback(async () => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from('auth_codes')
      .select('role, subscription, expiry_date, name, tg_user_id')
      .eq('phone', cleanPhone)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (!data && !error) { 
        setUser(null);
        localStorage.removeItem(KEYS.SESSION);
      }
      return;
    }

    let currentSub = data.subscription || 'INACTIVE';
    if (data.role === 'ADMIN') currentSub = 'ACTIVE';
    else if (currentSub === 'ACTIVE' && data.expiry_date && new Date(data.expiry_date) < new Date()) {
      currentSub = 'INACTIVE';
    }

    const updatedUser = { 
      ...user, 
      full_name: data.name, 
      role: data.role || 'USER', 
      subscription: currentSub, 
      expiry_date: data.expiry_date, 
      tg_user_id: data.tg_user_id 
    };

    if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
      setUser(updatedUser);
      localStorage.setItem(KEYS.SESSION, JSON.stringify(updatedUser));
    }
  }, [user?.phone]); 

  const handleSavePhone = async () => {
    if (!pn || !pr) return alert('Заполните данные');
    const { error } = await supabase.from('phones').insert([{ number: pn, price: Number(pr), status: st, label_ids: sl }]);
    if (!error) { setPn(''); setPr(''); setSl([]); fetchData(); return true; }
    return false;
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить?')) {
      await supabase.from('phones').delete().eq('id', id);
      fetchData();
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (user) fetchUserOrders(); }, [user, fetchUserOrders]);

  useEffect(() => {
    const channel = supabase.channel('public_phones')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'phones' }, (payload) => {
        setPhones(current => current.map(p => p.id === payload.new.id ? payload.new : p));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!user?.phone || view === 'auth') return;
    refreshUserData();
    const interval = setInterval(refreshUserData, 15000);
    return () => clearInterval(interval);
  }, [user?.phone, view, refreshUserData]);

  useEffect(() => {
    if (user) localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    else localStorage.removeItem(KEYS.SESSION);
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isLight) {
      root.style.backgroundColor = '#F4F4F6';
      body.style.backgroundColor = '#F4F4F6';
      body.style.color = '#000000';
    } else {
      root.style.backgroundColor = '#050505';
      body.style.backgroundColor = '#050505';
      body.style.color = '#ffffff';
    }
  }, [isLight]);

  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      if (p.status === 'SOLD' && p.sold_at) {
        if (Date.now() - new Date(p.sold_at).getTime() > 60000) return false;
      }
      const mSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const mLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return mSearch && mLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  return {
    isLoading, view, setView, user, setUser, phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones, selectedPhone, setSelectedPhone,
    userOrders, fetchUserOrders, fetchData, refreshUserData, handleSavePhone, handleDeletePhone, 
    tryLockPhone, createOrder, pn, setPn, pr, setPr, st, setSt, sl, setSl, 
    isLight, toggleTheme
  };
};
