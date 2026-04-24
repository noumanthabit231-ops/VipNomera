import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { 
  SESSION: 'golden_v2_session',
  THEME: 'golden_v2_theme'
};

export const useGoldenApp = () => {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'my_orders' | 'order' | 'subscription'>('catalog');
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

  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  // Admin state
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

  const refreshUserData = useCallback(async () => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '');
    const { data } = await supabase
      .from('auth_codes')
      .select('role, subscription, expiry_date, name, tg_user_id')
      .eq('phone', cleanPhone)
      .eq('is_verified', true)
      .maybeSingle();
    if (data) {
      let currentSub = data.subscription || 'INACTIVE';
      if (data.role === 'ADMIN') currentSub = 'ACTIVE';
      setUser(prev => prev ? { ...prev, full_name: data.name, role: data.role || 'USER', subscription: currentSub } : null);
    }
  }, [user?.phone]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }, [user, fetchUserOrders]);

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
    userOrders, fetchData, refreshUserData, createOrder,
    pn, setPn, pr, setPr, st, setSt, sl, setSl,
    isLight, toggleTheme
  };
};
