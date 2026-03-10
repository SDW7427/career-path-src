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

/**
 * React Flow position is top-left.
 * Your node CSS has min-width 140px, so half = 70px is a good stable snap target.
 * (If you later make width fixed, adjust this.)
 */
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

function stageToY(stage: number): number {
  // Align exactly with StageLaneOverlay: rawY = base + (6 - stage) * gap
  return STAGE_Y_BASE + (MAX_STAGE - stage) * STAGE_Y_GAP;
}

/** when subtrack is missing / slightly different, infer from existing x */
function inferSubtrack(track: Track, x: number): string {
  // x here is top-left, but we compare roughly; it’s fine.
  if (track === 'it-support') {
    if (x < 220) return 'ITサポート';
    if (x < 470) return '情シス支援';
    return 'PMO支援';
  }
  // dev/infra have 2 groups
  if (x < 380) return track === 'development' ? 'Webアプリケーション' : 'サーバー';
  return track === 'development' ? 'モバイルアプリ' : 'ネットワーク';
}

function snapNodePosition(node: CareerNodeType): { x: number; y: number } {
  const y = stageToY(node.stage);

  const laneMap = TRACK_LANES[node.track];
  const rawX = node.position?.x ?? 0;

  const sub =
    node.subtrack && laneMap[node.subtrack]
      ? node.subtrack
      : inferSubtrack(node.track, rawX);

  const lane = laneMap[sub] ?? undefined;

  // Decide centerX (lane center) by pathType, fallback to group center
  const centerX =
    (lane && lane[node.pathType as PathType]) ??
    (lane ? lane.center : rawX + NODE_HALF_WIDTH);

  const x = centerX - NODE_HALF_WIDTH;

  return { x, y };
}

/**
 * Main skill-tree graph using React Flow.
 * Renders career nodes and edges for the active track.
 */
const SkillTreeGraph: React.FC<SkillTreeGraphProps> = ({
  careerNodes,
  careerEdges,
  selectedNodeId,
  connectedNodeIds,
  track,
  onNodeClick,
}) => {
  /** Snap all nodes onto fixed lanes + stage rows so edges become straight */
  const rfNodes: Node[] = useMemo(() => {
    return careerNodes.map((cn) => {
      const snapped = snapNodePosition(cn);

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
  }, [careerNodes, selectedNodeId, connectedNodeIds]);

  /** Convert CareerEdge[] → React Flow Edge[] */
  const rfEdges: Edge[] = useMemo(() => {
    const nodeMeta = new Map(careerNodes.map((node) => [node.id, node]));

    return careerEdges.map((ce, idx) => {
      const sourceNode = nodeMeta.get(ce.source);
      const targetNode = nodeMeta.get(ce.target);

      const isSameStage =
        sourceNode !== undefined &&
        targetNode !== undefined &&
        sourceNode.stage === targetNode.stage;

      const sourceIsLeft =
        sourceNode !== undefined && targetNode !== undefined
          ? sourceNode.position.x <= targetNode.position.x
          : true;

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
  }, [careerEdges, careerNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  /** Sync when source data changes (track switch, selection change) */
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
      {/* Stage lane labels overlay */}
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
        <Controls showInteractive={false} />

        <MiniMap
          nodeColor={() => minimapColor}
          maskColor="rgba(0,0,0,0.06)"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Legend note */}
      <div className="absolute bottom-3 left-3 text-[11px] text-gray-400 bg-white/70 border border-gray-100 rounded px-2 py-1">
        ※ SpecialistやManagerは兼任可能
      </div>
    </div>
  );
};

export default SkillTreeGraph;