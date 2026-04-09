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

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/* ══════════════════════════════════════════
   ПОЛНАЯ ДЕМО-АНИМАЦИЯ ПРИЛОЖЕНИЯ
   Циклически показывает 4 экрана:
   1. Игровое поле — выстрел, попадание, бонус
   2. Таблица лидеров
   3. Панель адмирала (расстановка)
   4. История выстрелов
══════════════════════════════════════════ */
type AppScreen = 'game' | 'leaderboard' | 'admin' | 'history';

function AppDemo() {
  const [screen, setScreen] = useState<AppScreen>('game');
  const [gamePhase, setGamePhase] = useState<'idle'|'aim'|'hit'|'bonus'>('idle');
  const [showBonus, setShowBonus] = useState(false);
  const [adminPhase, setAdminPhase] = useState<'empty'|'ship1'|'ship2'|'done'>('empty');

  // Ships on 5×5 demo grid
  const COLS5 = ['А','Б','В','Г','Д'];
  const shipH = [{r:1,c:1},{r:1,c:2},{r:1,c:3}]; // 3-палубный горизонт
  const shipV = [{r:3,c:4},{r:4,c:4}];             // 2-палубный верт

  // Game board: miss at (0,3), hit at (2,3)
  const missCells = [{r:0,c:3}];
  const hitCells  = [{r:2,c:3}];
  const aimCell   = {r:2,c:2};

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        /* ── Экран 1: Игровое поле ── */
        setScreen('game'); setGamePhase('idle'); setShowBonus(false);
        await sleep(900);
        setGamePhase('aim');
        await sleep(800);
        setGamePhase('hit');
        await sleep(350);
        setShowBonus(true);
        await sleep(2200);
        setShowBonus(false); setGamePhase('idle');
        await sleep(600);

        /* ── Экран 2: Рейтинг ── */
        setScreen('leaderboard');
        await sleep(2800);

        /* ── Экран 3: Панель адмирала ── */
        setScreen('admin'); setAdminPhase('empty');
        await sleep(700);
        setAdminPhase('ship1');
        await sleep(700);
        setAdminPhase('ship2');
        await sleep(600);
        setAdminPhase('done');
        await sleep(1600);

        /* ── Экран 4: История ── */
        setScreen('history');
        await sleep(2600);
      }
    };
    const t = setTimeout(run, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const C = '#0a2f5c';
  const CDIM = 'rgba(10,47,92,0.5)';
  const cardStyle = {
    background: 'linear-gradient(145deg,#fff,#eef6fc)',
    border: '2px solid rgba(10,93,150,0.22)',
    boxShadow: '0 8px 40px rgba(10,93,150,0.18)',
    borderRadius: 24,
    padding: '16px',
    fontFamily: 'Golos Text,sans-serif',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: 340,
  };

  // Header bar always shown
  const Header = ({ tab }: { tab: string }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#b8d8f0,#88bce0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>⚓</div>
        <div>
          <div style={{ fontFamily:'Russo One,sans-serif', fontSize:13, color:C }}>Морской Бой</div>
          <div style={{ fontSize:10, color:CDIM }}>Геймификация продаж</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.35)', fontSize:10, fontWeight:700, color:'#0f6030' }}>
        <span style={{ width:6,height:6,borderRadius:'50%',background:'#16a34a',display:'inline-block' }} /> Идёт игра
      </div>
    </div>
  );

  // Nav tabs
  const tabs = [
    { id:'game',        icon:'🎯', label:'Поле' },
    { id:'leaderboard', icon:'🏆', label:'Рейтинг' },
    { id:'history',     icon:'📋', label:'История' },
    { id:'admin',       icon:'⚓', label:'Адмирал' },
  ];
  const Nav = () => (
    <div style={{ display:'flex', gap:4, marginBottom:12 }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display:'flex', alignItems:'center', gap:4,
          padding:'4px 8px', borderRadius:10, fontSize:10, fontWeight:700,
          background: screen===t.id ? 'rgba(10,93,150,0.14)' : 'transparent',
          border: screen===t.id ? '1.5px solid rgba(10,93,150,0.38)' : '1.5px solid transparent',
          color: screen===t.id ? '#0a5d96' : CDIM,
          cursor: 'default',
          transition: 'all 0.3s',
        }}>
          {t.icon} {t.label}
        </div>
      ))}
    </div>
  );

  /* ── GAME SCREEN ── */
  const GameScreen = () => {
    const COLS5L = ['А','Б','В','Г','Д'];
    return (
      <div>
        {/* Mini board 5×5 */}
        <div style={{ display:'flex', marginBottom:2 }}>
          <div style={{ width:18 }} />
          {COLS5L.map(c => <div key={c} style={{ flex:1, textAlign:'center', fontSize:9, color:CDIM, fontFamily:'Russo One,sans-serif' }}>{c}</div>)}
        </div>
        {Array.from({length:5},(_,ri) => (
          <div key={ri} style={{ display:'flex', marginBottom:2 }}>
            <div style={{ width:18, fontSize:9, color:CDIM, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:3, fontFamily:'Russo One,sans-serif' }}>{ri+1}</div>
            {Array.from({length:5},(_,ci) => {
              const isMiss    = missCells.some(c=>c.r===ri&&c.c===ci);
              const isHit2    = hitCells.some(c=>c.r===ri&&c.c===ci) && gamePhase!=='idle' && gamePhase!=='aim';
              const isAiming  = gamePhase==='aim' && ri===aimCell.r && ci===aimCell.c;
              const isNewHit  = gamePhase==='hit' && ri===aimCell.r && ci===aimCell.c;
              // ship 3-deck horizontal row 1: c=1,2,3
              const isShip3   = ri===1 && ci>=1 && ci<=3;
              const isShipSingle = ri===3 && ci===0;
              return (
                <div key={ci} style={{
                  flex:1, marginLeft:2,
                  aspectRatio:'1',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative', overflow:'hidden',
                  borderRadius:4,
                  border: isHit2||isNewHit ? '1.5px solid rgba(200,52,0,0.75)' : isMiss ? '1.5px solid rgba(18,118,184,0.65)' : isAiming ? '1.5px solid rgba(10,93,150,0.7)' : '1.5px solid rgba(10,93,150,0.2)',
                  background: isHit2||isNewHit ? 'linear-gradient(135deg,rgba(200,52,0,0.88),rgba(140,10,0,0.75))' : isMiss ? 'linear-gradient(135deg,rgba(18,118,184,0.28),rgba(10,80,160,0.18))' : isAiming ? 'rgba(10,93,150,0.16)' : isShip3||isShipSingle ? 'linear-gradient(160deg,rgba(18,118,184,0.9),rgba(7,46,100,0.85))' : 'rgba(212,232,245,0.6)',
                  transition: 'all 0.2s',
                  fontSize:11,
                }}>
                  {(isHit2||isNewHit) && <span style={{filter:'drop-shadow(0 0 3px rgba(255,100,30,0.8))'}}>🔥</span>}
                  {isMiss && <span style={{color:'rgba(18,118,184,0.85)',fontWeight:'bold',fontSize:10}}>●</span>}
                  {isAiming && <span>🎯</span>}
                  {!isHit2 && !isNewHit && !isMiss && !isAiming && isShip3 && (
                    <div style={{ position:'absolute', inset:2, background:'linear-gradient(160deg,rgba(32,144,224,0.9),rgba(12,60,140,0.85))', borderRadius: ci===1?'5px 2px 2px 5px': ci===3?'2px 5px 5px 2px':'2px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {ci===1 && <span style={{fontSize:8,opacity:0.9}}>◀</span>}
                      {ci===3 && <span style={{fontSize:8,opacity:0.9}}>▶</span>}
                    </div>
                  )}
                  {!isHit2 && !isNewHit && !isMiss && !isAiming && isShipSingle && (
                    <span style={{fontSize:10}}>🚤</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Bonus popup */}
        {showBonus && (
          <div style={{ position:'absolute', top:16, right:16, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', zIndex:10 }}>
            <div style={{ padding:'6px 12px', borderRadius:14, fontFamily:'Russo One,sans-serif', fontSize:13, background:'linear-gradient(135deg,#d88a14,#905000)', color:'#fff', boxShadow:'0 4px 14px rgba(180,100,0,0.45)', animation:'coin-pop 0.5s ease-out' }}>
              💰 +3 000₽
            </div>
            <div style={{ padding:'4px 10px', borderRadius:10, fontSize:11, fontWeight:700, background:'#fff', color:'#c01818', border:'1.5px solid rgba(200,52,0,0.35)', animation:'coin-pop 0.5s ease-out 0.12s both' }}>
              💥 Корабль потоплен!
            </div>
          </div>
        )}

        {/* Player bar */}
        <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:12, background:'rgba(10,93,150,0.06)', border:'1.5px solid rgba(10,93,150,0.12)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{fontSize:18}}>👨‍💼</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C}}>Алексей Петров</div>
              <div style={{fontSize:10,color:CDIM}}>ООО Максимум · 850 000₽</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{fontSize:10,color:CDIM}}>Бонус</div>
            <div style={{fontFamily:'Russo One,sans-serif',fontSize:13,color:'#b87000'}}>3 000₽</div>
          </div>
        </div>
      </div>
    );
  };

  /* ── LEADERBOARD SCREEN ── */
  const LeaderboardScreen = () => {
    const players = [
      { name:'Игорь Волков',   dept:'Розница',     bonus:5000, sunk:2, av:'🧑‍🎯' },
      { name:'Алексей Петров', dept:'Отдел продаж', bonus:3000, sunk:1, av:'👨‍💼' },
      { name:'Мария Сидорова', dept:'Отдел продаж', bonus:1000, sunk:1, av:'👩‍💼' },
      { name:'Елена Новикова', dept:'B2B',          bonus:0,    sunk:0, av:'👩‍🔬' },
    ];
    const medals = ['🥇','🥈','🥉',''];
    return (
      <div>
        {/* Top 3 mini podium */}
        <div style={{ display:'flex', gap:6, marginBottom:10, height:60 }}>
          {[players[1],players[0],players[2]].map((p,i) => {
            const ri = i===0?1:i===1?0:2;
            return (
              <div key={p.name} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', borderRadius:12, padding:'6px 4px', background:ri===0?'rgba(212,138,16,0.08)':'rgba(10,93,150,0.06)', border:`1.5px solid ${ri===0?'rgba(212,138,16,0.35)':'rgba(10,93,150,0.15)'}` }}>
                <span style={{fontSize:14}}>{medals[ri]}</span>
                <span style={{fontSize:16}}>{p.av}</span>
                <div style={{fontSize:9,fontWeight:700,color:ri===0?'#b87000':'#0a5d96'}}>{p.bonus.toLocaleString()}₽</div>
              </div>
            );
          })}
        </div>
        {/* Table */}
        {players.map((p,i) => (
          <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:10, marginBottom:4, background:i===0?'rgba(212,138,16,0.06)':'transparent', border:`1.5px solid ${i===0?'rgba(212,138,16,0.2)':'rgba(10,93,150,0.08)'}` }}>
            <span style={{fontSize:14}}>{medals[i]||<span style={{fontSize:11,color:CDIM}}>{i+1}</span>}</span>
            <span style={{fontSize:16}}>{p.av}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:C}}>{p.name}</div>
              <div style={{fontSize:9,color:CDIM}}>{p.dept}</div>
            </div>
            <div style={{fontFamily:'Russo One,sans-serif',fontSize:12,color:p.bonus>0?'#b87000':'rgba(10,47,92,0.35)'}}>
              {p.bonus>0?`+${p.bonus.toLocaleString()}₽`:'—'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ── ADMIN SCREEN ── */
  const AdminScreen = () => {
    const showShip1 = adminPhase==='ship1'||adminPhase==='ship2'||adminPhase==='done';
    const showShip2 = adminPhase==='ship2'||adminPhase==='done';
    const ship1 = [{r:1,c:0},{r:1,c:1},{r:1,c:2}];
    const ship2 = [{r:3,c:3},{r:3,c:4}];
    return (
      <div>
        <div style={{ fontSize:10, fontWeight:700, color:CDIM, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ padding:'2px 8px', borderRadius:8, background:'rgba(10,93,150,0.1)', border:'1px solid rgba(10,93,150,0.22)', color:'#0a5d96' }}>🗺️ Расстановка</span>
          <span style={{ color:'rgba(10,47,92,0.4)' }}>Кликните на поле чтобы поставить корабль</span>
        </div>
        <div style={{ display:'flex', marginBottom:2 }}>
          <div style={{ width:16 }} />
          {COLS5.map(c => <div key={c} style={{ flex:1, textAlign:'center', fontSize:9, color:CDIM, fontFamily:'Russo One,sans-serif' }}>{c}</div>)}
        </div>
        {Array.from({length:5},(_,ri) => (
          <div key={ri} style={{ display:'flex', marginBottom:2 }}>
            <div style={{ width:16, fontSize:9, color:CDIM, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:2, fontFamily:'Russo One,sans-serif' }}>{ri+1}</div>
            {Array.from({length:5},(_,ci) => {
              const isS1 = showShip1 && ship1.some(c=>c.r===ri&&c.c===ci);
              const isS2 = showShip2 && ship2.some(c=>c.r===ri&&c.c===ci);
              const sIdx1 = ship1.findIndex(c=>c.r===ri&&c.c===ci);
              const sIdx2 = ship2.findIndex(c=>c.r===ri&&c.c===ci);
              return (
                <div key={ci} style={{
                  flex:1, marginLeft:2, aspectRatio:'1', position:'relative', overflow:'hidden',
                  borderRadius:4,
                  border: isS1||isS2 ? '1.5px solid rgba(62,180,240,0.7)' : '1.5px solid rgba(10,93,150,0.18)',
                  background: isS1||isS2 ? 'linear-gradient(160deg,rgba(18,118,184,0.88),rgba(7,46,100,0.82))' : 'rgba(212,232,245,0.55)',
                  transition:'all 0.35s',
                  boxShadow: isS1||isS2 ? '0 1px 6px rgba(10,93,150,0.35)' : 'none',
                }}>
                  {isS1 && (
                    <div style={{ position:'absolute', inset:2, background:'linear-gradient(160deg,rgba(32,144,224,0.9),rgba(12,60,140,0.85))', borderRadius: sIdx1===0?'5px 2px 2px 5px':sIdx1===2?'2px 5px 5px 2px':'2px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sIdx1===0 && <span style={{fontSize:8,opacity:0.9}}>◀</span>}
                      {sIdx1===2 && <span style={{fontSize:8,opacity:0.9}}>▶</span>}
                    </div>
                  )}
                  {isS2 && (
                    <div style={{ position:'absolute', inset:2, background:'linear-gradient(160deg,rgba(32,144,224,0.9),rgba(12,60,140,0.85))', borderRadius: sIdx2===0?'5px 5px 2px 2px':'2px 2px 5px 5px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sIdx2===0 && <span style={{fontSize:8,opacity:0.9}}>▲</span>}
                      {sIdx2===1 && <span style={{fontSize:8,opacity:0.9}}>▼</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ marginTop:8, display:'flex', gap:6 }}>
          {showShip1 && <div style={{ padding:'3px 10px', borderRadius:8, background:'rgba(10,93,150,0.08)', border:'1.5px solid rgba(10,93,150,0.22)', fontSize:10, fontWeight:700, color:'#0a5d96' }}>🛥️ 3-пал. · +3000₽</div>}
          {showShip2 && <div style={{ padding:'3px 10px', borderRadius:8, background:'rgba(10,93,150,0.08)', border:'1.5px solid rgba(10,93,150,0.22)', fontSize:10, fontWeight:700, color:'#0a5d96' }}>⛵ 2-пал. · +2000₽</div>}
        </div>
      </div>
    );
  };

  /* ── HISTORY SCREEN ── */
  const HistoryScreen = () => {
    const rows = [
      { av:'🧑‍🎯', name:'Игорь Волков',   coord:'В6', res:'sunk', bonus:3000, deal:'ИП Кузнецов' },
      { av:'👨‍💼', name:'Алексей Петров', coord:'Д3', res:'sunk', bonus:3000, deal:'ООО Максимум' },
      { av:'👩‍💼', name:'Мария Сидорова', coord:'Б8', res:'hit',  bonus:0,    deal:'ИП Смирнов' },
      { av:'👨‍💻', name:'Дмитрий Козлов', coord:'И5', res:'miss', bonus:0,    deal:'ООО Техно' },
    ];
    return (
      <div>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {[{label:'Выстрелов',val:'24',c:'#0a5d96'},{label:'Потоплено',val:'6',c:'#c03400'},{label:'Выплачено',val:'16 000₽',c:'#b87000'}].map(s => (
            <div key={s.label} style={{ flex:1, padding:'6px 8px', borderRadius:10, background:'rgba(10,93,150,0.07)', border:'1.5px solid rgba(10,93,150,0.14)', textAlign:'center' }}>
              <div style={{ fontFamily:'Russo One,sans-serif', fontSize:14, color:s.c }}>{s.val}</div>
              <div style={{ fontSize:9, color:CDIM }}>{s.label}</div>
            </div>
          ))}
        </div>
        {rows.map((r,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:10, marginBottom:4, background:r.res==='sunk'?'rgba(212,138,16,0.05)':r.res==='hit'?'rgba(200,52,0,0.04)':'transparent', border:'1.5px solid rgba(10,93,150,0.08)' }}>
            <span style={{fontSize:16}}>{r.av}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:10,fontWeight:700,color:C}}>{r.name}</div>
              <div style={{fontSize:9,color:CDIM}}>{r.deal}</div>
            </div>
            <div style={{ fontFamily:'Russo One,sans-serif', fontSize:10, padding:'2px 7px', borderRadius:20, background:r.res==='sunk'?'linear-gradient(135deg,#d88a14,#905000)':r.res==='hit'?'linear-gradient(135deg,#d83030,#900000)':'rgba(18,118,184,0.12)', color:r.res==='sunk'?'#fff':r.res==='hit'?'#fff':'#0a5d96', border:r.res==='miss'?'1.5px solid rgba(18,118,184,0.5)':'none' }}>
              {r.res==='sunk'?'💥 Потоплен':r.res==='hit'?'🔥 Попадание':'💧 Промах'}
            </div>
            {r.bonus>0 && <div style={{fontFamily:'Russo One,sans-serif',fontSize:11,color:'#b87000',whiteSpace:'nowrap'}}>+{r.bonus.toLocaleString()}₽</div>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative select-none">
      <div style={cardStyle}>
        <Header tab={screen} />
        <Nav />
        <div style={{ transition:'opacity 0.3s', opacity:1 }}>
          {screen==='game'        && <GameScreen />}
          {screen==='leaderboard' && <LeaderboardScreen />}
          {screen==='admin'       && <AdminScreen />}
          {screen==='history'     && <HistoryScreen />}
        </div>
      </div>
    </div>
  );
}

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
            <AppDemo />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
              style={{ background: '#fff', border: '1.5px solid rgba(11,109,171,0.25)', color: '#0b6dab', boxShadow: '0 2px 10px rgba(11,109,171,0.15)' }}>
              🎮 Живая демонстрация приложения
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