import { useState, useCallback } from 'react';
import { Cell, Ship, COLS, ROWS, GRID_SIZE, SHIP_PRIZES } from '@/types/game';
import Icon from '@/components/ui/icon';

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

export default function AdminPanel({ board, ships, shots, gameActive, onShipsChange, onBoardChange, onGameToggle, onReset }: AdminPanelProps) {
  const [selectedShipSize, setSelectedShipSize] = useState<1 | 2 | 3 | 4>(4);
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [hoveredCells, setHoveredCells] = useState<{ row: number; col: number }[]>([]);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [adminBoard, setAdminBoard] = useState<Cell[][]>(createEmptyBoard());
  const [adminShips, setAdminShips] = useState<Ship[]>([]);

  const getPlacementCells = useCallback((row: number, col: number, size: number, orient: 'h' | 'v') => {
    const cells: { row: number; col: number }[] = [];
    for (let i = 0; i < size; i++) {
      const r = orient === 'v' ? row + i : row;
      const c = orient === 'h' ? col + i : col;
      cells.push({ row: r, col: c });
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

  const handleMouseLeave = () => {
    setHoveredCells([]);
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
      prize: SHIP_PRIZES[selectedShipSize],
    };

    const newShips = [...adminShips, newShip];
    const newBoard = adminBoard.map(r => r.map(c => ({ ...c })));
    cells.forEach(({ row: r, col: c }) => {
      newBoard[r][c].state = 'ship';
      newBoard[r][c].shipId = newShip.id;
    });

    setAdminShips(newShips);
    setAdminBoard(newBoard);
  };

  const handleRemoveShip = (shipId: string) => {
    const newShips = adminShips.filter(s => s.id !== shipId);
    const newBoard = createEmptyBoard();
    newShips.forEach(ship => {
      ship.cells.forEach(({ row, col }) => {
        newBoard[row][col].state = 'ship';
        newBoard[row][col].shipId = ship.id;
      });
    });
    setAdminShips(newShips);
    setAdminBoard(newBoard);
  };

  const handleApply = () => {
    onShipsChange(adminShips);
    onBoardChange(adminBoard);
    alert('Расположение кораблей применено! Игра начата.');
  };

  const handleReset = () => {
    setAdminShips([]);
    setAdminBoard(createEmptyBoard());
    onReset();
  };

  const shipCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  adminShips.forEach(s => { shipCounts[s.size]++; });
  const maxShips = { 1: 4, 2: 3, 3: 2, 4: 1 };

  const getCellClass = (cell: Cell, row: number, col: number) => {
    const isHovered = hoveredCells.some(c => c.row === row && c.col === col);
    const shotResult = shots.find(s => s.row === row && s.col === col);

    if (isHovered) {
      return `cell w-full aspect-square flex items-center justify-center text-xs ${isValidPlacement ? 'place-hover' : 'place-hover-invalid'}`;
    }
    if (cell.state === 'ship') {
      return shotResult
        ? 'cell w-full aspect-square flex items-center justify-center text-xs hit-admin'
        : 'cell w-full aspect-square flex items-center justify-center text-xs ship-admin';
    }
    if (shotResult?.result === 'miss') return 'cell w-full aspect-square flex items-center justify-center text-xs miss';
    return 'cell w-full aspect-square flex items-center justify-center text-xs';
  };

  const getCellContent = (cell: Cell, row: number, col: number) => {
    const shotResult = shots.find(s => s.row === row && s.col === col);
    if (cell.state === 'ship' && shotResult) return <span className="text-sm">🔥</span>;
    if (cell.state === 'ship') return <span style={{ fontSize: '8px', color: 'rgba(100,180,220,0.8)' }}>■</span>;
    if (shotResult?.result === 'miss') return <span style={{ color: 'rgba(150,200,220,0.5)', fontSize: '10px' }}>●</span>;
    return null;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">⚓</span>
          <h2 className="font-russo text-2xl md:text-3xl" style={{ color: '#00d4ff' }}>
            ПАНЕЛЬ АДМИРАЛА
          </h2>
          <span className="text-3xl">🗺️</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Расставь корабли на поле — сотрудники будут их топить
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ship selection */}
        <div className="sea-card p-4 flex flex-col gap-4">
          <h3 className="font-russo text-sm uppercase tracking-wider" style={{ color: '#00d4ff' }}>
            🚢 Выбор корабля
          </h3>

          <div className="flex flex-col gap-2">
            {([4, 3, 2, 1] as const).map(size => {
              const count = shipCounts[size];
              const max = maxShips[size];
              const available = count < max;
              return (
                <button
                  key={size}
                  onClick={() => available && setSelectedShipSize(size)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedShipSize === size ? 'border border-cyan-400/60' : 'border border-transparent'} ${!available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-cyan-800/40'}`}
                  style={{
                    background: selectedShipSize === size
                      ? 'linear-gradient(135deg, rgba(0,150,200,0.25), rgba(0,80,150,0.2))'
                      : 'rgba(0,20,50,0.4)',
                  }}
                >
                  <div className="flex gap-1">
                    {Array.from({ length: size }).map((_, i) => (
                      <div key={i} className="w-5 h-5 rounded-sm" style={{ background: 'rgba(30,100,180,0.9)', border: '1px solid rgba(0,180,220,0.6)' }} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'rgba(200,230,250,0.9)' }}>
                      {size}-палубный
                    </div>
                    <div className="text-xs gold-text">+{SHIP_PRIZES[size].toLocaleString()}₽</div>
                  </div>
                  <div className="text-xs" style={{ color: count >= max ? 'rgba(255,100,100,0.8)' : 'rgba(0,200,120,0.8)' }}>
                    {count}/{max}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Orientation */}
          <div>
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: 'rgba(150,200,230,0.6)' }}>
              Ориентация корабля
            </label>
            <div className="flex gap-2">
              {[{ key: 'h', label: '↔ Горизонтально' }, { key: 'v', label: '↕ Вертикально' }].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setOrientation(opt.key as 'h' | 'v')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${orientation === opt.key ? 'btn-sea' : ''}`}
                  style={orientation !== opt.key ? { background: 'rgba(0,30,70,0.5)', border: '1px solid rgba(0,100,150,0.3)', color: 'rgba(150,200,230,0.7)' } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto">
            <button onClick={handleApply} className="btn-gold w-full py-3 rounded-xl font-russo text-sm">
              ✅ Применить расстановку
            </button>
            <button onClick={handleReset} className="btn-danger w-full py-2 rounded-xl text-sm">
              🗑️ Очистить поле
            </button>
          </div>

          {/* Game toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(0,20,50,0.5)', border: '1px solid rgba(0,100,150,0.3)' }}>
            <span className="text-sm" style={{ color: 'rgba(200,230,250,0.8)' }}>Игра активна</span>
            <button
              onClick={() => onGameToggle(!gameActive)}
              className={`relative w-12 h-6 rounded-full transition-all`}
              style={{ background: gameActive ? 'rgba(0,180,80,0.8)' : 'rgba(100,100,120,0.4)', border: `1px solid ${gameActive ? 'rgba(0,220,100,0.5)' : 'rgba(150,150,180,0.3)'}` }}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${gameActive ? 'left-6' : 'left-0.5'}`}
                style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
        </div>

        {/* Admin board */}
        <div className="lg:col-span-2">
          <div className="sea-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Eye" size={16} style={{ color: '#00d4ff' }} />
              <span className="font-russo text-sm" style={{ color: '#00d4ff' }}>КАРТА АДМИРАЛА (видны все корабли)</span>
            </div>

            {/* Column headers */}
            <div className="flex mb-1">
              <div className="w-7 shrink-0" />
              {COLS.map(col => (
                <div key={col} className="flex-1 text-center text-xs font-russo" style={{ color: 'rgba(0,180,220,0.6)' }}>{col}</div>
              ))}
            </div>

            {adminBoard.map((row, rowIdx) => (
              <div key={rowIdx} className="flex mb-1">
                <div className="w-7 shrink-0 text-xs font-russo flex items-center justify-end pr-1" style={{ color: 'rgba(0,180,220,0.6)' }}>
                  {ROWS[rowIdx]}
                </div>
                {row.map((cell, colIdx) => (
                  <div
                    key={colIdx}
                    className={`flex-1 mx-px ${getCellClass(cell, rowIdx, colIdx)}`}
                    style={{ minWidth: 0, minHeight: 0 }}
                    onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handlePlaceShip(rowIdx, colIdx)}
                  >
                    {getCellContent(cell, rowIdx, colIdx)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Ships list */}
          {adminShips.length > 0 && (
            <div className="sea-card p-4 mt-4">
              <div className="font-russo text-sm mb-3" style={{ color: '#00d4ff' }}>
                🚢 Расставленные корабли ({adminShips.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {adminShips.map(ship => (
                  <div key={ship.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(0,40,90,0.6)', border: '1px solid rgba(0,120,180,0.3)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'rgba(150,210,250,0.9)' }}>
                      {ship.size}-пал.
                    </span>
                    <span className="text-xs gold-text">+{ship.prize.toLocaleString()}₽</span>
                    <button onClick={() => handleRemoveShip(ship.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
