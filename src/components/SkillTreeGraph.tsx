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
import type { CareerNode as CareerNodeType, CareerEdge, Track } from '../types/career';

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
  showMiniMap = true,
  showControls = true,
}) => {
  // Convert CareerNode[] → React Flow Node[]
  const rfNodes: Node[] = useMemo(() => {
    return careerNodes.map((cn) => ({
      id: cn.id,
      type: 'careerNode',
      position: cn.position,
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
    }));
  }, [careerNodes, selectedNodeId, connectedNodeIds]);

  // Convert CareerEdge[] → React Flow Edge[]
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
        sourceHandle: isSameStage ? (sourceIsLeft ? 'source-right' : 'source-left') : 'source-top',
        targetHandle: isSameStage ? (sourceIsLeft ? 'target-left' : 'target-right') : 'target-bottom',
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
        // 段階の進行エッジ（例: 段階1→2）は直線で描画したい
        type: ce.type === 'cross-track' ? 'smoothstep' : 'straight',
      };
    });
  }, [careerEdges, careerNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync when source data changes (track switch, selection change)
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

  // Track-specific minimap colors
  const minimapColor = useMemo(() => {
    switch (track) {
      case 'development': return '#3b82f6';
      case 'infrastructure': return '#06b6d4';
      case 'it-support': return '#8b5cf6';
    }
  }, [track]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        colorMode={'light' as ColorMode}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        {showControls && (
          <Controls
            showInteractive={false}
            className="!bg-white !border-gray-200 !shadow-sm"
          />
        )}
        {showMiniMap && (
          <MiniMap
            nodeColor={minimapColor}
            maskColor="rgba(0,0,0,0.08)"
            className="!bg-white !border-gray-200"
            pannable
            zoomable
          />
        )}
        {/* Stage lane labels overlay */}
        <StageLaneOverlay track={track} />
      </ReactFlow>

      {/* Legend note */}
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded">
        ※ SpecialistやManagerは兼任可能
      </div>
    </div>
  );
};

export default SkillTreeGraph;
