import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
  type ColorMode,
} from '@xyflow/react';

import CareerNodeComponent from './CareerNode';
import type { CareerNodeData } from './CareerNode';
import StageLaneOverlay from './StageLaneOverlay';
import type { CareerNode as CareerNodeType, CareerEdge, Track, PathType } from '../types/career';

interface SkillTreeGraphProps {
  careerNodes: CareerNodeType[];
  careerEdges: CareerEdge[];
  selectedNodeId: string | null;
  connectedNodeIds: Set<string>;
  track: Track;
  onNodeClick: (nodeId: string) => void;
  showMiniMap?: boolean;
  showControls?: boolean;
}

/** Map CareerEdge.type to CSS class */
function edgeClassName(type: CareerEdge['type']): string {
  switch (type) {
    case 'optional':
      return 'edge-optional';
    case 'cross-track':
      return 'edge-cross-track';
    default:
      return 'edge-normal';
  }
}

const nodeTypes = { careerNode: CareerNodeComponent };

/** ===== Layout constants (match StageLaneOverlay) ===== */
const STAGE_Y_BASE = 50;
const STAGE_Y_GAP = 150;
const MAX_STAGE = 6;

/** Node position is top-left */
const NODE_HALF_WIDTH = 70;

type LaneMap = Record<string, Partial<Record<PathType, number>> & { center: number }>;

