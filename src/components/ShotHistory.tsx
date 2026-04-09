import { ShotRecord } from '@/types/game';
import Icon from '@/components/ui/icon';

interface ShotHistoryProps {
  shots: ShotRecord[];
}

export default function ShotHistory({ shots }: ShotHistoryProps) {
  const COLS = ['А','Б','В','Г','Д','Е','Ж','З','И','К'];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-navy w-12 h-12 text-xl animate-float">📋</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>История попаданий</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>Все выстрелы, результаты и бонусы</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { iconName: 'Crosshair', badge: 'icon-badge-blue',  label: 'Всего выстрелов', value: shots.length },
          { iconName: 'Flame',     badge: 'icon-badge-red',   label: 'Попаданий / Потоплено', value: `${shots.filter(s => s.result !== 'miss').length} / ${shots.filter(s => s.result === 'sunk').length}` },
          { iconName: 'Banknote',  badge: 'icon-badge-gold',  label: 'Выплачено бонусов', value: `${shots.reduce((s, r) => s + (r.bonus || 0), 0).toLocaleString()}₽` },
        ].map(stat => (
          <div key={stat.label} className="sea-card p-4 flex items-center gap-3">
            <div className={`icon-badge ${stat.badge} w-11 h-11 flex-shrink-0`}>
              <Icon name={stat.iconName} size={20} />
            </div>
            <div>
              <div className="font-russo text-xl leading-tight" style={{ color: 'var(--sea-navy)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'rgba(13,59,110,0.45)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="sea-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(13,59,110,0.42)', borderBottom: '1px solid rgba(14,127,194,0.1)', background: 'rgba(14,127,194,0.03)' }}>
          <div className="col-span-3">Игрок</div>
          <div className="col-span-2 text-center">Координата</div>
          <div className="col-span-2 text-center">Результат</div>
          <div className="col-span-3">Сделка</div>
          <div className="col-span-2 text-right">Бонус</div>
        </div>

        {shots.length === 0 && (
          <div className="p-12 text-center">
            <div className="icon-badge icon-badge-blue w-16 h-16 text-3xl mx-auto mb-3">🌊</div>
            <div className="font-russo text-sm mb-1" style={{ color: 'rgba(13,59,110,0.4)' }}>Пока нет выстрелов</div>
            <div className="text-xs" style={{ color: 'rgba(13,59,110,0.3)' }}>Сделайте продажу и сделайте первый выстрел!</div>
          </div>
        )}

        <div className="max-h-[480px] overflow-y-auto">
          {shots.map((shot) => {
            const coord = `${COLS[shot.col]}${shot.row + 1}`;
            const rowBg = shot.result === 'sunk'
              ? 'rgba(245,166,35,0.04)'
              : shot.result === 'hit'
                ? 'rgba(240,82,40,0.03)'
                : 'transparent';

            return (
              <div key={shot.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-blue-50/60"
                style={{ borderBottom: '1px solid rgba(14,127,194,0.07)', background: rowBg }}>

                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-lg">{shot.playerName.includes('Алексей') ? '👨‍💼' : shot.playerName.includes('Мария') ? '👩‍💼' : shot.playerName.includes('Игорь') ? '🧑‍🎯' : '👤'}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--sea-navy)' }}>{shot.playerName}</div>
                    <div className="text-xs" style={{ color: 'rgba(13,59,110,0.38)' }}>{shot.timestamp}</div>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className="font-russo text-sm px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(14,127,194,0.08)', color: 'var(--sea-blue)', border: '1px solid rgba(14,127,194,0.18)' }}>
                    {coord}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  {shot.result === 'miss' && (
                    <span className="badge-miss inline-flex items-center gap-1">
                      <Icon name="Droplets" size={10} /> Промах
                    </span>
                  )}
                  {shot.result === 'hit' && (
                    <span className="badge-hit inline-flex items-center gap-1">
                      <Icon name="Flame" size={10} /> Попадание
                    </span>
                  )}
                  {shot.result === 'sunk' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="badge-sink inline-flex items-center gap-1">
                        <Icon name="Skull" size={10} /> Потоплен!
                      </span>
                      {shot.shipSize && (
                        <span className="text-xs" style={{ color: 'rgba(13,59,110,0.4)' }}>{shot.shipSize}-пал.</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-3">
                  <div className="text-xs truncate" style={{ color: 'rgba(13,59,110,0.6)' }}>
                    {shot.saleInfo || '—'}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  {shot.bonus && shot.bonus > 0
                    ? <span className="font-russo text-sm gold-text">+{shot.bonus.toLocaleString()}₽</span>
                    : <span className="text-xs" style={{ color: 'rgba(13,59,110,0.28)' }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
