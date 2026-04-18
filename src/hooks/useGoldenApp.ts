import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { USERS: 'golden_v2_users', SESSION: 'golden_v2_session' };

export const useGoldenApp = () => {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'subscription'>('catalog');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  });
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  });

  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  
  // ЭТО БЫЛО ПРОПУЩЕНО:
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  // States for Admin
  const [pn, setPn] = useState('');
  const [pr, setPr] = useState('');
  const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
  const [sl, setSl] = useState<string[]>([]);
  const [lt, setLt] = useState('');
  const [lc, setLc] = useState('#D4AF37');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }, [user, users]);

  const fetchData = async () => {
    const [pRes, lRes] = await Promise.all([
      supabase.from('phones').select('*').order('created_at', { ascending: false }),
      supabase.from('labels').select('*').order('text')
    ]);
    if (pRes.data) setPhones(pRes.data);
    if (lRes.data) setLabels(lRes.data);
  };

  const handleSavePhone = async () => {
    if (!pn || !pr) return alert('Заполните данные');
    const payload = { number: pn, price: Number(pr), status: st, label_ids: sl };
    const { error } = await supabase.from('phones').insert([payload]);
    if (!error) { setPn(''); setPr(''); setSl([]); await fetchData(); return true; }
    return false;
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить номер?')) {
      const { error } = await supabase.from('phones').delete().eq('id', id);
      if (!error) fetchData();
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
      const matchesLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  return {
    view, setView, user, setUser, users, setUsers, phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones, fetchData, handleSavePhone, 
    handleDeletePhone, approveUser, pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc,
    selectedPhone, setSelectedPhone // ТЕПЕРЬ ОНИ ЗДЕСЬ
  };
};