const TRACK_LANES: Record<Track, LaneMap> = {
  development: {
    'Webアプリケーション': { specialist: 80, manager: 260, common: 170, center: 170 },
    'モバイルアプリ': { specialist: 500, manager: 680, common: 590, center: 590 },
  },
  infrastructure: {
    'サーバー': { specialist: 80, manager: 260, common: 170, center: 170 },
    'ネットワーク': { specialist: 500, manager: 680, common: 590, center: 590 },
  },
  'it-support': {
    'ITサポート': { manager: 100, common: 100, center: 100 },
    '情シス支援': { manager: 350, common: 350, center: 350 },
    'PMO支援': { manager: 600, common: 600, center: 600 },
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** ✅ stage가 "段階6" 같은 문자열이어도 안전하게 숫자로 변환 */
function coerceStage(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return clamp(value, 1, MAX_STAGE);

  if (typeof value === 'string') {
    // "6", "段階6", "段階 6" etc
    const m = value.match(/\d+/);
    if (m) {
      const n = Number(m[0]);
      if (Number.isFinite(n)) return clamp(n, 1, MAX_STAGE);
    }
  }
  // fallback
  return 1;
}

function stageToY(stageValue: unknown): number {
  const stage = coerceStage(stageValue);
  return STAGE_Y_BASE + (MAX_STAGE - stage) * STAGE_Y_GAP;
}

/** when subtrack is missing / slightly different, infer from existing x */
function inferSubtrack(track: Track, x: number): string {
  if (track === 'it-support') {
    if (x < 220) return 'ITサポート';
    if (x < 470) return '情シス支援';
    return 'PMO支援';
  }
  if (x < 380) return track === 'development' ? 'Webアプリケーション' : 'サーバー';
  return track === 'development' ? 'モバイルアプリ' : 'ネットワーク';
}

function snapNodePosition(node: CareerNodeType): { x: number; y: number } {
  const y = stageToY((node as any).stage);

  const laneMap = TRACK_LANES[node.track];
  const rawX = (node.position as any)?.x ?? 0;

  const sub =
    node.subtrack && laneMap[node.subtrack]
      ? node.subtrack
      : inferSubtrack(node.track, rawX);

  const lane = laneMap[sub];

  const centerX =
    (lane && lane[node.pathType as PathType]) ??
    (lane ? lane.center : rawX + NODE_HALF_WIDTH);

  const x = centerX - NODE_HALF_WIDTH;

  return { x, y };
}

/**
 * Main skill-tree graph using React Flow.
 */
const SkillTreeGraph: React.FC<SkillTreeGraphProps> = ({
  careerNodes,
  careerEdges,
  selectedNodeId,
  connectedNodeIds,
  track,
  onNodeClick,
  showMiniMap = true,
  showControls = true,
}) => {
  // ✅ robust default (in case parent briefly passes undefined)
  const safeNodes = careerNodes ?? [];
  const safeEdges = careerEdges ?? [];

  /** Precompute snapped positions for consistent edge handle decisions */
  const snappedPosById = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const cn of safeNodes) m.set(cn.id, snapNodePosition(cn));
    return m;
  }, [safeNodes]);

  /** Snap all nodes onto fixed lanes + stage rows so edges become straight */
  const rfNodes: Node[] = useMemo(() => {
    return safeNodes.map((cn) => {
      const snapped = snappedPosById.get(cn.id) ?? snapNodePosition(cn);

      return {
        id: cn.id,
        type: 'careerNode',
        position: snapped,
        data: {
          nodeId: cn.id,
          shortLabel: cn.shortLabel,
          titleJa: cn.titleJa,
          stage: cn.stage,
          pathType: cn.pathType,
          track: cn.track,
          subtrack: cn.subtrack,
          styleKey: cn.styleKey,
          isSelected: cn.id === selectedNodeId,
          isConnected: connectedNodeIds.has(cn.id),
        } satisfies CareerNodeData,
      };
    });
  }, [safeNodes, snappedPosById, selectedNodeId, connectedNodeIds]);

  /** Convert CareerEdge[] → React Flow Edge[] */
  const rfEdges: Edge[] = useMemo(() => {
    const nodeMeta = new Map(safeNodes.map((node) => [node.id, node]));

    return safeEdges.map((ce, idx) => {
      const sourceNode = nodeMeta.get(ce.source);
      const targetNode = nodeMeta.get(ce.target);

      const sourcePos = snappedPosById.get(ce.source);
      const targetPos = snappedPosById.get(ce.target);

      const sourceStage = sourceNode ? coerceStage((sourceNode as any).stage) : NaN;
      const targetStage = targetNode ? coerceStage((targetNode as any).stage) : NaN;

      const isSameStage =
        Number.isFinite(sourceStage) &&
        Number.isFinite(targetStage) &&
        sourceStage === targetStage;

      const sourceIsLeft =
        sourcePos && targetPos ? sourcePos.x <= targetPos.x : true;

      return {
        id: `e-${ce.source}-${ce.target}-${idx}`,
        source: ce.source,
        target: ce.target,
        sourceHandle: isSameStage
          ? sourceIsLeft
            ? 'source-right'
            : 'source-left'
          : 'source-top',
        targetHandle: isSameStage
          ? sourceIsLeft
            ? 'target-left'
            : 'target-right'
          : 'target-bottom',
        className: edgeClassName(ce.type),
        label: ce.label || undefined,
        animated: ce.type === 'cross-track',
        style:
          ce.type === 'cross-track'
            ? { stroke: '#f59e0b' }
            : ce.type === 'optional'
              ? { stroke: '#94a3b8', strokeDasharray: '6 4' }
              : { stroke: '#94a3b8' },
        labelStyle: { fontSize: 10, fill: '#64748b' },

        // ✅ All edges straight
        type: 'straight',
      };
    });
  }, [safeEdges, safeNodes, snappedPosById]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  /** Sync when source data changes */
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  /** Track-specific minimap colors */
  const minimapColor = useMemo(() => {
    switch (track) {
      case 'development':
        return '#3b82f6';
      case 'infrastructure':
        return '#06b6d4';
      case 'it-support':
        return '#8b5cf6';
    }
  }, [track]);

  return (
    <div className="h-full w-full relative">
      <StageLaneOverlay track={track} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode={'light' as ColorMode}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        {showControls && <Controls showInteractive={false} />}
        {showMiniMap && (
          <MiniMap
            nodeColor={() => minimapColor}
            maskColor="rgba(0,0,0,0.06)"
            pannable
            zoomable
          />
        )}
      </ReactFlow>

      <div className="absolute bottom-3 left-3 text-[11px] text-gray-400 bg-white/70 border border-gray-100 rounded px-2 py-1">
        ※ SpecialistやManagerは兼任可能
      </div>
    </div>
  );
};

export default SkillTreeGraph;