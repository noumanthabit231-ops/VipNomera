import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { 
  SESSION: 'golden_v2_session',
  THEME: 'golden_v2_theme'
};

export const useGoldenApp = () => {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'my_orders' | 'order' | 'subscription'>('catalog');
  
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(KEYS.THEME) === 'light';
    }
    return false;
  });
  
  const toggleTheme = () => {
    setIsLight(prev => {
      const next = !prev;
      localStorage.setItem(KEYS.THEME, next ? 'light' : 'dark');
      return next;
    });
  };

  const [user, setUser] = useState<UserProfile | null>(() => {
    const data = typeof window !== 'undefined' ? localStorage.getItem(KEYS.SESSION) : null;
    return data ? JSON.parse(data) : null;
  });

  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  // State for admin panel
  const [pn, setPn] = useState('');
  const [pr, setPr] = useState('');
  const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
  const [sl, setSl] = useState<string[]>([]);

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
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from('phones').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('labels').select('*').order('created_at', { ascending: true })
      ]);
      if (pRes.data) setPhones(pRes.data);
      if (lRes.data) setLabels(lRes.data);
    } catch (e) {
      console.error("Data fetch error:", e);
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

  // Источник правды по статусу подписки — ТОЛЬКО сервер (auth_codes).
  // Зависим от user?.phone, а не от всего объекта user — иначе каждое
  // обновление user пересоздавало бы колбэк и рвало интервал ниже.
  const refreshUserData = useCallback(async () => {
    const phone = user?.phone;
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const { data } = await supabase
      .from('auth_codes')
      .select('role, subscription, expiry_date, name, tg_user_id')
      .eq('phone', cleanPhone)
      .eq('is_verified', true)
      .limit(1)
      .maybeSingle();

    if (data) {
      let currentSub = data.subscription || 'INACTIVE';
      if (data.role === 'ADMIN') currentSub = 'ACTIVE';
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, full_name: data.name ?? prev.full_name, role: data.role || 'USER', subscription: currentSub, expiry_date: data.expiry_date };
        return JSON.stringify(prev) !== JSON.stringify(updated) ? updated : prev;
      });
    }
  }, [user?.phone]);

  // Живой доступ: пока Боб не подтвердит оплату — subscription в базе остаётся
  // не ACTIVE, и это окно само подхватит статус, где бы пользователь ни находился
  // (не только на вкладке "Кабинет"). Плюс мгновенный ресинк при возврате в приложение —
  // человек обычно уходит в Telegram/WhatsApp и возвращается, ловим этот момент.
  useEffect(() => {
    if (!user?.phone) return;
    refreshUserData();
    const interval = setInterval(refreshUserData, 8000);
    const onVisible = () => { if (document.visibilityState === 'visible') refreshUserData(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [user?.phone, refreshUserData]);

  // Тикер для мгновенного "закрытия" каталога по дате истечения подписки,
  // даже если данные на сервере не менялись (защита работает без сетевого события).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }, [user, fetchUserOrders]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.backgroundColor = isLight ? '#F4F4F6' : '#050505';
  }, [isLight]);

  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      if (p.status === 'SOLD' && p.sold_at) {
        if (Date.now() - new Date(p.sold_at).getTime() > 60000) return false;
      }
      const matchSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return matchSearch && matchLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  return {
    isLoading, view, setView, user, setUser, phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones, selectedPhone, setSelectedPhone,
    userOrders, fetchData, refreshUserData, createOrder, now,
    pn, setPn, pr, setPr, st, setSt, sl, setSl,
    isLight, toggleTheme
  };
};
