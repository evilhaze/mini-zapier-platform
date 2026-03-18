'use client';

import { useMemo } from 'react';
import { Lock, PlugZap, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';

type Integration = {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
  color: string; // css color
  comingSoon?: boolean;
  popular?: boolean;
};

const INTEGRATIONS: Integration[] = [
  { id: 'gsheets', name: 'Google Sheets', subtitle: 'Электронные таблицы', initials: 'G', color: '#16a34a', comingSoon: true, popular: true },
  { id: 'gdrive', name: 'Google Drive', subtitle: 'Файлы и папки', initials: 'G', color: '#2563eb', comingSoon: true, popular: true },
  { id: 'gmail', name: 'Gmail', subtitle: 'Почта', initials: 'G', color: '#ef4444', comingSoon: true, popular: true },
  { id: 'notion', name: 'Notion', subtitle: 'Документы и базы данных', initials: 'N', color: '#0f172a', comingSoon: true, popular: true },
  { id: 'slack', name: 'Slack', subtitle: 'Командный чат', initials: 'S', color: '#7c3aed', comingSoon: true, popular: true },
  { id: 'discord', name: 'Discord', subtitle: 'Сообщества', initials: 'D', color: '#5865F2', comingSoon: true, popular: true },
  { id: 'github', name: 'GitHub', subtitle: 'Код и задачи', initials: 'GH', color: '#111827', comingSoon: true, popular: true },
  { id: 'airtable', name: 'Airtable', subtitle: 'Таблицы и представления', initials: 'A', color: '#f59e0b', comingSoon: true, popular: true },
  { id: 'trello', name: 'Trello', subtitle: 'Доски', initials: 'T', color: '#0ea5e9', comingSoon: true },
  { id: 'dropbox', name: 'Dropbox', subtitle: 'Облачное хранилище', initials: 'D', color: '#2563eb', comingSoon: true },
  { id: 'outlook', name: 'Outlook', subtitle: 'Почта и календарь', initials: 'O', color: '#1d4ed8', comingSoon: true },
  { id: 'stripe', name: 'Stripe', subtitle: 'Платежи', initials: 'S', color: '#635bff', comingSoon: true, popular: true },
  { id: 'webflow', name: 'Webflow', subtitle: 'CMS и сайты', initials: 'W', color: '#146ef5', comingSoon: true },
  { id: 'shopify', name: 'Shopify', subtitle: 'Электронная коммерция', initials: 'S', color: '#16a34a', comingSoon: true },
  { id: 'hubspot', name: 'HubSpot', subtitle: 'CRM', initials: 'H', color: '#f97316', comingSoon: true },
  { id: 'linear', name: 'Linear', subtitle: 'Задачи продукта', initials: 'L', color: '#111827', comingSoon: true },
  { id: 'asana', name: 'Asana', subtitle: 'Управление задачами', initials: 'A', color: '#f43f5e', comingSoon: true },
  { id: 'clickup', name: 'ClickUp', subtitle: 'Задачи', initials: 'C', color: '#7c3aed', comingSoon: true },
  { id: 'openai', name: 'OpenAI', subtitle: 'ИИ', initials: 'AI', color: '#0f766e', comingSoon: true, popular: true },
  { id: 'calendly', name: 'Calendly', subtitle: 'Планирование', initials: 'C', color: '#2563eb', comingSoon: true },
];

function IntegrationCard({ item }: { item: Integration }) {
  const locked = item.comingSoon ?? true;
  return (
    <button
      type="button"
      onClick={() =>
        toast.info('Скоро', { description: 'Интеграции будут доступны в ближайшее время.' })
      }
      className={`
        group relative flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition
        ${locked ? 'border-slate-200/80 hover:border-slate-300 hover:shadow-md' : 'border-emerald-200'}
      `}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white ring-1 ring-black/10"
        style={{ background: item.color }}
        aria-hidden
      >
        {item.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
          {item.popular ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              <Star className="h-3 w-3" />
              Популярное
            </span>
          ) : null}
        </div>
        <div className="mt-1 truncate text-xs text-slate-500">{item.subtitle}</div>
      </div>
      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
        <Lock className="h-3.5 w-3.5" />
        Скоро
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px circle at var(--x, 50%) var(--y, 40%), rgba(239,68,68,0.10), transparent 45%)',
        }}
      />
    </button>
  );
}

export default function IntegrationsPage() {
  const popular = useMemo(() => INTEGRATIONS.filter((i) => i.popular), []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(800px 400px at 20% 0%, rgba(239,68,68,0.12), transparent 60%)',
              'radial-gradient(900px 500px at 90% 20%, rgba(99,102,241,0.10), transparent 55%)',
            ].join(','),
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Интеграции</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Подключайте любимые сервисы
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Мы готовим библиотеку интеграций, чтобы ваши воркфлоу могли работать с Google, Notion, Slack, GitHub
              и многими другими сервисами. Этот раздел — превью того, что появится дальше.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                <Sparkles className="h-4 w-4" />
                Скоро
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                <PlugZap className="h-4 w-4 text-slate-500" />
                Маркетплейс приложений (превью)
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Популярные будущие приложения</h2>
            <p className="mt-1 text-sm text-slate-600">
              Самые востребованные приложения, которые мы планируем добавить в первой версии.
            </p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Закрытое превью
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((item) => (
            <IntegrationCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Запланированные интеграции</h2>
          <p className="mt-1 text-sm text-slate-600">
            Более широкий набор сервисов, которые мы будем добавлять со временем.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((item) => (
            <IntegrationCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Запрошенные приложения</h3>
        <p className="mt-1 text-sm text-slate-600">
          Хотите видеть здесь определённый сервис? Скоро добавим отдельный процесс запросов. А пока этот экран
          показывает, как будет выглядеть будущий центр интеграций.
        </p>
      </section>
    </div>
  );
}

