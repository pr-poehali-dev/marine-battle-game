import { Player, ShotRecord, Ship } from '@/types/game';

interface StatisticsProps {
  players: Player[];
  shots: ShotRecord[];
  ships: Ship[];
}

export default function Statistics({ players, shots, ships }: StatisticsProps) {
  const totalShots = shots.length;
  const totalHits = shots.filter(s => s.result !== 'miss').length;
  const totalSunk = shots.filter(s => s.result === 'sunk').length;
  const totalBonus = shots.reduce((sum, s) => sum + (s.bonus || 0), 0);
  const accuracy = totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 0;

  const topShooter = [...players].sort((a, b) => b.shotsTotal - a.shotsTotal)[0];
  const topAccurate = [...players].filter(p => p.shotsTotal > 0).sort((a, b) =>
    (b.hitsTotal / b.shotsTotal) - (a.hitsTotal / a.shotsTotal)
  )[0];
  const topEarner = [...players].sort((a, b) => b.bonusEarned - a.bonusEarned)[0];

  const shipsRemaining = ships.filter(s => !s.sunk).length;
  const shipsSunk = ships.filter(s => s.sunk).length;

  const byDate: Record<string, number> = {};
  shots.forEach(s => {
    const date = s.timestamp.split(' ')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">📊</span>
          <h2 className="font-russo text-2xl md:text-3xl glow-text" style={{ color: '#00d4ff' }}>
            СТАТИСТИКА ИГРЫ
          </h2>
          <span className="text-3xl animate-float inline-block" style={{ animationDelay: '0.3s' }}>📈</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Полная аналитика игрового процесса
        </p>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Выстрелов', value: totalShots, color: '#00d4ff', icon: '🎯', sub: 'всего' },
          { label: 'Точность', value: `${accuracy}%`, color: totalHits > 0 ? '#ff8040' : '#00d4ff', icon: '🎖️', sub: `${totalHits} попаданий` },
          { label: 'Потоплено', value: totalSunk, color: '#ff4444', icon: '💥', sub: `из ${ships.length} кораблей` },
          { label: 'Выплачено', value: `${totalBonus.toLocaleString()}₽`, color: '#ffd700', icon: '💰', sub: 'бонусов' },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-russo text-2xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: 'rgba(150,200,230,0.8)' }}>{stat.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(100,150,190,0.5)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ship status */}
        <div className="sea-card p-4">
          <div className="font-russo text-sm mb-4 flex items-center gap-2" style={{ color: '#00d4ff' }}>
            <span>🚢</span> Состояние флота
          </div>
          {ships.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'rgba(120,170,200,0.5)' }}>
              <div className="text-3xl mb-2">⚓</div>
              <div className="text-sm">Корабли ещё не расставлены</div>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 text-center p-3 rounded-xl" style={{ background: 'rgba(0,30,70,0.5)', border: '1px solid rgba(0,100,150,0.3)' }}>
                  <div className="font-russo text-xl" style={{ color: '#00d4ff' }}>{shipsRemaining}</div>
                  <div className="text-xs" style={{ color: 'rgba(120,170,200,0.6)' }}>На плаву</div>
                </div>
                <div className="flex-1 text-center p-3 rounded-xl" style={{ background: 'rgba(40,10,0,0.5)', border: '1px solid rgba(150,50,0,0.3)' }}>
                  <div className="font-russo text-xl" style={{ color: '#ff4444' }}>{shipsSunk}</div>
                  <div className="text-xs" style={{ color: 'rgba(200,120,100,0.6)' }}>Потоплено</div>
                </div>
              </div>
              <div className="space-y-2">
                {ships.map(ship => (
                  <div key={ship.id} className="flex items-center gap-3 p-2 rounded-lg"
                    style={{ background: ship.sunk ? 'rgba(100,20,0,0.3)' : 'rgba(0,30,70,0.4)', border: `1px solid ${ship.sunk ? 'rgba(150,50,0,0.4)' : 'rgba(0,100,150,0.3)'}` }}>
                    <div className="flex gap-1">
                      {Array.from({ length: ship.size }).map((_, i) => (
                        <div key={i} className="w-4 h-4 rounded-sm"
                          style={{
                            background: i < ship.hits
                              ? 'rgba(255,80,0,0.8)'
                              : ship.sunk ? 'rgba(80,20,0,0.6)' : 'rgba(30,100,180,0.8)',
                            border: `1px solid ${i < ship.hits ? 'rgba(255,100,0,0.6)' : 'rgba(0,180,220,0.4)'}`
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs" style={{ color: ship.sunk ? 'rgba(200,100,80,0.8)' : 'rgba(150,200,230,0.8)' }}>
                        {ship.size}-палубный
                      </span>
                    </div>
                    <span className="text-xs">{ship.sunk ? '💥 Потоплен' : `${ship.hits}/${ship.size} попаданий`}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Champions */}
        <div className="sea-card p-4">
          <div className="font-russo text-sm mb-4 flex items-center gap-2" style={{ color: '#ffd700' }}>
            <span>🏆</span> Чемпионы раунда
          </div>
          <div className="space-y-3">
            {[
              { title: '🎯 Самый активный', player: topShooter, stat: topShooter ? `${topShooter.shotsTotal} выстрелов` : '—' },
              { title: '💥 Самый меткий', player: topAccurate, stat: topAccurate ? `${Math.round((topAccurate.hitsTotal / topAccurate.shotsTotal) * 100)}% точность` : '—' },
              { title: '💰 Топ по бонусам', player: topEarner, stat: topEarner ? `+${topEarner.bonusEarned.toLocaleString()}₽` : '—' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(0,20,50,0.5)', border: '1px solid rgba(0,80,120,0.3)' }}>
                <div className="flex-1">
                  <div className="text-xs mb-1" style={{ color: 'rgba(120,170,200,0.6)' }}>{item.title}</div>
                  {item.player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.player.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'rgba(200,230,250,0.9)' }}>{item.player.name}</div>
                        <div className="text-xs gold-text">{item.stat}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm" style={{ color: 'rgba(100,150,190,0.5)' }}>Нет данных</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity by day */}
      {Object.keys(byDate).length > 0 && (
        <div className="sea-card p-4">
          <div className="font-russo text-sm mb-4 flex items-center gap-2" style={{ color: '#00d4ff' }}>
            <span>📅</span> Активность по дням
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(byDate).map(([date, count]) => (
              <div key={date} className="text-center p-3 rounded-xl min-w-16"
                style={{ background: 'rgba(0,30,70,0.5)', border: '1px solid rgba(0,100,150,0.3)' }}>
                <div className="font-russo text-lg" style={{ color: '#00d4ff' }}>{count}</div>
                <div className="text-xs" style={{ color: 'rgba(120,170,200,0.6)' }}>{date}</div>
                <div className="text-xs" style={{ color: 'rgba(100,150,190,0.4)' }}>выстрелов</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
