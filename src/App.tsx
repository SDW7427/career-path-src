import React, { useEffect, useState } from 'react';
import TrackTabs from './components/TrackTabs';
import ControlBar from './components/ControlBar';
import SubtrackTabs from './components/SubtrackTabs';
import SkillTreeGraph from './components/SkillTreeGraph';
import DetailPanel from './components/DetailPanel';
import { useCareerPathState } from './hooks/useCareerPathState';
import { TRACK_LABELS, type CareerDataSet } from './types/career';
import { loadCareerDataFromSheets } from './data/loadCareerDataFromSheets';
import { allNodes as fallbackNodes, allEdges as fallbackEdges } from './data/careerData';

/**
 * Main application component.
 *
 * Layout:
 * ┌────────────────────────────────────────────┐
 * │ Header: Title + Track Tabs                 │
 * ├────────────────────────────────────────────┤
 * │ Control Bar: Search + Filters + Legend      │
 * ├──────────────────────────┬─────────────────┤
 * │                          │                 │
 * │  Skill Tree Graph (2/3)  │  Detail (1/3)   │
 * │                          │                 │
 * └──────────────────────────┴─────────────────┘
 */
const App: React.FC = () => {
  const [data, setData] = useState<CareerDataSet>({
    nodes: fallbackNodes,
    edges: fallbackEdges,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load from Google Sheets (CSV) on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ds = await loadCareerDataFromSheets();
        if (!cancelled) {
          setData(ds);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : 'Failed to load data from Google Sheets.'
          );
          // fallback data stays
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
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
  } = useCareerPathState(data.nodes, data.edges);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ============================================================
          A. HEADER
          ============================================================ */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Title block */}
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Career Path
              </h1>
              <p className="text-[11px] text-gray-400 -mt-0.5">
                キャリアパスモデル（育成面談用）
              </p>
            </div>

            {/* Track + Subtrack selectors */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">区分</span>
                <TrackTabs
                  activeTrack={activeTrack}
                  onTrackChange={handleTrackChange}
                />
              </div>

              <SubtrackTabs
                track={activeTrack}
                subtracks={availableSubtracks}
                activeSubtrack={activeSubtrack}
                onSubtrackChange={handleSubtrackChange}
                showLabel
              />
            </div>
          </div>

          {/* Right side: active track indicator */}
          <div className="text-xs text-gray-400">
            現在の表示:{' '}
            <span className="font-semibold text-gray-600">
              {TRACK_LABELS[activeTrack]}
            </span>
            <span className="ml-1 text-gray-500">
              / {activeSubtrack === 'all' ? '全分類' : activeSubtrack}
            </span>
            {filteredNodes.length > 0 && (
              <span className="ml-2 text-gray-300">
                ({filteredNodes.length} ノード)
              </span>
            )}
          </div>
        </div>

        {/* Load error banner (optional) */}
        {loadError && (
          <div className="mt-2 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-3 py-2">
            Sheetsからの読み込みに失敗したため、ローカルデータを表示中：{loadError}
          </div>
        )}
      </header>

      {/* ============================================================
          CONTROL BAR
          ============================================================ */}
      <ControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
      />

      {/* ============================================================
          B + C. MAIN CONTENT AREA
          ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* B. LEFT PANE — Skill Tree Graph (2/3 width) */}
        <div className="flex-[2] min-w-0 border-r border-gray-200 bg-white">
          <SkillTreeGraph
            careerNodes={filteredNodes}
            careerEdges={filteredEdges}
            selectedNodeId={selectedNodeId}
            connectedNodeIds={connectedNodeIds}
            track={activeTrack}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* C. RIGHT PANE — Detail Panel (1/3 width) */}
        <div className="flex-[1] min-w-[320px] max-w-[420px] bg-white border-l border-gray-100">
          <DetailPanel
            node={selectedNode}
            onNodeClick={handleNodeClick}
            getNodeById={getNodeById}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
