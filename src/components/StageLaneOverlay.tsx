import React from 'react';
import { useViewport } from '@xyflow/react';

const STAGE_Y_BASE = 50;
const STAGE_Y_GAP = 150;
const STAGES = [1, 2, 3, 4, 5, 6];

/**
 * Renders horizontal stage-lane labels on the React Flow canvas.
 * These float as an overlay to show 段階1〜6 progression.
 */
const StageLaneOverlay: React.FC = () => {
  const { x, y, zoom } = useViewport();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {STAGES.map((stage) => {
        const rawY = STAGE_Y_BASE + (stage - 1) * STAGE_Y_GAP;
        // Transform world coordinates to screen coordinates
        const screenY = rawY * zoom + y;
        const screenX = x;

        return (
          <React.Fragment key={stage}>
            {/* Stage label */}
            <div
              className="absolute text-[11px] font-bold text-gray-300 select-none"
              style={{
                top: screenY - 8,
                left: Math.max(screenX + 4, 4),
              }}
            >
              段階{stage}
            </div>
            {/* Horizontal lane line */}
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
    </div>
  );
};

export default StageLaneOverlay;
