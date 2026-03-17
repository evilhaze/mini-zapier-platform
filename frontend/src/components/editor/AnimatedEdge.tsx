'use client';

import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, getBezierPath } from '@xyflow/react';

export function AnimatedEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd } =
    props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const pathId = `edge-path-${id}`;

  return (
    <g>
      {/* subtle background stroke for contrast */}
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#e2e8f0', strokeWidth: 2 }} />

      {/* animated overlay stroke (keeps existing flow feel) */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="url(#edge-gradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="4 8"
        strokeDashoffset={0}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-48"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>

      <defs>
        {/* path definition for lightning stream */}
        <path id={pathId} d={edgePath} />

        {/* gradient for stroke */}
        <linearGradient id="edge-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f97373" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f97373" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {markerEnd && (
        <path d={edgePath} fill="none" stroke="transparent" strokeWidth={10} markerEnd={markerEnd} />
      )}

      {/* stream of tiny lightning glyphs moving along the edge */}
      <text
        fontSize={8}
        fill="#f97373"
        opacity={0.85}
      >
        <textPath
          href={`#${pathId}`}
          startOffset="0%"
          textLength="140%"
          spacing="auto"
        >
          {'⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡   ⚡'}
          <animate
            attributeName="startOffset"
            from="0%"
            to="100%"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </textPath>
      </text>
    </g>
  );
}

