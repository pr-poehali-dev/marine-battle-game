import { useRef, useState } from 'react';
import { Player } from '@/types/game';
import Icon from '@/components/ui/icon';

interface PlayersProps {
  players: Player[];
  onAddPlayer: (
    player: Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'>
  ) => void;
  onRemovePlayer: (id: string) => void;
}

const AVATARS = [
  '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍🎯',
  '👨‍🚀', '👩‍🚀', '🧑‍💼', '👨‍🔬', '👩‍🔬',
];

interface FormState {
  name: string;
  department: string;
  avatar: string;
  avatarUrl: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  department: '',
  avatar: '👨‍💼',
  avatarUrl: '',
};

// Player extended with optional base64 photo (stored at runtime, not in the core type)
type PlayerWithPhoto = Player & { avatarUrl?: string };

// Payload emitted by the add-form (may carry avatarUrl on top of core fields)
type NewPlayerPayload = Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'> & {
  avatarUrl?: string;
};

// ── Avatar display ─────────────────────────────────────────────────────────────
function PlayerAvatar({
  avatarUrl,
  avatar,
  size = 'lg',
}: {
  avatarUrl?: string;
  avatar: string;
  size?: 'sm' | 'lg';
}) {
  const dim = size === 'lg' ? 48 : 32;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        width={dim}
        height={dim}
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid rgba(10,93,150,0.25)',
        }}
      />
    );
  }
  return (
    <span
      style={{
        fontSize: size === 'lg' ? 30 : 20,
        lineHeight: 1,
        flexShrink: 0,
        display: 'block',
        marginTop: size === 'lg' ? 2 : 0,
      }}
    >
      {avatar}
    </span>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────────
function StatPill({
  iconName,
  label,
  value,
  badge,
}: {
  iconName: string;
  label: string;
  value: string | number;
  badge: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
      style={{
        background: 'rgba(14,127,194,0.05)',
        border: '1px solid rgba(14,127,194,0.12)',
      }}
    >
      <div className={`icon-badge ${badge} w-6 h-6 flex-shrink-0`}>
        <Icon name={iconName} size={11} />
      </div>
      <div>
        <div className="font-russo text-xs leading-none" style={{ color: 'var(--sea-text)' }}>
          {value}
        </div>
        <div style={{ fontSize: 9, color: 'var(--sea-text-dim)' }}>{label}</div>
      </div>
    </div>
  );
}

// ── Player card ────────────────────────────────────────────────────────────────
function PlayerCard({
  player,
  idx,
  onRemove,
}: {
  player: PlayerWithPhoto;
  idx: number;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={player.id}
      className="sea-card p-4 flex items-start gap-3 transition-all animate-fade-in"
      style={{
        animationDelay: `${idx * 0.07}s`,
        position: 'relative',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button — appears on hover */}
      <button
        onClick={onRemove}
        aria-label="Удалить игрока"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          background: hovered ? 'rgba(192,30,30,0.12)' : 'transparent',
          color: hovered ? '#c0392b' : 'transparent',
          transition: 'all 0.18s',
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        <Icon name="Trash2" size={14} />
      </button>

      {/* Avatar */}
      <PlayerAvatar avatarUrl={player.avatarUrl} avatar={player.avatar} size="lg" />

      {/* Content */}
      <div className="flex-1 min-w-0" style={{ paddingRight: 24 }}>
        <div
          className="font-semibold text-sm truncate"
          style={{ color: 'var(--sea-text)' }}
        >
          {player.name}
        </div>
        <div
          className="text-xs mb-3 truncate"
          style={{ color: 'var(--sea-text-dim)' }}
        >
          {player.department}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <StatPill iconName="Crosshair" label="Выстрелов"  value={player.shotsTotal}                              badge="icon-badge-blue"  />
          <StatPill iconName="Flame"     label="Попаданий"  value={player.hitsTotal}                               badge="icon-badge-red"   />
          <StatPill iconName="Anchor"    label="Потоплено"  value={player.shipsSunk}                               badge="icon-badge-navy"  />
          <StatPill iconName="Banknote"  label="Бонус"      value={`${player.bonusEarned.toLocaleString()}₽`}      badge="icon-badge-gold"  />
        </div>
      </div>
    </div>
  );
}

// ── Add-player form ────────────────────────────────────────────────────────────
function AddPlayerForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: NewPlayerPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm((f) => ({ ...f, avatarUrl: base64, avatar: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = (av: string) => {
    setForm((f) => ({ ...f, avatar: av, avatarUrl: '' }));
    // clear file input so same file can be re-selected after switching back
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.department.trim()) return;
    const payload: NewPlayerPayload = {
      name: form.name.trim(),
      department: form.department.trim(),
      avatar: form.avatar || '👨‍💼',
    };
    if (form.avatarUrl) payload.avatarUrl = form.avatarUrl;
    onSubmit(payload);
  };

  const previewAvatar = form.avatarUrl ? (
    <img
      src={form.avatarUrl}
      alt="preview"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(14,127,194,0.4)',
      }}
    />
  ) : (
    <span style={{ fontSize: 32, lineHeight: 1 }}>{form.avatar}</span>
  );

  return (
    <div
      className="sea-card p-5 animate-scale-in"
      style={{ border: '1px solid rgba(14,127,194,0.25)' }}
    >
      {/* Form header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="icon-badge icon-badge-blue w-8 h-8">
          <Icon name="UserPlus" size={15} />
        </div>
        <span className="font-russo text-sm" style={{ color: 'var(--sea-text)' }}>
          Новый игрок
        </span>
      </div>

      {/* Name + department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
            style={{ color: 'var(--sea-text-sub)' }}
          >
            Имя и фамилия
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Иван Петров"
            className="sea-input w-full px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
            style={{ color: 'var(--sea-text-sub)' }}
          >
            Отдел
          </label>
          <input
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="Отдел продаж"
            className="sea-input w-full px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Avatar section */}
      <div className="mt-4">
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-2 block"
          style={{ color: 'var(--sea-text-sub)' }}
        >
          Аватар
        </label>

        <div className="flex items-start gap-3 flex-wrap">
          {/* Current preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(14,127,194,0.08)',
              border: '1.5px solid rgba(14,127,194,0.2)',
              flexShrink: 0,
            }}
          >
            {previewAvatar}
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Emoji row + upload button */}
            <div className="flex items-center gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectEmoji(av)}
                  className="text-2xl p-1.5 rounded-xl transition-all"
                  style={{
                    background:
                      form.avatar === av && !form.avatarUrl
                        ? 'rgba(14,127,194,0.14)'
                        : 'rgba(14,127,194,0.04)',
                    border: `1px solid ${
                      form.avatar === av && !form.avatarUrl
                        ? 'rgba(14,127,194,0.45)'
                        : 'rgba(14,127,194,0.12)'
                    }`,
                    transform: form.avatar === av && !form.avatarUrl ? 'scale(1.12)' : 'scale(1)',
                    opacity: !form.avatarUrl && form.avatar !== av ? 0.55 : 1,
                  }}
                >
                  {av}
                </button>
              ))}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />

              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: form.avatarUrl
                    ? 'rgba(14,127,194,0.18)'
                    : 'rgba(14,127,194,0.06)',
                  border: `1px solid ${
                    form.avatarUrl ? 'rgba(14,127,194,0.5)' : 'rgba(14,127,194,0.2)'
                  }`,
                  color: 'var(--sea-text-sub)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                <Icon name="Upload" size={13} />
                {form.avatarUrl ? 'Фото загружено' : 'Загрузить фото'}
              </button>

              {/* Clear uploaded photo */}
              {form.avatarUrl && (
                <button
                  onClick={() => {
                    setForm((f) => ({ ...f, avatarUrl: '', avatar: '👨‍💼' }));
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(192,30,30,0.07)',
                    border: '1px solid rgba(192,30,30,0.2)',
                    color: '#c0392b',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="X" size={12} />
                  Убрать
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleSubmit}
          className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
        >
          <Icon name="Check" size={15} /> Добавить
        </button>
        <button
          onClick={onCancel}
          className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Players({ players, onAddPlayer, onRemovePlayer }: PlayersProps) {
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleAdd = (
    data: Omit<Player, 'id' | 'shotsTotal' | 'hitsTotal' | 'shipsSunk' | 'bonusEarned'>
  ) => {
    onAddPlayer(data);
    setShowForm(false);
  };

  const handleRemoveClick = (id: string) => {
    setConfirmId(id);
  };

  const handleConfirmRemove = () => {
    if (confirmId) {
      onRemovePlayer(confirmId);
      setConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-teal w-12 h-12 text-xl animate-float">👥</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-text)' }}>
            Игроки
          </h2>
          <p className="text-sm" style={{ color: 'var(--sea-text-dim)' }}>
            Управление командой и интеграция с Битрикс24
          </p>
        </div>
      </div>

      {/* ── Bitrix24 block ──────────────────────────────────────── */}
      <div
        className="sea-card p-5"
        style={{ border: '1px solid rgba(22,163,74,0.22)' }}
      >
        <div className="flex items-start gap-4">
          <div className="icon-badge icon-badge-green w-14 h-14 text-3xl flex-shrink-0">🔗</div>
          <div className="flex-1">
            <div className="font-russo text-base mb-1" style={{ color: 'var(--green-ok)' }}>
              Интеграция с Битрикс24
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--sea-text-dim)' }}>
              Подключите Битрикс24 для автоматической синхронизации сотрудников и выстрелов при
              закрытии сделки
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { iconName: 'UserCheck', text: 'Синхронизация сотрудников' },
                { iconName: 'Zap',       text: 'Автовыстрел при закрытии сделки' },
                { iconName: 'BarChart2', text: 'Статистика продаж в игре' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-2.5 p-3 rounded-2xl"
                  style={{
                    background: 'rgba(22,163,74,0.07)',
                    border: '1px solid rgba(22,163,74,0.15)',
                  }}
                >
                  <div className="icon-badge icon-badge-green w-8 h-8 flex-shrink-0 mt-0.5">
                    <Icon name={item.iconName} size={14} />
                  </div>
                  <span
                    className="text-xs font-medium leading-snug"
                    style={{ color: 'var(--sea-text-sub)' }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Icon name="Link2" size={15} /> Подключить Битрикс24
              </button>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: 'rgba(22,163,74,0.07)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  color: 'var(--sea-text-dim)',
                }}
              >
                <Icon name="Info" size={13} /> Требуется настройка Webhook
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── List header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-badge icon-badge-blue w-8 h-8">
            <Icon name="Users" size={15} />
          </div>
          <span className="font-russo text-sm" style={{ color: 'var(--sea-text)' }}>
            Список игроков ({players.length})
          </span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-sea px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <Icon name="UserPlus" size={15} />
          {showForm ? 'Скрыть' : 'Добавить'}
        </button>
      </div>

      {/* ── Add form ───────────────────────────────────────────── */}
      {showForm && (
        <AddPlayerForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* ── Confirm delete dialog ──────────────────────────────── */}
      {confirmId && (() => {
        const target = players.find((p) => p.id === confirmId);
        return (
          <div
            className="sea-card p-5 animate-scale-in"
            style={{ border: '1.5px solid rgba(192,30,30,0.3)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="icon-badge w-10 h-10 flex-shrink-0"
                style={{ background: 'rgba(192,30,30,0.1)', border: '1px solid rgba(192,30,30,0.25)' }}
              >
                <Icon name="Trash2" size={18} color="#c0392b" />
              </div>
              <div className="flex-1">
                <div className="font-russo text-sm mb-1" style={{ color: 'var(--sea-text)' }}>
                  Удалить игрока?
                </div>
                <div className="text-sm mb-4" style={{ color: 'var(--sea-text-dim)' }}>
                  Игрок{' '}
                  <span className="font-semibold" style={{ color: 'var(--sea-text)' }}>
                    {target?.name}
                  </span>{' '}
                  будет удалён без возможности восстановления.
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmRemove}
                    className="btn-danger px-5 py-2 rounded-xl text-sm flex items-center gap-2"
                  >
                    <Icon name="Trash2" size={14} /> Удалить
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="btn-ghost px-5 py-2 rounded-xl text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Players grid ───────────────────────────────────────── */}
      {players.length === 0 ? (
        <div
          className="sea-card p-10 flex flex-col items-center gap-3"
          style={{ border: '1.5px dashed rgba(14,127,194,0.25)' }}
        >
          <span style={{ fontSize: 40 }}>⚓</span>
          <div className="font-russo text-sm" style={{ color: 'var(--sea-text-dim)' }}>
            Нет игроков
          </div>
          <div className="text-xs" style={{ color: 'var(--sea-text-dim)' }}>
            Добавьте первого участника команды
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player, idx) => (
            <PlayerCard
              key={player.id}
              player={player}
              idx={idx}
              onRemove={() => handleRemoveClick(player.id)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom stat summary ─────────────────────────────────── */}
      {players.length > 0 && (
        <div
          className="sea-card p-4 flex flex-wrap gap-4 justify-between items-center animate-fade-in"
          style={{ border: '1px solid rgba(14,127,194,0.12)' }}
        >
          {[
            {
              iconName: 'Users',
              label: 'Участников',
              value: players.length,
              badge: 'icon-badge-blue',
            },
            {
              iconName: 'Crosshair',
              label: 'Всего выстрелов',
              value: players.reduce((s, p) => s + p.shotsTotal, 0),
              badge: 'icon-badge-blue',
            },
            {
              iconName: 'Flame',
              label: 'Всего попаданий',
              value: players.reduce((s, p) => s + p.hitsTotal, 0),
              badge: 'icon-badge-red',
            },
            {
              iconName: 'Banknote',
              label: 'Бонусов выдано',
              value: `${players.reduce((s, p) => s + p.bonusEarned, 0).toLocaleString()}₽`,
              badge: 'icon-badge-gold',
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <div className={`icon-badge ${stat.badge} w-9 h-9`}>
                <Icon name={stat.iconName} size={16} />
              </div>
              <div>
                <div className="font-russo text-sm leading-none" style={{ color: 'var(--sea-text)' }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--sea-text-dim)' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}