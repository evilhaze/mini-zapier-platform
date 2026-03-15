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
}: {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'trigger' | 'action';
}) {
  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_TYPE, type);
      e.dataTransfer.setData('variant', variant);
      e.dataTransfer.effectAllowed = 'move';
    },
    [type, variant]
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`
        flex cursor-grab items-center gap-3 rounded-btn border-2 border-dashed px-3 py-2.5 text-left transition-colors
        active:cursor-grabbing
        ${variant === 'trigger' ? 'border-violet-200 bg-violet-50/50 hover:border-violet-300 hover:bg-violet-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100'}
      `}
    >
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
          ${variant === 'trigger' ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-600'}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <div className="border-b border-slate-200/80 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Add node
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Drag onto canvas
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <section className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-violet-600">Triggers</h4>
          <div className="space-y-1.5">
            {TRIGGER_TYPES.map((type) => (
              <SidebarItem
                key={type}
                type={type}
                label={type === 'email' ? 'Email trigger' : (NODE_LABELS[type] ?? type)}
                icon={TRIGGER_ICONS[type] ?? Zap}
                variant="trigger"
              />
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-xs font-medium text-slate-600">Actions</h4>
          <div className="space-y-1.5">
            {ACTION_TYPES.map((type) => (
              <SidebarItem
                key={type}
                type={type}
                label={type === 'email' ? 'Email' : (NODE_LABELS[type] ?? type)}
                icon={ACTION_ICONS[type] ?? Code}
                variant="action"
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

export const DRAG_TYPE_APPLICATION = DRAG_TYPE;
