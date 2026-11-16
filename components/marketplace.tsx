"use client";

import {
  BadgeCheck,
  ChevronDown,
  Crown,
  Heart,
  Home,
  Menu,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Listing, Operator, SessionUser } from "@/lib/types";

const operators: Operator[] = ["Beeline", "Tele2", "ALTEL", "activ", "Kcell"];
const categories = ["Все", "Обычные", "Красивые", "Бизнес"] as const;

const operatorClass: Record<Operator, string> = {
  Beeline: "beeline",
  Tele2: "tele2",
  ALTEL: "altel",
  activ: "activ",
  Kcell: "kcell",
};

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₸`;
}

function Modal({ children, onClose, className = "" }: { children: React.ReactNode; onClose: () => void; className?: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-sheet ${className}`} role="dialog" aria-modal="true">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>
        {children}
      </section>
    </div>
  );
}

function TelegramLogin({ onSuccess, onClose, forListing = false }: { onSuccess: (user: SessionUser) => void; onClose: () => void; forListing?: boolean }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    if (!nonce) return;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/auth/status?nonce=${encodeURIComponent(nonce)}`, { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        if (data.status === "confirmed") {
          onSuccess(data.user);
          onClose();
        } else if (data.status === "expired") {
          setLoading(false);
          setNonce(null);
          setError("Ссылка устарела. Попробуйте ещё раз.");
        }
      } catch {
        // Keep polling through brief network interruptions.
      }
    };
    poll();
    const interval = window.setInterval(poll, 1600);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [nonce, onClose, onSuccess]);

  async function startLogin() {
    if (phone.length !== 10) {
      setError("Введите 10 цифр номера после +7");
      return;
    }
    setLoading(true);
    setError("");
    const authWindow = window.open("", "_blank");
    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось начать вход");
      setNonce(data.nonce);
      if (authWindow) authWindow.location.href = data.url;
      else window.location.href = data.url;
    } catch (authError) {
      authWindow?.close();
      setLoading(false);
      setError(authError instanceof Error ? authError.message : "Не удалось начать вход");
    }
  }

  return (
    <>
      <div className="modal-kicker">{forListing ? "Новое объявление · шаг 1 из 2" : "Без паролей и SMS"}</div>
      <h2>Войти через Telegram</h2>
      <p className="modal-lead">
        {forListing
          ? "Сначала подтвердите аккаунт — это защищает площадку от спама. Затем сразу откроется форма объявления."
          : "Подтвердите аккаунт один раз — вход сохранится на этом устройстве."}
      </p>
      <label className="field-label" htmlFor="auth-phone">Ваш номер для связи</label>
      <div className="phone-input">
        <span>+7</span>
        <input
          id="auth-phone"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="777 123 45 67"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      </div>
      <p className="field-hint">Этот номер увидит покупатель после отклика.</p>
      <button className="telegram-login-button" type="button" onClick={startLogin} disabled={loading || phone.length !== 10}>
        <span>✈</span>
        {loading ? "Ждём подтверждение в Telegram…" : "Продолжить в Telegram"}
      </button>
      {loading && <div className="inline-notice">Нажмите «Start», затем «Подтвердить номер» в Telegram. Вход завершится только после совпадения номера.</div>}
      {error && <div className="form-error">{error}</div>}
      <div className="trust-row"><BadgeCheck size={17} /> Мы не публикуем ваш Telegram и не отправляем спам.</div>
    </>
  );
}

function SubmitListing({ user, onCreated, onNeedAuth, onClose }: {
  user: SessionUser | null;
  onCreated: (listing: Listing) => void;
  onNeedAuth: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return onNeedAuth();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось опубликовать");
      onCreated(data.listing);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось опубликовать");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="modal-kicker">Новое объявление</div>
      <h2>Продайте красивый номер</h2>
      <p className="modal-lead">Заполнение занимает меньше минуты.</p>
      <div className="form-grid">
        <label className="field-group field-wide">
          <span>Номер</span>
          <div className="phone-input">
            <b>+7</b>
            <input name="phone" inputMode="numeric" maxLength={10} required placeholder="777 123 45 67" />
          </div>
        </label>
        <label className="field-group">
          <span>Оператор</span>
          <select name="operator" defaultValue="Beeline">
            {operators.map((operator) => <option key={operator}>{operator}</option>)}
          </select>
        </label>
        <label className="field-group">
          <span>Категория</span>
          <select name="category" defaultValue="Красивые">
            {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="field-group field-wide">
          <span>Короткое описание</span>
          <input name="title" maxLength={80} required placeholder="Например: легко запоминается" />
        </label>
        <label className="field-group field-wide">
          <span>Цена, ₸</span>
          <input name="price" type="number" min={1000} step={1000} inputMode="numeric" required placeholder="150 000" />
        </label>
      </div>
      {user && <div className="signed-in-as"><BadgeCheck size={18} /> Публикуете как {user.firstName}</div>}
      {error && <div className="form-error">{error}</div>}
      <button className="primary-button full" type="submit" disabled={loading || !user}>
        {loading ? "Публикуем…" : "Опубликовать бесплатно"}
      </button>
    </form>
  );
}

export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Все");
  const [operator, setOperator] = useState<"Все" | Operator>("Все");
  const [sort, setSort] = useState("popular");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [modal, setModal] = useState<"auth" | "submit" | "profile" | "filters" | null>(null);
  const [toast, setToast] = useState("");
  const [returnToSubmit, setReturnToSubmit] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      const response = await fetch("/api/listings");
      const data = await response.json();
      setListings(data.listings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
    fetch("/api/auth/me").then((response) => response.json()).then((data) => setUser(data.user)).catch(() => undefined);
    try {
      const saved = JSON.parse(localStorage.getItem("nomeraplus_favorites") || "[]") as string[];
      setFavorites(new Set(saved));
    } catch {}
  }, [loadListings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.replace(/\s/g, "").toLowerCase();
    const result = listings.filter((listing) => {
      const searchable = `${listing.phone}${listing.title}`.replace(/\s/g, "").toLowerCase();
      return searchable.includes(normalizedQuery)
        && (category === "Все" || listing.category === category)
        && (operator === "Все" || listing.operator === operator);
    });
    return [...result].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : Number(Boolean(b.promoted)) - Number(Boolean(a.promoted)));
  }, [category, listings, operator, query, sort]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("nomeraplus_favorites", JSON.stringify([...next]));
      return next;
    });
  }

  function openSubmit() {
    if (!user) return needAuth();
    setModal("submit");
  }

  function needAuth() {
    setReturnToSubmit(true);
    setModal("auth");
  }

  function completeAuth(nextUser: SessionUser) {
    setUser(nextUser);
    setToast(`Добро пожаловать, ${nextUser.firstName}!`);
    if (returnToSubmit) {
      setReturnToSubmit(false);
      window.setTimeout(() => setModal("submit"), 120);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setModal(null);
    setToast("Вы вышли из профиля");
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="app-frame">
        <header className="topbar">
          <button className="brand" type="button" aria-label="НомераПлюс — на главную">
            <span className="brand-mark"><Phone size={23} fill="currentColor" /></span>
            <span><b>НомераПлюс</b><small>Красивые номера Казахстана</small></span>
          </button>
          <button className="icon-button menu-button" type="button" aria-label="Открыть меню"><Menu /></button>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <span className="hero-icon"><Crown size={25} /></span>
            <h1>VIP-канал</h1>
            <p>Редкие номера появляются здесь раньше всех.</p>
            <button type="button">Подробнее <span>→</span></button>
          </div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-number"><Sparkles size={18} /> +7 777 777 77 77</div>
        </section>

        <section className="quick-actions">
          <button className="quick-action primary" type="button" onClick={openSubmit}>
            <span className="action-icon"><Plus size={22} /></span>
            <span><b>Подать объявление</b><small>Продать свой номер</small></span>
          </button>
          <button className="quick-action vip" type="button" onClick={() => setToast("VIP-доступ скоро появится") }>
            <span className="action-icon"><Crown size={21} /></span>
            <span><b>Купить VIP</b><small>Доступ к редким номерам</small></span>
          </button>
        </section>

        <section className="search-section">
          <div className="search-box">
            <Search size={21} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Введите номер или комбинацию, например 777" aria-label="Поиск номера" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"><X size={17} /></button>}
          </div>
          <button className="filter-button" type="button" onClick={() => setModal("filters")} aria-label="Расширенные фильтры"><SlidersHorizontal size={21} /></button>
        </section>

        <section className="filters" aria-label="Фильтры">
          <div className="category-row">
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} type="button" onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="select-row">
            <label><span>Оператор:</span><select value={operator} onChange={(event) => setOperator(event.target.value as "Все" | Operator)}><option>Все</option>{operators.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка"><option value="popular">Популярные</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select><ChevronDown size={14} /></label>
          </div>
        </section>

        <div className="results-head"><span>{visibleListings.length} номеров</span><small>Проверенные продавцы</small></div>
        <section className="listings" aria-live="polite">
          {loading ? Array.from({ length: 5 }).map((_, index) => <div className="listing-card skeleton" key={index} />) : visibleListings.length ? visibleListings.map((listing) => (
            <article className={`listing-card ${listing.promoted ? "promoted" : ""}`} key={listing.id}>
              <div className="listing-main">
                <div className="number-row"><h3>{listing.phone}</h3>{listing.promoted && <span className="ad-label">VIP</span>}</div>
                <p>{listing.title}</p>
                <div className="listing-meta">
                  <span className={`operator ${operatorClass[listing.operator]}`}><i />{listing.operator}</span>
                  <span className={`source-badge ${listing.source === "user" ? "user" : "site"}`}>
                    {listing.source === "user" ? "От пользователя" : "От сайта"}
                  </span>
                </div>
              </div>
              <div className="listing-actions">
                <button className={`favorite ${favorites.has(listing.id) ? "selected" : ""}`} type="button" onClick={() => toggleFavorite(listing.id)} aria-label="Добавить в избранное"><Heart size={20} fill={favorites.has(listing.id) ? "currentColor" : "none"} /></button>
                <strong className="price">{formatPrice(listing.price)}</strong>
                <button className="buy-button" type="button" onClick={() => setToast("Заявка отправлена продавцу")}><ShoppingBag size={17} /> Купить</button>
              </div>
            </article>
          )) : (
            <div className="empty-state"><Search size={26} /><h3>Таких номеров пока нет</h3><p>Измените комбинацию или сбросьте фильтры.</p><button type="button" onClick={() => { setQuery(""); setCategory("Все"); setOperator("Все"); }}>Сбросить фильтры</button></div>
          )}
        </section>
      </div>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button className="active" type="button"><Home size={22} fill="currentColor" /><span>Главная</span></button>
        <button className="publish-nav" type="button" onClick={openSubmit}><span><Plus size={28} /></span><small>Подать</small></button>
        <button type="button" onClick={() => setToast("VIP-канал скоро появится")}><Crown size={23} /><span>VIP-канал</span></button>
        <button type="button" onClick={() => setModal(user ? "profile" : "auth")}><UserRound size={22} fill={user ? "currentColor" : "none"} /><span>Профиль</span></button>
      </nav>

      {modal === "auth" && <Modal onClose={() => { setModal(null); setReturnToSubmit(false); }}><TelegramLogin forListing={returnToSubmit} onSuccess={completeAuth} onClose={() => { if (!returnToSubmit) setModal(null); }} /></Modal>}
      {modal === "submit" && <Modal onClose={() => setModal(null)} className="submit-modal"><SubmitListing user={user} onNeedAuth={needAuth} onClose={() => setModal(null)} onCreated={(listing) => { setListings((items) => [listing, ...items]); setToast("Объявление опубликовано"); }} /></Modal>}
      {modal === "profile" && user && <Modal onClose={() => setModal(null)}><div className="profile-card"><div className="profile-avatar">{user.photoUrl ? <img src={user.photoUrl} alt="" /> : user.firstName.slice(0, 1)}</div><div><div className="modal-kicker">Ваш профиль</div><h2>{user.firstName}</h2><p>{user.username ? `@${user.username}` : "Аккаунт Telegram подтверждён"}</p></div></div><div className="profile-status"><BadgeCheck size={20} /> Telegram подтверждён</div><button className="secondary-button full" type="button" onClick={logout}>Выйти из профиля</button></Modal>}
      {modal === "filters" && <Modal onClose={() => setModal(null)}><div className="modal-kicker">Настройте выдачу</div><h2>Фильтры</h2><div className="filter-modal-grid"><label className="field-group"><span>Оператор</span><select value={operator} onChange={(event) => setOperator(event.target.value as "Все" | Operator)}><option>Все</option>{operators.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-group"><span>Сортировка</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Популярные</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select></label></div><button className="primary-button full" type="button" onClick={() => setModal(null)}>Показать {visibleListings.length} номеров</button></Modal>}
      {toast && <div className="toast"><Star size={18} fill="currentColor" /> {toast}</div>}
    </main>
  );
}
