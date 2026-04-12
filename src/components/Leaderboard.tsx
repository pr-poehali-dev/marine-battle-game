import { Player } from '@/types/game';
import Icon from '@/components/ui/icon';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.bonusEarned - a.bonusEarned || b.shipsSunk - a.shipsSunk);
  const medals = [
    { icon: '🥇', badge: 'icon-badge-gold',  glow: 'rgba(200,140,0,0.15)', border: 'rgba(200,140,0,0.35)' },
    { icon: '🥈', badge: 'icon-badge-blue',  glow: 'rgba(9,83,144,0.1)',   border: 'rgba(9,83,144,0.28)' },
    { icon: '🥉', badge: 'icon-badge-teal',  glow: 'rgba(0,150,130,0.1)',  border: 'rgba(0,150,130,0.28)' },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-gold w-12 h-12 text-xl animate-float">🏆</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Таблица лидеров</h2>
          <p className="text-sm font-semibold" style={{ color: 'var(--sea-text-dim)' }}>Топ игроков по заработанным бонусам</p>
        </div>
      </div>

      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[sorted[1], sorted[0], sorted[2]].map((player, idx) => {
            const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            const m = medals[realIdx];
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={player.id}
                className={`sea-card flex flex-col items-center justify-end ${heights[idx]} p-3 transition-all hover:scale-105`}
                style={{ border: `1.5px solid ${m.border}`, boxShadow: `0 4px 20px ${m.glow}` }}>
                <span className="text-2xl mb-1">{m.icon}</span>
                {player.avatarUrl
                  ? <img src={player.avatarUrl} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', marginBottom:4 }} />
                  : <span className="text-2xl mb-1">{player.avatar}</span>
                }
                <div className="text-xs font-bold text-center truncate w-full" style={{ color: 'var(--sea-text)' }}>
                  {player.name.split(' ')[0]}
                </div>
                <div className="font-russo text-sm" style={{ color: 'var(--gold)', fontWeight:800 }}>{player.bonusEarned.toLocaleString()}₽</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sea-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--sea-text-dim)', borderBottom: '1.5px solid rgba(9,83,144,0.12)', background: 'rgba(9,83,144,0.04)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-4">Игрок</div>
          <div className="col-span-2 text-center">Выстрелов</div>
          <div className="col-span-2 text-center">Попаданий</div>
          <div className="col-span-1 text-center">Топлено</div>
          <div className="col-span-2 text-right">Бонус</div>
        </div>

        {sorted.map((player, idx) => (
          <div key={player.id}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors"
            style={{
              borderBottom: '1.5px solid rgba(9,83,144,0.08)',
              background: idx % 2 === 0 ? 'transparent' : 'rgba(9,83,144,0.025)',
            }}>
            <div className="col-span-1">
              {idx < 3
                ? <span className="text-lg">{medals[idx].icon}</span>
                : <span className="text-sm font-russo" style={{ color: 'var(--sea-text-dim)' }}>{idx + 1}</span>}
            </div>
            <div className="col-span-4 flex items-center gap-2">
              {player.avatarUrl
                ? <img src={player.avatarUrl} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                : <span className="text-xl flex-shrink-0">{player.avatar}</span>
              }
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: 'var(--sea-text)' }}>{player.name}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>{player.department}</div>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <span className="font-russo text-sm" style={{ color: 'var(--sea-text)' }}>{player.shotsTotal}</span>
            </div>
            <div className="col-span-2 text-center">
              <span className="font-russo text-sm" style={{ color: player.hitsTotal > 0 ? 'var(--hit-orange)' : 'var(--sea-text-dim)' }}>
                {player.hitsTotal}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className="font-russo text-sm" style={{ color: player.shipsSunk > 0 ? 'var(--sea-blue)' : 'var(--sea-text-dim)' }}>
                {player.shipsSunk}
              </span>
            </div>
            <div className="col-span-2 text-right">
              {player.bonusEarned > 0
                ? <span className="font-russo text-sm" style={{ color:'var(--gold)', fontWeight:800 }}>+{player.bonusEarned.toLocaleString()}₽</span>
                : <span className="text-xs font-bold" style={{ color: 'var(--sea-text-dim)' }}>—</span>}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="p-12 text-center">
            <div className="icon-badge icon-badge-blue w-16 h-16 text-3xl mx-auto mb-3">⚓</div>
            <div className="font-russo text-sm" style={{ color: 'var(--sea-text-dim)' }}>Пока нет игроков</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { iconName: 'Users',     badge: 'icon-badge-blue', label: 'Игроков',   value: sorted.length },
          { iconName: 'Crosshair', badge: 'icon-badge-navy', label: 'Выстрелов', value: sorted.reduce((s, p) => s + p.shotsTotal, 0) },
          { iconName: 'Skull',     badge: 'icon-badge-red',  label: 'Потоплено', value: sorted.reduce((s, p) => s + p.shipsSunk, 0) },
          { iconName: 'Banknote',  badge: 'icon-badge-gold', label: 'Выплачено', value: `${sorted.reduce((s, p) => s + p.bonusEarned, 0).toLocaleString()}₽` },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 flex items-center gap-3">
            <div className={`icon-badge ${stat.badge} w-11 h-11`}>
              <Icon name={stat.iconName} size={20} />
            </div>
            <div>
              <div className="font-russo text-xl" style={{ color: 'var(--sea-text)' }}>{stat.value}</div>
              <div className="text-xs font-bold" style={{ color: 'var(--sea-text-dim)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
