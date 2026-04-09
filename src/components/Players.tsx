import { useState } from 'react';
import { Player } from '@/types/game';
import Icon from '@/components/ui/icon';

interface PlayersProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'>) => void;
}

const AVATARS = ['👨‍💼','👩‍💼','👨‍💻','👩‍💻','🧑‍🎯','👨‍🚀','👩‍🚀','🧑‍💼','👨‍🔬','👩‍🔬'];

export default function Players({ players, onAddPlayer }: PlayersProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', avatar: '👨‍💼' });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.department.trim()) return;
    onAddPlayer({ name: form.name.trim(), department: form.department.trim(), avatar: form.avatar });
    setForm({ name: '', department: '', avatar: '👨‍💼' });
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-teal w-12 h-12 text-xl animate-float">👥</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Игроки</h2>
          <p className="text-sm" style={{ color: 'rgba(13,59,110,0.5)' }}>Управление командой и интеграция с Битрикс24</p>
        </div>
      </div>

      {/* Bitrix24 block */}
      <div className="sea-card p-5" style={{ border: '1px solid rgba(22,163,74,0.2)', background: 'linear-gradient(135deg,rgba(240,253,244,0.8),#ffffff)' }}>
        <div className="flex items-start gap-4">
          <div className="icon-badge icon-badge-green w-14 h-14 text-3xl flex-shrink-0">🔗</div>
          <div className="flex-1">
            <div className="font-russo text-base mb-1" style={{ color: '#15803d' }}>Интеграция с Битрикс24</div>
            <div className="text-sm mb-4" style={{ color: 'rgba(21,128,61,0.75)' }}>
              Подключите Битрикс24 для автоматической синхронизации сотрудников и выстрелов при закрытии сделки
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { iconName: 'UserCheck',  text: 'Синхронизация сотрудников', badge: 'icon-badge-green' },
                { iconName: 'Zap',        text: 'Автовыстрел при закрытии сделки', badge: 'icon-badge-green' },
                { iconName: 'BarChart2',  text: 'Статистика продаж в игре', badge: 'icon-badge-green' },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2.5 p-3 rounded-2xl"
                  style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.15)' }}>
                  <div className={`icon-badge ${item.badge} w-8 h-8 flex-shrink-0 mt-0.5`}>
                    <Icon name={item.iconName} size={14} />
                  </div>
                  <span className="text-xs font-medium leading-snug" style={{ color: 'rgba(21,128,61,0.85)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Icon name="Link2" size={15} /> Подключить Битрикс24
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', color: 'rgba(21,128,61,0.7)' }}>
                <Icon name="Info" size={13} /> Требуется настройка Webhook
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-badge icon-badge-blue w-8 h-8">
            <Icon name="Users" size={15} />
          </div>
          <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>
            Список игроков ({players.length})
          </span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-sea px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <Icon name="UserPlus" size={15} /> Добавить
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="sea-card p-5 animate-scale-in" style={{ border: '1px solid rgba(14,127,194,0.25)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge icon-badge-blue w-8 h-8"><Icon name="UserPlus" size={15} /></div>
            <span className="font-russo text-sm" style={{ color: 'var(--sea-navy)' }}>Новый игрок</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Имя и фамилия</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Иван Петров"
                className="sea-input w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Отдел</label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="Отдел продаж"
                className="sea-input w-full px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(13,59,110,0.45)' }}>Аватар</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(av => (
                <button key={av} onClick={() => setForm(f => ({ ...f, avatar: av }))}
                  className={`text-2xl p-2 rounded-xl transition-all ${form.avatar === av ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}
                  style={{
                    background: form.avatar === av ? 'rgba(14,127,194,0.12)' : 'rgba(14,127,194,0.04)',
                    border: `1px solid ${form.avatar === av ? 'rgba(14,127,194,0.4)' : 'rgba(14,127,194,0.1)'}`,
                  }}>
                  {av}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <Icon name="Check" size={15} /> Добавить
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost px-6 py-2.5 rounded-xl text-sm">Отмена</button>
          </div>
        </div>
      )}

      {/* Players grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, idx) => (
          <div key={player.id}
            className="sea-card p-4 flex items-start gap-3 hover:scale-[1.02] transition-all animate-fade-in"
            style={{ animationDelay: `${idx * 0.07}s` }}>
            <span className="text-3xl leading-none mt-0.5">{player.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: 'var(--sea-navy)' }}>{player.name}</div>
              <div className="text-xs mb-3" style={{ color: 'rgba(13,59,110,0.42)' }}>{player.department}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { iconName: 'Crosshair', label: 'Выстрелов', value: player.shotsTotal,   badge: 'icon-badge-blue' },
                  { iconName: 'Flame',     label: 'Попаданий',  value: player.hitsTotal,    badge: 'icon-badge-red' },
                  { iconName: 'Anchor',    label: 'Потоплено',  value: player.shipsSunk,     badge: 'icon-badge-navy' },
                  { iconName: 'Banknote',  label: 'Бонус',      value: `${player.bonusEarned.toLocaleString()}₽`, badge: 'icon-badge-gold' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
                    style={{ background: 'rgba(14,127,194,0.04)', border: '1px solid rgba(14,127,194,0.1)' }}>
                    <div className={`icon-badge ${s.badge} w-6 h-6`}><Icon name={s.iconName} size={11} /></div>
                    <div>
                      <div className="font-russo text-xs leading-none" style={{ color: 'var(--sea-navy)' }}>{s.value}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(13,59,110,0.4)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              {player.lastShot && (
                <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'rgba(13,59,110,0.38)' }}>
                  <Icon name="Clock" size={11} /> {player.lastShot}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="sea-card p-12 text-center">
          <div className="icon-badge icon-badge-blue w-20 h-20 text-4xl mx-auto mb-4">👥</div>
          <div className="font-russo text-sm mb-1" style={{ color: 'rgba(13,59,110,0.45)' }}>Нет игроков</div>
          <div className="text-xs" style={{ color: 'rgba(13,59,110,0.3)' }}>Подключи Битрикс24 или добавь вручную</div>
        </div>
      )}
    </div>
  );
}
