import { useState, useEffect, useRef } from 'react';
import { Cell, COLS, ROWS, ShotRecord, Player, Ship, SHIP_PRIZES } from '@/types/game';
import Icon from '@/components/ui/icon';

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

/* Определяем, к какому кораблю принадлежит клетка и её позицию в нём */
function getShipInfo(ships: Ship[], row: number, col: number) {
  for (const ship of ships) {
    const idx = ship.cells.findIndex(c => c.row === row && c.col === col);
    if (idx === -1) continue;
    const isH = ship.cells.length < 2 || ship.cells[0].row === ship.cells[1].row;
    return { ship, idx, isH, total: ship.cells.length };
  }
  return null;
}

/* Иконка корабля по размеру */
const SHIP_ICONS: Record<number, string> = { 1: '🚤', 2: '⛵', 3: '🛥️', 4: '🚢' };

/* Всплеск промаха */
function MissSplash() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div style={{
        fontSize: '14px', lineHeight: 1,
        filter: 'drop-shadow(0 0 4px rgba(30,140,220,0.9))',
      }}>💧</div>
      <div className="miss-ripple absolute" />
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
  const [newMissCells, setNewMissCells] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (result === 'miss') {
        const key = `${row}-${col}`;
        setNewMissCells(prev => new Set(prev).add(key));
        setTimeout(() => setNewMissCells(prev => { const s = new Set(prev); s.delete(key); return s; }), 1000);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowResult(false), 3200);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* Рисуем клетку поля */
  const renderCell = (cell: Cell, row: number, col: number) => {
    const isHovered  = hoveredCell?.row === row && hoveredCell?.col === col;
    const isExploding = lastExplosion?.row === row && lastExplosion?.col === col;
    const isMiss = cell.state === 'miss';
    const isHit  = cell.state === 'hit' || cell.state === 'sunk' || isExploding;
    const key    = `${row}-${col}`;
    const isNewMiss = newMissCells.has(key);

    let cellClass = 'cell w-full aspect-square flex items-center justify-center relative overflow-hidden';
    if (isHit)    cellClass += ' hit';
    else if (isMiss) cellClass += ' miss';

    /* Корабль (только в режиме игры — не показываем игроку) */
    const shipInfo = getShipInfo(ships, row, col);
    const isShipCell = shipInfo !== null;

    return (
      <div
        key={col}
        className={`flex-1 mx-px ${cellClass}`}
        style={{ minWidth: 0 }}
        onMouseEnter={() => setHoveredCell({ row, col })}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={() => handleFire(row, col)}
      >
        {/* Explosion */}
        {isExploding && <span className="text-base animate-scale-in z-10 relative">💥</span>}

        {/* Hit state */}
        {!isExploding && isHit && (
          <span className="text-sm z-10 relative" style={{ filter: 'drop-shadow(0 0 4px rgba(255,100,30,0.8))' }}>🔥</span>
        )}

        {/* Miss state — яркий всплеск */}
        {!isExploding && isMiss && (isNewMiss ? <MissSplash /> : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span style={{ fontSize: '13px', color: 'rgba(30,140,220,0.85)', fontWeight: 'bold' }}>●</span>
          </div>
        ))}

        {/* Hover crosshair */}
        {!isHit && !isMiss && isHovered && (
          <span style={{ fontSize: '13px', opacity: 0.6, position: 'relative', zIndex: 5 }}>🎯</span>
        )}
      </div>
    );
  };

  const resultMeta = {
    miss: { bg: 'rgba(18,118,184,0.1)', border: 'rgba(18,118,184,0.3)',  color: 'var(--sea-blue)', icon: 'Droplets', msg: 'Промах! Мимо...' },
    hit:  { bg: 'rgba(200,52,0,0.1)',   border: 'rgba(200,52,0,0.3)',    color: 'var(--hit-orange)', icon: 'Flame',   msg: 'Попадание! Корабль горит!' },
    sunk: { bg: 'rgba(180,100,0,0.1)',  border: 'rgba(180,100,0,0.3)',   color: 'var(--gold)',       icon: 'Skull',   msg: 'ПОТОПЛЕН!' },
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-blue w-12 h-12 text-xl animate-float">🎯</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Игровое поле</h2>
          <p className="text-sm font-medium" style={{ color: 'var(--sea-text-dim)' }}>
            Закрой сделку — сделай выстрел. Потопи корабль — получи бонус
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="sea-card p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="icon-badge icon-badge-navy w-8 h-8"><Icon name="Users" size={15} /></div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Выбери игрока</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
            {players.map(player => (
              <button key={player.id} onClick={() => onSelectPlayer(player)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left border ${selectedPlayer?.id === player.id ? 'sea-card-selected bg-blue-50/60' : 'border-transparent hover:bg-blue-50/40'}`}>
                <span className="text-2xl leading-none">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: selectedPlayer?.id === player.id ? 'var(--sea-blue)' : 'var(--sea-text)' }}>
                    {player.name}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--sea-text-dim)' }}>{player.department}</div>
                </div>
                {selectedPlayer?.id === player.id && (
                  <Icon name="CheckCircle2" size={16} style={{ color: 'var(--sea-blue)', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--sea-text-dim)' }}>
              <Icon name="FileText" size={12} /> Сделка
            </label>
            <textarea value={saleInfo} onChange={e => setSaleInfo(e.target.value)}
              placeholder="Название клиента, сумма..."
              rows={2}
              className="sea-input w-full px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Player stats */}
          {selectedPlayer && (
            <div className="rounded-2xl p-3" style={{ background: 'rgba(10,93,150,0.05)', border: '1.5px solid rgba(10,93,150,0.12)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--sea-text-dim)' }}>
                <Icon name="Activity" size={12} /> Статистика
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { iconName: 'Crosshair', label: 'Выстрелов', value: selectedPlayer.shotsTotal, badge: 'icon-badge-blue' },
                  { iconName: 'Flame',     label: 'Попаданий',  value: selectedPlayer.hitsTotal,  badge: 'icon-badge-red' },
                  { iconName: 'Anchor',    label: 'Потоплено',  value: selectedPlayer.shipsSunk,   badge: 'icon-badge-navy' },
                  { iconName: 'Banknote',  label: 'Бонус', value: `${selectedPlayer.bonusEarned.toLocaleString()}₽`, badge: 'icon-badge-gold' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 p-2 rounded-xl"
                    style={{ background: 'var(--sea-surface)', border: '1.5px solid rgba(10,93,150,0.1)' }}>
                    <div className={`icon-badge ${s.badge} w-7 h-7`}><Icon name={s.iconName} size={13} /></div>
                    <div>
                      <div className="font-russo text-sm leading-none" style={{ color: 'var(--sea-text)' }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--sea-text-dim)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — grid */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Result notification */}
          {showResult && lastResult && (() => {
            const m = resultMeta[lastResult.result as keyof typeof resultMeta];
            return (
              <div className="p-3 rounded-2xl animate-scale-in flex items-center gap-3"
                style={{ background: m.bg, border: `1.5px solid ${m.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m.bg, border: `1.5px solid ${m.border}` }}>
                  <Icon name={m.icon} size={18} style={{ color: m.color }} />
                </div>
                <div>
                  <div className="font-russo text-sm" style={{ color: m.color }}>{m.msg}</div>
                  {lastResult.result === 'sunk' && lastResult.bonus ? (
                    <div className="text-xs font-bold gold-text">+{lastResult.bonus.toLocaleString()}₽ к бонусу!</div>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* Grid */}
          <div className="sea-card p-4">
            <div className="flex mb-1">
              <div className="w-7 shrink-0" />
              {COLS.map(col => (
                <div key={col} className="flex-1 text-center font-russo"
                  style={{ fontSize: '10px', color: 'var(--sea-text-dim)' }}>{col}</div>
              ))}
            </div>
            {board.map((row, ri) => (
              <div key={ri} className="flex mb-px">
                <div className="w-7 shrink-0 flex items-center justify-end pr-1 font-russo"
                  style={{ fontSize: '10px', color: 'var(--sea-text-dim)' }}>{ROWS[ri]}</div>
                {row.map((cell, ci) => renderCell(cell, ri, ci))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { content: '○', style: { color: 'rgba(10,93,150,0.3)' }, label: 'Пусто', bg: 'rgba(212,232,245,0.6)', border: 'rgba(10,93,150,0.2)' },
              { content: '🔥', style: {}, label: 'Попадание', bg: 'rgba(200,52,0,0.25)', border: 'rgba(200,52,0,0.6)' },
              { content: '💧', style: {}, label: 'Промах', bg: 'rgba(18,118,184,0.2)', border: 'rgba(18,118,184,0.55)' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{ background: item.bg, border: `1.5px solid ${item.border}` }}>
                  <span style={item.style}>{item.content}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ship prizes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { size: 1, emoji: '🚤', label: '1-палубный', badge: 'icon-badge-teal' },
          { size: 2, emoji: '⛵', label: '2-палубный', badge: 'icon-badge-blue' },
          { size: 3, emoji: '🛥️', label: '3-палубный', badge: 'icon-badge-navy' },
          { size: 4, emoji: '🚢', label: '4-палубный', badge: 'icon-badge-purple' },
        ].map(s => (
          <div key={s.size} className="sea-card p-3 flex items-center gap-3">
            <div className={`icon-badge ${s.badge} w-11 h-11 text-2xl flex-shrink-0`}>{s.emoji}</div>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>{s.label}</div>
              <div className="font-russo text-sm gold-text">+{SHIP_PRIZES[s.size].toLocaleString()}₽</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
