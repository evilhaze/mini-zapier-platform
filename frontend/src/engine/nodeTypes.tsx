import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Webhook, Clock, Mail, Globe, Send, MessageCircle, Database, Shuffle } from 'lucide-react';

const triggerIcons: Record<string, typeof Webhook> = {
  webhook: Webhook,
  schedule: Clock,
  email: Mail,
};
const actionIcons: Record<string, typeof Globe> = {
  http: Globe,
  email: Send,
  telegram: MessageCircle,
  db: Database,
  transform: Shuffle,
};

function TriggerNodeInner({ data, type }: NodeProps) {
  const t = type.replace('trigger_', '');
  const Icon = triggerIcons[t] ?? Webhook;
  const label = t === 'webhook' ? 'Webhook' : t === 'schedule' ? 'Schedule' : 'Email';
  return (
    <div className="min-w-[180px] bg-white rounded-lg border-2 border-amber-400 shadow-sm px-3 py-2">
      <Handle type="source" position={Position.Right} className="!bg-amber-500" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-medium text-surface-900 text-sm">{label}</p>
          <p className="text-xs text-surface-500 truncate max-w-[120px]">
            {t === 'schedule' && (data.config as { cron?: string })?.cron}
            {t === 'webhook' && 'POST /api/triggers/webhook/:id'}
            {t === 'email' && 'Inbound email'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionNodeInner({ data, type }: NodeProps) {
  const t = type.replace('action_', '');
  const Icon = actionIcons[t] ?? Globe;
  const labels: Record<string, string> = {
    http: 'HTTP Request',
    email: 'Send Email',
    telegram: 'Telegram',
    db: 'Database',
    transform: 'Transform',
  };
  return (
    <div className="min-w-[180px] bg-white rounded-lg border-2 border-brand-400 shadow-sm px-3 py-2">
      <Handle type="target" position={Position.Left} className="!bg-brand-500" />
      <Handle type="source" position={Position.Right} className="!bg-brand-500" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <p className="font-medium text-surface-900 text-sm">{labels[t] || t}</p>
          <p className="text-xs text-surface-500 truncate max-w-[120px]">
            {t === 'http' && (data.config as { url?: string })?.url}
            {t === 'telegram' && (data.config as { chatId?: string })?.chatId && 'Chat'}
            {t === 'transform' && (data.config as { mode?: string })?.mode}
          </p>
        </div>
      </div>
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeInner);
export const ActionNode = memo(ActionNodeInner);

export const nodeTypes = {
  trigger_webhook: TriggerNode,
  trigger_schedule: TriggerNode,
  trigger_email: TriggerNode,
  action_http: ActionNode,
  action_email: ActionNode,
  action_telegram: ActionNode,
  action_db: ActionNode,
  action_transform: ActionNode,
};
