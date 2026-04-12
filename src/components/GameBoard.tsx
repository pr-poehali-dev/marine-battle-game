import { useState, useEffect, useRef, useCallback } from 'react';
import { Cell, COLS, ROWS, ShotRecord, Player, Ship, SHIP_PRIZES } from '@/types/game';
import Icon from '@/components/ui/icon';
import ShipSVG from '@/components/ShipSVG';

interface GameBoardProps {
  board: Cell[][];
  shots: ShotRecord[];
  players: Player[];
  selectedPlayer: Player | null;
  onSelectPlayer: (p: Player) => void;
  onFire: (row: number, col: number, saleInfo: string) => 'hit' | 'miss' | 'sunk' | undefined;
  lastExplosion: { row: number; col: number } | null;
  gameActive: boolean;
  ships?: Ship[];
}

interface Particle { id: number; dx: number; dy: number; color: string; size: number; delay: number; }
interface ShotEffect { type: 'miss' | 'hit' | 'sunk'; row: number; col: number; id: number; particles: Particle[]; }

function getShipInfo(ships: Ship[], row: number, col: number) {
  for (const ship of ships) {
    const idx = ship.cells.findIndex(c => c.row === row && c.col === col);
    if (idx === -1) continue;
    const isH = ship.cells.length < 2 || ship.cells[0].row === ship.cells[1].row;
    return { ship, idx, isH, total: ship.cells.length };
  }
  return null;
}

/* Получаем "голову" корабля (первую клетку) и его параметры */
function getShipHead(ship: Ship) {
  const isH = ship.cells.length < 2 || ship.cells[0].row === ship.cells[1].row;
  const head = ship.cells.reduce((a, b) =>
    isH ? (a.col < b.col ? a : b) : (a.row < b.row ? a : b)
  );
  return { head, isH };
}

/* ── Анимация промаха: вода разлетается ── */
function MissEffect({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t); }, [onDone]);
  const drops = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const rad = (angle * Math.PI) / 180;
    const dist = 18 + Math.random() * 14;
    return {
      dx: Math.cos(rad) * dist,
      dy: Math.sin(rad) * dist,
      delay: i * 35,
      size: 3 + Math.random() * 4,
    };
  });
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      {/* Central splash */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: '70%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,200,255,0.9) 0%, rgba(20,100,220,0.6) 60%, transparent 100%)',
          animation: 'water-splash 0.7s ease-out forwards',
        }} />
      </div>
      {/* Ripple rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          position: 'absolute', width: '60%', height: '60%',
          borderRadius: '50%', border: '2.5px solid rgba(24,136,220,0.9)',
          animation: 'miss-ripple-1 0.75s ease-out forwards',
        }} />
        <div style={{
          position: 'absolute', width: '60%', height: '60%',
          borderRadius: '50%', border: '1.5px solid rgba(64,180,255,0.6)',
          animation: 'miss-ripple-2 0.9s ease-out 0.12s forwards',
        }} />
      </div>
      {/* Water drops flying out */}
      {drops.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: `rgba(${80 + i * 10},${180 + i * 5},255,0.95)`,
          boxShadow: '0 0 3px rgba(64,200,255,0.8)',
          '--dx': `${d.dx}px`,
          '--dy': `${d.dy}px`,
          animation: `water-particle 0.7s ease-out ${d.delay}ms forwards`,
          transform: 'translate(-50%,-50%)',
        } as React.CSSProperties} />
      ))}
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: '30%', height: '30%', borderRadius: '50%',
          background: 'rgba(200,240,255,0.95)',
          boxShadow: '0 0 8px rgba(64,180,255,0.8)',
          animation: 'scaleIn 0.15s ease-out forwards',
        }} />
      </div>
    </div>
  );
}

