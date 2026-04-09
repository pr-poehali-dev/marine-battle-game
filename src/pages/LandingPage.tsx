import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

/* ── Тарифы с морскими названиями ── */
const PLANS = [
  {
    id: 'brig',
    name: 'Бриг',
    emoji: '⛵',
    price: 2900,
    period: 'мес',
    color: '#0b6dab',
    border: 'rgba(11,109,171,0.4)',
    glow: 'rgba(11,109,171,0.12)',
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
      { ok: false, text: 'API + Вебхуки' },
    ],
  },
  {
    id: 'frigate',
    name: 'Фрегат',
    emoji: '🛥️',
    price: 4900,
    period: 'мес',
    color: '#d48a10',
    border: 'rgba(212,138,16,0.55)',
    glow: 'rgba(212,138,16,0.18)',
    highlight: true,
    badge: '🔥 Самый популярный',
    description: 'Для активных отделов продаж',
    features: [
      { ok: true,  text: 'До 50 сотрудников' },
      { ok: true,  text: 'До 3 игровых полей' },
      { ok: true,  text: 'История выстрелов' },
      { ok: true,  text: 'Таблица рейтинга' },
      { ok: true,  text: 'До 5 адмиралов' },
      { ok: true,  text: 'Интеграция Битрикс24' },
      { ok: true,  text: 'Настройка бонусов' },
      { ok: false, text: 'API + Вебхуки' },
    ],
  },
  {
    id: 'flagship',
    name: 'Флагман',
    emoji: '🚢',
    price: 9900,
    period: 'мес',
    color: '#0b6dab',
    border: 'rgba(11,109,171,0.4)',
    glow: 'rgba(11,109,171,0.1)',
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
      { ok: true,  text: 'API + Вебхуки' },
    ],
  },
];

const FEATURES = [
  { icon: '🎯', title: 'Игровое поле 10×10',    desc: 'Каждый выстрел = одна сделка. Менеджер закрыл продажу — получает ход. Красивое морское поле с анимациями.' },
  { icon: '💥', title: 'Бонус за потопление',   desc: 'Потопил корабль = деньги на карту. Размер бонуса адмирал настраивает под бюджет компании.' },
  { icon: '🏆', title: 'Таблица лидеров',       desc: 'Живой рейтинг в реальном времени. Кто лидирует? Сколько заработал? Видят все — мотивирует каждого.' },
  { icon: '🔗', title: 'Интеграция Битрикс24', desc: 'Сделка закрыта в Битриксе — выстрел засчитан автоматически. Никаких ручных вводов.' },
  { icon: '⚓', title: 'Панель адмирала',       desc: 'Руководитель расставляет корабли, задаёт суммы бонусов, управляет игрой и видит всю картину.' },
  { icon: '📊', title: 'Аналитика и отчёты',   desc: 'Статистика по каждому менеджеру: активность, точность, бонусы. Полная картина эффективности.' },
];

const STEPS = [
  { num: '01', title: 'Установите',      desc: '«Морской Бой» в маркетплейсе Битрикс24 за 2 клика', icon: '📦' },
  { num: '02', title: 'Расставьте',      desc: 'Адмирал ставит корабли и назначает бонусы за потопление', icon: '🗺️' },
  { num: '03', title: 'Начните игру',   desc: 'Менеджеры делают сделки и стреляют по полю', icon: '🎯' },
  { num: '04', title: 'Выплатите',      desc: 'Потопил корабль — получи бонус. Приложение считает само', icon: '💰' },
];

const FAQ = [
  { q: 'Как менеджер получает право на выстрел?', a: 'При интеграции Битрикс24 — автоматически при закрытии сделки. Без интеграции — адмирал вводит вручную.' },
  { q: 'Можно ли настроить размер бонуса?', a: 'Да! Адмирал задаёт любую сумму для каждого типа корабля. 1-палубный — 500₽, 4-палубный — 20 000₽.' },
  { q: 'Сколько полей можно вести одновременно?', a: '«Бриг» — одно поле, «Фрегат» — до 3, «Флагман» — без ограничений. Разные поля для разных отделов.' },
  { q: 'Что происходит когда все корабли потоплены?', a: 'Игра завершается, итоги фиксируются. Адмирал начинает новую игру с новой расстановкой.' },
  { q: 'Есть ли пробный период?', a: 'Да, 14 дней бесплатно на тарифе «Фрегат» без ввода карты. Просто установите из маркетплейса.' },
];

