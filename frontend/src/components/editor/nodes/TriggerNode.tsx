'use client';

import { memo } from 'react';
import { Handle, type NodeProps, type Node, Position } from '@xyflow/react';
import { Zap, Calendar, Mail, MousePointer } from 'lucide-react';
import type { FlowNodeData } from '../utils';
import { NODE_LABELS } from '../types';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  webhook: Zap,
  schedule: Calendar,
  email: Mail,
  manual: MousePointer,
};

function TriggerNode({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const Icon = icons[data.type] ?? Zap;
  const label = data.label || NODE_LABELS[data.type] || data.type;

  return (
    <div
      className={`
        min-w-[180px] rounded-xl border-2 bg-white shadow-card
        ${selected ? 'border-accent ring-2 ring-accent/20' : 'border-violet-200'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!border-0 !w-3 !h-3 !bg-violet-400" />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-600">Trigger</p>
          <p className="truncate text-sm font-medium text-slate-900">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-0 !w-3 !h-3 !bg-violet-400" />
    </div>
  );
}

export default memo(TriggerNode);
