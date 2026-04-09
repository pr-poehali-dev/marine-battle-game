import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import AdminPanel from '@/components/AdminPanel';
import Leaderboard from '@/components/Leaderboard';
import ShotHistory from '@/components/ShotHistory';
import Players from '@/components/Players';
import Statistics from '@/components/Statistics';
import Icon from '@/components/ui/icon';

type Tab = 'game' | 'admin' | 'leaderboard' | 'history' | 'players' | 'stats';

const TABS: { id: Tab; label: string; iconName: string; adminOnly?: boolean }[] = [
  { id: 'game',        label: 'Игровое поле', iconName: 'Crosshair' },
  { id: 'leaderboard', label: 'Рейтинг',      iconName: 'Trophy' },
  { id: 'history',     label: 'История',       iconName: 'ScrollText' },
  { id: 'stats',       label: 'Статистика',    iconName: 'BarChart3' },
  { id: 'players',     label: 'Игроки',        iconName: 'Users' },
  { id: 'admin',       label: 'Адмирал',       iconName: 'ShieldCheck', adminOnly: true },
];

function WaveBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Subtle top gradient band */}
      <div className="absolute top-0 left-0 right-0 h-64"
        style={{ background: 'linear-gradient(180deg, rgba(14,127,194,0.07) 0%, transparent 100%)' }} />
      {/* Floating bubbles */}
      {Array.from({ length: 8 }, (_, i) => ({
        size: 12 + i * 6,
        left: 8 + i * 12,
        delay: i * 1.8,
        dur: 9 + i * 1.5,
      })).map((b, i) => (
        <div key={i} className="bubble absolute"
          style={{ width: b.size, height: b.size, left: `${b.left}%`, bottom: '-30px', animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
      ))}
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    board, ships, shots, players, gameActive, selectedPlayer, lastExplosion,
    setShips, setBoard, setGameActive, setSelectedPlayer,
    placeShipOnBoard, fireShot, addPlayer, resetGame,
  } = useGameStore();

  const handleShipsChange = (newShips: typeof ships) => {
    setShips(newShips);
    placeShipOnBoard(newShips);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--sea-bg)' }}>
      <WaveBg />

      {/* ── HEADER ── */}
      <header className="relative z-10 px-4 pt-5 pb-3">
        <div className="max-w-6xl mx-auto">
          <div className="sea-card px-5 py-3 flex items-center justify-between mb-4"
            style={{ borderRadius: '18px' }}>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative animate-float inline-block">
                <div className="icon-badge icon-badge-blue w-11 h-11 text-2xl rounded-2xl">
                  ⚓
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: gameActive ? '#16a34a' : '#dc2626', boxShadow: `0 0 6px ${gameActive ? 'rgba(22,163,74,0.6)' : 'rgba(220,38,38,0.6)'}` }} />
              </div>
              <div>
                <h1 className="font-russo text-xl leading-tight" style={{ color: 'var(--sea-navy)' }}>
                  Морской Бой
                </h1>
                <div className="text-xs font-medium" style={{ color: 'rgba(13,59,110,0.5)' }}>
                  Геймификация продаж · Битрикс24
                </div>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Status */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: gameActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                  border: `1px solid ${gameActive ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.25)'}`,
                  color: gameActive ? '#16a34a' : '#dc2626',
                }}>
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: gameActive ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
                {gameActive ? 'Игра идёт' : 'Остановлена'}
              </div>

              {/* Admin toggle */}
              <button onClick={() => setIsAdmin(!isAdmin)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: isAdmin ? 'rgba(245,166,35,0.12)' : 'rgba(14,127,194,0.07)',
                  border: `1px solid ${isAdmin ? 'rgba(245,166,35,0.45)' : 'rgba(14,127,194,0.22)'}`,
                  color: isAdmin ? 'var(--gold-dark)' : 'rgba(13,59,110,0.7)',
                }}>
                <Icon name={isAdmin ? 'ShieldCheck' : 'Shield'} size={13} />
                <span className="hidden sm:inline">{isAdmin ? 'Адмирал' : 'Игрок'}</span>
              </button>
            </div>
          </div>

          {/* ── NAV ── */}
          <nav className="flex gap-1 flex-wrap px-1">
            {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`nav-tab flex items-center gap-1.5 ${activeTab === tab.id ? 'active' : ''}`}>
                <Icon name={tab.iconName} size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="relative z-10 px-4 py-5 max-w-6xl mx-auto">
        {activeTab === 'game' && (
          <GameBoard
            board={board} shots={shots} players={players}
            selectedPlayer={selectedPlayer} onSelectPlayer={setSelectedPlayer}
            onFire={fireShot} lastExplosion={lastExplosion} gameActive={gameActive}
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            board={board} ships={ships}
            shots={shots.map(s => ({ row: s.row, col: s.col, result: s.result }))}
            gameActive={gameActive}
            onShipsChange={handleShipsChange} onBoardChange={setBoard}
            onGameToggle={setGameActive} onReset={resetGame}
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard players={players} />}
        {activeTab === 'history'     && <ShotHistory shots={shots} />}
        {activeTab === 'players'     && <Players players={players} onAddPlayer={addPlayer} />}
        {activeTab === 'stats'       && <Statistics players={players} shots={shots} ships={ships} />}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-4 py-5 mt-4">
        <div className="max-w-6xl mx-auto sea-divider mb-4" />
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xs font-medium" style={{ color: 'rgba(13,59,110,0.35)' }}>
            ⚓ Морской Бой · Геймификация продаж
          </div>
          <div className="text-xs" style={{ color: 'rgba(13,59,110,0.3)' }}>
            Интеграция Битрикс24
          </div>
        </div>
      </footer>
    </div>
  );
}
