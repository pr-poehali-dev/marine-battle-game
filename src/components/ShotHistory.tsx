import { ShotRecord } from '@/types/game';

interface ShotHistoryProps {
  shots: ShotRecord[];
}

export default function ShotHistory({ shots }: ShotHistoryProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">📋</span>
          <h2 className="font-russo text-2xl md:text-3xl glow-text" style={{ color: '#00d4ff' }}>
            ИСТОРИЯ ПОПАДАНИЙ
          </h2>
          <span className="text-3xl animate-float inline-block" style={{ animationDelay: '0.3s' }}>💥</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Все выстрелы, попадания и потопленные корабли
        </p>
      </div>

      {/* Filter stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Все выстрелы', value: shots.length, color: 'rgba(0,150,200,0.6)', icon: '🎯' },
          { label: 'Попадания / Потоплено', value: `${shots.filter(s => s.result !== 'miss').length} / ${shots.filter(s => s.result === 'sunk').length}`, color: 'rgba(255,80,0,0.6)', icon: '🔥' },
          { label: 'Выплачено бонусов', value: `${shots.reduce((s, r) => s + (r.bonus || 0), 0).toLocaleString()}₽`, color: 'rgba(255,200,0,0.6)', icon: '💰' },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-russo text-lg" style={{ color: stat.color === 'rgba(255,200,0,0.6)' ? '#ffd700' : stat.color }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'rgba(120,170,200,0.6)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* History table */}
      <div className="sea-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-russo"
          style={{ color: 'rgba(0,180,220,0.6)', borderBottom: '1px solid rgba(0,100,150,0.2)' }}>
          <div className="col-span-3">Игрок</div>
          <div className="col-span-2 text-center">Координата</div>
          <div className="col-span-2 text-center">Результат</div>
          <div className="col-span-3">Сделка</div>
          <div className="col-span-2 text-right">Бонус</div>
        </div>

        {shots.length === 0 && (
          <div className="p-10 text-center" style={{ color: 'rgba(120,170,200,0.5)' }}>
            <div className="text-4xl mb-3">🌊</div>
            <div className="font-russo text-sm">Ещё нет выстрелов</div>
            <div className="text-xs mt-1">Сделайте продажу и сделайте первый выстрел!</div>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          {shots.map((shot, idx) => {
            const COLS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
            const coord = `${COLS[shot.col]}${shot.row + 1}`;
            return (
              <div
                key={shot.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all hover:bg-white/5"
                style={{
                  borderBottom: '1px solid rgba(0,80,120,0.15)',
                  background: shot.result === 'sunk'
                    ? 'linear-gradient(90deg, rgba(255,100,0,0.08), transparent)'
                    : shot.result === 'hit'
                      ? 'linear-gradient(90deg, rgba(255,60,0,0.05), transparent)'
                      : 'transparent',
                  animationDelay: `${idx * 0.05}s`
                }}
              >
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'rgba(200,230,250,0.9)' }}>{shot.playerName}</div>
                    <div className="text-xs" style={{ color: 'rgba(100,150,190,0.6)' }}>{shot.timestamp}</div>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className="font-russo text-sm px-2 py-1 rounded"
                    style={{ background: 'rgba(0,50,100,0.5)', color: '#7ef4ff' }}>
                    {coord}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  {shot.result === 'miss' && <span className="badge-miss">Промах</span>}
                  {shot.result === 'hit' && <span className="badge-hit">Попадание</span>}
                  {shot.result === 'sunk' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="badge-sink">Потоплен!</span>
                      {shot.shipSize && (
                        <span className="text-xs" style={{ color: 'rgba(150,200,230,0.6)' }}>
                          {shot.shipSize}-пал.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-3">
                  <div className="text-xs truncate" style={{ color: 'rgba(150,200,230,0.7)' }}>
                    {shot.saleInfo || '—'}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  {shot.bonus && shot.bonus > 0
                    ? <span className="font-russo text-sm gold-text">+{shot.bonus.toLocaleString()}₽</span>
                    : <span className="text-xs" style={{ color: 'rgba(100,150,190,0.4)' }}>—</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
