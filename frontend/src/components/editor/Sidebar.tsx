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
        flex cursor-grab items-center gap-3 rounded-btn border-2 border-dashed px-3 py-2.5 text-left transition-colors
        active:cursor-grabbing
        ${variant === 'trigger' ? 'border-[#EFC7D6] bg-[#FDF2F7]/90 hover:border-[#E8B9CA] hover:bg-[#FDF2F7]' : 'border-red-200 bg-[#FEF2F2]/80 hover:border-red-300 hover:bg-red-50'}
      `}
    >
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
          ${variant === 'trigger' ? 'bg-[#F6E3EA] text-[#B86B7C]' : 'bg-[#FEF2F2] text-[#EF4444]'}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </div>
  );
}

type SidebarProps = {
  onAddNode?: (type: string, variant: 'trigger' | 'action') => void;
};

export function Sidebar({ onAddNode }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <div className="border-b border-slate-200/80 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Add node
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Drag onto canvas or click to add
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <section className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#B86B7C]">Triggers</h4>
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
          <h4 className="mb-2 text-xs font-medium text-red-600">Actions</h4>
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
