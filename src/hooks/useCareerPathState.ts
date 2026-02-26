import { useCallback, useMemo, useState } from 'react';
import type { CareerEdge, CareerNode, PathType, Track } from '../types/career';

const DEFAULT_SUBTRACKS: Record<Track, string[]> = {
  development: ['Webアプリケーション', 'モバイルアプリ'],
  infrastructure: ['サーバー', 'ネットワーク'],
  'it-support': ['ITサポート', '情シス支援', 'PMO支援'],
};

export function useCareerPathState(allNodes: CareerNode[], allEdges: CareerEdge[]) {
  const [activeTrack, setActiveTrack] = useState<Track>('development');
  const [activeSubtrack, setActiveSubtrack] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<PathType | 'all'>>(new Set(['all']));

  const nodeById = useMemo(() => {
    const map = new Map<string, CareerNode>();
    allNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [allNodes]);

  const getNodeById = useCallback((id: string) => nodeById.get(id), [nodeById]);

  const availableSubtracks = useMemo(() => {
    const labels = new Set<string>();
    allNodes.forEach((node) => {
      if (node.track !== activeTrack) return;
      if (!node.subtrack) return;
      labels.add(node.subtrack);
    });

    const fromData = Array.from(labels).sort((a, b) => a.localeCompare(b, 'ja'));
    return fromData.length > 0 ? fromData : DEFAULT_SUBTRACKS[activeTrack];
  }, [activeTrack, allNodes]);

  const hasTrackSubtrackData = useMemo(
    () => allNodes.some((node) => node.track === activeTrack && Boolean(node.subtrack)),
    [activeTrack, allNodes]
  );

  const handleTrackChange = useCallback((track: Track) => {
    setActiveTrack(track);
    setActiveSubtrack('all');
    setSelectedNodeId(null);
  }, []);

  const handleSubtrackChange = useCallback((subtrack: string) => {
    setActiveSubtrack(subtrack);
    setSelectedNodeId(null);
  }, []);

  const handleFilterToggle = useCallback((filter: PathType | 'all') => {
    setActiveFilters((prev) => {
      const next = new Set(prev);

      if (filter === 'all') return new Set<PathType | 'all'>(['all']);

      next.delete('all');
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);

      if (next.size === 0) return new Set<PathType | 'all'>(['all']);
      return next;
    });
  }, []);

  const filteredNodes: CareerNode[] = useMemo(() => {
    let nodes = allNodes.filter((n) => n.track === activeTrack);

    if (activeSubtrack !== 'all' && hasTrackSubtrackData) {
      nodes = nodes.filter((n) => n.subtrack === activeSubtrack);
    }

    if (!activeFilters.has('all')) {
      const filterTypes = activeFilters as Set<PathType>;
      nodes = nodes.filter((n) => filterTypes.has(n.pathType));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.titleJa.toLowerCase().includes(q) ||
          n.shortLabel.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.recommendedCerts.some((c) => c.toLowerCase().includes(q)) ||
          n.toolsEnvironmentsLanguages.some((t) => t.toLowerCase().includes(q)) ||
          (n.subtrack && n.subtrack.toLowerCase().includes(q))
      );
    }

    return nodes;
  }, [allNodes, activeTrack, activeSubtrack, activeFilters, hasTrackSubtrackData, searchQuery]);

  const filteredEdges: CareerEdge[] = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return allEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [allEdges, filteredNodes]);

  const connectedNodeIds: Set<string> = useMemo(() => {
    if (!selectedNodeId) return new Set();
    const connected = new Set<string>();
    allEdges.forEach((e) => {
      if (e.source === selectedNodeId) connected.add(e.target);
      if (e.target === selectedNodeId) connected.add(e.source);
    });
    return connected;
  }, [allEdges, selectedNodeId]);

  const selectedNode: CareerNode | null = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeById(selectedNodeId) || null;
  }, [getNodeById, selectedNodeId]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = getNodeById(nodeId);
      if (node && node.track !== activeTrack) {
        setActiveTrack(node.track);
        setActiveSubtrack('all');
      }
      setSelectedNodeId(nodeId);
    },
    [activeTrack, getNodeById]
  );

  return {
    activeTrack,
    activeSubtrack,
    availableSubtracks,
    selectedNodeId,
    selectedNode,
    searchQuery,
    activeFilters,
    filteredNodes,
    filteredEdges,
    connectedNodeIds,
    handleTrackChange,
    handleSubtrackChange,
    handleNodeClick,
    setSearchQuery,
    handleFilterToggle,
    getNodeById,
  };
}
