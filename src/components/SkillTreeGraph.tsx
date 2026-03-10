import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
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
  type ReactFlowInstance,
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
  /**
   * ✅ Edge가 “기울어져 보이는” 주 원인 중 하나가
   * 노드 폭이 가변(min/max)이라서 handle의 실제 x 위치(중심)가 달라지는 경우임.
   * 여기서 wrapper style로 폭을 고정해주면 (CSS를 안 건드려도) 정렬이 안정됨.
   *
   * - Desktop: 140
   * - Mobile: 110
   */
  const [nodeWidth, setNodeWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 140;
    return window.matchMedia?.('(max-width: 768px)').matches ? 110 : 140;
  });

useEffect(() => {
  if (typeof window === 'undefined') return;

  const mql = window.matchMedia('(max-width: 768px)');
  const update = () => setNodeWidth(mql.matches ? 110 : 140);

  // 초기 1회 반영
  update();

  // 최신 브라우저
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }

  // 구형 브라우저 (deprecated지만 일부 환경에서 남아있음)
  if (typeof (mql as MediaQueryList).addListener === 'function') {
    (mql as MediaQueryList).addListener(update);
    return () => (mql as MediaQueryList).removeListener(update);
  }

  return;
}, []);
  // Convert CareerNode[] → React Flow Node[]
  const rfNodes: Node[] = useMemo(() => {
    return careerNodes.map((cn) => ({
      id: cn.id,
      type: 'careerNode',
      position: cn.position,
      // ✅ wrapper width 고정 (직선/정렬 체감에 가장 큼)
      style: { width: nodeWidth, minWidth: nodeWidth, maxWidth: nodeWidth },
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
  }, [careerNodes, selectedNodeId, connectedNodeIds, nodeWidth]);

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

        /**
         * ✅ 일괄 직선 적용
         * - cross-track도 smoothstep(곡선) 쓰지 않고 straight로 통일
         * - “삐뚤빼뚤” 체감이 제일 크게 줄어듦
         */
        type: 'straight',
      };
    });
  }, [careerEdges, careerNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // IMPORTANT: useState here (not only useRef) so that fitView logic reruns after onInit.
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Hide the graph until the *first* fitView is applied, so users never see the default (0,0,zoom=1)
  // viewport flash and then a sudden jump. We keep the graph mounted (opacity 0) so measurement works.
  const [isInitialViewportReady, setIsInitialViewportReady] = useState(false);
  const hasInitialFitRef = useRef(false);

  // Fit once per *visible node set* (track/subtrack changes), not for selection/highlight changes.
  const lastFitSigRef = useRef<string>('');

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
      case 'development':
        return '#3b82f6';
      case 'infrastructure':
        return '#06b6d4';
      case 'it-support':
        return '#8b5cf6';
    }
  }, [track]);

  // Signature based only on visible node IDs
  const fitSignature = useMemo(() => rfNodes.map((n) => n.id).join('|'), [rfNodes]);

  useEffect(() => {
    const inst = rfInstance;
    if (!inst) return;
    if (nodes.length === 0) return;

    // Only for the very first paint: keep hidden until we actually applied fitView.
    if (!hasInitialFitRef.current) {
      setIsInitialViewportReady(false);
    }

    // If the visible node set didn't change, never refit.
    if (lastFitSigRef.current === fitSignature) return;

    let cancelled = false;
    let rafId = 0;
    let attempts = 0;

    const isNodeMeasured = (n: any) => {
      const w = n?.measured?.width ?? n?.width ?? 0;
      const h = n?.measured?.height ?? n?.height ?? 0;
      return w > 0 && h > 0;
    };

    const isMobile = () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia?.('(max-width: 767px)').matches ?? false;
    };

    const runFit = () => {
      if (cancelled) return;

      const currentNodes = inst.getNodes?.() ?? [];
      const ready = currentNodes.length > 0 && currentNodes.every(isNodeMeasured);

      attempts += 1;
      if (!ready && attempts < 120) {
        rafId = requestAnimationFrame(runFit);
        return;
      }

      // Desktop: zoom OUT more (bigger padding). Mobile: zoom IN a bit.
      const padding = isMobile() ? 0.14 : 0.40;

      inst.fitView({ padding });

      // Extra micro-adjust for desktop: keep it visually centered in the left canvas.
      // (fitView sometimes feels left-biased when node positions start near x=0)
      if (!isMobile()) {
        const vp = inst.getViewport?.();
        if (vp) {
          inst.setViewport({ x: vp.x + 24, y: vp.y + 8, zoom: vp.zoom }, { duration: 0 });
        }
      }

      lastFitSigRef.current = fitSignature;

      // Mark initial viewport as ready so we can reveal the graph.
      if (!hasInitialFitRef.current) {
        hasInitialFitRef.current = true;
        setIsInitialViewportReady(true);
      }
    };

    const run = () => {
      if (cancelled) return;
      // Two-phase paint: wait for React commit + layout.
      requestAnimationFrame(() => {
        if (cancelled) return;
        rafId = requestAnimationFrame(runFit);
      });
    };

    const fontsReady = (typeof document !== 'undefined' && (document as any).fonts?.ready) as
      | Promise<unknown>
      | undefined;

    if (fontsReady) {
      void fontsReady.then(run).catch(run);
    } else {
      run();
    }

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [rfInstance, fitSignature, nodes.length]);

  return (
    <div className="w-full h-full relative">
      {/* Keep the graph mounted for measurement, but hide it until initial fitView completes. */}
      <div
        className={`absolute inset-0 transition-opacity duration-150 ${
          isInitialViewportReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: isInitialViewportReady ? 'auto' : 'none' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onInit={(inst) => setRfInstance(inst)}
          nodeTypes={nodeTypes}
          minZoom={0.3}
          maxZoom={1.5}
          colorMode={'light' as ColorMode}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          // ✅ “혹시 어딘가에서 type이 덮어써져도” 직선 유지하는 안전장치
          defaultEdgeOptions={{ type: 'straight' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
          {showControls && (
            <Controls showInteractive={false} className="!bg-white !border-gray-200 !shadow-sm" />
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
      </div>

      {/* Skeleton overlay during the tiny window before the first fitView */}
      {!isInitialViewportReady && (
        <div className="absolute inset-0 bg-white pointer-events-none">
          <div className="absolute inset-0 animate-pulse">
            {/* faint canvas blocks to suggest the graph */}
            <div className="absolute left-8 top-8 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-56 top-8 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-8 top-24 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-56 top-24 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-8 top-40 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-56 top-40 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-8 top-56 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-56 top-56 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-8 top-72 h-10 w-40 rounded bg-gray-100" />
            <div className="absolute left-56 top-72 h-10 w-40 rounded bg-gray-100" />

            {/* minimap placeholder (desktop only) */}
            {showMiniMap && (
              <div className="absolute bottom-8 right-8 h-40 w-56 rounded bg-gray-100" />
            )}
          </div>
        </div>
      )}

      {/* Legend note */}
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded">
        ※ SpecialistやManagerは兼任可能
      </div>
    </div>
  );
};

export default SkillTreeGraph;