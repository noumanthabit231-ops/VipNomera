import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Phone, Label, UserProfile } from '../types';

const KEYS = { SESSION: 'golden_v2_session' };

export const useGoldenApp = () => {
  // --- СОСТОЯНИЕ НАВИГАЦИИ И ПОЛЬЗОВАТЕЛЯ ---
  const [view, setView] = useState<'catalog' | 'auth' | 'admin' | 'profile' | 'subscription'>('catalog');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  });

  // --- ДАННЫЕ КАТАЛОГА ---
  const [phones, setPhones] = useState<Phone[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
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
  const TG_BOT_TOKEN = "8254818813:AAGOwrgCn-Yl6zLpp_vn_A9aAA4nfAFjtss";
  const TG_CHAT_ID = "7620660514";

  // --- МЕТОДЫ ---

  // Загрузка каталога (номера и теги)
  const fetchData = useCallback(async () => {
    const [pRes, lRes] = await Promise.all([
      supabase.from('phones').select('*').order('created_at', { ascending: false }),
      supabase.from('labels').select('*').order('text')
    ]);
    if (pRes.data) setPhones(pRes.data);
    if (lRes.data) setLabels(lRes.data);
  }, []);

  // Обновление данных юзера (Проверка подписки) — ИСПРАВЛЕНО
  const refreshUserData = useCallback(async () => {
    if (!user?.phone) return;
    
    // Очищаем номер от плюса и пробелов для корректного поиска
    const cleanPhone = user.phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from('auth_codes')
      .select('is_verified, name, subscription, expiry_date')
      .ilike('phone', `%${cleanPhone}%`) // Более гибкий поиск
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      const updatedUser = { 
        ...user, 
        full_name: data.name, 
        subscription: data.subscription || 'INACTIVE',
        expiry_date: data.expiry_date
      };
      
      // Обновляем стейт только если данные реально изменились
      if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
        setUser(updatedUser);
        localStorage.setItem(KEYS.SESSION, JSON.stringify(updatedUser));
      }
    }
  }, [user]);

  // Уведомление в Telegram об оплате
  const sendPaymentNotification = async (userData: any, detail: string = "Подписка VIP (30 дней)") => {
    const message = `
🔔 *НОВАЯ ЗАЯВКА НА ОПЛАТУ*
👤 Клиент: ${userData?.full_name || 'Не указано'}
📱 Номер: +${userData?.phone?.replace(/\D/g, '') || 'Не указано'}
📦 Услуга: ${detail}
💰 Статус: Ожидает подтверждения
⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `;

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Ошибка уведомления в TG:", err);
      return false;
    }
  };

  // Админка: Добавить номер
  const handleSavePhone = async () => {
    if (!pn || !pr) return alert('Заполните данные');
    const payload = { number: pn, price: Number(pr), status: st, label_ids: sl };
    const { error } = await supabase.from('phones').insert([payload]);
    if (!error) { 
      setPn(''); setPr(''); setSl([]); 
      await fetchData(); 
      return true; 
    }
    return false;
  };

  // Админка: Удалить номер
  const handleDeletePhone = async (id: string) => {
    if (confirm('Удалить этот номер из базы?')) {
      const { error } = await supabase.from('phones').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  // --- ЭФФЕКТЫ ---

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Авто-обновление статуса каждые 10 секунд (Polling)
  useEffect(() => {
    if (user && view !== 'auth') {
      const interval = setInterval(refreshUserData, 10000);
      return () => clearInterval(interval);
    }
  }, [user, view, refreshUserData]);

  // Синхронизация сессии с LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }, [user]);

  // Фильтрация каталога (Поиск + Теги)
  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  return {
    // Навигация и Юзер
    view, setView, user, setUser, 
    
    // Данные
    phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones,
    selectedPhone, setSelectedPhone,
    
    // Действия
    fetchData, refreshUserData, handleSavePhone, 
    handleDeletePhone, sendPaymentNotification,
    
    // Формы админа
    pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc
  };
};
