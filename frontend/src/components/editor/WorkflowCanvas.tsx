'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import type { FlowNodeData } from './utils';
import { definitionToFlow, flowToDefinition } from './utils';
import type { DefinitionJson } from './types';
import { DRAG_TYPE_APPLICATION } from './Sidebar';
import { isTriggerType } from './types';
import { SettingsPanel } from './SettingsPanel';

const proOptions = { hideAttribution: true };

type WorkflowCanvasProps = {
  initialDefinition: DefinitionJson | null;
  /** Ref that will be set to a function returning current definition (for Save). */
  getDefinitionRef?: React.MutableRefObject<(() => DefinitionJson) | null>;
};

function WorkflowCanvasInner({
  initialDefinition,
  getDefinitionRef,
}: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = definitionToFlow(initialDefinition);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (getDefinitionRef)
      getDefinitionRef.current = () => flowToDefinition(nodes, edges);
    return () => {
      if (getDefinitionRef) getDefinitionRef.current = null;
    };
  }, [nodes, edges, getDefinitionRef]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData(DRAG_TYPE_APPLICATION);
      const variant = e.dataTransfer.getData('variant');
      if (!type) return;
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const nodeType = variant === 'trigger' ? 'trigger' : 'action';
      const id = `${type}-${Date.now()}`;
      const newNode: Node<FlowNodeData> = {
        id,
        type: nodeType,
        position,
        data: {
          type,
          label: type,
          config: type === 'schedule' ? { cron: '0 * * * *' } : {},
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  const handleUpdateNode = useCallback((nodeId: string, data: Partial<FlowNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    );
  }, [setNodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const isEmpty = nodes.length === 0;
  const hasOnlyTriggerNoActions =
    nodes.length === 1 &&
    typeof nodes[0].data?.type === 'string' &&
    isTriggerType(nodes[0].data.type) &&
    edges.length === 0;
  const showStartState = isEmpty || hasOnlyTriggerNoActions;

  return (
    <div className="relative flex h-full min-w-0 flex-1 bg-slate-50/50">
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={proOptions}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls className="!border-slate-200/80 !rounded-btn !bg-white !shadow-soft" />
        <MiniMap
          nodeColor={(n) => (typeof n.data?.type === 'string' && isTriggerType(n.data.type) ? '#8b5cf6' : '#059669')}
          className="!bg-white !border !border-slate-200/80 !rounded-card"
        />
      </ReactFlow>
      </div>

      {/* Start state overlay — guides user without blocking drag & drop */}
      {showStartState && (
        <div
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none"
          aria-hidden
        >
          <div className="max-w-md rounded-2xl border border-slate-200/80 bg-white/95 px-8 py-8 text-center shadow-xl backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              {isEmpty ? 'Choose your trigger' : 'Add your first step'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isEmpty
                ? 'Drag a trigger from the left panel to start. Webhook, Schedule, or Manual — then connect actions.'
                : 'Drag an action from the left and connect it to your trigger to run the workflow.'}
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
              Triggers ← left panel
            </p>
          </div>
        </div>
      )}

      <SettingsPanel node={selectedNode} onUpdate={handleUpdateNode} />
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

