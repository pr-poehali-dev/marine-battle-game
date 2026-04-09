import { Player, ShotRecord, Ship } from '@/types/game';
import Icon from '@/components/ui/icon';

interface StatisticsProps {
  players: Player[];
  shots: ShotRecord[];
  ships: Ship[];
}

export default function Statistics({ players, shots, ships }: StatisticsProps) {
  const totalShots  = shots.length;
  const totalHits   = shots.filter(s => s.result !== 'miss').length;
  const totalSunk   = shots.filter(s => s.result === 'sunk').length;
  const totalBonus  = shots.reduce((s, r) => s + (r.bonus || 0), 0);
  const accuracy    = totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 0;

  const topShooter  = [...players].sort((a, b) => b.shotsTotal - a.shotsTotal)[0];
  const topAccurate = [...players].filter(p => p.shotsTotal > 0)
    .sort((a, b) => (b.hitsTotal / b.shotsTotal) - (a.hitsTotal / a.shotsTotal))[0];
  const topEarner   = [...players].sort((a, b) => b.bonusEarned - a.bonusEarned)[0];

  const shipsRemaining = ships.filter(s => !s.sunk).length;
  const shipsSunk      = ships.filter(s => s.sunk).length;

  const byDate: Record<string, number> = {};
  shots.forEach(s => { const d = s.timestamp.split(' ')[0]; byDate[d] = (byDate[d] || 0) + 1; });

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-purple w-12 h-12 text-xl animate-float">📊</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Статистика</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>Полная аналитика игрового процесса</p>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { iconName: 'Crosshair', badge: 'icon-badge-blue',   label: 'Выстрелов',  value: totalShots,  sub: 'всего' },
          { iconName: 'Target',    badge: 'icon-badge-teal',   label: 'Точность',   value: `${accuracy}%`, sub: `${totalHits} попаданий` },
          { iconName: 'Skull',     badge: 'icon-badge-red',    label: 'Потоплено',  value: totalSunk,   sub: `из ${ships.length} кораблей` },
          { iconName: 'Banknote',  badge: 'icon-badge-gold',   label: 'Выплачено',  value: `${totalBonus.toLocaleString()}₽`, sub: 'бонусов' },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 flex items-center gap-3">
            <div className={`icon-badge ${stat.badge} w-12 h-12 flex-shrink-0`}>
              <Icon name={stat.iconName} size={22} />
            </div>
            <div>
              <div className="font-russo text-xl leading-tight" style={{ color: 'var(--sea-navy)' }}>{stat.value}</div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(13,59,110,0.55)' }}>{stat.label}</div>
              <div style={{ fontSize: '10px', color: 'rgba(13,59,110,0.35)' }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fleet status */}
        <div className="sea-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge icon-badge-navy w-9 h-9"><Icon name="Ship" size={17} /></div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Состояние флота</span>
          </div>

          {ships.length === 0 ? (
            <div className="text-center py-8">
              <div className="icon-badge icon-badge-blue w-14 h-14 text-3xl mx-auto mb-3">⚓</div>
              <div className="text-sm" style={{ color: 'rgba(13,59,110,0.4)' }}>Корабли не расставлены</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl"
                  style={{ background: 'rgba(14,127,194,0.06)', border: '1px solid rgba(14,127,194,0.15)' }}>
                  <div className="icon-badge icon-badge-blue w-9 h-9"><Icon name="Anchor" size={16} /></div>
                  <div>
                    <div className="font-russo text-xl" style={{ color: 'var(--sea-blue)' }}>{shipsRemaining}</div>
                    <div className="text-xs" style={{ color: 'rgba(13,59,110,0.45)' }}>На плаву</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl"
                  style={{ background: 'rgba(240,82,40,0.06)', border: '1px solid rgba(240,82,40,0.18)' }}>
                  <div className="icon-badge icon-badge-red w-9 h-9"><Icon name="Skull" size={16} /></div>
                  <div>
                    <div className="font-russo text-xl" style={{ color: 'var(--hit-orange)' }}>{shipsSunk}</div>
                    <div className="text-xs" style={{ color: 'rgba(13,59,110,0.45)' }}>Потоплено</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {ships.map(ship => (
                  <div key={ship.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                    style={{ background: ship.sunk ? 'rgba(240,82,40,0.05)' : 'rgba(14,127,194,0.04)', border: `1px solid ${ship.sunk ? 'rgba(240,82,40,0.2)' : 'rgba(14,127,194,0.12)'}` }}>
                    <div className="flex gap-1">
                      {Array.from({ length: ship.size }).map((_, i) => (
                        <div key={i} className="w-4 h-4 rounded"
                          style={{
                            background: i < ship.hits ? 'rgba(240,82,40,0.75)' : ship.sunk ? 'rgba(200,50,30,0.25)' : 'rgba(30,111,168,0.7)',
                            border: `1px solid ${i < ship.hits ? 'rgba(240,82,40,0.5)' : 'rgba(14,127,194,0.3)'}`,
                          }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium flex-1" style={{ color: ship.sunk ? 'rgba(180,60,40,0.8)' : 'rgba(13,59,110,0.7)' }}>
                      {ship.size}-палубный
                    </span>
                    <span className="text-xs" style={{ color: ship.sunk ? '#c0391e' : 'rgba(13,59,110,0.4)' }}>
                      {ship.sunk ? '💥 Потоплен' : `${ship.hits}/${ship.size}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Champions */}
        <div className="sea-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge icon-badge-gold w-9 h-9"><Icon name="Trophy" size={17} /></div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Чемпионы раунда</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { title: 'Самый активный',  iconName: 'Zap',      badge: 'icon-badge-blue',   player: topShooter,  stat: topShooter ? `${topShooter.shotsTotal} выстрелов` : '—' },
              { title: 'Самый меткий',    iconName: 'Target',   badge: 'icon-badge-teal',   player: topAccurate, stat: topAccurate ? `${Math.round((topAccurate.hitsTotal / topAccurate.shotsTotal) * 100)}% точность` : '—' },
              { title: 'Топ по бонусам',  iconName: 'Banknote', badge: 'icon-badge-gold',   player: topEarner,   stat: topEarner ? `+${topEarner.bonusEarned.toLocaleString()}₽` : '—' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: 'rgba(14,127,194,0.04)', border: '1px solid rgba(14,127,194,0.1)' }}>
                <div className={`icon-badge ${item.badge} w-9 h-9 flex-shrink-0`}>
                  <Icon name={item.iconName} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(13,59,110,0.45)' }}>{item.title}</div>
                  {item.player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.player.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--sea-navy)' }}>{item.player.name}</div>
                        <div className="text-xs gold-text">{item.stat}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm" style={{ color: 'rgba(13,59,110,0.3)' }}>Нет данных</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity by day */}
      {Object.keys(byDate).length > 0 && (
        <div className="sea-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge icon-badge-blue w-9 h-9"><Icon name="Calendar" size={16} /></div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Активность по дням</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(byDate).map(([date, count]) => (
              <div key={date} className="text-center p-3 rounded-2xl min-w-16"
                style={{ background: 'rgba(14,127,194,0.06)', border: '1px solid rgba(14,127,194,0.15)' }}>
                <div className="font-russo text-xl" style={{ color: 'var(--sea-blue)' }}>{count}</div>
                <div className="text-xs font-medium" style={{ color: 'rgba(13,59,110,0.6)' }}>{date}</div>
                <div style={{ fontSize: '10px', color: 'rgba(13,59,110,0.35)' }}>выстрелов</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
