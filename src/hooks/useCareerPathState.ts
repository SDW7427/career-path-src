import { useState, useMemo, useCallback } from 'react';
import type {
  Track,
  PathType,
  CareerNode,
  CareerEdge,
} from '../types/career';
import {
  getNodesByTrack,
  allEdges,
  getNodeById,
} from '../data/careerData';

/**
 * Central state management hook for the career path app.
 * Manages track selection, node selection, search, filters, and derived data.
 */
export function useCareerPathState() {
  // --- Core state ---
  const [activeTrack, setActiveTrack] = useState<Track>('development');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<PathType | 'all'>>(
    new Set(['all'])
  );

  // --- Track change handler ---
  const handleTrackChange = useCallback((track: Track) => {
    setActiveTrack(track);
    setSelectedNodeId(null); // Clear selection on track switch
  }, []);

  // --- Filter toggle handler ---
  const handleFilterToggle = useCallback((filter: PathType | 'all') => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (filter === 'all') {
        // Toggle "all" clears individual filters
        return new Set(['all']);
      }
      // Remove "all" if selecting individual filter
      next.delete('all');
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      // If nothing selected, default back to "all"
      if (next.size === 0) return new Set<PathType | 'all'>(['all']);
      return next;
    });
  }, []);

  // --- Filtered nodes for current track ---
  const filteredNodes: CareerNode[] = useMemo(() => {
    let nodes = getNodesByTrack(activeTrack);

    // Apply path type filter
    if (!activeFilters.has('all')) {
      const filterTypes = activeFilters as Set<PathType>;
      nodes = nodes.filter((n) => filterTypes.has(n.pathType));
    }

    // Apply search filter
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
  }, [activeTrack, activeFilters, searchQuery]);

  // --- Edges for filtered nodes (include cross-track edges that touch our nodes) ---
  const filteredEdges: CareerEdge[] = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    // Get edges where BOTH source and target are in our node set
    return allEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );
  }, [filteredNodes]);

  // --- Connected nodes for visual highlight ---
  const connectedNodeIds: Set<string> = useMemo(() => {
    if (!selectedNodeId) return new Set();
    const connected = new Set<string>();
    allEdges.forEach((e) => {
      if (e.source === selectedNodeId) connected.add(e.target);
      if (e.target === selectedNodeId) connected.add(e.source);
    });
    return connected;
  }, [selectedNodeId]);

  // --- Selected node detail ---
  const selectedNode: CareerNode | null = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeById(selectedNodeId) || null;
  }, [selectedNodeId]);

  // --- Node click handler (handles cross-track jumps) ---
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = getNodeById(nodeId);
      if (node && node.track !== activeTrack) {
        // Cross-track jump: switch tab and select
        setActiveTrack(node.track);
      }
      setSelectedNodeId(nodeId);
    },
    [activeTrack]
  );

  return {
    // State
    activeTrack,
    selectedNodeId,
    selectedNode,
    searchQuery,
    activeFilters,
    filteredNodes,
    filteredEdges,
    connectedNodeIds,
    // Handlers
    handleTrackChange,
    handleNodeClick,
    setSearchQuery,
    handleFilterToggle,
  };
}
