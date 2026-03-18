'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
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
import { ExecutionResultsPanel, type ExecutionWithSteps, type ExpectedNode } from './ExecutionResultsPanel';
import { API_BASE } from '@/lib/api';

const proOptions = { hideAttribution: true };

type WorkflowCanvasProps = {
  initialDefinition: DefinitionJson | null;
  workflowId: string;
  /** Ref that will be set to a function returning current definition (for Save). */
  getDefinitionRef?: React.MutableRefObject<(() => DefinitionJson) | null>;
  baselineSignature?: string;
  onDirtyChange?: (dirty: boolean) => void;
};

function WorkflowCanvasInner({
  initialDefinition,
  workflowId,
  getDefinitionRef,
  baselineSignature,
  onDirtyChange,
}: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastExecutionId, setLastExecutionId] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<ExecutionWithSteps | null>(null);
  const [lastExecutionLoading, setLastExecutionLoading] = useState(false);
  const [openResultNodeId, setOpenResultNodeId] = useState<string | null>(null);

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

  // Notify outer editor when definition changes (for Saved/Unsaved UX).
  useEffect(() => {
    if (!onDirtyChange) return;
    // IMPORTANT: node dragging updates positions on every mousemove.
    // Computing JSON signatures on each tick can lag the UI.
    // Debounce the signature computation so it runs after interaction settles.
    const t = window.setTimeout(() => {
      const sig = JSON.stringify(flowToDefinition(nodes, edges));
      onDirtyChange(baselineSignature ? sig !== baselineSignature : true);
    }, 250);
    return () => {
      window.clearTimeout(t);
    };
  }, [nodes, edges, baselineSignature, onDirtyChange]);

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
    const isTypingInFormField = (event: KeyboardEvent) => {
      const targetEl =
        (event.target instanceof HTMLElement ? event.target : null) ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);

      if (!targetEl) return false;

      // If focus is inside any form control / editable element, do not run canvas hotkeys.
      // This protects all node settings fields (Label, Description, Telegram, Email, etc.).
      const editable = targetEl.closest(
        'input, textarea, select, [contenteditable="true"], [role="textbox"]'
      );
      if (editable) return true;

      // Some browsers set isContentEditable on nested elements inside a contenteditable container.
      if (targetEl.isContentEditable) return true;

      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNodeId) return;
      if (isTypingInFormField(event)) return;
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
  // Settings panel does not depend on node position. Avoid re-rendering the panel on drag.
  const selectedNodeForPanel = useMemo(() => {
    if (!selectedNode) return null;
    return { id: selectedNode.id, type: selectedNode.type, data: selectedNode.data };
  }, [selectedNode?.id, selectedNode?.type, selectedNode?.data]);

  const expectedSteps: ExpectedNode[] = useMemo(() => {
    // Compute expected action node order starting from trigger (BFS), similar to backend runner.
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const outEdges = new Map<string, string[]>();
    for (const e of edges) {
      if (!outEdges.has(e.source)) outEdges.set(e.source, []);
      outEdges.get(e.source)!.push(e.target);
    }
    const trigger = nodes.find((n) => typeof n.data?.type === 'string' && isTriggerType(n.data.type));
    if (!trigger) return [];
    const ordered: ExpectedNode[] = [];
    const visited = new Set<string>();
    const q: string[] = [trigger.id];
    while (q.length) {
      const id = q.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const node = byId.get(id);
      if (node && typeof node.data?.type === 'string' && !isTriggerType(node.data.type)) {
        ordered.push({ nodeId: node.id, nodeType: node.data.type, nodeName: node.data.name ?? node.data.label ?? null });
      }
      for (const next of outEdges.get(id) ?? []) {
        if (!visited.has(next)) q.push(next);
      }
    }
    return ordered;
  }, [nodes, edges]);

  // Fetch and poll last execution details for the unified results panel.
  useEffect(() => {
    let cancelled = false;
    if (!lastExecutionId) return;
    async function poll() {
      setLastExecutionLoading(true);
      try {
        for (let i = 0; i < 14; i++) {
          const res = await fetch(`${API_BASE}/executions/${lastExecutionId}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) throw new Error('Failed to load execution');
          const ex = (await res.json()) as ExecutionWithSteps;
          if (cancelled) return;
          setLastExecution(ex);
          if (ex.status !== 'pending' && ex.status !== 'running') break;
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch {
        if (!cancelled) setLastExecution(null);
      } finally {
        if (!cancelled) setLastExecutionLoading(false);
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [lastExecutionId]);

  const handleNewExecutionId = useCallback((executionId: string) => {
    setLastExecutionId(executionId);
    setOpenResultNodeId(null);
  }, []);

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
      <div className="flex h-full min-h-0 w-full gap-4">
        {/* Left column: Add Node */}
        <div className="w-56 shrink-0">
          <Sidebar onAddNode={handleAddNodeFromSidebar} />
        </div>

        {/* Right: Canvas */}
        <div
          ref={reactFlowWrapper}
          className="relative h-full min-h-0 flex-1"
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
                gap={24}
                size={1}
                color="#e2e8f0"
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
      </div>

      {/* Overlay layer for panels and hints (canvas area only) */}
      <div className="pointer-events-none absolute inset-0">

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
        {selectedNodeForPanel && settingsOpen && (
          <div className="pointer-events-auto absolute inset-y-4 right-4 z-30 flex">
            <div className="w-[420px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Node settings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close settings"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-auto overflow-x-hidden p-3">
                <SettingsPanel
                  node={selectedNodeForPanel as unknown as Node<FlowNodeData>}
                  onUpdate={handleUpdateNode}
                  workflowId={workflowId}
                  onNewExecutionId={handleNewExecutionId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Unified last execution results */}
        {(lastExecutionLoading || lastExecution) && (
          <div className="pointer-events-auto absolute bottom-4 left-4 z-20 w-[520px] max-w-[calc(100%-2rem)]">
            <ExecutionResultsPanel
              execution={lastExecution}
              loading={lastExecutionLoading}
              expected={expectedSteps}
              openStepNodeId={openResultNodeId}
              onToggleStep={(nodeId) => setOpenResultNodeId((cur) => (cur === nodeId ? null : nodeId))}
            />
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
        {/* Polished canvas background (soft + subtle structure) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            // Variant C: subtle dots + faint large grid (no images, lightweight).
            backgroundColor: '#f8fafc', // slate-50-ish but slightly softer
            backgroundImage: [
              // Tiny dots
              'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.22) 1px, transparent 1px)',
              // Large grid
              'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
              // Soft color wash (very subtle)
              'radial-gradient(800px 420px at 10% 0%, rgba(248,113,113,0.08), transparent 60%)',
              'radial-gradient(700px 380px at 95% 35%, rgba(167,139,250,0.08), transparent 60%)',
            ].join(','),
            backgroundSize: [
              '18px 18px',
              '120px 120px',
              '120px 120px',
              '100% 100%',
              '100% 100%',
            ].join(','),
            backgroundPosition: [
              '0 0',
              '0 0',
              '0 0',
              '0 0',
              '0 0',
            ].join(','),
          }}
        />
        <WorkflowCanvasInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}

