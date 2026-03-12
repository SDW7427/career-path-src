import React, { useEffect, useMemo, useState } from 'react';
import { useViewport } from '@xyflow/react';
import type { Track } from '../types/career';

const STAGE_Y_BASE = 50;
const STAGE_Y_GAP = 150;
const STAGES = [1, 2, 3, 4, 5, 6];
const DEFAULT_NODE_WIDTH = 140;
const TRACK_HEADER_PADDING = 40;
const MOBILE_COMMON_STAGE_SHIFT_X = -8;

interface StageLaneOverlayProps {
  track: Track;
}

interface LaneHeader {
  label: string;
  x: number;
}

interface GroupHeader {
  label: string;
  centerX: number;
  startX: number;
  endX: number;
  lanes: LaneHeader[];
}

const laneCenter = (x: number, nodeWidth = DEFAULT_NODE_WIDTH) => x + nodeWidth / 2;

const singleLaneGroup = (label: string, x: number, laneLabel = 'Manager'): GroupHeader => ({
  label,
  centerX: laneCenter(x),
  startX: x - TRACK_HEADER_PADDING,
  endX: x + DEFAULT_NODE_WIDTH + TRACK_HEADER_PADDING,
  lanes: [{ label: laneLabel, x: laneCenter(x) }],
});

const dualLaneGroup = (
  label: string,
  specialistX: number,
  managerX: number,
  commonStageShiftX: number,
  specialistLabel = 'Specialist',
  managerLabel = 'Manager'
): GroupHeader => ({
  label,
  centerX: (laneCenter(specialistX) + laneCenter(managerX)) / 2 + commonStageShiftX,
  startX: specialistX - TRACK_HEADER_PADDING,
  endX: managerX + DEFAULT_NODE_WIDTH + TRACK_HEADER_PADDING,
  lanes: [
    { label: specialistLabel, x: laneCenter(specialistX) },
    { label: managerLabel, x: laneCenter(managerX) },
  ],
});

function getGroupHeaders(track: Track, commonStageShiftX: number): GroupHeader[] {
  switch (track) {
    case 'development':
      return [
        dualLaneGroup('Webアプリケーション', 80, 260, commonStageShiftX),
        dualLaneGroup('モバイルアプリ', 500, 680, commonStageShiftX),
      ];
    case 'infrastructure':
      return [
        dualLaneGroup('サーバー', 80, 260, commonStageShiftX),
        dualLaneGroup('ネットワーク', 500, 680, commonStageShiftX),
      ];
    case 'it-support':
      return [
        singleLaneGroup('ITサポート', 100),
        singleLaneGroup('情シス支援', 350),
        singleLaneGroup('PMO支援', 600),
      ];
  }
}

/**
 * Renders horizontal stage-lane labels on the React Flow canvas.
 * These float as an overlay to show 段階1〜6 progression.
 */
const StageLaneOverlay: React.FC<StageLaneOverlayProps> = ({ track }) => {
  const { x, y, zoom } = useViewport();
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewportMode = () => {
      setIsMobileViewport(window.matchMedia('(max-width: 767px)').matches);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);

    return () => {
      window.removeEventListener('resize', updateViewportMode);
    };
  }, []);

  const commonStageShiftX = isMobileViewport ? MOBILE_COMMON_STAGE_SHIFT_X : 0;
  const groupHeaders = useMemo(
    () => getGroupHeaders(track, commonStageShiftX),
    [track, commonStageShiftX]
  );
  const separatorXs = groupHeaders
    .slice(0, -1)
    .map((group, idx) => (group.endX + groupHeaders[idx + 1].startX) / 2);
  const topStageScreenY = STAGE_Y_BASE * zoom + y;
  const titleTop = Math.max(topStageScreenY - 52, 8);
  const laneTop = titleTop + 28;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {STAGES.map((stage) => {
        const rawY = STAGE_Y_BASE + (6 - stage) * STAGE_Y_GAP;
        const screenY = rawY * zoom + y;

        return (
          <React.Fragment key={stage}>
            <div
              className="absolute text-[11px] font-bold text-gray-300 select-none"
              style={{
                top: screenY - 8,
                left: Math.max(x + 4, 4),
              }}
            >
              段階{stage}
            </div>
            <div
              className="absolute h-px bg-gray-100"
              style={{
                top: screenY - 15,
                left: 0,
                right: 0,
              }}
            />
          </React.Fragment>
        );
      })}

      {separatorXs.map((separatorX, idx) => (
        <div
          key={`group-separator-${idx}`}
          className="absolute border-l border-dashed border-gray-200/90"
          style={{
            top: 0,
            bottom: 0,
            left: separatorX * zoom + x,
          }}
        />
      ))}

      {groupHeaders.map((group) => (
        <React.Fragment key={group.label}>
          <div
            className="absolute rounded-md border border-blue-100 bg-blue-50/75"
            style={{
              top: titleTop - 6,
              left: group.startX * zoom + x,
              width: Math.max((group.endX - group.startX) * zoom, 100),
              height: 46,
            }}
          />

          <div
            className="absolute px-3 py-1 rounded-full border border-blue-300 bg-white/95 text-[13px] font-bold text-blue-800 shadow-sm whitespace-nowrap"
            style={{
              top: titleTop,
              left: group.centerX * zoom + x,
              transform: 'translateX(-50%)',
            }}
          >
            {group.label}
          </div>

          {group.lanes.map((lane) => (
            <div
              key={`${group.label}-${lane.label}`}
              className="absolute text-[10px] text-blue-700 whitespace-nowrap"
              style={{
                top: laneTop,
                left: lane.x * zoom + x,
                transform: 'translateX(-50%)',
              }}
            >
              {lane.label}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StageLaneOverlay;
