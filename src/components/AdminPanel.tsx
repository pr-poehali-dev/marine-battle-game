import { useState, useCallback } from 'react';
import { Cell, Ship, COLS, ROWS, GRID_SIZE } from '@/types/game';
import Icon from '@/components/ui/icon';
import ShipSVG from '@/components/ShipSVG';

interface Admiral {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  createdAt: string;
}

interface AdminPanelProps {
  board: Cell[][];
  ships: Ship[];
  shots: { row: number; col: number; result: string }[];
  gameActive: boolean;
  onShipsChange: (ships: Ship[]) => void;
  onBoardChange: (board: Cell[][]) => void;
  onGameToggle: (active: boolean) => void;
  onReset: () => void;
}

const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col, state: 'empty' as const }))
  );

const MOCK_ADMIRALS: Admiral[] = [
  { id: 'a1', name: 'Иван Директоров', avatar: '🎖️', pin: '1234', createdAt: '01.04.2026' },
  { id: 'a2', name: 'Ольга Главная', avatar: '👑', pin: '5678', createdAt: '05.04.2026' },
];

const BONUS_PRESETS = [500, 1000, 2000, 3000, 5000, 10000, 15000, 20000];

export default function AdminPanel({ board, ships, shots, gameActive, onShipsChange, onBoardChange, onGameToggle, onReset }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<'ships' | 'admirals' | 'bonuses'>('ships');

  /* ── Ships state ── */
  const [selectedShipSize, setSelectedShipSize] = useState<1 | 2 | 3 | 4>(4);
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [hoveredCells, setHoveredCells] = useState<{ row: number; col: number }[]>([]);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [adminBoard, setAdminBoard] = useState<Cell[][]>(createEmptyBoard());
  const [adminShips, setAdminShips] = useState<Ship[]>([]);

  /* ── Custom prizes state ── */
  const [customPrizes, setCustomPrizes] = useState<Record<number, number>>({ 1: 1000, 2: 2000, 3: 3000, 4: 4000 });

  /* ── Admirals state ── */
  const [admirals, setAdmirals] = useState<Admiral[]>(MOCK_ADMIRALS);
  const [showAddAdmiral, setShowAddAdmiral] = useState(false);
  const [newAdmiral, setNewAdmiral] = useState({ name: '', pin: '', avatar: '🎖️' });

  /* ── Ship placement ── */
  const getPlacementCells = useCallback((row: number, col: number, size: number, orient: 'h' | 'v') => {
    const cells: { row: number; col: number }[] = [];
    for (let i = 0; i < size; i++) {
      cells.push({ row: orient === 'v' ? row + i : row, col: orient === 'h' ? col + i : col });
    }
    return cells;
  }, []);

  const isValidCell = useCallback((cells: { row: number; col: number }[], existingShips: Ship[]) => {
    for (const cell of cells) {
      if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) return false;
      for (const ship of existingShips) {
        for (const sc of ship.cells) {
          if (Math.abs(sc.row - cell.row) <= 1 && Math.abs(sc.col - cell.col) <= 1) return false;
        }
      }
    }
    return true;
  }, []);

  const handleMouseEnter = (row: number, col: number) => {
    const cells = getPlacementCells(row, col, selectedShipSize, orientation);
    setHoveredCells(cells);
    setIsValidPlacement(isValidCell(cells, adminShips));
  };

  const handlePlaceShip = (row: number, col: number) => {
    const cells = getPlacementCells(row, col, selectedShipSize, orientation);
    if (!isValidCell(cells, adminShips)) return;
    const newShip: Ship = {
      id: `ship_${Date.now()}`,
      size: selectedShipSize,
      hits: 0,
      sunk: false,
      cells,
      prize: customPrizes[selectedShipSize],
    };
    const newShips = [...adminShips, newShip];
    const newBoard = adminBoard.map(r => r.map(c => ({ ...c })));
    cells.forEach(({ row: r, col: c }) => { newBoard[r][c].state = 'ship'; newBoard[r][c].shipId = newShip.id; });
    setAdminShips(newShips);
    setAdminBoard(newBoard);
  };

  const handleRemoveShip = (shipId: string) => {
    const newShips = adminShips.filter(s => s.id !== shipId);
    const newBoard = createEmptyBoard();
    newShips.forEach(ship => {
      ship.cells.forEach(({ row, col }) => { newBoard[row][col].state = 'ship'; newBoard[row][col].shipId = ship.id; });
    });
    setAdminShips(newShips);
    setAdminBoard(newBoard);
  };

  const handleApply = () => {
    onShipsChange(adminShips);
    onBoardChange(adminBoard);
    alert('✅ Расположение кораблей применено!');
  };

  const handleReset = () => {
    setAdminShips([]);
    setAdminBoard(createEmptyBoard());
    onReset();
  };

  /* ── Admirals ── */
  const handleAddAdmiral = () => {
    if (!newAdmiral.name.trim() || newAdmiral.pin.length < 4) return;
    const admiral: Admiral = {
      id: `a${Date.now()}`,
      ...newAdmiral,
      name: newAdmiral.name.trim(),
      createdAt: new Date().toLocaleDateString('ru-RU'),
    };
    setAdmirals(prev => [...prev, admiral]);
    setNewAdmiral({ name: '', pin: '', avatar: '🎖️' });
    setShowAddAdmiral(false);
  };

  const handleRemoveAdmiral = (id: string) => {
    if (admirals.length <= 1) { alert('Должен быть хотя бы один адмирал'); return; }
    setAdmirals(prev => prev.filter(a => a.id !== id));
  };

  const shipCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  adminShips.forEach(s => { shipCounts[s.size]++; });
  const maxShips = { 1: 4, 2: 3, 3: 2, 4: 1 };

  const getCellStyle = (cell: Cell, row: number, col: number) => {
    const isHovered = hoveredCells.some(c => c.row === row && c.col === col);
    const shot = shots.find(s => s.row === row && s.col === col);
    const base = 'cell w-full aspect-square flex items-center justify-center text-xs relative overflow-visible';
    if (isHovered) return `${base} ${isValidPlacement ? 'place-hover' : 'place-hover-invalid'}`;
    if (cell.state === 'ship') return shot ? `${base} hit-admin` : base;
    if (shot?.result === 'miss') return `${base} miss`;
    return base;
  };

  const ADMIRAL_AVATARS = ['🎖️', '👑', '⚓', '🪖', '🛡️', '🚀', '🌟', '💎'];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-navy w-12 h-12 text-xl animate-float">⚓</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Панель адмирала</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>Расставь корабли, настрой бонусы и управляй адмиралами</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'ships' as const, label: '🚢 Расстановка', icon: 'Map' },
          { id: 'bonuses' as const, label: '💰 Бонусы за корабли', icon: 'DollarSign' },
          { id: 'admirals' as const, label: '⚓ Адмиралы', icon: 'Users' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeSection === s.id ? 'btn-sea' : 'btn-ghost'}`}
          >
            {s.label}
          </button>
        ))}

        {/* Game toggle */}
        <div className="ml-auto flex items-center gap-3 px-4 py-2 rounded-xl sea-card">
          <span className="text-sm font-semibold" style={{ color: 'var(--sea-navy)' }}>Игра</span>
          <button
            onClick={() => onGameToggle(!gameActive)}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: gameActive ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'rgba(180,190,210,0.4)', border: `1px solid ${gameActive ? 'rgba(22,163,74,.4)' : 'rgba(14,127,194,.2)'}` }}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-white shadow-sm ${gameActive ? 'left-6' : 'left-0.5'}`} />
          </button>
          <span className="text-xs font-bold" style={{ color: gameActive ? '#16a34a' : 'rgba(13,59,110,0.35)' }}>
            {gameActive ? 'ВКЛ' : 'ВЫКЛ'}
          </span>
        </div>
      </div>

      {/* ═══ SHIPS SECTION ═══ */}
      {activeSection === 'ships' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="sea-card p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2"><div className="icon-badge icon-badge-blue w-8 h-8"><Icon name="Ship" size={15} /></div><span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Выбор корабля</span></div>
            <div className="flex flex-col gap-2">
              {([4, 3, 2, 1] as const).map(size => {
                const count = shipCounts[size];
                const max = maxShips[size];
                const available = count < max;
                const isSelected = selectedShipSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => available && setSelectedShipSize(size)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${isSelected ? 'sea-card-selected' : 'border-transparent'} ${!available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-cyan-700/40'}`}
                    style={{ background: isSelected ? 'rgba(14,127,194,0.07)' : 'transparent' }}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: size }).map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-sm" style={{ background: isSelected ? 'rgba(14,127,194,0.75)' : 'rgba(30,111,168,0.55)', border: `1px solid ${isSelected ? 'rgba(14,127,194,0.6)' : 'rgba(14,127,194,0.35)'}` }} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: 'var(--sea-navy)' }}>{size}-палубный</div>
                      <div className="text-xs gold-text">+{customPrizes[size].toLocaleString()}₽</div>
                    </div>
                    <div className="text-xs font-bold" style={{ color: count >= max ? '#dc2626' : '#16a34a' }}>{count}/{max}</div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Ориентация</label>
              <div className="flex gap-2">
                {[{ key: 'h', label: '↔ Горизонтально' }, { key: 'v', label: '↕ Вертикально' }].map(opt => (
                  <button key={opt.key} onClick={() => setOrientation(opt.key as 'h' | 'v')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${orientation === opt.key ? 'btn-sea' : 'btn-ghost'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto pt-2 border-t" style={{ borderColor: 'rgba(14,127,194,0.12)' }}>
              <button onClick={handleApply} className="btn-gold w-full py-3 rounded-xl font-russo text-sm">
                ✅ Применить расстановку
              </button>
              <button onClick={handleReset} className="btn-danger w-full py-2.5 rounded-xl text-sm font-semibold">
                🗑️ Очистить поле
              </button>
            </div>
          </div>

          {/* Admin board */}
          <div className="lg:col-span-2">
            <div className="sea-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="icon-badge icon-badge-blue w-7 h-7"><Icon name="Eye" size={13} /></div>
                <span className="font-russo text-xs uppercase tracking-wider" style={{ color: 'var(--sea-blue)' }}>Карта адмирала — видны все корабли</span>
              </div>
              <div className="flex mb-1">
                <div className="w-7 shrink-0" />
                {COLS.map(col => (
                  <div key={col} className="flex-1 text-center text-xs font-russo" style={{ color: 'rgba(14,127,194,0.5)' }}>{col}</div>
                ))}
              </div>
              {adminBoard.map((row, ri) => (
                <div key={ri} className="flex mb-px">
                  <div className="w-7 shrink-0 text-xs font-russo flex items-center justify-end pr-1" style={{ color: 'rgba(14,127,194,0.5)' }}>{ROWS[ri]}</div>
                  {row.map((cell, ci) => (
                    <div
                      key={ci}
                      className={`flex-1 mx-px ${getCellStyle(cell, ri, ci)}`}
                      style={{ minWidth: 0 }}
                      onMouseEnter={() => handleMouseEnter(ri, ci)}
                      onMouseLeave={() => setHoveredCells([])}
                      onClick={() => handlePlaceShip(ri, ci)}
                    >
                      {(() => {
                        const shot = shots.find(s => s.row === ri && s.col === ci);
                        if (cell.state === 'ship' && shot) return <span className="text-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(255,100,30,0.8))' }}>🔥</span>;
                        if (cell.state === 'ship') {
                          const ship = adminShips.find(s => s.cells.some(c => c.row === ri && c.col === ci));
                          if (!ship) return null;
                          const isH = ship.cells.length < 2 || ship.cells[0].row === ship.cells[1].row;
                          // Only render SVG at the "head" cell (min col for H, min row for V)
                          const head = ship.cells.reduce((a, b) =>
                            isH ? (a.col < b.col ? a : b) : (a.row < b.row ? a : b)
                          );
                          if (head.row !== ri || head.col !== ci) return null;
                          // SVG covers entire ship — positioned absolutely relative to head cell
                          // Each cell is ~100%/GRID_SIZE wide — we use pixel approach via inline style
                          const shipLen = ship.cells.length;
                          return (
                            <div style={{
                              position: 'absolute',
                              top: 1, left: 1,
                              width: isH ? `calc(${shipLen * 100}% + ${(shipLen - 1) * 3}px)` : 'calc(100% - 2px)',
                              height: isH ? 'calc(100% - 2px)' : `calc(${shipLen * 100}% + ${(shipLen - 1) * 3}px)`,
                              zIndex: 5,
                              pointerEvents: 'none',
                            }}>
                              <ShipSVG
                                size={ship.size}
                                isVertical={!isH}
                                isHit={ship.hits > 0 && !ship.sunk}
                                isSunk={ship.sunk}
                                style={{ width: '100%', height: '100%' }}
                              />
                            </div>
                          );
                        }
                        if (shot?.result === 'miss') return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span style={{ fontSize: '13px', color: 'rgba(62,200,255,0.85)', fontWeight: 'bold' }}>●</span>
                          </div>
                        );
                        return null;
                      })()}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {adminShips.length > 0 && (
              <div className="sea-card p-4 mt-3">
                <div className="font-russo text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--sea-blue)' }}>
                  Расставлено: {adminShips.length} кораблей
                </div>
                <div className="flex flex-wrap gap-2">
                  {adminShips.map(ship => (
                    <div key={ship.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(14,127,194,0.07)', border: '1px solid rgba(14,127,194,0.2)' }}>
                      <span className="text-xs font-bold" style={{ color: 'var(--sea-blue)' }}>{ship.size}-пал.</span>
                      <span className="text-xs gold-text">+{ship.prize.toLocaleString()}₽</span>
                      <button onClick={() => handleRemoveShip(ship.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Icon name="X" size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BONUSES SECTION ═══ */}
      {activeSection === 'bonuses' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="sea-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-russo text-base" style={{ color: 'var(--sea-navy)' }}>Настройка бонусов за потопленные корабли</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(13,59,110,0.5)' }}>Изменения применяются к новым расстановкам кораблей</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map(size => {
                const shipEmojis = { 1: '🚤', 2: '⛵', 3: '🛥️', 4: '🚢' };
                return (
                  <div key={size} className="p-4 rounded-2xl" style={{ background: 'rgba(14,127,194,0.04)', border: '1px solid rgba(14,127,194,0.15)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{shipEmojis[size]}</span>
                      <div>
                        <div className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>{size}-палубный корабль</div>
                        <div className="text-xs" style={{ color: 'rgba(13,59,110,0.45)' }}>При потоплении</div>
                      </div>
                    </div>

                    {/* Preset buttons */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {BONUS_PRESETS.map(preset => (
                        <button
                          key={preset}
                          onClick={() => setCustomPrizes(p => ({ ...p, [size]: preset }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${customPrizes[size] === preset ? 'btn-gold' : 'btn-ghost'}`}
                        >
                          {preset >= 1000 ? `${preset / 1000}к` : preset}₽
                        </button>
                      ))}
                    </div>

                    {/* Custom input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={customPrizes[size]}
                          onChange={e => setCustomPrizes(p => ({ ...p, [size]: Math.max(0, Number(e.target.value)) }))}
                          className="sea-input w-full px-3 py-2 text-sm pr-8"
                          placeholder="Своя сумма..."
                          min="0"
                          step="500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(13,59,110,0.4)' }}>₽</span>
                      </div>
                      <div className="text-sm font-russo gold-text whitespace-nowrap">
                        = {customPrizes[size].toLocaleString()}₽
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-2xl flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(240,253,244,0.8),rgba(220,252,231,0.5))', border: '1px solid rgba(22,163,74,0.2)' }}>
              <div className="icon-badge icon-badge-green w-12 h-12 flex-shrink-0">
                <Icon name="Banknote" size={22} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#15803d' }}>Максимальный банк за партию</div>
                <div className="font-russo text-xl gold-text">
                  {(customPrizes[4] * 1 + customPrizes[3] * 2 + customPrizes[2] * 3 + customPrizes[1] * 4).toLocaleString()}₽
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(21,128,61,0.55)' }}>
                  Если потопить все корабли (10 штук)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADMIRALS SECTION ═══ */}
      {activeSection === 'admirals' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2"><div className="icon-badge icon-badge-navy w-8 h-8"><Icon name="Shield" size={15} /></div><span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Управление адмиралами</span></div>
              <div className="text-xs mt-1" style={{ color: 'rgba(13,59,110,0.5)' }}>Адмиралы имеют доступ к расстановке кораблей и настройкам игры</div>
            </div>
            <button onClick={() => setShowAddAdmiral(!showAddAdmiral)} className="btn-gold px-4 py-2.5 rounded-xl text-sm font-russo flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Добавить адмирала
            </button>
          </div>

          {/* Add form */}
          {showAddAdmiral && (
            <div className="sea-card p-5 animate-scale-in" style={{ border: '1px solid rgba(14,127,194,0.25)' }}>
              <div className="flex items-center gap-2 mb-4"><div className="icon-badge icon-badge-blue w-8 h-8"><Icon name="UserPlus" size={15} /></div><span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Новый адмирал</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Имя и фамилия</label>
                  <input
                    value={newAdmiral.name}
                    onChange={e => setNewAdmiral(a => ({ ...a, name: e.target.value }))}
                    placeholder="Иван Петров"
                    className="sea-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(13,59,110,0.45)' }}>PIN-код доступа (4+ цифр)</label>
                  <input
                    value={newAdmiral.pin}
                    onChange={e => setNewAdmiral(a => ({ ...a, pin: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                    placeholder="1234"
                    type="password"
                    className="sea-input w-full px-3 py-2.5 text-sm"
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Значок</label>
                <div className="flex gap-2">
                  {ADMIRAL_AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setNewAdmiral(a => ({ ...a, avatar: av }))}
                      className={`text-2xl p-2 rounded-xl transition-all ${newAdmiral.avatar === av ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}
                      style={{ background: newAdmiral.avatar === av ? 'rgba(14,127,194,0.12)' : 'rgba(14,127,194,0.04)', border: `1px solid ${newAdmiral.avatar === av ? 'rgba(14,127,194,0.4)' : 'rgba(14,127,194,0.1)'}` }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleAddAdmiral} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-russo">
                  ✅ Добавить
                </button>
                <button onClick={() => setShowAddAdmiral(false)} className="btn-ghost px-6 py-2.5 rounded-xl text-sm font-semibold">
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Admirals list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admirals.map((admiral, idx) => (
              <div key={admiral.id} className="sea-card p-4 flex items-start gap-3 transition-all hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${idx * 0.08}s` }}>
                <div className="relative">
                  <div className="icon-badge icon-badge-navy w-14 h-14 text-3xl">{admiral.avatar}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: '#16a34a' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>{admiral.name}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(13,59,110,0.45)' }}>
                    <Icon name="Calendar" size={11} /> Добавлен: {admiral.createdAt}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-lg inline-flex"
                    style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
                    <Icon name="KeyRound" size={12} style={{ color: 'var(--gold-dark)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--gold-dark)' }}>PIN: {'•'.repeat(admiral.pin.length)}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveAdmiral(admiral.id)}
                  className="p-1.5 rounded-xl transition-all hover:bg-red-50"
                  style={{ color: 'rgba(220,38,38,0.4)' }}>
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Info block */}
          <div className="sea-card p-4 flex items-start gap-3" style={{ border: '1px solid rgba(14,127,194,0.18)', background: 'linear-gradient(135deg,rgba(239,246,255,0.8),rgba(255,255,255,0.6))' }}>
            <div className="icon-badge icon-badge-blue w-9 h-9 flex-shrink-0 mt-0.5"><Icon name="Info" size={16} /></div>
            <div className="text-sm" style={{ color: 'rgba(13,59,110,0.7)' }}>
              Адмирал — это роль с правом расставлять корабли, менять бонусы и управлять игрой. При входе в режим адмирала можно будет вводить PIN для авторизации. Это защитит настройки от случайных изменений игроками.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}