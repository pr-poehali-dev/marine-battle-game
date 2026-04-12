import { useState } from 'react';
import Icon from '@/components/ui/icon';

const STEPS = [
  {
    num: 1,
    title: 'Установка приложения в Битрикс24',
    icon: 'Package',
    badge: 'icon-badge-blue',
    status: 'ready',
    time: '5 мин',
    items: [
      { done: true,  text: 'Зайдите в Битрикс24 → Приложения → Маркетплейс' },
      { done: true,  text: 'Найдите «Морской Бой: Геймификация продаж»' },
      { done: true,  text: 'Нажмите «Установить», подтвердите права доступа' },
      { done: true,  text: 'Приложение появится в левом меню Битрикс24' },
    ],
    note: 'Приложение запрашивает доступ к сделкам CRM и пользователям — это необходимо для автоматических выстрелов.',
  },
  {
    num: 2,
    title: 'Настройка Webhook для автоматических выстрелов',
    icon: 'Zap',
    badge: 'icon-badge-gold',
    status: 'required',
    time: '10 мин',
    items: [
      { done: false, text: 'Перейдите: CRM → Настройки → Автоматизация → Роботы и триггеры' },
      { done: false, text: 'Создайте новый Бизнес-процесс на стадии «Сделка закрыта успешно»' },
      { done: false, text: 'Добавьте действие «Исходящий Webhook»' },
      { done: false, text: 'В поле URL вставьте: ваш_домен.bitrix24.ru/rest/1/xxxxxxxx/crm.deal.get/' },
      { done: false, text: 'В теле запроса передайте: {"DEAL_ID": "{=Document:ID}", "RESPONSIBLE_ID": "{=Document:ASSIGNED_BY_ID}"}' },
      { done: false, text: 'Сохраните и активируйте бизнес-процесс' },
    ],
    note: null,
    code: `// URL формата:
https://ваш_домен/rest/1/webhook_token/crm.deal.update/

// Тело Webhook (JSON):
{
  "deal_id": "{=Document:ID}",
  "user_id": "{=Document:ASSIGNED_BY_ID}",
  "amount": "{=Document:OPPORTUNITY}",
  "title": "{=Document:TITLE}"
}`,
  },
  {
    num: 3,
    title: 'Синхронизация сотрудников из Битрикс24',
    icon: 'Users',
    badge: 'icon-badge-teal',
    status: 'required',
    time: '5 мин',
    items: [
      { done: false, text: 'В приложении «Морской Бой» откройте вкладку «Игроки»' },
      { done: false, text: 'Нажмите кнопку «Подключить Битрикс24»' },
      { done: false, text: 'Авторизуйтесь под аккаунтом администратора' },
      { done: false, text: 'Выберите отделы и сотрудников для синхронизации' },
      { done: false, text: 'Нажмите «Синхронизировать» — сотрудники добавятся автоматически' },
    ],
    note: 'Синхронизация работает в реальном времени: новые сотрудники появляются автоматически.',
  },
  {
    num: 4,
    title: 'Расстановка кораблей (Адмирал)',
    icon: 'Anchor',
    badge: 'icon-badge-navy',
    status: 'required',
    time: '10 мин',
    items: [
      { done: false, text: 'Переключитесь в режим «Адмирал» (кнопка в шапке)' },
      { done: false, text: 'Перейдите на вкладку «Адмирал»' },
      { done: false, text: 'Выберите размер корабля (1–4 палубы) и кликайте по полю для расстановки' },
      { done: false, text: 'Расставьте все корабли: 1×4-палубный, 2×3-палубных, 3×2-палубных, 4×1-палубных' },
      { done: false, text: 'Нажмите «Начать игру» — поле скрывается от игроков' },
    ],
    note: 'Игровое поле видно только в режиме Адмирала. Игроки видят только результаты своих выстрелов.',
  },
  {
    num: 5,
    title: 'Настройка бонусной системы',
    icon: 'Banknote',
    badge: 'icon-badge-gold',
    status: 'optional',
    time: '15 мин',
    items: [
      { done: false, text: 'Перейдите в Настройки → Бонусы' },
      { done: false, text: 'Установите размер бонуса за каждый тип корабля' },
      { done: false, text: 'Включите автоматическое начисление через зарплатный модуль Битрикс24' },
      { done: false, text: 'Настройте уведомления: сотрудник получает push при начислении бонуса' },
      { done: false, text: 'Проверьте интеграцию: сделайте тестовую сделку и проверьте выстрел' },
    ],
    note: 'Базовые бонусы: 1-палубный = 1000₽, 2-палубный = 2000₽, 3-палубный = 3000₽, 4-палубный = 4000₽',
  },
  {
    num: 6,
    title: 'Запуск и мониторинг',
    icon: 'Rocket',
    badge: 'icon-badge-green',
    status: 'optional',
    time: '5 мин',
    items: [
      { done: false, text: 'Проведите вводный инструктаж с командой — объясните правила' },
      { done: false, text: 'Разместите QR-код на игровое поле в офисе или Telegram-канале' },
      { done: false, text: 'Включите push-уведомления для всех участников в Битрикс24' },
      { done: false, text: 'Отслеживайте статистику в разделе «Статистика» приложения' },
      { done: false, text: 'После потопления всех кораблей — сбросьте поле и начните новый раунд' },
    ],
    note: null,
  },
];

