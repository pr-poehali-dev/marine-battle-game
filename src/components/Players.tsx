import { useState } from 'react';
import { Player } from '@/types/game';
import Icon from '@/components/ui/icon';

interface PlayersProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'>) => void;
}

const AVATARS = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍🎯', '👨‍🚀', '👩‍🚀', '🧑‍💼', '👨‍🔬', '👩‍🔬'];

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
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-float inline-block">👥</span>
          <h2 className="font-russo text-2xl md:text-3xl glow-text" style={{ color: '#00d4ff' }}>
            УПРАВЛЕНИЕ ИГРОКАМИ
          </h2>
          <span className="text-3xl animate-float inline-block" style={{ animationDelay: '0.3s' }}>⚓</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(150,200,230,0.7)' }}>
          Добавляй сотрудников из Битрикс24 или вручную
        </p>
      </div>

      {/* Bitrix24 integration block */}
      <div className="sea-card p-5" style={{ border: '1px solid rgba(255,180,0,0.3)', background: 'linear-gradient(135deg, rgba(20,50,30,0.6), rgba(10,30,70,0.9))' }}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔗</div>
          <div className="flex-1">
            <div className="font-russo text-sm mb-1" style={{ color: '#ffd700' }}>
              ИНТЕГРАЦИЯ С БИТРИКС24
            </div>
            <div className="text-sm mb-3" style={{ color: 'rgba(180,220,200,0.8)' }}>
              Подключите Битрикс24 для автоматической синхронизации сотрудников, сделок и начисления выстрелов при закрытии продажи
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { icon: '👤', text: 'Синхронизация контактов и сотрудников' },
                { icon: '💼', text: 'Автовыстрел при закрытии сделки' },
                { icon: '📊', text: 'Статистика продаж в игре' },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(0,40,20,0.4)', border: '1px solid rgba(0,200,100,0.2)' }}>
                  <span>{item.icon}</span>
                  <span className="text-xs" style={{ color: 'rgba(150,220,180,0.8)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-gold px-4 py-2 rounded-xl text-sm font-russo">
                🔗 Подключить Битрикс24
              </button>
              <div className="px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                style={{ background: 'rgba(0,30,60,0.5)', border: '1px solid rgba(0,100,150,0.3)', color: 'rgba(150,200,230,0.8)' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(200,200,0,0.7)' }} />
                Требуется настройка Webhook
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add player */}
      <div className="flex justify-between items-center">
        <h3 className="font-russo text-sm uppercase tracking-wider" style={{ color: '#00d4ff' }}>
          Список игроков ({players.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-sea px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <Icon name="UserPlus" size={16} />
          Добавить вручную
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="sea-card p-4 animate-scale-in">
          <div className="font-russo text-sm mb-4" style={{ color: '#00d4ff' }}>➕ Новый игрок</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'rgba(150,200,230,0.6)' }}>Имя и фамилия</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Иван Петров"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50"
                style={{ background: 'rgba(0,30,70,0.6)', border: '1px solid rgba(0,150,200,0.3)', color: 'rgba(200,230,250,0.9)', fontFamily: 'Golos Text' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'rgba(150,200,230,0.6)' }}>Отдел</label>
              <input
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="Отдел продаж"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50"
                style={{ background: 'rgba(0,30,70,0.6)', border: '1px solid rgba(0,150,200,0.3)', color: 'rgba(200,230,250,0.9)', fontFamily: 'Golos Text' }}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: 'rgba(150,200,230,0.6)' }}>Аватар</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setForm(f => ({ ...f, avatar }))}
                  className={`text-2xl p-2 rounded-lg transition-all ${form.avatar === avatar ? 'scale-125' : 'opacity-60 hover:opacity-100'}`}
                  style={{ background: form.avatar === avatar ? 'rgba(0,150,200,0.3)' : 'rgba(0,20,50,0.3)', border: `1px solid ${form.avatar === avatar ? 'rgba(0,200,255,0.5)' : 'transparent'}` }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="btn-gold px-6 py-2 rounded-xl text-sm font-russo">
              ✅ Добавить
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(100,150,200,0.3)', color: 'rgba(150,200,230,0.7)' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Players grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, idx) => (
          <div key={player.id} className="sea-card p-4 flex items-start gap-3 hover:scale-105 transition-all animate-fade-in"
            style={{ animationDelay: `${idx * 0.08}s` }}>
            <span className="text-3xl">{player.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold" style={{ color: 'rgba(200,230,250,0.95)' }}>{player.name}</div>
              <div className="text-xs mb-3" style={{ color: 'rgba(100,160,200,0.7)' }}>{player.department}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {[
                  { label: 'Выстрелов', value: player.shotsTotal },
                  { label: 'Попаданий', value: player.hitsTotal },
                  { label: 'Потоплено', value: player.shipsSunk },
                  { label: 'Бонус', value: `${player.bonusEarned.toLocaleString()}₽`, gold: true },
                ].map(stat => (
                  <div key={stat.label}>
                    <span className="text-xs" style={{ color: 'rgba(100,150,190,0.6)' }}>{stat.label}: </span>
                    <span className={`text-xs font-semibold ${stat.gold ? 'gold-text' : ''}`}
                      style={!stat.gold ? { color: 'rgba(150,200,230,0.8)' } : {}}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              {player.lastShot && (
                <div className="mt-2 text-xs" style={{ color: 'rgba(100,150,190,0.5)' }}>
                  Последний выстрел: {player.lastShot}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="sea-card p-10 text-center">
          <div className="text-5xl mb-3">👥</div>
          <div className="font-russo text-sm mb-2" style={{ color: 'rgba(150,200,230,0.7)' }}>Нет игроков</div>
          <div className="text-xs" style={{ color: 'rgba(100,150,190,0.5)' }}>Подключи Битрикс24 или добавь вручную</div>
        </div>
      )}
    </div>
  );
}
