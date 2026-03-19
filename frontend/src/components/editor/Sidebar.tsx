'use client';

import { useCallback } from 'react';
import { Zap, Calendar, Mail, MousePointer, Globe, Send, Database, Code } from 'lucide-react';
import { TRIGGER_TYPES, ACTION_TYPES, NODE_LABELS } from './types';

const TRIGGER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  webhook: Zap,
  schedule: Calendar,
  email: Mail,
  manual: MousePointer,
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  http: Globe,
  email: Mail,
  telegram: Send,
  db: Database,
  transform: Code,
};

const DRAG_TYPE = 'application/reactflow';

function SidebarItem({
  type,
  label,
  icon: Icon,
  variant,
  onAddNode,
}: {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'trigger' | 'action';
  onAddNode?: (type: string, variant: 'trigger' | 'action') => void;
}) {
  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_TYPE, type);
      e.dataTransfer.setData('variant', variant);
      e.dataTransfer.setData('text/plain', `${variant}:${type}`);
      e.dataTransfer.effectAllowed = 'move';
    },
    [type, variant]
  );

  const onClick = useCallback(() => {
    onAddNode?.(type, variant);
  }, [type, variant, onAddNode]);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
        className={`
        group flex cursor-grab items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left shadow-sm transition
        hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md
        active:cursor-grabbing
        dark:bg-slate-800 dark:border-slate-600
        ${variant === 'trigger'
          ? 'hover:bg-[#FDF2F7] dark:hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-[#DEA5B5]/30 dark:focus-visible:ring-[#DEA5B5]/20'
          : 'hover:bg-red-50 dark:hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-red-200 dark:focus-visible:ring-red-200/20'}
      `}
    >
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5
          ${variant === 'trigger'
            ? 'bg-[#F6E3EA] text-[#B86B7C] group-hover:bg-[#F3D7E2] dark:bg-pink-500/15 dark:text-[#F9A8D4] dark:group-hover:bg-slate-700'
            : 'bg-[#FEF2F2] text-[#EF4444] group-hover:bg-red-100/60 dark:bg-red-500/15 dark:text-[#F87171] dark:group-hover:bg-slate-700'}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-300">
          {variant === 'trigger' ? 'Starts the workflow' : 'Runs after previous step'}
        </span>
      </div>
    </div>
  );
}

type SidebarProps = {
  onAddNode?: (type: string, variant: 'trigger' | 'action') => void;
};

export function Sidebar({ onAddNode }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-slate-600 dark:bg-slate-800">
      <div className="border-b border-slate-200/80 px-3.5 py-3 dark:border-slate-600">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-300">
          Add node
        </h3>
        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Triggers & actions
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Drag onto the canvas or click to add.
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <section className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B86B7C] dark:text-[#F9A8D4]">
              Triggers
            </h4>
          </div>
          <div className="space-y-1.5">
            {TRIGGER_TYPES.map((type) => (
              <SidebarItem
                key={type}
                type={type}
                label={type === 'email' ? 'Email trigger' : (NODE_LABELS[type] ?? type)}
                icon={TRIGGER_ICONS[type] ?? Zap}
                variant="trigger"
                onAddNode={onAddNode}
              />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
              Actions
            </h4>
          </div>
          <div className="space-y-1.5">
            {ACTION_TYPES.map((type) => (
              <SidebarItem
                key={type}
                type={type}
                label={type === 'email' ? 'Email' : (NODE_LABELS[type] ?? type)}
                icon={ACTION_ICONS[type] ?? Code}
                variant="action"
                onAddNode={onAddNode}
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

export const DRAG_TYPE_APPLICATION = DRAG_TYPE;
