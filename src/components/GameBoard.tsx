import { useState } from 'react';
import { Cell, COLS, ROWS, ShotRecord } from '@/types/game';
import { Player } from '@/types/game';
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
    if (!saleInfo.trim()) {
      alert('Укажите информацию о сделке, чтобы сделать выстрел!');
      return;
    }
    const result = onFire(row, col, saleInfo);
    if (result) {
      const bonus = result === 'sunk' ? shots[0]?.bonus : 0;
      setLastResult({ result, bonus });
      setShowResult(true);
      setSaleInfo('');
      setTimeout(() => setShowResult(false), 3000);
    }
  };

  const getCellClass = (cell: Cell, row: number, col: number): string => {
    let base = 'cell w-full aspect-square flex items-center justify-center text-xs font-bold';
    if (lastExplosion?.row === row && lastExplosion?.col === col) base += ' scale-110';
    switch (cell.state) {
      case 'hit': return base + ' hit';
      case 'miss': return base + ' miss';
      case 'sunk': return base + ' hit';
      default:
        if (hoveredCell?.row === row && hoveredCell?.col === col) return base + ' cursor-pointer';
        return base;
    }
  };

  const getCellContent = (cell: Cell, row: number, col: number) => {
    if (lastExplosion?.row === row && lastExplosion?.col === col) {
      return <span className="text-lg animate-scale-in">💥</span>;
    }
    if (cell.state === 'hit' || cell.state === 'sunk') return <span className="text-base">🔥</span>;
    if (cell.state === 'miss') return <span style={{ color: 'rgba(150,200,220,0.5)', fontSize: '10px' }}>●</span>;
    if (hoveredCell?.row === row && hoveredCell?.col === col && cell.state === 'empty') {
      return <span className="text-lg opacity-70">🎯</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">🚢</span>
          <h2 className="font-russo text-2xl md:text-3xl glow-text" style={{ color: '#00d4ff' }}>
            ИГРОВОЕ ПОЛЕ
          </h2>
          <span className="text-3xl animate-float inline-block" style={{ animationDelay: '0.5s' }}>🎯</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Каждая продажа = один выстрел. Топи корабли — зарабатывай бонусы!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — player selection */}
        <div className="sea-card p-4 flex flex-col gap-3">
          <h3 className="font-russo text-sm uppercase tracking-wider" style={{ color: '#00d4ff' }}>
            👤 Выбери игрока
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedPlayer?.id === player.id ? 'border border-cyan-400/60' : 'border border-transparent hover:border-cyan-800/50'}`}
                style={{
                  background: selectedPlayer?.id === player.id
                    ? 'linear-gradient(135deg, rgba(0,150,200,0.25), rgba(0,80,150,0.2))'
                    : 'rgba(0,20,50,0.3)',
                  boxShadow: selectedPlayer?.id === player.id ? '0 0 15px rgba(0,200,255,0.15)' : 'none'
                }}
              >
                <span className="text-2xl">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: selectedPlayer?.id === player.id ? '#7ef4ff' : 'rgba(200,230,250,0.9)' }}>
                    {player.name}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(120,170,200,0.7)' }}>{player.department}</div>
                </div>
                {selectedPlayer?.id === player.id && (
                  <Icon name="Crosshair" size={16} className="text-cyan-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Sale input */}
          <div className="mt-2">
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'rgba(150,200,230,0.6)' }}>
              📋 Информация о сделке
            </label>
            <textarea
              value={saleInfo}
              onChange={e => setSaleInfo(e.target.value)}
              placeholder="Название клиента, сумма сделки..."
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-cyan-500/50"
              style={{
                background: 'rgba(0,30,70,0.6)',
                border: '1px solid rgba(0,150,200,0.3)',
                color: 'rgba(200,230,250,0.9)',
                fontFamily: 'Golos Text, sans-serif'
              }}
            />
          </div>

          {/* Stats for selected */}
          {selectedPlayer && (
            <div className="rounded-xl p-3 mt-1" style={{ background: 'rgba(0,20,50,0.5)', border: '1px solid rgba(0,100,150,0.3)' }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'rgba(150,200,230,0.6)' }}>Статистика</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Выстрелов', value: selectedPlayer.shotsTotal },
                  { label: 'Попаданий', value: selectedPlayer.hitsTotal },
                  { label: 'Потоплено', value: selectedPlayer.shipsSunk },
                  { label: 'Бонус', value: `${selectedPlayer.bonusEarned.toLocaleString()}₽` },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="font-russo text-lg" style={{ color: stat.label === 'Бонус' ? '#ffd700' : '#00d4ff' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'rgba(120,170,200,0.6)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center — game board */}
        <div className="lg:col-span-2">
          {/* Result notification */}
          {showResult && lastResult && (
            <div className={`mb-4 p-4 rounded-xl text-center font-russo text-lg animate-scale-in ${lastResult.result === 'miss' ? '' : ''}`}
              style={{
                background: lastResult.result === 'miss'
                  ? 'linear-gradient(135deg, rgba(40,80,120,0.8), rgba(20,50,90,0.8))'
                  : lastResult.result === 'sunk'
                    ? 'linear-gradient(135deg, rgba(200,100,0,0.8), rgba(150,50,0,0.8))'
                    : 'linear-gradient(135deg, rgba(200,80,0,0.8), rgba(150,30,0,0.8))',
                border: `1px solid ${lastResult.result === 'miss' ? 'rgba(100,160,200,0.4)' : 'rgba(255,120,0,0.6)'}`,
              }}>
              {lastResult.result === 'miss' && <span>💧 Промах! Вода...</span>}
              {lastResult.result === 'hit' && <span>🔥 Попадание! Корабль горит!</span>}
              {lastResult.result === 'sunk' && (
                <div>
                  <div>💥 ПОТОПЛЕН! Отличный выстрел!</div>
                  {lastResult.bonus ? <div className="text-base mt-1 gold-text">+{lastResult.bonus.toLocaleString()}₽ к зарплате!</div> : null}
                </div>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="sea-card p-4">
            {/* Column headers */}
            <div className="flex mb-1">
              <div className="w-7 shrink-0" />
              {COLS.map(col => (
                <div key={col} className="flex-1 text-center text-xs font-russo" style={{ color: 'rgba(0,180,220,0.6)' }}>{col}</div>
              ))}
            </div>

            {/* Rows */}
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex mb-1">
                <div className="w-7 shrink-0 text-xs font-russo flex items-center justify-end pr-1" style={{ color: 'rgba(0,180,220,0.6)' }}>
                  {ROWS[rowIdx]}
                </div>
                {row.map((cell, colIdx) => (
                  <div
                    key={colIdx}
                    className={`flex-1 mx-px ${getCellClass(cell, rowIdx, colIdx)}`}
                    style={{ minWidth: 0, minHeight: 0 }}
                    onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleFire(rowIdx, colIdx)}
                  >
                    {getCellContent(cell, rowIdx, colIdx)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap justify-center">
            {[
              { color: 'rgba(5,25,60,0.7)', border: 'rgba(0,180,220,0.25)', label: 'Пусто' },
              { color: 'rgba(255,80,0,0.7)', border: 'rgba(255,100,0,0.8)', label: 'Попадание 🔥' },
              { color: 'rgba(100,160,200,0.15)', border: 'rgba(100,160,200,0.4)', label: 'Промах' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded" style={{ background: item.color, border: `1px solid ${item.border}` }} />
                <span className="text-xs" style={{ color: 'rgba(150,200,230,0.7)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prizes info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { size: 1, prize: 1000, emoji: '🚤', label: '1-палубный' },
          { size: 2, prize: 2000, emoji: '⛵', label: '2-палубный' },
          { size: 3, prize: 3000, emoji: '🛥️', label: '3-палубный' },
          { size: 4, prize: 4000, emoji: '🚢', label: '4-палубный' },
        ].map(ship => (
          <div key={ship.size} className="sea-card p-3 text-center">
            <div className="text-2xl mb-1 animate-float inline-block" style={{ animationDelay: `${ship.size * 0.3}s` }}>
              {ship.emoji}
            </div>
            <div className="text-xs" style={{ color: 'rgba(150,200,230,0.7)' }}>{ship.label}</div>
            <div className="font-russo text-sm gold-text">+{ship.prize.toLocaleString()}₽</div>
          </div>
        ))}
      </div>
    </div>
  );
}
