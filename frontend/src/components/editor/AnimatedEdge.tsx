'use client';

import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

export function AnimatedEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd } =
    props;
  const { theme } = useTheme();

  const baseStroke = theme === 'dark' ? '#334155' : '#e2e8f0';

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <g>
      {/* subtle background stroke for contrast */}
      <BaseEdge id={id} path={edgePath} style={{ stroke: baseStroke, strokeWidth: 2 }} />

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

    </g>
  );
}

