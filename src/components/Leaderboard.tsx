import { Player } from '@/types/game';
import Icon from '@/components/ui/icon';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.bonusEarned - a.bonusEarned || b.shipsSunk - a.shipsSunk);
  const medals = [
    { icon: '🥇', badge: 'icon-badge-gold',  glow: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.3)' },
    { icon: '🥈', badge: 'icon-badge-blue',  glow: 'rgba(14,127,194,0.1)',  border: 'rgba(14,127,194,0.25)' },
    { icon: '🥉', badge: 'icon-badge-teal',  glow: 'rgba(0,180,166,0.1)',   border: 'rgba(0,180,166,0.25)' },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-gold w-12 h-12 text-xl animate-float">🏆</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Таблица лидеров</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>Топ игроков по заработанным бонусам</p>
        </div>
      </div>

      {/* Podium */}
      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[sorted[1], sorted[0], sorted[2]].map((player, idx) => {
            const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            const m = medals[realIdx];
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={player.id}
                className={`sea-card flex flex-col items-center justify-end ${heights[idx]} p-3 transition-all hover:scale-105`}
                style={{ border: `1px solid ${m.border}`, boxShadow: `0 4px 20px ${m.glow}` }}>
                <span className="text-2xl mb-1">{m.icon}</span>
                <span className="text-2xl mb-1">{player.avatar}</span>
                <div className="text-xs font-semibold text-center truncate w-full" style={{ color: 'var(--sea-navy)' }}>
                  {player.name.split(' ')[0]}
                </div>
                <div className="font-russo text-sm gold-text">{player.bonusEarned.toLocaleString()}₽</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="sea-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(13,59,110,0.42)', borderBottom: '1px solid rgba(14,127,194,0.1)', background: 'rgba(14,127,194,0.03)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-4">Игрок</div>
          <div className="col-span-2 text-center">Выстрелов</div>
          <div className="col-span-2 text-center">Попаданий</div>
          <div className="col-span-1 text-center">Топлено</div>
          <div className="col-span-2 text-right">Бонус</div>
        </div>

        {sorted.map((player, idx) => (
          <div key={player.id}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-blue-50/60"
            style={{ borderBottom: '1px solid rgba(14,127,194,0.07)' }}>
            <div className="col-span-1">
              {idx < 3
                ? <span className="text-lg">{medals[idx].icon}</span>
                : <span className="text-sm font-russo" style={{ color: 'rgba(13,59,110,0.4)' }}>{idx + 1}</span>}
            </div>
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-xl">{player.avatar}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--sea-navy)' }}>{player.name}</div>
                <div className="text-xs" style={{ color: 'rgba(13,59,110,0.4)' }}>{player.department}</div>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="inline-flex items-center gap-1 justify-center">
                <Icon name="Crosshair" size={12} style={{ color: 'rgba(14,127,194,0.5)' }} />
                <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>{player.shotsTotal}</span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <span className="font-russo text-sm" style={{ color: player.hitsTotal > 0 ? 'var(--hit-orange)' : 'rgba(13,59,110,0.5)' }}>
                {player.hitsTotal}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className="font-russo text-sm" style={{ color: player.shipsSunk > 0 ? 'var(--sea-blue)' : 'rgba(13,59,110,0.4)' }}>
                {player.shipsSunk}
              </span>
            </div>
            <div className="col-span-2 text-right">
              {player.bonusEarned > 0
                ? <span className="font-russo text-sm gold-text">+{player.bonusEarned.toLocaleString()}₽</span>
                : <span className="text-xs" style={{ color: 'rgba(13,59,110,0.3)' }}>—</span>}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="p-12 text-center">
            <div className="icon-badge icon-badge-blue w-16 h-16 text-3xl mx-auto mb-3">⚓</div>
            <div className="font-russo text-sm" style={{ color: 'rgba(13,59,110,0.4)' }}>Пока нет игроков</div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { iconName: 'Users',     badge: 'icon-badge-blue',   label: 'Игроков',    value: sorted.length },
          { iconName: 'Crosshair', badge: 'icon-badge-navy',   label: 'Выстрелов',  value: sorted.reduce((s, p) => s + p.shotsTotal, 0) },
          { iconName: 'Skull',     badge: 'icon-badge-red',    label: 'Потоплено',  value: sorted.reduce((s, p) => s + p.shipsSunk, 0) },
          { iconName: 'Banknote',  badge: 'icon-badge-gold',   label: 'Выплачено',  value: `${sorted.reduce((s, p) => s + p.bonusEarned, 0).toLocaleString()}₽` },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 flex items-center gap-3">
            <div className={`icon-badge ${stat.badge} w-11 h-11`}>
              <Icon name={stat.iconName} size={20} />
            </div>
            <div>
              <div className="font-russo text-xl" style={{ color: 'var(--sea-navy)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'rgba(13,59,110,0.45)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
