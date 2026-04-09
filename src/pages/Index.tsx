import { useState, useEffect } from 'react';
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
  { id: 'game',        label: 'Поле',      iconName: 'Crosshair' },
  { id: 'leaderboard', label: 'Рейтинг',   iconName: 'Trophy' },
  { id: 'history',     label: 'История',   iconName: 'ScrollText' },
  { id: 'stats',       label: 'Статистика',iconName: 'BarChart3' },
  { id: 'players',     label: 'Игроки',    iconName: 'Users' },
  { id: 'admin',       label: 'Адмирал',   iconName: 'ShieldCheck', adminOnly: true },
];

function WaveBg({ dark }: { dark: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {Array.from({ length: 7 }, (_, i) => ({
        size: 10 + i * 7,
        left: 6 + i * 13,
        delay: i * 2,
        dur: 10 + i * 1.5,
      })).map((b, i) => (
        <div key={i} className="bubble absolute"
          style={{
            width: b.size, height: b.size,
            left: `${b.left}%`, bottom: '-30px',
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            opacity: dark ? 0.4 : 0.55,
          }} />
      ))}
    </div>
  );
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle flex items-center gap-0"
      style={{
        background: dark
          ? 'linear-gradient(90deg,#0a2050,#1060b0)'
          : 'linear-gradient(90deg,#7ec8f0,#3498d8)',
      }}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      aria-label="Переключить тему"
    >
      <div
        className="theme-toggle-thumb"
        style={{ left: dark ? '23px' : '3px' }}
      />
      <span className="sr-only">{dark ? '☀️' : '🌙'}</span>
    </button>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [isAdmin, setIsAdmin] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') { setDark(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

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
    <div className="min-h-screen relative" style={{ background: 'var(--sea-bg)', transition: 'background 0.3s' }}>
      <WaveBg dark={dark} />

      {/* ── HEADER ── */}
      <header className="relative z-10 px-4 pt-4 pb-3">
        <div className="max-w-6xl mx-auto">
          <div className="sea-card px-4 py-3 flex items-center justify-between mb-3">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative animate-float inline-block">
                <div className="icon-badge icon-badge-blue w-11 h-11 text-xl rounded-2xl font-russo">⚓</div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{
                    background: gameActive ? '#16a34a' : '#dc2626',
                    boxShadow: `0 0 6px ${gameActive ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.7)'}`,
                  }} />
              </div>
              <div>
                <h1 className="font-russo text-xl leading-tight" style={{ color: 'var(--sea-navy)' }}>
                  Морской Бой
                </h1>
                <div className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>
                  Геймификация продаж · Битрикс24
                </div>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Game status */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: gameActive ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.1)',
                  border: `1.5px solid ${gameActive ? 'rgba(22,163,74,0.4)' : 'rgba(220,38,38,0.35)'}`,
                  color: gameActive ? '#14803c' : '#b81818',
                }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: gameActive ? '#14803c' : '#b81818' }} />
                {gameActive ? 'Идёт игра' : 'Остановлена'}
              </div>

              {/* Theme toggle */}
              <div className="flex items-center gap-1.5">
                <Icon name={dark ? 'Moon' : 'Sun'} size={13} style={{ color: 'var(--sea-text-dim)' }} />
                <ThemeToggle dark={dark} onToggle={toggleTheme} />
              </div>

              {/* Admin toggle */}
              <button onClick={() => setIsAdmin(!isAdmin)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: isAdmin ? 'rgba(212,138,16,0.14)' : 'rgba(11,109,171,0.08)',
                  border: `1.5px solid ${isAdmin ? 'rgba(212,138,16,0.5)' : 'rgba(11,109,171,0.25)'}`,
                  color: isAdmin ? 'var(--gold)' : 'var(--sea-text-sub)',
                }}>
                <Icon name={isAdmin ? 'ShieldCheck' : 'Shield'} size={13} />
                <span className="hidden sm:inline">{isAdmin ? 'Адмирал' : 'Игрок'}</span>
              </button>
            </div>
          </div>

          {/* ── NAV ── */}
          <nav className="flex gap-1 flex-wrap">
            {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`nav-tab flex items-center gap-1.5 ${activeTab === tab.id ? 'active' : ''}`}>
                <Icon name={tab.iconName} size={14} />
                <span>{tab.label}</span>
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
      <footer className="relative z-10 px-4 py-4 mt-2">
        <div className="max-w-6xl mx-auto sea-divider mb-3" />
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>
            ⚓ Морской Бой · Геймификация продаж
          </div>
          <a href="/landing" className="text-xs font-semibold transition-colors"
            style={{ color: 'var(--sea-blue)' }}>
            О приложении →
          </a>
        </div>
      </footer>
    </div>
  );
}
