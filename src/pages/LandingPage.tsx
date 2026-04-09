import { useState } from 'react';
import Icon from '@/components/ui/icon';

const PLANS = [
  {
    id: 'starter',
    name: 'Старт',
    emoji: '⛵',
    price: 2900,
    period: 'мес',
    color: '#00b4ff',
    border: 'rgba(0,180,255,0.4)',
    glow: 'rgba(0,180,255,0.15)',
    highlight: false,
    description: 'Для небольших команд',
    features: [
      { ok: true,  text: 'До 10 сотрудников' },
      { ok: true,  text: '1 игровое поле' },
      { ok: true,  text: 'История выстрелов' },
      { ok: true,  text: 'Таблица рейтинга' },
      { ok: true,  text: '1 адмирал' },
      { ok: false, text: 'Интеграция Битрикс24' },
      { ok: false, text: 'Несколько полей' },
      { ok: false, text: 'API доступ' },
    ],
  },
  {
    id: 'pro',
    name: 'Профи',
    emoji: '🛥️',
    price: 6900,
    period: 'мес',
    color: '#ffd700',
    border: 'rgba(255,215,0,0.6)',
    glow: 'rgba(255,200,0,0.2)',
    highlight: true,
    badge: '🔥 Хит продаж',
    description: 'Для активных отделов продаж',
    features: [
      { ok: true,  text: 'До 50 сотрудников' },
      { ok: true,  text: 'До 3 игровых полей' },
      { ok: true,  text: 'История выстрелов' },
      { ok: true,  text: 'Таблица рейтинга' },
      { ok: true,  text: 'До 5 адмиралов' },
      { ok: true,  text: 'Интеграция Битрикс24' },
      { ok: true,  text: 'Настройка бонусов' },
      { ok: false, text: 'API доступ' },
    ],
  },
  {
    id: 'fleet',
    name: 'Флотилия',
    emoji: '🚢',
    price: 14900,
    period: 'мес',
    color: '#00ffcc',
    border: 'rgba(0,255,200,0.4)',
    glow: 'rgba(0,255,200,0.12)',
    highlight: false,
    description: 'Для крупных компаний',
    features: [
      { ok: true,  text: 'Безлимит сотрудников' },
      { ok: true,  text: 'Безлимит игровых полей' },
      { ok: true,  text: 'История выстрелов' },
      { ok: true,  text: 'Таблица рейтинга' },
      { ok: true,  text: 'Безлимит адмиралов' },
      { ok: true,  text: 'Интеграция Битрикс24' },
      { ok: true,  text: 'Настройка бонусов' },
      { ok: true,  text: 'API доступ + Вебхуки' },
    ],
  },
];

const FEATURES = [
  { icon: '🎯', title: 'Игровое поле 10×10', desc: 'Красивое поле в морском стиле. Каждый выстрел = одна сделка. Менеджер закрыл продажу — получает ход.' },
  { icon: '💥', title: 'Бонус за потопление', desc: 'Потопил корабль = получил деньги на карту. Размер бонуса настраивается адмиралом под ваш бюджет.' },
  { icon: '🏆', title: 'Таблица лидеров', desc: 'Живой рейтинг в реальном времени. Кто лидирует? Сколько заработал? Видят все — мотивирует каждого.' },
  { icon: '🔗', title: 'Интеграция Битрикс24', desc: 'Сделка закрыта в Битриксе — выстрел засчитан автоматически. Никаких ручных вводов.' },
  { icon: '⚓', title: 'Панель адмирала', desc: 'Руководитель расставляет корабли, задаёт суммы бонусов, управляет игрой и видит всю картину.' },
  { icon: '📊', title: 'Аналитика и отчёты', desc: 'Статистика по каждому менеджеру: активность, точность, бонусы. Полная картина эффективности.' },
];

