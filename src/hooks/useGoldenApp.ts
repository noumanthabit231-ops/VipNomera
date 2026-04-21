import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { 
  SESSION: 'golden_v2_session',
  PHONES_CACHE: 'golden_v2_phones_cache',
  LABELS_CACHE: 'golden_v2_labels_cache'
};

export const useGoldenApp = () => {
  // --- СОСТОЯНИЕ НАВИГАЦИИ ---
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'order' | 'my_orders'>('catalog');

  // --- СОСТОЯНИЕ ПОЛЬЗОВАТЕЛЯ ---
  const [user, setUser] = useState<UserProfile | null>(() => {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  });

  // --- ДАННЫЕ КАТАЛОГА (ИНИЦИАЛИЗАЦИЯ ИЗ КЭША) ---
  const [phones, setPhones] = useState<Phone[]>(() => {
    const cached = localStorage.getItem(KEYS.PHONES_CACHE);
    return cached ? JSON.parse(cached) : [];
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    const cached = localStorage.getItem(KEYS.LABELS_CACHE);
    return cached ? JSON.parse(cached) : [];
  });

  // --- ЗАЯВКИ ПОЛЬЗОВАТЕЛЯ ---
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // --- СОСТОЯНИЯ ИНТЕРФЕЙСА ---
  const [isLoading, setIsLoading] = useState(phones.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  // --- СОСТОЯНИЕ АДМИН-ПАНЕЛИ ---
  const [pn, setPn] = useState('');
  const [pr, setPr] = useState('');
  const [st, setSt] = useState<'IN_STOCK' | 'ON_ORDER'>('IN_STOCK');
  const [sl, setSl] = useState<string[]>([]);
  const [lt, setLt] = useState('');
  const [lc, setLc] = useState('#D4AF37');

  // --- КОНФИГ ТЕЛЕГРАМА ---
  const TG_BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || "8254818813:AAGOwrgCn-Yl6zLpp_vn_A9aAA4nfAFjtss";
  const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || "7620660514";

  // --- МЕТОДЫ ЗАГРУЗКИ ДАННЫХ ---

  // Загрузка каталога (номера и теги)
  const fetchData = useCallback(async () => {
    if (phones.length === 0) setIsLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from('phones')
          .select('id, number, price, status, label_ids, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('labels')
          .select('id, text, color')
          .order('text')
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
      console.error("Критическая ошибка загрузки каталога:", e);
    } finally {
      setIsLoading(false);
    }
  }, [phones.length]);

  // Загрузка заявок конкретного пользователя
  const fetchUserOrders = useCallback(async () => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_phone', cleanPhone)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUserOrders(data);
    } catch (e) {
      console.error("Ошибка загрузки заявок:", e);
    }
  }, [user?.phone]);

  // Проверка статуса пользователя и VIP
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

    if (!data || error) {
      if (error) console.error("Ошибка профиля:", error);
      return;
    }

    let currentSub = data.subscription || 'INACTIVE';
    if (data.role === 'ADMIN') {
      currentSub = 'ACTIVE';
    } else if (currentSub === 'ACTIVE' && data.expiry_date) {
      if (new Date(data.expiry_date) < new Date()) {
        currentSub = 'INACTIVE';
      }
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
  }, [user]);

  // --- МЕТОДЫ СОЗДАНИЯ ЗАЯВОК И УВЕДОМЛЕНИЙ ---

  const createOrder = async (phoneData: any, type: 'PURCHASE' | 'ORDER') => {
    if (!user?.phone) return false;
    const cleanPhone = user.phone.replace(/\D/g, '');

    try {
      const { error } = await supabase.from('orders').insert([{
        user_phone: cleanPhone,
        phone_number: phoneData.number,
        price: phoneData.price,
        type: type
      }]);

      if (error) throw error;
      await fetchUserOrders(); // Обновляем список и счетчик
      return true;
    } catch (e) {
      console.error("Ошибка сохранения заявки в БД:", e);
      return false;
    }
  };

  const sendPaymentNotification = async (userData: any, detail: string = "Подписка VIP (30 дней)") => {
    const cleanPhone = userData?.phone?.replace(/\D/g, '');
    const tgId = userData?.tg_user_id; 
    
    const message = `
🔔 <b>НОВАЯ ЗАЯВКА НА ОПЛАТУ</b>
👤 Клиент: ${userData?.full_name || 'Не указано'}
📱 Номер: +${cleanPhone || 'Не указано'}
📦 Услуга: ${detail}
💰 Статус: Ожидает подтверждения
⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: "✅ Подтвердить оплату", callback_data: `approve_pay:${cleanPhone}` }],
        [{ text: "🔵 Написать в Telegram", url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}` }]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML', reply_markup: keyboard }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const sendPurchaseNotification = async (userData: any, phoneData: any) => {
    const cleanPhone = userData?.phone?.replace(/\D/g, '');
    const tgId = userData?.tg_user_id;
    const clientMention = tgId 
      ? `<a href="tg://user?id=${tgId}">${userData?.full_name || 'Клиент'}</a>`
      : `<b>${userData?.full_name || 'Клиент'}</b>`;

    const message = `
💰 <b>ЗАЯВКА НА ПОКУПКУ НОМЕРА</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Клиент:</b> ${clientMention}
📱 <b>Связь:</b> +${cleanPhone}
💎 <b>НОМЕР:</b> <code>${phoneData.number}</code>
💵 <b>ЦЕНА:</b> ${phoneData.price.toLocaleString()} ₸
━━━━━━━━━━━━━━━━━━
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: "🔵 Написать в Telegram", url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}` }],
        [{ text: "🟢 Написать в WhatsApp", url: `https://wa.me/${cleanPhone}` }]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML', reply_markup: keyboard }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  // --- АДМИН-ФУНКЦИИ ---

  const handleSavePhone = async () => {
    if (!pn || !pr) return alert('Заполните данные');
    try {
      const { error } = await supabase.from('phones').insert([{ 
        number: pn, 
        price: Number(pr), 
        status: st, 
        label_ids: sl 
      }]);
      if (!error) {
        setPn(''); setPr(''); setSl([]);
        await fetchData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить этот номер из базы?')) {
      const { error } = await supabase.from('phones').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  // --- ЭФФЕКТЫ ---

  // Первичная загрузка
  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Загрузка заявок при входе
  useEffect(() => {
    if (user) fetchUserOrders();
  }, [user, fetchUserOrders]);

  // Слежение за статусом и реалтайм
  useEffect(() => {
    if (!user?.phone || view === 'auth') return;

    const cleanPhone = user.phone.replace(/\D/g, '');
    refreshUserData();

    const subscription = supabase
      .channel(`updates`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auth_codes' }, () => refreshUserData())
      .subscribe();

    const interval = setInterval(refreshUserData, 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [user?.phone, view, refreshUserData]);

  // Синхронизация сессии
  useEffect(() => {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }, [user]);

  // --- ФИЛЬТРАЦИЯ ---
  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  // --- ЭКСПОРТ ---
  return {
    isLoading, view, setView, user, setUser, phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones, selectedPhone, setSelectedPhone,
    userOrders, createOrder, fetchData, fetchUserOrders, refreshUserData, handleSavePhone, handleDeletePhone, 
    sendPaymentNotification, sendPurchaseNotification,
    pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc
  };
};
