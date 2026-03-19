import type { Node, Edge } from '@xyflow/react';
import type { DefinitionJson, WorkflowNodeDef, WorkflowEdgeDef } from './types';

export type FlowNodeData = {
  type: string;
  label: string;
  config?: Record<string, unknown>;
  name?: string;
};

const DEFAULT_STEP = 120;

/**
 * Convert backend definition to React Flow nodes and edges.
 */
export function definitionToFlow(def: DefinitionJson | null): {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
} {
  const defNodes = def?.nodes ?? [];
  const defEdges = def?.edges ?? [];

  const nodes: Node<FlowNodeData>[] = defNodes.map((n, i) => ({
    id: n.id,
    type: isTrigger(n.type) ? 'trigger' : 'action',
    position: n.position ?? { x: 80, y: 80 + i * DEFAULT_STEP },
    data: {
      type: n.type,
      label: n.name || n.type,
      config: n.config ?? {},
      name: n.name,
    },
  }));

  const edges: Edge[] = defEdges.map((e, i) => ({
    id: `e-${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
  }));

  return { nodes, edges };
}

/**
 * Convert React Flow state back to backend definition.
 */
export function flowToDefinition(
  nodes: Node<FlowNodeData>[],
  edges: Edge[]
): DefinitionJson {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.type,
      config: n.data.config,
      name: n.data.name || n.data.label,
      position: n.position,
    })),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
    })),
  };
}

function isTrigger(type: string): boolean {
  return ['webhook', 'schedule', 'email', 'manual'].includes(type);
}

/**
 * Convert a single node definition (e.g. from AI add_node op) to React Flow node.
 */
export function nodeDefToFlowNode(
  nodeDef: { id: string; type: string; config?: Record<string, unknown>; name?: string; position?: { x: number; y: number } }
): Node<FlowNodeData> {
  const type = nodeDef.type ?? 'http';
  return {
    id: nodeDef.id,
    type: isTrigger(type) ? 'trigger' : 'action',
    position: nodeDef.position ?? { x: 80, y: 80 },
    data: {
      type,
      label: nodeDef.name ?? type,
      config: nodeDef.config ?? {},
      name: nodeDef.name,
    },
  };
}