const STEPS = [
  { num: '01', title: 'Установите приложение', desc: 'Найдите «Морской Бой» в маркетплейсе Битрикс24 и установите за 2 клика', icon: '📦' },
  { num: '02', title: 'Расставьте корабли', desc: 'Адмирал расставляет корабли и назначает суммы бонусов за потопление', icon: '🗺️' },
  { num: '03', title: 'Начните игру', desc: 'Менеджеры делают продажи и стреляют по полю. Каждая сделка = выстрел', icon: '🎯' },
  { num: '04', title: 'Выплачивайте бонусы', desc: 'Потопил корабль — получи бонус. Приложение само считает всё за вас', icon: '💰' },
];

const FAQ = [
  { q: 'Как менеджер получает право на выстрел?', a: 'При подключённой интеграции Битрикс24 — автоматически при закрытии сделки. Без интеграции — адмирал вручную вводит информацию о сделке.' },
  { q: 'Можно ли настроить размер бонуса?', a: 'Да! Адмирал в своей панели может задать любую сумму для каждого типа корабля. 1-палубный может стоить 500₽, а 4-палубный — 20 000₽.' },
  { q: 'Сколько полей можно вести одновременно?', a: 'На тарифе «Старт» — одно поле, «Профи» — до 3, «Флотилия» — без ограничений. Можно вести разные отделы на разных полях.' },
  { q: 'Что происходит когда все корабли потоплены?', a: 'Игра завершается, итоги фиксируются. Адмирал начинает новую игру с новой расстановкой кораблей.' },
  { q: 'Есть ли пробный период?', a: 'Да, 14 дней бесплатно на тарифе «Профи» без ввода карты. Просто установите из маркетплейса.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{
        background: '#030c1f',
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,80,180,0.4) 0%, transparent 65%)',
        fontFamily: 'Golos Text, sans-serif',
      }}>

      {/* Scanline grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,140,200,0.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,140,200,0.04) 40px)',
        zIndex: 0,
      }} />

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚓</span>
          <span className="font-russo text-lg" style={{ color: '#00e5ff', textShadow: '0 0 15px rgba(0,229,255,0.5)' }}>
            МОРСКОЙ БОЙ
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Возможности', 'Тарифы', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold transition-colors"
              style={{ color: 'rgba(150,210,240,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00e5ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(150,210,240,0.7)')}>
              {item}
            </a>
          ))}
        </div>
        <a href="/" className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#ffe44d,#ffa500)', color: '#071628' }}>
          Открыть игру →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-6 pt-16 pb-24 text-center max-w-5xl mx-auto">
        {/* Decorative ship */}
        <div className="text-8xl mb-6 inline-block" style={{ animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(0,180,255,0.5))' }}>
          🚢
        </div>

        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ background: 'rgba(0,180,255,0.15)', border: '1px solid rgba(0,180,255,0.4)', color: '#00e5ff' }}>
          Приложение для Битрикс24 · Геймификация продаж
        </div>

        <h1 className="font-russo text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #80f4ff 40%, #00b4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(0,180,255,0.3))',
          }}>
          Превратите продажи<br />
          <span style={{
            background: 'linear-gradient(135deg,#ffd700,#ff8c00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>в игру</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgba(160,220,250,0.8)' }}>
          Менеджер закрыл сделку — делает выстрел по кораблю. Потопил — получает реальные деньги. Рост продаж до <strong style={{ color: '#ffd700' }}>+35%</strong> без изменения системы мотивации.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#тарифы" className="px-8 py-4 rounded-2xl font-russo text-base transition-all inline-block"
            style={{ background: 'linear-gradient(135deg,#ffe44d,#ffa500)', color: '#071628', boxShadow: '0 4px 30px rgba(255,200,0,0.5)' }}>
            🚀 Попробовать бесплатно 14 дней
          </a>
          <a href="#возможности" className="px-8 py-4 rounded-2xl font-bold text-base transition-all inline-block"
            style={{ background: 'rgba(0,60,120,0.5)', border: '1px solid rgba(0,180,255,0.4)', color: '#80f4ff' }}>
            Как это работает →
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
          {[
            { value: '+35%', label: 'рост продаж' },
            { value: '14 дней', label: 'бесплатно' },
            { value: '5 мин', label: 'настройка' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-russo text-2xl md:text-3xl" style={{ color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(130,190,220,0.65)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="возможности" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#ffffff' }}>
            Как работает <span style={{ color: '#00e5ff', textShadow: '0 0 20px rgba(0,229,255,0.6)' }}>Морской Бой</span>
          </div>
          <div className="text-base" style={{ color: 'rgba(150,210,240,0.7)' }}>Четыре шага от установки до первой выплаты бонуса</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, idx) => (
            <div key={step.num}
              className="p-6 rounded-2xl relative overflow-hidden transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(145deg,rgba(8,24,65,0.95),rgba(3,12,40,0.98))',
                border: '1px solid rgba(0,160,220,0.25)',
                animationDelay: `${idx * 0.1}s`,
              }}>
              <div className="font-russo text-5xl mb-3" style={{ color: 'rgba(0,180,220,0.12)', lineHeight: 1 }}>{step.num}</div>
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="font-russo text-sm mb-2" style={{ color: 'rgba(210,240,255,0.95)' }}>{step.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(130,185,220,0.75)' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#ffffff' }}>
            Всё что нужно для <span style={{ color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>результата</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, idx) => (
            <div key={f.title}
              className="p-6 rounded-2xl transition-all group cursor-default"
              style={{
                background: 'linear-gradient(145deg,rgba(8,24,65,0.9),rgba(3,12,40,0.95))',
                border: '1px solid rgba(0,150,210,0.2)',
                animationDelay: `${idx * 0.08}s`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.45)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(0,180,220,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,150,210,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="font-russo text-sm mb-2" style={{ color: 'rgba(210,240,255,0.95)' }}>{f.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(130,185,220,0.7)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="тарифы" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#ffffff' }}>
            Тарифы
          </div>
          <div className="text-base" style={{ color: 'rgba(150,210,240,0.7)' }}>
            14 дней бесплатно на любом тарифе. Без ввода карты.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, idx) => (
            <div key={plan.id}
              className="relative flex flex-col rounded-3xl p-6 transition-all"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(145deg,rgba(20,45,10,0.95),rgba(8,24,55,0.98))'
                  : 'linear-gradient(145deg,rgba(8,24,65,0.95),rgba(3,12,40,0.98))',
                border: `1px solid ${plan.border}`,
                boxShadow: plan.highlight ? `0 0 40px ${plan.glow}, 0 8px 40px rgba(0,0,0,0.5)` : '0 8px 40px rgba(0,0,0,0.4)',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                animationDelay: `${idx * 0.1}s`,
              }}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#071628' }}>
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{plan.emoji}</span>
                <div>
                  <div className="font-russo text-xl" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(130,185,215,0.65)' }}>{plan.description}</div>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-russo text-4xl" style={{ color: '#ffffff' }}>{plan.price.toLocaleString()}₽</span>
                <span className="text-sm ml-1" style={{ color: 'rgba(130,185,215,0.6)' }}>/{plan.period}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 mb-6">
                {plan.features.map(f => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0" style={{ color: f.ok ? '#00e676' : 'rgba(100,100,130,0.5)' }}>
                      {f.ok ? '✓' : '×'}
                    </span>
                    <span className="text-sm" style={{ color: f.ok ? 'rgba(200,235,255,0.85)' : 'rgba(100,130,160,0.45)' }}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3.5 rounded-xl font-russo text-sm transition-all"
                style={plan.highlight
                  ? { background: 'linear-gradient(135deg,#ffe44d,#ffa500)', color: '#071628', boxShadow: '0 4px 20px rgba(255,200,0,0.45)' }
                  : { background: 'rgba(0,60,120,0.5)', border: `1px solid ${plan.border}`, color: plan.color }}>
                {plan.highlight ? '🚀 Начать бесплатно' : 'Выбрать тариф'}
              </button>
            </div>
          ))}
        </div>

        {/* Annual discount */}
        <div className="mt-8 text-center p-5 rounded-2xl max-w-xl mx-auto"
          style={{ background: 'rgba(0,50,30,0.4)', border: '1px solid rgba(0,200,100,0.25)' }}>
          <span className="text-lg">🎁</span>
          <span className="text-sm font-semibold ml-2" style={{ color: 'rgba(160,240,200,0.9)' }}>
            При оплате за год — скидка 20%. Сэкономьте до
          </span>
          <span className="font-russo text-base ml-1" style={{ color: '#ffd700' }}> 35 760₽</span>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#ffffff' }}>
            Частые вопросы
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ.map((item, idx) => (
            <div key={idx}
              className="rounded-2xl overflow-hidden transition-all cursor-pointer"
              style={{ background: 'rgba(8,24,65,0.9)', border: openFaq === idx ? '1px solid rgba(0,229,255,0.45)' : '1px solid rgba(0,130,190,0.22)' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <span className="text-sm font-semibold" style={{ color: openFaq === idx ? '#00e5ff' : 'rgba(200,235,255,0.9)' }}>
                  {item.q}
                </span>
                <Icon name={openFaq === idx ? 'ChevronUp' : 'ChevronDown'} size={18}
                  style={{ color: openFaq === idx ? '#00e5ff' : 'rgba(130,185,215,0.55)', flexShrink: 0 }} />
              </div>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(150,210,240,0.75)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-20 text-center max-w-3xl mx-auto">
        <div className="p-10 rounded-3xl"
          style={{
            background: 'linear-gradient(145deg,rgba(0,40,100,0.8),rgba(0,20,60,0.95))',
            border: '1px solid rgba(0,180,255,0.35)',
            boxShadow: '0 0 60px rgba(0,120,200,0.2)',
          }}>
          <div className="text-6xl mb-5" style={{ filter: 'drop-shadow(0 0 20px rgba(0,200,255,0.5))' }}>⚓</div>
          <div className="font-russo text-3xl md:text-4xl mb-4" style={{ color: '#ffffff' }}>
            Готовы поднять продажи<br />
            <span style={{ color: '#ffd700' }}>до нового уровня?</span>
          </div>
          <p className="text-base mb-8" style={{ color: 'rgba(160,220,250,0.8)' }}>
            Установите Морской Бой из маркетплейса Битрикс24 и начните бесплатно уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-xl font-russo text-base transition-all"
              style={{ background: 'linear-gradient(135deg,#ffe44d,#ffa500)', color: '#071628', boxShadow: '0 4px 30px rgba(255,200,0,0.5)' }}>
              🚀 Установить бесплатно
            </button>
            <a href="/" className="px-8 py-4 rounded-xl font-bold text-base transition-all inline-block"
              style={{ background: 'rgba(0,60,120,0.5)', border: '1px solid rgba(0,180,255,0.4)', color: '#80f4ff' }}>
              Открыть демо →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 py-8 border-t" style={{ borderColor: 'rgba(0,100,160,0.2)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚓</span>
            <span className="font-russo text-sm" style={{ color: 'rgba(100,170,210,0.7)' }}>МОРСКОЙ БОЙ</span>
            <span className="text-xs" style={{ color: 'rgba(80,130,170,0.4)' }}>· Геймификация продаж · 2026</span>
          </div>
          <div className="flex gap-6">
            {['Политика конфиденциальности', 'Оферта', 'Контакты'].map(item => (
              <a key={item} href="#" className="text-xs transition-colors"
                style={{ color: 'rgba(100,155,200,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(150,210,240,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(100,155,200,0.5)')}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
