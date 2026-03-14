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

  return (
    <div className="flex h-full min-w-0 flex-1">
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
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
        <Controls className="!border-slate-200 !bg-white !shadow-card" />
        <MiniMap
          nodeColor={(n) => (typeof n.data?.type === 'string' && isTriggerType(n.data.type) ? '#8b5cf6' : '#059669')}
          className="!bg-slate-100"
        />
      </ReactFlow>
      </div>
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