const STATUS_META = {
  ready:    { label: 'Выполнено',   color: '#0a5228', bg: 'rgba(14,110,50,0.1)', border: 'rgba(14,110,50,0.3)' },
  required: { label: 'Обязательно', color: 'var(--sea-blue)', bg: 'rgba(9,83,144,0.08)', border: 'rgba(9,83,144,0.28)' },
  optional: { label: 'По желанию',  color: 'var(--gold)', bg: 'rgba(160,96,0,0.08)', border: 'rgba(160,96,0,0.28)' },
};

export default function Bitrix24Setup() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setCompleted(prev => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key); else s.add(key);
      return s;
    });
  };

  const totalItems = STEPS.flatMap((s, si) => s.items.map((_, ii) => `${si}-${ii}`)).length;
  const doneItems  = STEPS.flatMap((s, si) => s.items.map((_, ii) => `${si}-${ii}`)).filter(k => completed.has(k) || STEPS[+k.split('-')[0]]?.items[+k.split('-')[1]]?.done).length;
  const progress   = Math.round((doneItems / totalItems) * 100);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge icon-badge-blue w-12 h-12 text-xl animate-float">🔗</div>
        <div>
          <h2 className="font-russo text-2xl" style={{ color: 'var(--sea-navy)' }}>Настройка Битрикс24</h2>
          <p className="text-sm font-semibold" style={{ color: 'var(--sea-text-dim)' }}>Пошаговый гид для запуска приложения</p>
        </div>
      </div>

      {/* Progress */}
      <div className="sea-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm" style={{ color: 'var(--sea-text)' }}>Готовность к запуску</span>
          <span className="font-russo text-lg" style={{ color: progress >= 70 ? 'var(--green-ok)' : 'var(--sea-blue)' }}>{progress}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(9,83,144,0.1)' }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            width: `${progress}%`,
            background: progress >= 70
              ? 'linear-gradient(90deg,#28e878,#0a9040)'
              : 'linear-gradient(90deg,#40ccff,#095390)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {[
            { color:'#0a5228', bg:'rgba(14,110,50,0.1)',  border:'rgba(14,110,50,0.3)',  label:'Выполнено автоматически' },
            { color:'var(--sea-blue)', bg:'rgba(9,83,144,0.08)', border:'rgba(9,83,144,0.28)', label:'Обязательно' },
            { color:'var(--gold)',     bg:'rgba(160,96,0,0.08)', border:'rgba(160,96,0,0.28)', label:'Рекомендуется' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div style={{ width:10, height:10, borderRadius:3, background:s.bg, border:`1.5px solid ${s.border}` }} />
              <span className="text-xs font-bold" style={{ color:'var(--sea-text-dim)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {STEPS.map((step, si) => {
          const sm = STATUS_META[step.status as keyof typeof STATUS_META];
          const isOpen = openStep === si;
          const stepDone = step.items.filter((item, ii) => item.done || completed.has(`${si}-${ii}`)).length;
          return (
            <div key={si} className="sea-card overflow-hidden"
              style={{ border: isOpen ? `1.5px solid ${sm.border}` : undefined }}>
              {/* Step header */}
              <button
                className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                style={{ background: isOpen ? sm.bg : 'transparent' }}
                onClick={() => setOpenStep(isOpen ? null : si)}
              >
                <div className={`icon-badge ${step.badge} w-10 h-10 flex-shrink-0`}>
                  <Icon name={step.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-russo text-sm" style={{ color: 'var(--sea-text)' }}>
                      {step.num}. {step.title}
                    </span>
                    <div className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: sm.bg, border: `1.5px solid ${sm.border}`, color: sm.color }}>
                      {sm.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--sea-text-dim)' }}>⏱ {step.time}</span>
                    <span className="text-xs font-semibold" style={{ color: stepDone === step.items.length ? 'var(--green-ok)' : 'var(--sea-text-dim)' }}>
                      {stepDone}/{step.items.length} выполнено
                    </span>
                  </div>
                </div>
                <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={18}
                  style={{ color: 'var(--sea-text-dim)', flexShrink:0 }} />
              </button>

              {/* Step content */}
              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="sea-divider mb-4" />
                  <div className="flex flex-col gap-2">
                    {step.items.map((item, ii) => {
                      const key = `${si}-${ii}`;
                      const isDone = item.done || completed.has(key);
                      return (
                        <button key={ii}
                          className="flex items-start gap-3 p-3 rounded-2xl text-left transition-all w-full"
                          style={{
                            background: isDone ? 'rgba(14,110,50,0.07)' : 'rgba(9,83,144,0.04)',
                            border: `1.5px solid ${isDone ? 'rgba(14,110,50,0.25)' : 'rgba(9,83,144,0.12)'}`,
                          }}
                          onClick={() => !item.done && toggleItem(key)}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: isDone ? 'rgba(14,110,50,0.15)' : 'rgba(9,83,144,0.08)',
                              border: `1.5px solid ${isDone ? 'rgba(14,110,50,0.5)' : 'rgba(9,83,144,0.3)'}`,
                            }}>
                            {isDone && <Icon name="Check" size={12} style={{ color:'var(--green-ok)' }} />}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: isDone ? 'var(--sea-text-dim)' : 'var(--sea-text)' }}>
                            {item.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {step.code && (
                    <div className="mt-4 rounded-2xl p-4 overflow-x-auto"
                      style={{ background:'rgba(6,24,42,0.9)', border:'1.5px solid rgba(64,204,255,0.2)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Code2" size={14} style={{ color:'rgba(64,204,255,0.7)' }} />
                        <span className="text-xs font-bold" style={{ color:'rgba(64,204,255,0.7)' }}>Пример настройки Webhook</span>
                      </div>
                      <pre className="text-xs font-mono" style={{ color:'#90e4ff', whiteSpace:'pre-wrap' }}>
                        {step.code}
                      </pre>
                    </div>
                  )}

                  {step.note && (
                    <div className="mt-3 p-3 rounded-2xl flex items-start gap-2"
                      style={{ background:'rgba(160,96,0,0.07)', border:'1.5px solid rgba(160,96,0,0.25)' }}>
                      <Icon name="Info" size={15} style={{ color:'var(--gold)', flexShrink:0, marginTop:1 }} />
                      <p className="text-xs font-semibold" style={{ color:'var(--sea-text-sub)' }}>{step.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="sea-card p-5"
        style={{ border:'1.5px solid rgba(14,110,50,0.3)', background:'linear-gradient(135deg,rgba(14,110,50,0.06),rgba(9,83,144,0.04))' }}>
        <div className="flex items-start gap-4">
          <div className="icon-badge icon-badge-green w-12 h-12 text-2xl flex-shrink-0">🚀</div>
          <div>
            <div className="font-russo text-base mb-1" style={{ color:'var(--sea-text)' }}>Нужна помощь с настройкой?</div>
            <p className="text-sm font-semibold mb-3" style={{ color:'var(--sea-text-dim)' }}>
              Команда поддержки поможет настроить интеграцию за 30 минут. Бесплатно для тарифов «Фрегат» и выше.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="https://poehali.dev/help" target="_blank" rel="noopener noreferrer"
                className="btn-sea px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Icon name="HeadphonesIcon" size={15} /> Написать в поддержку
              </a>
              <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer"
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Icon name="MessageCircle" size={15} /> Telegram-сообщество
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
