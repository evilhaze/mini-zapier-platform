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
import { DRAG_TYPE_APPLICATION, Sidebar } from './Sidebar';
import { isTriggerType } from './types';
import { SettingsPanel } from './SettingsPanel';
import { AnimatedEdge } from './AnimatedEdge';
import { NodeActionsContext } from './NodeActionsContext';

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { nodes: initialNodes, edges: initialEdges } = definitionToFlow(initialDefinition);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // If the initialDefinition prop changes (e.g. after async load), reset nodes/edges once.
  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = definitionToFlow(initialDefinition);
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [initialDefinition, setNodes, setEdges]);

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
      let type = e.dataTransfer.getData(DRAG_TYPE_APPLICATION);
      let variant = e.dataTransfer.getData('variant');
      if (!type) {
        const textPlain = e.dataTransfer.getData('text/plain');
        if (textPlain) {
          const colon = textPlain.indexOf(':');
          if (colon !== -1) {
            variant = textPlain.slice(0, colon);
            type = textPlain.slice(colon + 1);
          } else {
            type = textPlain;
            variant = 'action';
          }
        }
      }
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
    setSettingsOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSettingsOpen(false);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<FlowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
      );
    },
    [setNodes]
  );

  const handleRenameNode = useCallback(
    (nodeId: string, newName: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, name: newName, label: newName } }
            : n
        )
      );
    },
    [setNodes]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const node = nds.find((n) => n.id === nodeId);
        if (!node) return nds;
        const baseId = typeof node.data?.type === 'string' ? node.data.type : 'node';
        const newId = `${baseId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const offsetPosition = {
          x: node.position.x + 40,
          y: node.position.y + 40,
        };
        const duplicated = {
          ...node,
          id: newId,
          position: offsetPosition,
        };
        // Do not copy edges here; they will be created by user.
        return nds.concat(duplicated);
      });
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId((current) => (current === nodeId ? null : current));
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNodeId) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, handleDeleteNode]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const isEmpty = nodes.length === 0;
  const hasOnlyTriggerNoActions =
    nodes.length === 1 &&
    typeof nodes[0].data?.type === 'string' &&
    isTriggerType(nodes[0].data.type) &&
    edges.length === 0;
  const hasAnyInitialNodes = initialNodes.length > 0;
  const showStartState = !hasAnyInitialNodes && (isEmpty || hasOnlyTriggerNoActions);

  const handleAddNodeFromSidebar = useCallback(
    (type: string, variant: 'trigger' | 'action') => {
      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const position = screenToFlowPosition({ x: centerX, y: centerY });
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

  return (
    <>
      {/* Main canvas fills all available space */}
      <div
        ref={reactFlowWrapper}
        className="h-full w-full"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <NodeActionsContext.Provider
          value={{
            openSettings: (nodeId: string) => {
              setSelectedNodeId(nodeId);
              setSettingsOpen(true);
            },
            renameNode: handleRenameNode,
            duplicateNode: handleDuplicateNode,
            deleteNode: handleDeleteNode,
          }}
        >
          <ReactFlow
            nodes={nodes}
              edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={{ animated: AnimatedEdge }}
            fitView
            style={{ width: '100%', height: '100%' }}
            fitViewOptions={{ padding: 0.2 }}
            proOptions={proOptions}
              defaultEdgeOptions={{ type: 'animated' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#cbd5e1"
            />
            <Controls className="!border-slate-200/80 !rounded-btn !bg-white !shadow-soft" />
            <MiniMap
              nodeColor={(n) =>
                typeof n.data?.type === 'string' && isTriggerType(n.data.type)
                  ? '#8b5cf6'
                  : '#059669'
              }
              className="!bg-white !border !border-slate-200/80 !rounded-card"
            />
          </ReactFlow>
        </NodeActionsContext.Provider>
      </div>

      {/* Overlay layer for panels and hints */}
      <div className="pointer-events-none absolute inset-0">
        {/* Left Add Node panel as overlay */}
        <div className="pointer-events-auto absolute left-4 top-4 z-20 max-h-[calc(100%-2rem)] w-60">
          <Sidebar onAddNode={handleAddNodeFromSidebar} />
        </div>

        {/* Start state overlay — guides user */}
        {showStartState && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6"
            aria-hidden
          >
            <div className="pointer-events-none max-w-sm rounded-2xl border border-[#FECACA] bg-[#FEF2F2]/95 px-6 py-6 text-center shadow-lg backdrop-blur-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCA5A5]/20 text-[#EF4444]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {isEmpty ? 'Start with a trigger' : 'Add your first step'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {isEmpty
                  ? 'Drag a trigger from the left panel to start your workflow.'
                  : 'Drag an action from the left and connect it to your trigger to run the workflow.'}
              </p>
            </div>
          </div>
        )}

        {/* Floating settings inspector with close button */}
        {selectedNode && settingsOpen && (
          <div className="pointer-events-auto absolute inset-y-4 right-4 z-30 flex max-w-sm">
            <div className="w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Node settings
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-auto p-2">
                <SettingsPanel node={selectedNode} onUpdate={handleUpdateNode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="relative flex h-full min-h-[600px] w-full bg-slate-50">
        <WorkflowCanvasInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}

