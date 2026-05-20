import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ExternalLink, Smartphone, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { useGoldenApp } from '../hooks/useGoldenApp';
import { cn } from '../cn';

const BOT_USERNAME = "vipvipnumbers_bot";

export const AuthView = () => {
  const { setUser, setView, isLight } = useGoldenApp();
  const [mode, setMode] = useState<'register' | 'restore'>('register');
  const [name, setName] = useState('');
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [part4, setPart4] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);

  const getPhone10 = () => {
    const digits = part1 + part2 + part3 + part4;
    return digits.length === 10 ? digits : null;
  };

  const getDisplayPhone = () => {
    const p1 = part1 || '___';
    const p2 = part2 || '___';
    const p3 = part3 || '__';
    const p4 = part4 || '__';
    return `+7 ${p1} ${p2} ${p3} ${p4}`;
  };

  const handlePartChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, maxLen: number, nextRef?: React.RefObject<HTMLInputElement>) => {
    const digits = value.replace(/\D/g, '').slice(0, maxLen);
    setter(digits);
    if (digits.length === maxLen && nextRef) nextRef.current?.focus();
  };

  const generateSessionToken = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleStartAuth = async () => {
    const phone10 = getPhone10();
    if (!phone10) {
      alert('Введите 10 цифр номера');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }
    setLoading(true);
    const sessionToken = generateSessionToken();
    setCode(sessionToken);

    // 1. Удаляем старые неверифицированные записи для этого номера
    await supabase.from('auth_codes').delete().eq('phone', phone10).eq('is_verified', false);

    // 2. Для режима восстановления: проверяем, существует ли верифицированный аккаунт
    if (mode === 'restore') {
      const { data: verified, error: verifyErr } = await supabase
        .from('auth_codes')
        .select('id')
        .eq('phone', phone10)
        .eq('is_verified', true)
        .limit(1) // <--- ДОБАВЛЕН ЛИМИТ, ЧТОБЫ ИЗБЕЖАТЬ КРАША ИЗ-ЗА ДУБЛЕЙ
        .maybeSingle();

      if (verifyErr) console.error("Ошибка проверки аккаунта:", verifyErr);

      if (!verified) {
        setLoading(false);
        alert('Пользователь не найден. Проверьте номер или зарегистрируйтесь.');
        return;
      }
    }

    // 3. Создаём новую неверифицированную запись
    const { error } = await supabase.from('auth_codes').insert([{
      phone: phone10,
      code: sessionToken,
      is_verified: false,
      name: name.trim() || 'Пользователь',
    }]);

    setLoading(false);
    if (!error) setStep('verify');
    else alert('Ошибка: ' + error.message);
  };

  useEffect(() => {
    if (step !== 'verify') return;
    const phone10 = getPhone10();
    if (!phone10) return;

    const interval = setInterval(async () => {
      // Ищем самую свежую верифицированную запись
      const { data, error } = await supabase
        .from('auth_codes')
        .select('is_verified, name, role, subscription, expiry_date, tg_user_id')
        .eq('phone', phone10)
        .eq('is_verified', true)
        .order('created_at', { ascending: false }) // <--- БЕРЕМ ПОСЛЕДНЮЮ ЗАЯВКУ
        .limit(1) // <--- СТРОГИЙ ЛИМИТ
        .maybeSingle();

      if (data?.is_verified) {
        clearInterval(interval);
        setUser({
          phone: phone10,
          full_name: data.name || (mode === 'register' ? name : 'Пользователь'),
          role: data.role || 'USER',
          subscription
