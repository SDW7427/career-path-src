import React from 'react';
import TrackTabs from './components/TrackTabs';
import ControlBar from './components/ControlBar';
import SkillTreeGraph from './components/SkillTreeGraph';
import DetailPanel from './components/DetailPanel';
import { useCareerPathState } from './hooks/useCareerPathState';
import { TRACK_LABELS } from './types/career';

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
  const {
    activeTrack,
    selectedNodeId,
    selectedNode,
    searchQuery,
    activeFilters,
    filteredNodes,
    filteredEdges,
    connectedNodeIds,
    handleTrackChange,
    handleNodeClick,
    setSearchQuery,
    handleFilterToggle,
  } = useCareerPathState();

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

            {/* Track Tabs */}
            <TrackTabs
              activeTrack={activeTrack}
              onTrackChange={handleTrackChange}
            />
          </div>

          {/* Right side: active track indicator */}
          <div className="text-xs text-gray-400">
            現在の表示:{' '}
            <span className="font-semibold text-gray-600">
              {TRACK_LABELS[activeTrack]}
            </span>
            {filteredNodes.length > 0 && (
              <span className="ml-2 text-gray-300">
                ({filteredNodes.length} ノード)
              </span>
            )}
          </div>
        </div>
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
          />
        </div>
      </div>
    </div>
  );
};

export default App;
