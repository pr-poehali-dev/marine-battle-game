export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export interface Cell {
  row: number;
  col: number;
  state: CellState;
  shipId?: string;
}

export interface Ship {
  id: string;
  size: 1 | 2 | 3 | 4;
  hits: number;
  sunk: boolean;
  cells: { row: number; col: number }[];
  prize: number;
}

export interface Player {
  id: string;
  name: string;
  department: string;
  avatar: string;
  shotsTotal: number;
  hitsTotal: number;
  shipsSunk: number;
  bonusEarned: number;
  lastShot?: string;
}

export interface ShotRecord {
  id: string;
  playerId: string;
  playerName: string;
  row: number;
  col: number;
  result: 'hit' | 'miss' | 'sunk';
  shipSize?: number;
  bonus?: number;
  timestamp: string;
  saleInfo?: string;
}

export interface GameState {
  board: Cell[][];
  ships: Ship[];
  shots: ShotRecord[];
  players: Player[];
  gameActive: boolean;
  gameId: string;
}

export const GRID_SIZE = 10;
export const COLS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
export const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const SHIP_PRIZES: Record<number, number> = {
  1: 1000,
  2: 2000,
  3: 3000,
  4: 4000,
};

export const SHIP_CONFIG = [
  { size: 4, count: 1 },
  { size: 3, count: 2 },
  { size: 2, count: 3 },
  { size: 1, count: 4 },
];
