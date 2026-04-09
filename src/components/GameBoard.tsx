import { useState } from 'react';
import { Cell, COLS, ROWS, ShotRecord, Player, SHIP_PRIZES } from '@/types/game';
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
}

export default function GameBoard({
  board, shots, players, selectedPlayer, onSelectPlayer, onFire, lastExplosion, gameActive
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [saleInfo, setSaleInfo] = useState('');
  const [lastResult, setLastResult] = useState<{ result: string; bonus?: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

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
      setTimeout(() => setShowResult(false), 3000);
    }
  };

  const getCellClass = (cell: Cell, row: number, col: number) => {
    const base = 'cell w-full aspect-square flex items-center justify-center text-xs font-bold';
    if (lastExplosion?.row === row && lastExplosion?.col === col) return base + ' hit';
    switch (cell.state) {
      case 'hit':  case 'sunk': return base + ' hit';
      case 'miss': return base + ' miss';
      default:     return base;
    }
  };

  const getCellContent = (cell: Cell, row: number, col: number) => {
    if (lastExplosion?.row === row && lastExplosion?.col === col)
      return <span className="text-base animate-scale-in">💥</span>;
    if (cell.state === 'hit' || cell.state === 'sunk') return <span className="text-sm">🔥</span>;
    if (cell.state === 'miss')
      return <span style={{ color: 'rgba(14,127,194,0.35)', fontSize: '10px' }}>●</span>;
    if (hoveredCell?.row === row && hoveredCell?.col === col && cell.state === 'empty')
      return <span style={{ fontSize: '13px', opacity: 0.55 }}>🎯</span>;
    return null;
  };

  const resultMeta = {
    miss: { bg: 'rgba(14,127,194,0.07)', border: 'rgba(14,127,194,0.2)', color: '#0e7fc2', icon: 'Droplets', msg: 'Промах! Мимо...' },
    hit:  { bg: 'rgba(240,82,40,0.08)',  border: 'rgba(240,82,40,0.22)',  color: '#c0391e', icon: 'Flame',    msg: 'Попадание! Горит!' },
    sunk: { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.28)', color: '#b45309', icon: 'Skull',    msg: 'ПОТОПЛЕН!' },
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-blue w-12 h-12 text-xl animate-float">🎯</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Игровое поле</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>
            Закрой сделку — сделай выстрел. Потопи корабль — получи бонус
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="sea-card p-4 flex flex-col gap-4">

          {/* Player select */}
          <div className="flex items-center gap-2 mb-1">
            <div className="icon-badge icon-badge-navy w-8 h-8">
              <Icon name="Users" size={15} />
            </div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Выбери игрока</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
            {players.map(player => (
              <button key={player.id} onClick={() => onSelectPlayer(player)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left border ${selectedPlayer?.id === player.id ? 'sea-card-selected' : 'border-transparent hover:bg-blue-50/80'}`}
                style={{ background: selectedPlayer?.id === player.id ? 'rgba(14,127,194,0.05)' : 'transparent' }}>
                <span className="text-2xl leading-none">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate"
                    style={{ color: selectedPlayer?.id === player.id ? 'var(--sea-blue)' : 'var(--sea-navy)' }}>
                    {player.name}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(13,59,110,0.42)' }}>{player.department}</div>
                </div>
                {selectedPlayer?.id === player.id && (
                  <Icon name="CheckCircle2" size={16} style={{ color: 'var(--sea-blue)', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Sale input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(13,59,110,0.45)' }}>
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
            <div className="rounded-2xl p-3" style={{ background: 'rgba(14,127,194,0.04)', border: '1px solid rgba(14,127,194,0.1)' }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2.5"
                style={{ color: 'rgba(13,59,110,0.45)' }}>
                <Icon name="Activity" size={12} /> Статистика
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { iconName: 'Crosshair', label: 'Выстрелов', value: selectedPlayer.shotsTotal,    badge: 'icon-badge-blue' },
                  { iconName: 'Flame',     label: 'Попаданий',  value: selectedPlayer.hitsTotal,     badge: 'icon-badge-red' },
                  { iconName: 'Anchor',    label: 'Потоплено',  value: selectedPlayer.shipsSunk,      badge: 'icon-badge-navy' },
                  { iconName: 'Banknote',  label: 'Бонус',      value: `${selectedPlayer.bonusEarned.toLocaleString()}₽`, badge: 'icon-badge-gold' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 p-2 rounded-xl bg-white"
                    style={{ border: '1px solid rgba(14,127,194,0.1)' }}>
                    <div className={`icon-badge ${s.badge} w-7 h-7`}>
                      <Icon name={s.iconName} size={13} />
                    </div>
                    <div>
                      <div className="font-russo text-sm leading-none" style={{ color: 'var(--sea-navy)' }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(13,59,110,0.42)', marginTop: 2 }}>{s.label}</div>
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
                style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                <div className="icon-badge w-9 h-9 flex-shrink-0" style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 12 }}>
                  <Icon name={m.icon} size={18} style={{ color: m.color }} />
                </div>
                <div>
                  <div className="font-russo text-sm" style={{ color: m.color }}>{m.msg}</div>
                  {lastResult.result === 'sunk' && lastResult.bonus ? (
                    <div className="text-xs gold-text">+{lastResult.bonus.toLocaleString()}₽ к бонусу!</div>
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
                  style={{ fontSize: '11px', color: 'rgba(14,127,194,0.5)' }}>{col}</div>
              ))}
            </div>
            {board.map((row, ri) => (
              <div key={ri} className="flex mb-px">
                <div className="w-7 shrink-0 flex items-center justify-end pr-1 font-russo"
                  style={{ fontSize: '11px', color: 'rgba(14,127,194,0.5)' }}>{ROWS[ri]}</div>
                {row.map((cell, ci) => (
                  <div key={ci}
                    className={`flex-1 mx-px ${getCellClass(cell, ri, ci)}`}
                    style={{ minWidth: 0 }}
                    onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleFire(ri, ci)}>
                    {getCellContent(cell, ri, ci)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { color: 'rgba(232,244,251,0.9)', border: 'rgba(14,127,194,0.22)', label: 'Пусто' },
              { color: 'rgba(240,82,40,0.7)',   border: 'rgba(240,82,40,0.5)',   label: '🔥 Попадание' },
              { color: 'rgba(14,127,194,0.08)', border: 'rgba(14,127,194,0.28)', label: '● Промах' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded" style={{ background: item.color, border: `1px solid ${item.border}` }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(13,59,110,0.5)' }}>{item.label}</span>
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
              <div className="text-xs font-medium" style={{ color: 'rgba(13,59,110,0.5)' }}>{s.label}</div>
              <div className="font-russo text-sm gold-text">+{SHIP_PRIZES[s.size].toLocaleString()}₽</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
