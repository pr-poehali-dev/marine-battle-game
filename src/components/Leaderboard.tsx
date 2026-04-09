import { Player } from '@/types/game';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.bonusEarned - a.bonusEarned || b.shipsSunk - a.shipsSunk);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">🏆</span>
          <h2 className="font-russo text-2xl md:text-3xl" style={{ color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            ТАБЛИЦА ЛИДЕРОВ
          </h2>
          <span className="text-3xl animate-float inline-block" style={{ animationDelay: '0.5s' }}>⭐</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Топ игроков по заработанным бонусам
        </p>
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[sorted[1], sorted[0], sorted[2]].map((player, idx) => {
            const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={player.id} className={`flex flex-col items-center justify-end ${heights[idx]} sea-card p-3 transition-all hover:scale-105`}
                style={{
                  background: realIdx === 0
                    ? 'linear-gradient(180deg, rgba(255,215,0,0.2) 0%, rgba(10,30,70,0.9) 100%)'
                    : realIdx === 1
                      ? 'linear-gradient(180deg, rgba(180,180,200,0.15) 0%, rgba(10,30,70,0.9) 100%)'
                      : 'linear-gradient(180deg, rgba(180,100,30,0.15) 0%, rgba(10,30,70,0.9) 100%)',
                  border: realIdx === 0
                    ? '1px solid rgba(255,215,0,0.4)'
                    : realIdx === 1
                      ? '1px solid rgba(180,180,200,0.3)'
                      : '1px solid rgba(180,100,30,0.3)',
                }}>
                <span className="text-2xl mb-1">{medals[realIdx]}</span>
                <span className="text-xl mb-1">{player.avatar}</span>
                <div className="text-center">
                  <div className="text-xs font-semibold truncate w-full" style={{ color: 'rgba(200,230,250,0.9)' }}>
                    {player.name.split(' ')[0]}
                  </div>
                  <div className="font-russo text-sm gold-text">{player.bonusEarned.toLocaleString()}₽</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="sea-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-russo" style={{ color: 'rgba(0,180,220,0.6)', borderBottom: '1px solid rgba(0,100,150,0.2)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-4">Игрок</div>
          <div className="col-span-2 text-center">Выстрелов</div>
          <div className="col-span-2 text-center">Попаданий</div>
          <div className="col-span-1 text-center">Потоплено</div>
          <div className="col-span-2 text-right">Бонус</div>
        </div>

        {sorted.map((player, idx) => (
          <div
            key={player.id}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all hover:bg-white/5"
            style={{ borderBottom: '1px solid rgba(0,80,120,0.15)' }}
          >
            <div className="col-span-1">
              {idx < 3
                ? <span className="text-lg">{medals[idx]}</span>
                : <span className="text-sm font-russo" style={{ color: 'rgba(120,170,200,0.7)' }}>{idx + 1}</span>
              }
            </div>
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-xl">{player.avatar}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'rgba(200,230,250,0.9)' }}>{player.name}</div>
                <div className="text-xs" style={{ color: 'rgba(100,160,200,0.6)' }}>{player.department}</div>
              </div>
            </div>
            <div className="col-span-2 text-center font-russo text-sm" style={{ color: 'rgba(150,200,230,0.8)' }}>
              {player.shotsTotal}
            </div>
            <div className="col-span-2 text-center">
              <span className="text-sm font-russo" style={{ color: player.hitsTotal > 0 ? '#ff8040' : 'rgba(150,200,230,0.8)' }}>
                {player.hitsTotal}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className="text-sm font-russo" style={{ color: player.shipsSunk > 0 ? '#ff4444' : 'rgba(150,200,230,0.8)' }}>
                {player.shipsSunk}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className={`font-russo text-sm ${player.bonusEarned > 0 ? 'gold-text' : ''}`}
                style={player.bonusEarned === 0 ? { color: 'rgba(120,170,200,0.5)' } : {}}>
                {player.bonusEarned > 0 ? `+${player.bonusEarned.toLocaleString()}₽` : '—'}
              </span>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="p-10 text-center" style={{ color: 'rgba(120,170,200,0.5)' }}>
            <div className="text-4xl mb-3">⚓</div>
            <div className="font-russo text-sm">Пока нет игроков</div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Всего игроков', value: sorted.length, color: '#00d4ff', icon: '👥' },
          { label: 'Всего выстрелов', value: sorted.reduce((s, p) => s + p.shotsTotal, 0), color: '#00d4ff', icon: '🎯' },
          { label: 'Потоплено кораблей', value: sorted.reduce((s, p) => s + p.shipsSunk, 0), color: '#ff8040', icon: '💥' },
          { label: 'Выплачено бонусов', value: `${sorted.reduce((s, p) => s + p.bonusEarned, 0).toLocaleString()}₽`, color: '#ffd700', icon: '💰' },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-russo text-xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(120,170,200,0.6)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