/* ── Анимация попадания: взрыв на всё поле ── */
function HitEffect({ onDone, isSunk }: { onDone: () => void; isSunk?: boolean }) {
  useEffect(() => { const t = setTimeout(onDone, isSunk ? 1400 : 900); return () => clearTimeout(t); }, [onDone, isSunk]);

  const debris = Array.from({ length: isSunk ? 16 : 10 }, (_, i) => {
    const angle = (i / (isSunk ? 16 : 10)) * 360 + Math.random() * 20;
    const rad = (angle * Math.PI) / 180;
    const dist = (isSunk ? 35 : 22) + Math.random() * (isSunk ? 30 : 18);
    const colors = ['#ff6020','#ff3000','#ffaa20','#ff8800','#ffffff','#ffcc00'];
    return {
      dx: Math.cos(rad) * dist,
      dy: Math.sin(rad) * dist,
      color: colors[i % colors.length],
      size: 2 + Math.random() * (isSunk ? 6 : 4),
      delay: i * 30,
    };
  });

  return (
    <div className="pointer-events-none" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Massive glow overlay for sunk */}
      {isSunk && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,120,0,0.25) 0%, rgba(255,40,0,0.1) 40%, transparent 70%)',
          animation: 'explosion-glow 1.2s ease-out forwards',
        }} />
      )}
    </div>
  );
}

/* Локальный эффект взрыва в клетке */
function CellExplosion({ isSunk, onDone }: { isSunk?: boolean; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, isSunk ? 1400 : 900); return () => clearTimeout(t); }, [onDone, isSunk]);

  const count = isSunk ? 16 : 10;
  const debris = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 20;
    const rad = (angle * Math.PI) / 180;
    const dist = (isSunk ? 40 : 26) + Math.random() * (isSunk ? 30 : 16);
    const colors = ['#ff6020','#ff3000','#ffaa20','#ff8800','#ffffff','#ffcc40'];
    return {
      dx: Math.cos(rad) * dist,
      dy: Math.sin(rad) * dist,
      color: colors[i % colors.length],
      size: 2.5 + Math.random() * (isSunk ? 7 : 4),
      delay: i * 25,
    };
  });

  return (
    <div className="absolute pointer-events-none" style={{
      inset: isSunk ? '-200%' : '-100%',
      zIndex: 50,
    }}>
      {/* Core flash */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: isSunk ? '60%' : '50%',
          height: isSunk ? '60%' : '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(255,255,200,1) 0%,rgba(255,160,0,0.9) 40%,rgba(255,40,0,0.7) 70%,transparent 100%)',
          animation: `explosion-core ${isSunk ? '1.1' : '0.7'}s ease-out forwards`,
          boxShadow: isSunk ? '0 0 40px rgba(255,120,0,0.8), 0 0 80px rgba(255,60,0,0.4)' : '0 0 20px rgba(255,120,0,0.6)',
        }} />
      </div>
      {/* Explosion ring */}
      <div className="absolute" style={{ top:'50%', left:'50%' }}>
        <div style={{
          position:'absolute',
          width: isSunk ? '100px' : '60px',
          height: isSunk ? '100px' : '60px',
          borderRadius:'50%',
          border: `${isSunk ? 5 : 3}px solid rgba(255,140,0,0.9)`,
          animation: `explosion-ring ${isSunk ? '1.0' : '0.65'}s ease-out forwards`,
          boxShadow:'0 0 12px rgba(255,80,0,0.6)',
        }} />
        {isSunk && (
          <div style={{
            position:'absolute',
            width:'140px', height:'140px',
            borderRadius:'50%',
            border:'3px solid rgba(255,60,0,0.6)',
            animation:'explosion-ring 1.2s ease-out 0.1s forwards',
          }} />
        )}
      </div>
      {/* Debris particles */}
      {debris.map((d, i) => (
        <div key={i} style={{
          position:'absolute',
          top:'50%', left:'50%',
          width: d.size, height: d.size,
          borderRadius: i % 3 === 0 ? '2px' : '50%',
          background: d.color,
          boxShadow: `0 0 4px ${d.color}`,
          '--dx': `${d.dx}px`,
          '--dy': `${d.dy}px`,
          transform: 'translate(-50%,-50%)',
          animation: `explosion-debris ${isSunk ? 1.1 : 0.75}s ease-out ${d.delay}ms forwards`,
        } as React.CSSProperties} />
      ))}
      {/* Smoke */}
      {isSunk && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            width:'80%', height:'80%', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(80,60,40,0.7) 0%,rgba(60,50,30,0.3) 60%,transparent 100%)',
            animation:'explosion-glow 1.3s ease-out 0.3s forwards',
          }} />
        </div>
      )}
    </div>
  );
}