/* ── Анимированная демо-игра ── */
const DEMO_COLS = ['А','Б','В','Г','Д'];
const DEMO_ROWS = ['1','2','3','4','5'];

type DemoState = 'idle' | 'aiming' | 'shooting' | 'hit' | 'bonus';

function GameDemo() {
  const [phase, setPhase] = useState<DemoState>('idle');
  const [hitCell] = useState({ r: 2, c: 3 });
  const [showBonus, setShowBonus] = useState(false);
  const [sunkEffect, setSunkEffect] = useState(false);

  // Ships on demo board: 3-deck horizontal at row 2, cols 1-3
  const shipCells = [{r:2,c:1},{r:2,c:2},{r:2,c:3}];
  const isShip = (r: number, c: number) => shipCells.some(s => s.r===r && s.c===c);
  const isHit  = (r: number, c: number) => phase !== 'idle' && phase !== 'aiming' && r===hitCell.r && c===hitCell.c;

  useEffect(() => {
    const seq = async () => {
      await sleep(1200);
      setPhase('aiming');
      await sleep(900);
      setPhase('shooting');
      await sleep(500);
      setPhase('hit');
      setSunkEffect(true);
      await sleep(400);
      setShowBonus(true);
      await sleep(2200);
      setShowBonus(false);
      setSunkEffect(false);
      await sleep(600);
      setPhase('idle');
      await sleep(800);
      seq();
    };
    const t = setTimeout(() => seq(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative select-none">
      {/* Glow ring behind board */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(11,109,171,0.15), transparent)', filter: 'blur(20px)' }} />

      <div className="relative rounded-3xl p-5"
        style={{ background: 'linear-gradient(145deg, #fff, #eef6fc)', border: '2px solid rgba(11,109,171,0.22)', boxShadow: '0 8px 40px rgba(11,109,171,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg,#bdddf5,#92c8ee)', color: '#0b6dab' }}>⚓</div>
            <span className="font-russo text-sm" style={{ color: '#0a2f5c' }}>Игровое поле</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.35)', color: '#14803c' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
            Идёт игра
          </div>
        </div>

        {/* Grid */}
        <div className="flex mb-1">
          <div className="w-6 shrink-0" />
          {DEMO_COLS.map(c => (
            <div key={c} className="flex-1 text-center font-russo"
              style={{ fontSize: '10px', color: 'rgba(11,109,171,0.5)' }}>{c}</div>
          ))}
        </div>
        {DEMO_ROWS.map((_, ri) => (
          <div key={ri} className="flex mb-0.5">
            <div className="w-6 shrink-0 flex items-center justify-end pr-1 font-russo"
              style={{ fontSize: '10px', color: 'rgba(11,109,171,0.5)' }}>{ri+1}</div>
            {Array.from({length:5},(_,ci) => {
              const aiming = phase==='aiming' && ri===hitCell.r && ci===hitCell.c;
              const hit    = isHit(ri,ci);
              const ship   = isShip(ri,ci) && !hit;
              return (
                <div key={ci} className="flex-1 mx-0.5 aspect-square flex items-center justify-center rounded"
                  style={{
                    fontSize: '12px',
                    border: hit
                      ? '1.5px solid rgba(217,64,16,0.7)'
                      : aiming
                        ? '1.5px solid rgba(11,109,171,0.7)'
                        : ship
                          ? '1.5px solid rgba(21,136,204,0.6)'
                          : '1.5px solid rgba(11,109,171,0.18)',
                    background: hit
                      ? 'linear-gradient(135deg,rgba(217,64,16,0.88),rgba(180,20,20,0.72))'
                      : aiming
                        ? 'rgba(11,109,171,0.15)'
                        : ship
                          ? 'linear-gradient(135deg,rgba(24,96,160,0.82),rgba(10,47,92,0.72))'
                          : 'rgba(220,238,252,0.55)',
                    transition: 'all 0.2s',
                    transform: sunkEffect && isShip(ri,ci) ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: hit ? '0 0 8px rgba(217,64,16,0.4)' : 'none',
                  }}>
                  {hit ? '🔥' : aiming ? '🎯' : ship ? <span style={{fontSize:'8px',color:'rgba(200,230,255,0.7)'}}>■</span> : null}
                </div>
              );
            })}
          </div>
        ))}

        {/* Explosion ring effect */}
        {sunkEffect && (
          <div className="absolute pointer-events-none" style={{
            top: `calc(${(hitCell.r/5)*100}% + 36px)`,
            left: `calc(${(hitCell.c/5)*100}% + 28px)`,
          }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              border: '3px solid rgba(217,64,16,0.7)',
              position: 'absolute',
              animation: 'explode-ring 0.7s ease-out forwards',
            }} />
          </div>
        )}

        {/* Bonus popup */}
        {showBonus && (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
            <div className="px-3 py-2 rounded-2xl font-russo text-sm shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#f0b820,#d06000)',
                color: '#3a1800',
                animation: 'coin-pop 0.5s ease-out',
                boxShadow: '0 4px 16px rgba(200,120,0,0.45)',
              }}>
              💰 +3 000₽
            </div>
            <div className="px-3 py-1.5 rounded-xl text-xs font-bold shadow"
              style={{
                background: '#fff',
                color: '#c01818',
                border: '1.5px solid rgba(217,64,16,0.35)',
                animation: 'coin-pop 0.5s ease-out 0.12s both',
              }}>
              💥 Корабль потоплен!
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍💼</span>
            <div>
              <div className="text-xs font-semibold" style={{color:'#0a2f5c'}}>Алексей П.</div>
              <div className="text-xs" style={{color:'rgba(10,47,92,0.5)'}}>Сделка: ООО Максимум</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold" style={{color:'#0a2f5c'}}>Бонусов</div>
            <div className="font-russo text-sm" style={{color:'#d48a10'}}>3 000₽</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/* ══════════════════════════════════════════ */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: 'Golos Text, sans-serif', background: '#ddeef8', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Subtle dot pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(11,109,171,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        zIndex: 0,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(11,109,171,0.12) 0%, transparent 60%), ' +
          'radial-gradient(ellipse 50% 40% at 90% 5%, rgba(0,153,140,0.08) 0%, transparent 55%)',
        zIndex: 0,
      }} />

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-russo"
            style={{ background: 'linear-gradient(135deg,#bdddf5,#92c8ee)', color: '#0b6dab', boxShadow: '0 2px 8px rgba(11,109,171,0.25)' }}>
            ⚓
          </div>
          <span className="font-russo text-lg" style={{ color: '#0a2f5c' }}>МОРСКОЙ БОЙ</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[['Как работает','#как-работает'],['Тарифы','#тарифы'],['FAQ','#faq']].map(([label, href]) => (
            <a key={label} href={href}
              className="text-sm font-semibold transition-colors"
              style={{ color: 'rgba(10,47,92,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0b6dab')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(10,47,92,0.6)')}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(11,109,171,0.1)', border: '1.5px solid rgba(11,109,171,0.3)', color: '#0b6dab' }}>
            Демо игры
          </a>
          <a href="#тарифы" className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#f0b820,#d06000)', color: '#3a1800', boxShadow: '0 2px 10px rgba(200,120,0,0.4)' }}>
            Попробовать →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-6 pt-12 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: 'rgba(11,109,171,0.1)', border: '1.5px solid rgba(11,109,171,0.28)', color: '#0b6dab' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
              Приложение для Битрикс24
            </div>

            <h1 className="font-russo text-4xl md:text-5xl mb-5 leading-tight" style={{ color: '#0a2f5c' }}>
              Превратите<br />продажи<br />
              <span style={{
                background: 'linear-gradient(135deg,#0b6dab,#00998c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>в игру</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(10,47,92,0.72)' }}>
              Менеджер закрыл сделку — делает выстрел по кораблю. Потопил — получает реальные деньги.
              Рост продаж до <strong style={{ color: '#d48a10' }}>+35%</strong> без изменения системы мотивации.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <a href="#тарифы" className="px-7 py-3.5 rounded-2xl font-russo text-base text-center transition-all"
                style={{ background: 'linear-gradient(135deg,#f0b820,#d06000)', color: '#3a1800', boxShadow: '0 4px 20px rgba(200,120,0,0.45)' }}>
                🚀 14 дней бесплатно
              </a>
              <a href="#как-работает" className="px-7 py-3.5 rounded-2xl font-bold text-base text-center transition-all"
                style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.3)', color: '#0b6dab', boxShadow: '0 2px 8px rgba(11,109,171,0.1)' }}>
                Как это работает →
              </a>
            </div>

            <div className="flex gap-8">
              {[
                { value: '+35%', label: 'рост продаж', color: '#0b6dab' },
                { value: '14 дней', label: 'бесплатно', color: '#d48a10' },
                { value: '5 мин', label: 'настройка', color: '#00998c' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="font-russo text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: 'rgba(10,47,92,0.5)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(11,109,171,0.15), transparent)', filter: 'blur(15px)' }} />
            <GameDemo />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
              style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.25)', color: '#0b6dab', boxShadow: '0 2px 10px rgba(11,109,171,0.15)' }}>
              🎮 Живая демонстрация игры
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="как-работает" className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#0a2f5c' }}>
            Как работает <span style={{ color: '#0b6dab' }}>Морской Бой</span>
          </h2>
          <p className="text-base font-medium" style={{ color: 'rgba(10,47,92,0.6)' }}>
            От установки до первой выплаты бонуса — четыре шага
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.num}
              className="p-5 rounded-2xl transition-all hover:scale-[1.03]"
              style={{
                background: '#fff',
                border: '1.5px solid rgba(11,109,171,0.18)',
                boxShadow: '0 2px 8px rgba(11,109,171,0.08)',
              }}>
              <div className="font-russo text-5xl mb-2 leading-none" style={{ color: 'rgba(11,109,171,0.1)' }}>{step.num}</div>
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="font-russo text-sm mb-1.5" style={{ color: '#0a2f5c' }}>{step.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(10,47,92,0.6)' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#0a2f5c' }}>
            Всё что нужно для <span style={{ color: '#d48a10' }}>результата</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title}
              className="p-5 rounded-2xl transition-all cursor-default group"
              style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.15)', boxShadow: '0 2px 8px rgba(11,109,171,0.07)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,109,171,0.35)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(11,109,171,0.13)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,109,171,0.15)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(11,109,171,0.07)'; }}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="font-russo text-sm mb-2" style={{ color: '#0a2f5c' }}>{f.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(10,47,92,0.62)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="тарифы" className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-russo text-3xl md:text-4xl mb-3" style={{ color: '#0a2f5c' }}>Тарифы</h2>
          <p className="text-base font-medium" style={{ color: 'rgba(10,47,92,0.6)' }}>
            14 дней бесплатно на любом тарифе · Без ввода карты
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className="relative flex flex-col rounded-3xl p-6 transition-all hover:scale-[1.02]"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(145deg,#fff8e8,#ffffff)'
                  : '#ffffff',
                border: `1.5px solid ${plan.border}`,
                boxShadow: plan.highlight
                  ? `0 4px 30px ${plan.glow}, 0 2px 8px rgba(11,109,171,0.08)`
                  : '0 2px 8px rgba(11,109,171,0.08)',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
              }}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#f0b820,#d06000)', color: '#3a1800', boxShadow: '0 2px 8px rgba(200,100,0,0.4)' }}>
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <div className="font-russo text-xl" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="text-xs font-medium" style={{ color: 'rgba(10,47,92,0.55)' }}>{plan.description}</div>
                </div>
              </div>

              <div className="mb-5">
                <span className="font-russo text-4xl" style={{ color: '#0a2f5c' }}>{plan.price.toLocaleString()}₽</span>
                <span className="text-sm font-medium ml-1" style={{ color: 'rgba(10,47,92,0.5)' }}>/{plan.period}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2 mb-5">
                {plan.features.map(f => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 font-bold" style={{ color: f.ok ? '#14803c' : 'rgba(10,47,92,0.25)' }}>
                      {f.ok ? '✓' : '×'}
                    </span>
                    <span className="text-sm" style={{ color: f.ok ? 'rgba(10,47,92,0.82)' : 'rgba(10,47,92,0.32)' }}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3.5 rounded-2xl font-russo text-sm transition-all hover:scale-[1.02]"
                style={plan.highlight
                  ? { background: 'linear-gradient(135deg,#f0b820,#d06000)', color: '#3a1800', boxShadow: '0 3px 14px rgba(200,120,0,0.4)' }
                  : { background: 'linear-gradient(135deg,#1588cc,#0b6dab)', color: '#fff', boxShadow: '0 2px 10px rgba(11,109,171,0.35)' }}>
                {plan.highlight ? '🚀 Начать бесплатно' : 'Выбрать тариф'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl text-center max-w-lg mx-auto"
          style={{ background: 'rgba(20,128,60,0.07)', border: '1.5px solid rgba(20,128,60,0.2)' }}>
          <span className="text-sm font-bold" style={{ color: '#14803c' }}>
            🎁 При оплате за год — скидка 20%
          </span>
          <span className="text-sm ml-1" style={{ color: 'rgba(10,47,92,0.6)' }}>
            (экономия до 23 760₽)
          </span>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-russo text-3xl md:text-4xl" style={{ color: '#0a2f5c' }}>Частые вопросы</h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {FAQ.map((item, idx) => (
            <div key={idx}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{ background: '#fff', border: `1.5px solid ${openFaq===idx ? 'rgba(11,109,171,0.45)' : 'rgba(11,109,171,0.18)'}`, boxShadow: openFaq===idx ? '0 2px 12px rgba(11,109,171,0.12)' : '0 1px 4px rgba(11,109,171,0.07)' }}
              onClick={() => setOpenFaq(openFaq===idx ? null : idx)}>
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <span className="text-sm font-bold" style={{ color: openFaq===idx ? '#0b6dab' : '#0a2f5c' }}>{item.q}</span>
                <Icon name={openFaq===idx ? 'ChevronUp' : 'ChevronDown'} size={18}
                  style={{ color: openFaq===idx ? '#0b6dab' : 'rgba(10,47,92,0.4)', flexShrink: 0 }} />
              </div>
              {openFaq===idx && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(10,47,92,0.7)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-16 text-center max-w-3xl mx-auto">
        <div className="p-10 rounded-3xl"
          style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.25)', boxShadow: '0 4px 30px rgba(11,109,171,0.14)' }}>
          <div className="text-6xl mb-5" style={{ filter: 'drop-shadow(0 0 16px rgba(11,109,171,0.3))' }}>⚓</div>
          <h2 className="font-russo text-3xl md:text-4xl mb-4" style={{ color: '#0a2f5c' }}>
            Готовы поднять продажи<br />
            <span style={{ color: '#d48a10' }}>до нового уровня?</span>
          </h2>
          <p className="text-base mb-8 font-medium" style={{ color: 'rgba(10,47,92,0.65)' }}>
            Установите Морской Бой из маркетплейса Битрикс24 и начните бесплатно
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-2xl font-russo text-base transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#f0b820,#d06000)', color: '#3a1800', boxShadow: '0 4px 20px rgba(200,120,0,0.45)' }}>
              🚀 Установить бесплатно
            </button>
            <a href="/" className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02]"
              style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.3)', color: '#0b6dab', boxShadow: '0 2px 8px rgba(11,109,171,0.1)' }}>
              Открыть демо →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 py-6" style={{ borderTop: '1.5px solid rgba(11,109,171,0.15)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span style={{ color: '#0b6dab' }}>⚓</span>
            <span className="font-russo text-sm" style={{ color: '#0b6dab' }}>МОРСКОЙ БОЙ</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(10,47,92,0.4)' }}>· Геймификация продаж · 2026</span>
          </div>
          <div className="flex gap-6">
            {['Конфиденциальность','Оферта','Контакты'].map(item => (
              <a key={item} href="#" className="text-xs font-medium transition-colors"
                style={{ color: 'rgba(10,47,92,0.45)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0b6dab')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(10,47,92,0.45)')}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
