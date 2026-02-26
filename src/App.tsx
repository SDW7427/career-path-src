import React, { useEffect, useState } from 'react';
import TrackTabs from './components/TrackTabs';
import ControlBar from './components/ControlBar';
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
          setLoadError(e instanceof Error ? e.message : 'Failed to load data from Google Sheets.');
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
    getNodeById,
  } = useCareerPathState(data.nodes, data.edges);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-[1400px] mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold leading-tight">Career Path</h1>
            <p className="text-xs text-gray-500">キャリアパスモデル（育成面談用）</p>
          </div>

          <div className="flex items-center gap-3">
            <TrackTabs activeTrack={activeTrack} onTrackChange={handleTrackChange} />
            <div className="text-xs text-gray-500">
              現在の表示: <span className="font-semibold">{TRACK_LABELS[activeTrack]}</span>
              {filteredNodes.length > 0 && <>（{filteredNodes.length} ノード）</>}
            </div>
          </div>
        </div>

        {loadError && (
          <div className="max-w-[1400px] mx-auto px-5 pb-3">
            <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded px-3 py-2">
              Sheetsからの読み込みに失敗したため、ローカルデータを表示中：{loadError}
            </div>
          </div>
        )}
      </header>

      {/* Control Bar */}
      <div className="max-w-[1400px] mx-auto px-5 py-3">
        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />
      </div>

      {/* Main */}
      <main className="max-w-[1400px] mx-auto px-5 pb-6 flex gap-4">
        <section className="flex-[2] bg-white rounded-lg border overflow-hidden">
          <SkillTreeGraph
            careerNodes={filteredNodes}
            careerEdges={filteredEdges}
            selectedNodeId={selectedNodeId}
            connectedNodeIds={connectedNodeIds}
            track={activeTrack}
            onNodeClick={handleNodeClick}
          />
        </section>

        <aside className="flex-[1] bg-white rounded-lg border overflow-hidden">
          <DetailPanel node={selectedNode} onNodeClick={handleNodeClick} getNodeById={getNodeById} />
        </aside>
      </main>
    </div>
  );
};

export default App;
