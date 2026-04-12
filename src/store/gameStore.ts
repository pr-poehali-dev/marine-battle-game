import { useState, useCallback } from 'react';
import { Cell, Ship, Player, ShotRecord, GRID_SIZE, SHIP_PRIZES } from '@/types/game';

const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col, state: 'empty' as const }))
  );

const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Алексей Петров', department: 'Отдел продаж', avatar: '👨‍💼', shotsTotal: 8, hitsTotal: 3, shipsSunk: 1, bonusEarned: 3000, lastShot: '09.04.2026' },
  { id: 'p2', name: 'Мария Сидорова', department: 'Отдел продаж', avatar: '👩‍💼', shotsTotal: 5, hitsTotal: 2, shipsSunk: 1, bonusEarned: 1000, lastShot: '09.04.2026' },
  { id: 'p3', name: 'Дмитрий Козлов', department: 'B2B', avatar: '👨‍💻', shotsTotal: 3, hitsTotal: 0, shipsSunk: 0, bonusEarned: 0, lastShot: '08.04.2026' },
  { id: 'p4', name: 'Елена Новикова', department: 'B2B', avatar: '👩‍🔬', shotsTotal: 6, hitsTotal: 1, shipsSunk: 0, bonusEarned: 0, lastShot: '08.04.2026' },
  { id: 'p5', name: 'Игорь Волков', department: 'Розница', avatar: '🧑‍🎯', shotsTotal: 4, hitsTotal: 4, shipsSunk: 2, bonusEarned: 5000, lastShot: '09.04.2026' },
];

const MOCK_SHOTS: ShotRecord[] = [
  { id: 's1', playerId: 'p1', playerName: 'Алексей Петров', row: 2, col: 3, result: 'hit', shipSize: 3, bonus: 0, timestamp: '09.04.2026 10:15', saleInfo: 'Продажа ООО Ромашка' },
  { id: 's2', playerId: 'p2', playerName: 'Мария Сидорова', row: 7, col: 1, result: 'sunk', shipSize: 1, bonus: 1000, timestamp: '09.04.2026 11:30', saleInfo: 'Продажа ИП Смирнов' },
  { id: 's3', playerId: 'p3', playerName: 'Дмитрий Козлов', row: 4, col: 8, result: 'miss', timestamp: '09.04.2026 12:00', saleInfo: 'Продажа ООО Техно' },
  { id: 's4', playerId: 'p5', playerName: 'Игорь Волков', row: 1, col: 0, result: 'sunk', shipSize: 2, bonus: 2000, timestamp: '09.04.2026 13:10', saleInfo: 'Продажа АО Строй' },
  { id: 's5', playerId: 'p1', playerName: 'Алексей Петров', row: 2, col: 4, result: 'sunk', shipSize: 3, bonus: 3000, timestamp: '09.04.2026 14:00', saleInfo: 'Продажа ООО Максимум' },
  { id: 's6', playerId: 'p5', playerName: 'Игорь Волков', row: 5, col: 5, result: 'sunk', shipSize: 3, bonus: 3000, timestamp: '09.04.2026 14:30', saleInfo: 'Продажа ИП Кузнецов' },
];

export function useGameStore() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());
  const [ships, setShips] = useState<Ship[]>([]);
  const [shots, setShots] = useState<ShotRecord[]>(MOCK_SHOTS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [gameActive, setGameActive] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(MOCK_PLAYERS[0]);
  const [lastExplosion, setLastExplosion] = useState<{ row: number; col: number } | null>(null);

  const placeShipOnBoard = useCallback((newShips: Ship[]) => {
    const newBoard = createEmptyBoard();
    newShips.forEach(ship => {
      ship.cells.forEach(({ row, col }) => {
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          newBoard[row][col].state = ship.sunk ? 'sunk' : ship.hits > 0 && ship.cells.some(c => c.row === row && c.col === col) ? 'hit' : 'ship';
          newBoard[row][col].shipId = ship.id;
        }
      });
    });
    // Apply shots
    shots.forEach(shot => {
      if (shot.result === 'hit' || shot.result === 'sunk') {
        newBoard[shot.row][shot.col].state = 'hit';
      } else if (shot.result === 'miss') {
        newBoard[shot.row][shot.col].state = 'miss';
      }
    });
    setBoard(newBoard);
  }, [shots]);

  const fireShot = useCallback((row: number, col: number, saleInfo: string) => {
    if (!selectedPlayer || !gameActive) return;
    const cell = board[row][col];
    if (cell.state === 'hit' || cell.state === 'miss' || cell.state === 'sunk') return;

    const hitShip = ships.find(s => s.cells.some(c => c.row === row && c.col === col));
    let result: 'hit' | 'miss' | 'sunk' = 'miss';
    let bonus = 0;
    let updatedShips = [...ships];

    if (hitShip) {
      const newHits = hitShip.hits + 1;
      const sunk = newHits >= hitShip.size;
      result = sunk ? 'sunk' : 'hit';
      if (sunk) bonus = SHIP_PRIZES[hitShip.size];
      updatedShips = ships.map(s => s.id === hitShip.id ? { ...s, hits: newHits, sunk } : s);
      setShips(updatedShips);
    }

    const newShot: ShotRecord = {
      id: `s${Date.now()}`,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      row, col, result,
      shipSize: hitShip?.size,
      bonus,
      timestamp: new Date().toLocaleString('ru-RU'),
      saleInfo,
    };

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].state = result === 'miss' ? 'miss' : 'hit';
    setBoard(newBoard);
    setShots(prev => [newShot, ...prev]);
    setLastExplosion({ row, col });

    setPlayers(prev => prev.map(p => {
      if (p.id !== selectedPlayer.id) return p;
      return {
        ...p,
        shotsTotal: p.shotsTotal + 1,
        hitsTotal: result !== 'miss' ? p.hitsTotal + 1 : p.hitsTotal,
        shipsSunk: result === 'sunk' ? p.shipsSunk + 1 : p.shipsSunk,
        bonusEarned: p.bonusEarned + bonus,
        lastShot: new Date().toLocaleDateString('ru-RU'),
      };
    }));

    setTimeout(() => setLastExplosion(null), 800);
    return result;
  }, [board, ships, selectedPlayer, gameActive]);

  const addPlayer = useCallback((player: Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'>) => {
    const newPlayer: Player = {
      ...player,
      id: `p${Date.now()}`,
      shotsTotal: 0,
      hitsTotal: 0,
      shipsSunk: 0,
      bonusEarned: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setSelectedPlayer((prev: Player | null) => prev?.id === id ? null : prev);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setShips([]);
    setShots([]);
    setGameActive(true);
  }, []);

  return {
    board, ships, shots, players, gameActive, selectedPlayer, lastExplosion,
    setBoard, setShips, setShots, setGameActive, setSelectedPlayer,
    placeShipOnBoard, fireShot, addPlayer, removePlayer, resetGame,
  };
}