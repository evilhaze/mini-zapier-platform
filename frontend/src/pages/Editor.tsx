import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, Webhook, Clock, Mail, Globe, Send, MessageCircle, Database, Shuffle } from 'lucide-react';
import { nodeTypes } from '../engine/nodeTypes';
import {
  getWorkflow,
  updateWorkflow,
  createWorkflow,
  runWorkflow,
  type WorkflowDefinition,
} from '../api';

const TRIGGERS = [
  { type: 'trigger_webhook', label: 'Webhook', icon: Webhook },
  { type: 'trigger_schedule', label: 'Schedule', icon: Clock },
  { type: 'trigger_email', label: 'Email', icon: Mail },
];
const ACTIONS = [
  { type: 'action_http', label: 'HTTP', icon: Globe },
  { type: 'action_email', label: 'Email', icon: Send },
  { type: 'action_telegram', label: 'Telegram', icon: MessageCircle },
  { type: 'action_db', label: 'DB', icon: Database },
  { type: 'action_transform', label: 'Transform', icon: Shuffle },
];

function frontendTypeToBackend(type: string): string {
  if (type.startsWith('trigger_')) return type.replace('trigger_', '');
  if (type.startsWith('action_')) return type.replace('action_', '');
  return type;
}

function defToFlow(def: WorkflowDefinition): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = (def.nodes || []).map((n, i) => ({
    id: n.id,
    type: n.type.startsWith('trigger_') || n.type.startsWith('action_')
      ? n.type
      : n.type === 'webhook' || n.type === 'schedule' || n.type === 'email'
        ? 'trigger_' + n.type
        : 'action_' + n.type,
    position: { x: 100 + (i % 3) * 220, y: 80 + Math.floor(i / 3) * 120 },
    data: { config: n.config ?? {} },
  }));
  const edges: Edge[] = (def.edges || []).map((e) => ({
    id: e.source + '-' + e.target,
    source: e.source,
    target: e.target,
  }));
  return { nodes, edges };
}

function flowToDef(nodes: Node[], edges: Edge[]): WorkflowDefinition {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: frontendTypeToBackend(n.type ?? 'action_http'),
      config: (n.data?.config as Record<string, unknown>) ?? {},
    })),
    edges: edges.map((e) => ({ source: e.source, target: e.target })),
  };
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const [name, setName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const onConnect: OnConnect = useCallback(
    (conn: Connection) => setEdges((eds) => addEdge(conn, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left - 90,
        y: e.clientY - rect.top - 20,
      };
      const nodeId = type + '-' + Date.now();
      const newNode: Node = {
        id: nodeId,
        type: type as Node['type'],
        position,
        data: {
          config:
            type === 'trigger_schedule'
              ? { cron: '0 * * * *' }
              : type === 'action_http'
                ? { url: 'https://api.example.com', method: 'GET' }
                : {},
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  useEffect(() => {
    if (isNew) {
      setName('Untitled workflow');
      setNodes([
        {
          id: 'trigger-' + Date.now(),
          type: 'trigger_webhook',
          position: { x: 100, y: 100 },
          data: { config: {} },
        },
      ]);
      setEdges([]);
      return;
    }
    getWorkflow(id!)
      .then((w) => {
        setName(w.name);
        const def = JSON.parse(w.definition) as WorkflowDefinition;
        const { nodes: n, edges: e } = defToFlow(def);
        setNodes(n as Node[]);
        setEdges(e as Edge[]);
      })
      .catch(() => setLoadError('Workflow not found'));
  }, [id, isNew, setNodes, setEdges]);

  const save = useCallback(() => {
    const definition = flowToDef(nodes, edges);
    setSaving(true);
    if (isNew) {
      createWorkflow({ name, definition })
        .then((w) => {
          navigate('/workflows/' + w.id, { replace: true });
          setSaving(false);
        })
        .catch((err) => {
          setLoadError(err.message);
          setSaving(false);
        });
    } else {
      updateWorkflow(id!, { name, definition })
        .then(() => setSaving(false))
        .catch((err) => {
          setLoadError(err.message);
          setSaving(false);
        });
    }
  }, [id, isNew, name, nodes, edges, navigate]);

  const run = useCallback(() => {
    if (isNew) return save();
    setRunning(true);
    runWorkflow(id!)
      .then(() => navigate('/executions'))
      .catch((err) => setLoadError(err.message))
      .finally(() => setRunning(false));
  }, [id, isNew, save, navigate]);

  if (loadError) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
        {loadError}
        <Link to="/" className="block mt-2 text-brand-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-surface-200 overflow-hidden bg-surface-100">
      <div className="w-56 shrink-0 border-r border-surface-200 bg-white flex flex-col">
        <div className="p-3 border-b border-surface-100">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm font-medium"
            placeholder="Workflow name"
          />
        </div>
        <div className="p-2 flex-1 overflow-auto">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2 py-1">Triggers</p>
          {TRIGGERS.map(({ type, label, icon: Icon }) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-50 cursor-grab border border-transparent hover:border-surface-200"
            >
              <Icon className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-surface-700">{label}</span>
            </div>
          ))}
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2 py-1 mt-3">Actions</p>
          {ACTIONS.map(({ type, label, icon: Icon }) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-50 cursor-grab border border-transparent hover:border-surface-200"
            >
              <Icon className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-surface-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-surface-100 flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-800 text-white text-sm font-medium hover:bg-surface-900 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          {!isNew && (
            <button
              onClick={run}
              disabled={running}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              title="Run once"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 flex items-center gap-2 px-3 border-b border-surface-200 bg-white shrink-0">
          <Link
            to="/"
            className="p-1.5 rounded text-surface-500 hover:bg-surface-100 hover:text-surface-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-surface-600">Drag nodes from the left, connect with edges</span>
        </div>
        <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes as NodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{ type: 'smoothstep' }}
          >
            <Background />
            <Controls />
            <Panel position="top-right" className="!m-2 text-xs text-surface-500">
              {isNew ? 'Save to get webhook URL' : null}
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
