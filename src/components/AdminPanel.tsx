import { useState, useCallback } from 'react';
import { Cell, Ship, COLS, ROWS, GRID_SIZE } from '@/types/game';
import Icon from '@/components/ui/icon';

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
    if (isHovered) return `cell w-full aspect-square flex items-center justify-center text-xs ${isValidPlacement ? 'place-hover' : 'place-hover-invalid'}`;
    if (cell.state === 'ship') return shot ? 'cell w-full aspect-square flex items-center justify-center text-xs hit-admin' : 'cell w-full aspect-square flex items-center justify-center text-xs ship-admin';
    if (shot?.result === 'miss') return 'cell w-full aspect-square flex items-center justify-center text-xs miss';
    return 'cell w-full aspect-square flex items-center justify-center text-xs';
  };

  const ADMIRAL_AVATARS = ['🎖️', '👑', '⚓', '🪖', '🛡️', '🚀', '🌟', '💎'];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">⚓</span>
          <h2 className="font-russo text-2xl md:text-3xl glow-text" style={{ color: '#00e5ff' }}>
            ПАНЕЛЬ АДМИРАЛА
          </h2>
          <span className="text-3xl">🗺️</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(140,200,230,0.7)' }}>
          Расставь корабли, настрой бонусы и управляй адмиралами
        </p>
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
          <span className="text-sm font-semibold" style={{ color: 'rgba(180,220,250,0.9)' }}>Игра</span>
          <button
            onClick={() => onGameToggle(!gameActive)}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: gameActive ? 'linear-gradient(90deg,#00c853,#00e676)' : 'rgba(80,80,100,0.5)', border: `1px solid ${gameActive ? 'rgba(0,230,120,.5)' : 'rgba(150,150,180,.3)'}` }}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-white shadow-md ${gameActive ? 'left-6' : 'left-0.5'}`} />
          </button>
          <span className="text-xs font-bold" style={{ color: gameActive ? '#00e676' : 'rgba(200,200,220,0.5)' }}>
            {gameActive ? 'ВКЛ' : 'ВЫКЛ'}
          </span>
        </div>
      </div>

      {/* ═══ SHIPS SECTION ═══ */}
      {activeSection === 'ships' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="sea-card p-4 flex flex-col gap-4">
            <h3 className="font-russo text-sm uppercase tracking-wider" style={{ color: '#00e5ff' }}>🚢 Выбор корабля</h3>
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
                    style={{ background: isSelected ? 'linear-gradient(135deg,rgba(0,170,230,0.22),rgba(0,80,170,0.18))' : 'rgba(0,15,45,0.45)' }}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: size }).map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-sm" style={{ background: isSelected ? 'rgba(0,200,255,0.8)' : 'rgba(20,96,180,0.8)', border: `1px solid ${isSelected ? 'rgba(0,229,255,0.7)' : 'rgba(0,160,220,0.5)'}` }} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: 'rgba(210,240,255,0.95)' }}>{size}-палубный</div>
                      <div className="text-xs gold-text">+{customPrizes[size].toLocaleString()}₽</div>
                    </div>
                    <div className="text-xs font-bold" style={{ color: count >= max ? 'rgba(255,100,100,.8)' : 'rgba(0,220,130,.8)' }}>{count}/{max}</div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: 'rgba(140,200,230,0.6)' }}>Ориентация</label>
              <div className="flex gap-2">
                {[{ key: 'h', label: '↔ Горизонтально' }, { key: 'v', label: '↕ Вертикально' }].map(opt => (
                  <button key={opt.key} onClick={() => setOrientation(opt.key as 'h' | 'v')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${orientation === opt.key ? 'btn-sea' : 'btn-ghost'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto pt-2 border-t" style={{ borderColor: 'rgba(0,120,180,0.2)' }}>
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
                <Icon name="Eye" size={14} style={{ color: '#00e5ff' }} />
                <span className="font-russo text-xs uppercase tracking-wider" style={{ color: '#00e5ff' }}>Карта адмирала — видны все корабли</span>
              </div>
              <div className="flex mb-1">
                <div className="w-7 shrink-0" />
                {COLS.map(col => (
                  <div key={col} className="flex-1 text-center text-xs font-russo" style={{ color: 'rgba(0,200,230,0.55)' }}>{col}</div>
                ))}
              </div>
              {adminBoard.map((row, ri) => (
                <div key={ri} className="flex mb-px">
                  <div className="w-7 shrink-0 text-xs font-russo flex items-center justify-end pr-1" style={{ color: 'rgba(0,200,230,0.55)' }}>{ROWS[ri]}</div>
                  {row.map((cell, ci) => (
                    <div
                      key={ci}
                      className={`flex-1 mx-px ${getCellStyle(cell, ri, ci)}`}
                      style={{ minWidth: 0 }}
                      onMouseEnter={() => handleMouseEnter(ri, ci)}
                      onMouseLeave={() => setHoveredCells([])}
                      onClick={() => handlePlaceShip(ri, ci)}
                    >
                      {cell.state === 'ship' && shots.find(s => s.row === ri && s.col === ci) ? <span className="text-sm">🔥</span> : null}
                      {cell.state === 'ship' && !shots.find(s => s.row === ri && s.col === ci) ? <span style={{ fontSize: '8px', color: 'rgba(80,180,240,0.8)' }}>■</span> : null}
                      {cell.state !== 'ship' && shots.find(s => s.row === ri && s.col === ci && s.result === 'miss') ? <span style={{ color: 'rgba(100,170,210,0.45)', fontSize: '10px' }}>●</span> : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {adminShips.length > 0 && (
              <div className="sea-card p-4 mt-3">
                <div className="font-russo text-xs mb-2 uppercase tracking-wider" style={{ color: '#00e5ff' }}>
                  Расставлено: {adminShips.length} кораблей
                </div>
                <div className="flex flex-wrap gap-2">
                  {adminShips.map(ship => (
                    <div key={ship.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(0,30,80,0.6)', border: '1px solid rgba(0,120,190,0.35)' }}>
                      <span className="text-xs font-bold" style={{ color: 'rgba(140,210,255,0.9)' }}>{ship.size}-пал.</span>
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
                <div className="font-russo text-base" style={{ color: '#00e5ff' }}>Настройка бонусов за потопленные корабли</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(140,200,230,0.6)' }}>Изменения применяются к новым расстановкам кораблей</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map(size => {
                const shipEmojis = { 1: '🚤', 2: '⛵', 3: '🛥️', 4: '🚢' };
                return (
                  <div key={size} className="p-4 rounded-2xl" style={{ background: 'rgba(0,20,55,0.6)', border: '1px solid rgba(0,130,190,0.3)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{shipEmojis[size]}</span>
                      <div>
                        <div className="font-russo text-sm" style={{ color: 'rgba(200,235,255,0.92)' }}>{size}-палубный корабль</div>
                        <div className="text-xs" style={{ color: 'rgba(120,180,220,0.6)' }}>При потоплении</div>
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
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(120,180,220,0.6)' }}>₽</span>
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
              style={{ background: 'linear-gradient(135deg,rgba(0,50,30,0.5),rgba(0,30,70,0.6))', border: '1px solid rgba(0,200,100,0.25)' }}>
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'rgba(180,240,200,0.9)' }}>Максимальный банк за партию</div>
                <div className="font-russo text-xl gold-text">
                  {(customPrizes[4] * 1 + customPrizes[3] * 2 + customPrizes[2] * 3 + customPrizes[1] * 4).toLocaleString()}₽
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(120,180,150,0.6)' }}>
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
              <div className="font-russo text-sm uppercase tracking-wider" style={{ color: '#00e5ff' }}>⚓ Управление адмиралами</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(140,200,230,0.6)' }}>Адмиралы имеют доступ к расстановке кораблей и настройкам игры</div>
            </div>
            <button onClick={() => setShowAddAdmiral(!showAddAdmiral)} className="btn-gold px-4 py-2.5 rounded-xl text-sm font-russo flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Добавить адмирала
            </button>
          </div>

          {/* Add form */}
          {showAddAdmiral && (
            <div className="sea-card p-5 animate-scale-in" style={{ border: '1px solid rgba(255,215,0,0.3)' }}>
              <div className="font-russo text-sm mb-4" style={{ color: '#ffd700' }}>⚓ Новый адмирал</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(140,200,230,0.6)' }}>Имя и фамилия</label>
                  <input
                    value={newAdmiral.name}
                    onChange={e => setNewAdmiral(a => ({ ...a, name: e.target.value }))}
                    placeholder="Иван Петров"
                    className="sea-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(140,200,230,0.6)' }}>PIN-код доступа (4+ цифр)</label>
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
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: 'rgba(140,200,230,0.6)' }}>Значок</label>
                <div className="flex gap-2">
                  {ADMIRAL_AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setNewAdmiral(a => ({ ...a, avatar: av }))}
                      className={`text-2xl p-2 rounded-xl transition-all ${newAdmiral.avatar === av ? 'scale-125' : 'opacity-60 hover:opacity-100'}`}
                      style={{ background: newAdmiral.avatar === av ? 'rgba(0,180,220,0.3)' : 'rgba(0,20,55,0.4)', border: `1px solid ${newAdmiral.avatar === av ? 'rgba(0,229,255,.6)' : 'transparent'}` }}
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
              <div key={admiral.id} className="sea-card p-4 flex items-start gap-3 transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${idx * 0.08}s`, border: '1px solid rgba(255,215,0,0.2)' }}>
                <div className="relative">
                  <span className="text-4xl">{admiral.avatar}</span>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full animate-pulse-glow"
                    style={{ background: 'rgba(0,229,255,0.9)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-russo text-sm" style={{ color: 'rgba(220,245,255,0.95)' }}>{admiral.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(100,170,210,0.6)' }}>Добавлен: {admiral.createdAt}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Icon name="KeyRound" size={12} style={{ color: 'rgba(255,215,0,0.7)' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,215,0,0.6)' }}>PIN: {'•'.repeat(admiral.pin.length)}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveAdmiral(admiral.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/20"
                  style={{ color: 'rgba(255,100,100,0.5)' }}>
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Info block */}
          <div className="sea-card p-4 flex items-start gap-3" style={{ border: '1px solid rgba(0,180,100,0.25)', background: 'linear-gradient(135deg,rgba(0,40,20,0.5),rgba(0,20,55,0.8))' }}>
            <Icon name="Info" size={18} style={{ color: 'rgba(0,220,130,0.8)', flexShrink: 0, marginTop: '2px' }} />
            <div className="text-sm" style={{ color: 'rgba(160,230,200,0.85)' }}>
              Адмирал — это роль с правом расставлять корабли, менять бонусы и управлять игрой. При входе в режим адмирала можно будет вводить PIN для авторизации. Это защитит настройки от случайных изменений игроками.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
