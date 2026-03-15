'use client';

import { memo } from 'react';
import { Handle, type NodeProps, type Node, Position } from '@xyflow/react';
import { Globe, Mail, Send, Database, Code, Settings } from 'lucide-react';
import type { FlowNodeData } from '../utils';
import { NODE_LABELS, ACTION_DESCRIPTIONS } from '../types';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  http: Globe,
  email: Mail,
  telegram: Send,
  db: Database,
  transform: Code,
};

function ActionNode({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const Icon = icons[data.type] ?? Code;
  const subtype = NODE_LABELS[data.type] || data.type;
  const title = data.name || data.label || subtype;
  const description = ACTION_DESCRIPTIONS[data.type] ?? 'Process data in the workflow';

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[220px] overflow-hidden rounded-card bg-white text-left shadow-soft
        ring-1 ring-slate-200/80
        ${selected ? 'ring-2 ring-accent shadow-card-hover' : 'hover:ring-slate-300'}
      `}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!left-1/2 !-top-1.5 !h-3 !w-3 !-translate-x-1/2 !border-2 !border-white !bg-accent !shadow"
      />

      {/* Left accent bar — action = emerald */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent-dark" />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Action · {subtype}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-accent"
            title="Configure"
            aria-label="Configure node"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!left-1/2 !-bottom-1.5 !h-3 !w-3 !-translate-x-1/2 !border-2 !border-white !bg-accent !shadow"
      />
    </div>
  );
}

export default memo(ActionNode);