export default function GameBoard({
  board, shots, players, selectedPlayer, onSelectPlayer, onFire,
  lastExplosion, gameActive, ships = [],
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [saleInfo, setSaleInfo] = useState('');
  const [lastResult, setLastResult] = useState<{ result: string; bonus?: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeEffects, setActiveEffects] = useState<ShotEffect[]>([]);
  const [boardShake, setBoardShake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectIdRef = useRef(0);

  const addEffect = useCallback((type: 'miss' | 'hit' | 'sunk', row: number, col: number) => {
    const id = ++effectIdRef.current;
    const count = type === 'sunk' ? 16 : type === 'hit' ? 10 : 8;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360;
      const rad = (angle * Math.PI) / 180;
      const dist = 20 + Math.random() * 20;
      const colors = type === 'miss'
        ? ['#40ccff','#60d8ff','#80e8ff','#20b0ff']
        : ['#ff6020','#ff3000','#ffaa20','#ff8800','#fff','#ffcc00'];
      return {
        id: i, dx: Math.cos(rad) * dist, dy: Math.sin(rad) * dist,
        color: colors[i % colors.length],
        size: 2 + Math.random() * 4,
        delay: i * 30,
      };
    });
    setActiveEffects(prev => [...prev, { type, row, col, id, particles }]);
    if (type === 'hit' || type === 'sunk') {
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 500);
    }
  }, []);

  const removeEffect = useCallback((id: number) => {
    setActiveEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleFire = (row: number, col: number) => {
    if (!gameActive || !selectedPlayer) return;
    const cell = board[row][col];
    if (cell.state === 'hit' || cell.state === 'miss' || cell.state === 'sunk') return;
    if (!saleInfo.trim()) { alert('Укажите информацию о сделке!'); return; }
    const result = onFire(row, col, saleInfo);
    if (result) {
      const bonus = result === 'sunk' ? (shots[0]?.bonus ?? 0) : 0;
      setLastResult({ result, bonus });
      setShowResult(true);
      setSaleInfo('');
      addEffect(result === 'sunk' ? 'sunk' : result === 'hit' ? 'hit' : 'miss', row, col);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowResult(false), 3500);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* Рисуем корабль SVG поверх клеток — только для видимых (admin) кораблей */
  const renderedShipIds = new Set<string>();

  const renderCell = (cell: Cell, row: number, col: number) => {
    const isHovered  = hoveredCell?.row === row && hoveredCell?.col === col;
    const isExploding = lastExplosion?.row === row && lastExplosion?.col === col;
    const isMiss = cell.state === 'miss';
    const isHit  = cell.state === 'hit' || cell.state === 'sunk' || isExploding;

    const cellEffect = activeEffects.find(e => e.row === row && e.col === col);

    let cellClass = 'cell w-full aspect-square flex items-center justify-center relative overflow-visible';
    if (isHit)  cellClass += ' hit';
    else if (isMiss) cellClass += ' miss';

    return (
      <div
        key={col}
        className={`flex-1 mx-px ${cellClass}`}
        style={{ minWidth: 0 }}
        onMouseEnter={() => setHoveredCell({ row, col })}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={() => handleFire(row, col)}
      >
        {/* Hit fire emoji */}
        {isHit && !isExploding && (
          <span className="relative z-10" style={{ fontSize:'12px', filter:'drop-shadow(0 0 4px rgba(255,80,0,0.9))' }}>🔥</span>
        )}
        {/* Exploding */}
        {isExploding && (
          <span className="animate-scale-in z-10 relative" style={{ fontSize:'13px' }}>💥</span>
        )}
        {/* Miss marker */}
        {!isExploding && isMiss && !cellEffect && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div style={{
              width:'40%', height:'40%', borderRadius:'50%',
              background:'rgba(24,128,210,0.85)',
              boxShadow:'0 0 6px rgba(64,180,255,0.7)',
            }} />
          </div>
        )}
        {/* Hover crosshair */}
        {!isHit && !isMiss && isHovered && (
          <span style={{ fontSize:'12px', opacity:0.65, position:'relative', zIndex:5 }}>🎯</span>
        )}
        {/* MISS effect */}
        {cellEffect?.type === 'miss' && (
          <MissEffect onDone={() => removeEffect(cellEffect.id)} />
        )}
        {/* HIT / SUNK effect */}
        {(cellEffect?.type === 'hit' || cellEffect?.type === 'sunk') && (
          <CellExplosion
            isSunk={cellEffect.type === 'sunk'}
            onDone={() => removeEffect(cellEffect.id)}
          />
        )}
      </div>
    );
  };

  const resultMeta = {
    miss: { bg:'rgba(15,106,174,0.1)', border:'rgba(15,106,174,0.3)', color:'var(--sea-blue)', icon:'Droplets', msg:'Промах! Вода...' },
    hit:  { bg:'rgba(190,48,0,0.1)',   border:'rgba(190,48,0,0.3)',   color:'var(--hit-orange)', icon:'Flame', msg:'Попадание! Корабль горит! 🔥' },
    sunk: { bg:'rgba(160,90,0,0.12)',  border:'rgba(160,90,0,0.3)',   color:'var(--gold)',       icon:'Skull', msg:'💥 ПОТОПЛЕН! Бонус получен!' },
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-blue w-12 h-12 text-xl animate-float">🎯</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color:'var(--sea-navy)' }}>Игровое поле</h2>
          <p className="text-sm font-semibold" style={{ color:'var(--sea-text-dim)' }}>
            Закрой сделку — сделай выстрел. Потопи корабль — получи бонус
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: player select + deal input */}
        <div className="sea-card p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="icon-badge icon-badge-navy w-8 h-8"><Icon name="Users" size={15} /></div>
            <span className="font-russo text-sm" style={{ color:'var(--sea-navy)' }}>Выбери игрока</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
            {players.map(player => (
              <button key={player.id} onClick={() => onSelectPlayer(player)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left border ${
                  selectedPlayer?.id === player.id ? 'sea-card-selected' : 'border-transparent'
                }`}
                style={{
                  background: selectedPlayer?.id === player.id ? 'rgba(9,83,144,0.08)' : 'transparent',
                }}>
                {player.avatarUrl
                  ? <img src={player.avatarUrl} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                  : <span className="text-2xl leading-none flex-shrink-0">{player.avatar}</span>
                }
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: selectedPlayer?.id === player.id ? 'var(--sea-blue)' : 'var(--sea-text)' }}>
                    {player.name}
                  </div>
                  <div className="text-xs font-semibold" style={{ color:'var(--sea-text-dim)' }}>{player.department}</div>
                </div>
                {selectedPlayer?.id === player.id && (
                  <Icon name="CheckCircle2" size={16} style={{ color:'var(--sea-blue)', flexShrink:0 }} />
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:'var(--sea-text-sub)' }}>
              <Icon name="FileText" size={12} /> Информация о сделке
            </label>
            <textarea value={saleInfo} onChange={e => setSaleInfo(e.target.value)}
              placeholder="Название клиента, сумма..."
              rows={2}
              className="sea-input w-full px-3 py-2 text-sm resize-none"
            />
          </div>

          {selectedPlayer && (
            <div className="rounded-2xl p-3" style={{ background:'rgba(9,83,144,0.06)', border:'1.5px solid rgba(9,83,144,0.16)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'var(--sea-text-sub)' }}>
                Статистика игрока
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { iconName:'Crosshair', label:'Выстрелов', value:selectedPlayer.shotsTotal, badge:'icon-badge-blue' },
                  { iconName:'Flame',     label:'Попаданий',  value:selectedPlayer.hitsTotal,  badge:'icon-badge-red' },
                  { iconName:'Anchor',    label:'Потоплено',  value:selectedPlayer.shipsSunk,   badge:'icon-badge-navy' },
                  { iconName:'Banknote',  label:'Бонус',      value:`${selectedPlayer.bonusEarned.toLocaleString()}₽`, badge:'icon-badge-gold' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 p-2 rounded-xl"
                    style={{ background:'var(--sea-surface)', border:'1.5px solid rgba(9,83,144,0.14)' }}>
                    <div className={`icon-badge ${s.badge} w-7 h-7`}><Icon name={s.iconName} size={13} /></div>
                    <div>
                      <div className="font-russo text-sm leading-none" style={{ color:'var(--sea-text)' }}>{s.value}</div>
                      <div style={{ fontSize:'10px', color:'var(--sea-text-dim)', marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: grid */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Result notification */}
          {showResult && lastResult && (() => {
            const m = resultMeta[lastResult.result as keyof typeof resultMeta];
            return (
              <div className="p-3 rounded-2xl animate-scale-in flex items-center gap-3"
                style={{ background:m.bg, border:`1.5px solid ${m.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:m.bg, border:`1.5px solid ${m.border}` }}>
                  <Icon name={m.icon} size={18} style={{ color:m.color }} />
                </div>
                <div>
                  <div className="font-russo text-sm font-bold" style={{ color:m.color }}>{m.msg}</div>
                  {lastResult.result === 'sunk' && lastResult.bonus ? (
                    <div className="text-xs font-bold" style={{ color:'var(--gold)' }}>+{lastResult.bonus.toLocaleString()}₽ к бонусу!</div>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* Board */}
          <div className={`sea-card p-3 ${boardShake ? 'board-shake' : ''}`}>
            {/* Column headers */}
            <div className="flex mb-1">
              <div className="w-7 shrink-0" />
              {COLS.map(col => (
                <div key={col} className="flex-1 text-center font-russo"
                  style={{ fontSize:'10px', color:'var(--sea-text-dim)' }}>{col}</div>
              ))}
            </div>
            {/* Rows */}
            {board.map((row, ri) => (
              <div key={ri} className="flex mb-px">
                <div className="w-7 shrink-0 flex items-center justify-end pr-1 font-russo"
                  style={{ fontSize:'10px', color:'var(--sea-text-dim)' }}>{ROWS[ri]}</div>
                {row.map((cell, ci) => renderCell(cell, ri, ci))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label:'Пусто',      bg:'rgba(200,223,240,0.65)', border:'rgba(9,83,144,0.25)', content:<span style={{color:'rgba(9,83,144,0.3)',fontSize:'10px'}}>○</span> },
              { label:'Попадание',  bg:'rgba(190,48,0,0.28)',    border:'rgba(190,48,0,0.7)',  content:<span style={{fontSize:'11px'}}>🔥</span> },
              { label:'Промах',     bg:'rgba(15,106,174,0.3)',   border:'rgba(24,128,210,0.7)', content:<div style={{width:8,height:8,borderRadius:'50%',background:'rgba(24,128,210,0.9)'}} /> },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background:item.bg, border:`1.5px solid ${item.border}` }}>
                  {item.content}
                </div>
                <span className="text-xs font-bold" style={{ color:'var(--sea-text-sub)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ship prizes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { size:1 as const, emoji:'🚤', label:'1-палубный', badge:'icon-badge-teal' },
          { size:2 as const, emoji:'⛵', label:'2-палубный', badge:'icon-badge-blue' },
          { size:3 as const, emoji:'🛥️', label:'3-палубный', badge:'icon-badge-navy' },
          { size:4 as const, emoji:'🚢', label:'4-палубный', badge:'icon-badge-purple' },
        ].map(s => (
          <div key={s.size} className="sea-card p-3 flex items-center gap-3">
            {/* Mini ship preview */}
            <div style={{ width:44+s.size*8, height:36, flexShrink:0 }}>
              <ShipSVG size={s.size} style={{ width:'100%', height:'100%' }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color:'var(--sea-text-sub)' }}>{s.label}</div>
              <div className="font-russo text-sm" style={{ color:'var(--gold)', fontWeight:800 }}>+{SHIP_PRIZES[s.size].toLocaleString()}₽</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}