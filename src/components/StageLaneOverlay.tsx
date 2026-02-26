import React from 'react';
import { useViewport } from '@xyflow/react';
import type { Track } from '../types/career';

const STAGE_Y_BASE = 50;
const STAGE_Y_GAP = 150;
const STAGES = [1, 2, 3, 4, 5, 6];

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
  lanes: LaneHeader[];
}

function getGroupHeaders(track: Track): GroupHeader[] {
  switch (track) {
    case 'development':
      return [
        {
          label: 'Webアプリケーション',
          centerX: 170,
          lanes: [
            { label: 'Specialist', x: 80 },
            { label: 'Manager', x: 260 },
          ],
        },
        {
          label: 'モバイルアプリ',
          centerX: 590,
          lanes: [
            { label: 'Specialist', x: 500 },
            { label: 'Manager', x: 680 },
          ],
        },
      ];
    case 'infrastructure':
      return [
        {
          label: 'サーバー',
          centerX: 170,
          lanes: [
            { label: 'Specialist', x: 80 },
            { label: 'Manager', x: 260 },
          ],
        },
        {
          label: 'ネットワーク',
          centerX: 590,
          lanes: [
            { label: 'Specialist', x: 500 },
            { label: 'Manager', x: 680 },
          ],
        },
      ];
    case 'it-support':
      return [
        {
          label: 'ITサポート',
          centerX: 100,
          lanes: [{ label: 'Manager', x: 100 }],
        },
        {
          label: '情シス支援',
          centerX: 350,
          lanes: [{ label: 'Manager', x: 350 }],
        },
        {
          label: 'PMO支援',
          centerX: 600,
          lanes: [{ label: 'Manager', x: 600 }],
        },
      ];
  }
}

/**
 * Renders horizontal stage-lane labels on the React Flow canvas.
 * These float as an overlay to show 段階1〜6 progression.
 */
const StageLaneOverlay: React.FC<StageLaneOverlayProps> = ({ track }) => {
  const { x, y, zoom } = useViewport();
  const groupHeaders = getGroupHeaders(track);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
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

      {groupHeaders.map((group) => (
        <React.Fragment key={group.label}>
          <div
            className="absolute text-[11px] font-semibold text-gray-500"
            style={{
              top: Math.max(y + 8, 8),
              left: group.centerX * zoom + x - 50,
            }}
          >
            {group.label}
          </div>
          {group.lanes.map((lane) => (
            <div
              key={`${group.label}-${lane.label}`}
              className="absolute text-[10px] text-gray-400"
              style={{
                top: Math.max(y + 24, 24),
                left: lane.x * zoom + x - 28,
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
