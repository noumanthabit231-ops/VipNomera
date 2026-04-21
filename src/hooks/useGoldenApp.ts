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

  // --- КОНФИГ ТЕЛЕГРАМА (Берем из .env, но оставляем старые как запасные) ---
  const TG_BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || "8254818813:AAGOwrgCn-Yl6zLpp_vn_A9aAA4nfAFjtss";
  const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || "7620660514";

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

  // Обновление данных юзера (Проверка подписки и удалений)
  const refreshUserData = useCallback(async () => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from('auth_codes')
      .select('role, subscription, expiry_date, name, tg_user_id')
      .eq('phone', cleanPhone)
      .eq('is_verified', true)
      // Сортируем так, чтобы ADMIN и ACTIVE были первыми, а потом по дате
      .order('role', { ascending: true }) 
      .order('subscription', { ascending: true }) 
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // ⚡️ ЕСЛИ ЮЗЕРА БОЛЬШЕ НЕТ В БАЗЕ (ТЫ ЕГО УДАЛИЛ) -> СБРАСЫВАЕМ ЛОКАЛЬНУЮ ПАМЯТЬ
    if (!data || error) {
      setUser(null);
      localStorage.removeItem(KEYS.SESSION);
      return;
    }

    // ⚡️ АВТОМАТИЧЕСКАЯ ПРОВЕРКА НА ПРОСРОЧКУ И ПРАВА АДМИНА
    let currentSub = data.subscription || 'INACTIVE';
    
    // Если это Владелец (ADMIN) - даем вечный доступ, игнорируем даты
    if (data.role === 'ADMIN') {
      currentSub = 'ACTIVE';
    } 
    // Для обычных юзеров проверяем срок годности
    else if (currentSub === 'ACTIVE' && data.expiry_date) {
      if (new Date(data.expiry_date) < new Date()) {
        currentSub = 'INACTIVE'; // Если время вышло, сбрасываем статус
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

  // Уведомление в Telegram об оплате ПОДПИСКИ (Исправлено на HTML)
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
        [
          { text: "✅ Подтвердить оплату", callback_data: `approve_pay:${cleanPhone}` }
        ],
        [
          { 
            text: "🔵 Написать в Telegram", 
            url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}` 
          }
        ]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: message,
          parse_mode: 'HTML', // ВАЖНО: Используем HTML
          reply_markup: keyboard
        }),
      });
      if (!res.ok) console.error("TG API Error:", await res.json());
      return res.ok;
    } catch (err) {
      console.error("TG Error:", err);
      return false;
    }
  };

  // Уведомление в Telegram о покупке КОНКРЕТНОГО НОМЕРА (Исправлено на HTML)
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
        [
          { 
            text: "🔵 Написать в Telegram", 
            url: tgId ? `tg://user?id=${tgId}` : `https://t.me/+${cleanPhone}`
          }
        ],
        [
          { 
            text: "🟢 Написать в WhatsApp", 
            url: `https://wa.me/${cleanPhone}`
          }
        ]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: message,
          parse_mode: 'HTML', // ВАЖНО: Используем HTML
          reply_markup: keyboard
        }),
      });
      if (!res.ok) console.error("TG API Error:", await res.json());
      return res.ok;
    } catch (err) {
      console.error("Ошибка уведомления о покупке:", err);
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

  // ⚡️ ЭФФЕКТ ДЛЯ МОМЕНТАЛЬНОГО ОБНОВЛЕНИЯ СТАТУСА ⚡️
  useEffect(() => {
    if (!user?.phone || view === 'auth') return;

    const cleanPhone = user.phone.replace(/\D/g, '');

    // 1. Вызываем сразу при загрузке (чтобы не ждать таймер)
    refreshUserData();

    // 2. Подписка на моментальные обновления из базы (WebSockets)
    const subscription = supabase
      .channel(`user_vip_updates_${cleanPhone}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auth_codes',
          filter: `phone=eq.${cleanPhone}` // Слушаем только свою строку
        },
        (payload) => {
          console.log('⚡️ Данные обновлены в БД! Мгновенно применяем...');
          refreshUserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'auth_codes',
          filter: `phone=eq.${cleanPhone}` // Слушаем удаление своей строки
        },
        (payload) => {
          console.log('⚡️ Пользователь удален из БД! Выходим из аккаунта...');
          setUser(null);
          localStorage.removeItem(KEYS.SESSION);
        }
      )
      .subscribe();

    // 3. Запасной интервал на случай потери связи
    const interval = setInterval(refreshUserData, 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [user?.phone, view, refreshUserData]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }, [user]);

  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = activeLabelFilter ? (p.label_ids || []).includes(activeLabelFilter) : true;
      return matchesSearch && matchesLabel;
    });
  }, [phones, searchQuery, activeLabelFilter]);

  // --- РЕЗУЛЬТАТ ХУКА ---
  return {
    view, setView, user, setUser, 
    phones, labels, searchQuery, setSearchQuery,
    activeLabelFilter, setActiveLabelFilter, filteredPhones,
    selectedPhone, setSelectedPhone,
    fetchData, 
    refreshUserData, 
    handleSavePhone, 
    handleDeletePhone, 
    sendPaymentNotification,
    sendPurchaseNotification,
    pn, setPn, pr, setPr, st, setSt, sl, setSl, lt, setLt, lc, setLc
  };
};
