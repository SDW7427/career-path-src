import React, { useEffect, useState } from 'react';
import TrackTabs from './components/TrackTabs';
import ControlBar from './components/ControlBar';
import SubtrackTabs from './components/SubtrackTabs';
import SkillTreeGraph from './components/SkillTreeGraph';
import DetailPanel from './components/DetailPanel';
import MobileDetailDrawer from './components/MobileDetailDrawer';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import MobileGestureTutorial from './components/MobileGestureTutorial';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useCareerPathState } from './hooks/useCareerPathState';
import { TRACK_LABELS, type CareerDataSet } from './types/career';
import { loadCareerDataFromSheets } from './data/loadCareerDataFromSheets';

const App: React.FC = () => {
  const [data, setData] = useState<CareerDataSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showMobileTutorial, setShowMobileTutorial] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const ds = await loadCareerDataFromSheets();
      setData(ds);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load data from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
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
  } = useCareerPathState(data?.nodes ?? [], data?.edges ?? []);

  const handleGraphNodeClick = (nodeId: string) => {
    handleNodeClick(nodeId);
    setIsMobileDetailOpen(true);
  };

  useEffect(() => {
    if (!selectedNode) {
      setIsMobileDetailOpen(false);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    const hasSeenTutorial = window.localStorage.getItem('career-mobile-tutorial-seen') === '1';

    if (isMobileViewport && !hasSeenTutorial) {
      setShowMobileTutorial(true);
    }
  }, []);

  const closeMobileTutorial = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('career-mobile-tutorial-seen', '1');
    }
    setShowMobileTutorial(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 md:px-5 md:py-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate">Career Path</h1>
              <p className="text-[10px] md:text-[11px] text-gray-400 -mt-0.5 truncate">キャリアパスモデル（育成面談用）</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12m-9 8h6" />
              </svg>
              Search/Filter
            </button>
            <div className="hidden md:block text-xs text-gray-400 shrink-0">
              現在の表示:{' '}
              <span className="font-semibold text-gray-600">{TRACK_LABELS[activeTrack]}</span>
              <span className="ml-1 text-gray-500">/ {activeSubtrack === 'all' ? '全分類' : activeSubtrack}</span>
              {filteredNodes.length > 0 && (
                <span className="ml-2 text-gray-300">({filteredNodes.length} ノード)</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-gray-500 shrink-0">区分</span>
              <TrackTabs activeTrack={activeTrack} onTrackChange={handleTrackChange} />
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

        {loadError && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              aria-label="Retry loading"
              title="Retry"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.153 9A8.001 8.001 0 0119 8m-.153 7A8.001 8.001 0 015 16" />
              </svg>
            </button>
          </div>
        )}
      </header>

      <div className="hidden md:block">
        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />
      </div>

      {loading ? (
        <div className="flex-1 overflow-hidden">
          <LoadingSkeleton />
        </div>
      ) : (
        <>
          <div className="hidden md:flex flex-1 overflow-hidden">
            <div className="flex-[2] min-w-0 border-r border-gray-200 bg-white">
              <SkillTreeGraph
                careerNodes={filteredNodes}
                careerEdges={filteredEdges}
                selectedNodeId={selectedNodeId}
                connectedNodeIds={connectedNodeIds}
                track={activeTrack}
                onNodeClick={handleGraphNodeClick}
                showMiniMap
                showControls
              />
            </div>

            <div className="flex-[1] min-w-[320px] max-w-[420px] bg-white border-l border-gray-100">
              <DetailPanel
                node={selectedNode}
                onNodeClick={handleGraphNodeClick}
                getNodeById={getNodeById}
              />
            </div>
          </div>

          <div className="md:hidden flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-white">
              <SkillTreeGraph
                careerNodes={filteredNodes}
                careerEdges={filteredEdges}
                selectedNodeId={selectedNodeId}
                connectedNodeIds={connectedNodeIds}
                track={activeTrack}
                onNodeClick={handleGraphNodeClick}
                showMiniMap={false}
                showControls={false}
              />
            </div>

            <MobileDetailDrawer
              open={isMobileDetailOpen}
              node={selectedNode}
              onClose={() => setIsMobileDetailOpen(false)}
              onNodeClick={handleGraphNodeClick}
              getNodeById={getNodeById}
            />

            <MobileFilterDrawer
              open={isMobileFilterOpen}
              onClose={() => setIsMobileFilterOpen(false)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilters={activeFilters}
              onFilterToggle={handleFilterToggle}
            />

            <MobileGestureTutorial
              open={showMobileTutorial}
              onClose={closeMobileTutorial}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
