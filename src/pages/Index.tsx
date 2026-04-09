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

const TABS: { id: Tab; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: 'game', label: 'Игровое поле', icon: '🎯' },
  { id: 'leaderboard', label: 'Рейтинг', icon: '🏆' },
  { id: 'history', label: 'История', icon: '📋' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'players', label: 'Игроки', icon: '👥' },
  { id: 'admin', label: 'Адмирал', icon: '⚓', adminOnly: true },
];

function OceanBubbles() {
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 8,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="bubble absolute"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: '-20px',
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
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
    <div className="min-h-screen relative" style={{ background: 'var(--sea-deep)' }}>
      <OceanBubbles />

      {/* Header */}
      <header className="relative z-10 px-4 pt-6 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-4xl animate-float inline-block">⚓</span>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background: gameActive ? 'rgba(0,220,80,0.9)' : 'rgba(200,50,50,0.9)', boxShadow: gameActive ? '0 0 8px rgba(0,220,80,0.7)' : '0 0 8px rgba(200,50,50,0.7)' }}
                />
              </div>
              <div>
                <h1 className="font-russo text-2xl md:text-3xl" style={{
                  background: 'linear-gradient(135deg, #7ef4ff, #00d4ff, #0088cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 15px rgba(0,212,255,0.4))'
                }}>
                  МОРСКОЙ БОЙ
                </h1>
                <div className="text-xs" style={{ color: 'rgba(100,180,220,0.6)' }}>
                  Геймификация продаж · Битрикс24
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
                style={{
                  background: gameActive ? 'rgba(0,80,30,0.5)' : 'rgba(80,20,20,0.5)',
                  border: `1px solid ${gameActive ? 'rgba(0,200,80,0.4)' : 'rgba(200,50,50,0.4)'}`,
                  color: gameActive ? 'rgba(100,230,150,0.9)' : 'rgba(230,100,100,0.9)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: gameActive ? 'rgba(0,220,80,1)' : 'rgba(220,50,50,1)' }}
                />
                <span className="hidden sm:inline">{gameActive ? 'Игра активна' : 'Остановлена'}</span>
              </div>

              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1"
                style={{
                  background: isAdmin ? 'rgba(255,180,0,0.2)' : 'rgba(0,30,70,0.5)',
                  border: `1px solid ${isAdmin ? 'rgba(255,180,0,0.5)' : 'rgba(0,100,150,0.3)'}`,
                  color: isAdmin ? '#ffd700' : 'rgba(150,200,230,0.7)',
                }}
              >
                <Icon name="Shield" size={12} />
                <span className="hidden sm:inline ml-1">{isAdmin ? 'Режим адмирала' : 'Режим игрока'}</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 flex-wrap">
            {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab flex items-center gap-1.5 ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Divider */}
      <div className="px-4">
        <div className="max-w-6xl mx-auto h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,180,220,0.3), transparent)' }} />
      </div>

      {/* Content */}
      <main className="relative z-10 px-4 py-6 max-w-6xl mx-auto">
        {activeTab === 'game' && (
          <GameBoard
            board={board}
            shots={shots}
            players={players}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
            onFire={fireShot}
            lastExplosion={lastExplosion}
            gameActive={gameActive}
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            board={board}
            ships={ships}
            shots={shots.map(s => ({ row: s.row, col: s.col, result: s.result }))}
            gameActive={gameActive}
            onShipsChange={handleShipsChange}
            onBoardChange={setBoard}
            onGameToggle={setGameActive}
            onReset={resetGame}
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard players={players} />}
        {activeTab === 'history' && <ShotHistory shots={shots} />}
        {activeTab === 'players' && <Players players={players} onAddPlayer={addPlayer} />}
        {activeTab === 'stats' && <Statistics players={players} shots={shots} ships={ships} />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-4 mt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xs" style={{ color: 'rgba(80,130,170,0.4)' }}>
            ⚓ Морской Бой · Геймификация продаж
          </div>
          <div className="text-xs" style={{ color: 'rgba(80,130,170,0.35)' }}>
            🔗 Интеграция Битрикс24
          </div>
        </div>
      </footer>
    </div>
  );
}
