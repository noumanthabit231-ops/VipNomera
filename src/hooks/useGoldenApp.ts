import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { 
  SESSION: 'golden_v2_session',
  PHONES_CACHE: 'golden_v2_phones_cache',
  LABELS_CACHE: 'golden_v2_labels_cache'
};

export const useGoldenApp = () => {
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'my_orders'>('catalog');
  
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
  const [lt, setLt] = useState('');
  const [lc, setLc] = useState('#D4AF37');

  const TG_BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || "8254818813:AAGOwrgCn-Yl6zLpp_vn_A9aAA4nfAFjtss";
  const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || "7620660514";

  // --- ЛОГИКА 1: ПРОСМОТР НОМЕРА (БРОНЬ 5 МИНУТ) ---
  const tryLockPhone = async (phoneId: string) => {
    if (!user?.phone) return false;
    const cleanPhone = user.phone.replace(/\D/g, '');
    
    // Берем актуальные данные из стейта
    const phone = phones.find(p => p.id === phoneId);
    if (!phone) return false;

    const now = Date.now();
    const lockedAt = phone.locked_at ? new Date(phone.locked_at).getTime() : 0;
    const confirmedAt = phone.user_confirmed_at ? new Date(phone.user_confirmed_at).getTime() : 0;

    const isViewExpired = phone.status === 'PENDING' && !phone.user_confirmed_at && (now - lockedAt >= 5 * 60000);
    const isPayExpired = phone.status === 'PENDING' && phone.user_confirmed_at && (now - confirmedAt >= 30 * 60000);

    // 🌟 ПРОПУСКАЕМ СВОИХ 🌟
    // Если номер УЖЕ заблокирован НАМИ и время не вышло - просто открываем окно
    if (phone.status === 'PENDING' && phone.locked_by === cleanPhone) {
      if (!phone.user_confirmed_at && !isViewExpired) return true; // Своя бронь 5 мин жива
      if (phone.user_confirmed_at && !isPayExpired) return true;   // Своя бронь 30 мин жива
    }

    // Если номер чужой и бронь еще ЖИВА - отказываем сразу
    if (phone.status !== 'IN_STOCK' && !isViewExpired && !isPayExpired) {
      return false; 
    }

    // Занимаем свободный номер (или забираем просроченный)
    let query = supabase
      .from('phones')
      .update({ 
        status: 'PENDING', 
        locked_at: new Date().toISOString(),
        locked_by: cleanPhone,
        user_confirmed_at: null 
      })
      .eq('id', phoneId)
      .eq('status', phone.status); // Защита от одновременного клика (Optimistic lock)

    // Если перехватываем, проверяем что его не продлили за долю секунды
    if (phone.locked_at) query = query.eq('locked_at', phone.locked_at);

    const { data, error } = await query.select();

    if (error || !data || data.length === 0) {
      return false; // Кто-то успел быстрее
    }
    return true; // Бронь успешна
  };

  // --- ЛОГИКА 2: НАЖАТИЕ НА ОПЛАТУ KASPI (БРОНЬ 30 МИНУТ) ---
  const extendLockToPayment = async (phoneId: string) => {
    await supabase
      .from('phones')
      .update({ user_confirmed_at: new Date().toISOString() })
      .eq('id', phoneId);
  };

  // --- ЛОГИКА 3: НАЖАТИЕ "Я ОПЛАТИЛ" (СОЗДАНИЕ ЗАКАЗА В БД) ---
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

  // --- ЗАГРУЗКА БАЗЫ ---
  const fetchData = useCallback(async () => {
    if (phones.length === 0) setIsLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from('phones').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('labels').select('*').order('text')
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
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [phones.length]);

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
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      setUser(null);
      localStorage.removeItem(KEYS.SESSION);
      return;
    }

    let currentSub = data.subscription || 'INACTIVE';
    if (data.role === 'ADMIN') currentSub = 'ACTIVE';
    else if (currentSub === 'ACTIVE' && data.expiry_date && new Date(data.expiry_date) < new Date()) {
      currentSub = 'INACTIVE';
    }

    const updatedUser = { ...user, full_name: data.name, role: data.role || 'USER', subscription: currentSub, expiry_date: data.expiry_date, tg_user_id: data.tg_user_id };
    if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
      setUser(updatedUser);
      localStorage.setItem(KEYS.SESSION, JSON.stringify(updatedUser));
    }
  }, [user]);

  // --- УВЕДОМЛЕНИЯ ---
  const sendPaymentNotification = async (userData: any, detail: string = "Подписка VIP (30 дней)") => {
    const cleanPhone = userData?.phone?.replace(/\D/g, '');
    const tgId = userData?.tg_user_id; 
    const message = `🔔 <b>ОПЛАТА ПОДПИСКИ</b>\n👤 ${userData?.full_name}\n📱 +${cleanPhone}\n📦 ${detail}`;
    const keyboard = { inline_keyboard: [[{ text: "✅ Подтвердить оплату", callback_data: `approve_pay:${cleanPhone}` }], [{ text: "🔵 Написать", url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}` }]] };
    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML', reply_markup: keyboard }) });
      return true;
    } catch { return false; }
  };

  const sendPurchaseNotification = async (userData: any, phoneData: any) => {
    const cleanPhone = userData?.phone?.replace(/\D/g, '');
    const tgId = userData?.tg_user_id;
    const clientMention = tgId ? `<a href="tg://user?id=${tgId}">${userData?.full_name}</a>` : `<b>${userData?.full_name}</b>`;
    const message = `💰 <b>КЛИЕНТ ОПЛАТИЛ НОМЕР</b>\n━━━━━━━━━━━━━━━━━━\n👤 ${clientMention}\n📱 +${cleanPhone}\n💎 Лот: <code>${phoneData.number}</code>\n💵 ${phoneData.price.toLocaleString()} ₸\n\n⚠️ <i>Проверьте Kaspi! Если деньги пришли, нажмите Подтвердить. Номер заблокирован на 30 минут.</i>`;
    
    const keyboard = { inline_keyboard: [
      [{ text: "✅ ПОДТВЕРДИТЬ ПРОДАЖУ", callback_data: `confirm_sale:${phoneData.id}` }],
      [{ text: "🔵 Написать клиенту", url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}` }]
    ]};

    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML', reply_markup: keyboard }) });
      return true;
    } catch { return false; }
  };

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

  // --- ЭФФЕКТЫ И REALTIME ---
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

  const filteredPhones = useMemo(() => {
    const now = Date.now();
    return phones.filter(p => {
      if (p.status === 'SOLD' && p.sold_at) {
        if (now - new Date(p.sold_at).getTime() > 60000) return false;
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
    sendPaymentNotification, sendPurchaseNotification, tryLockPhone, extendLockToPayment, createOrder,
    pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc
  };
};
