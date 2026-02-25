import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { STAGE_LABELS, PATH_TYPE_LABELS, type Stage, type PathType, type Track } from '../types/career';

/** Data passed to each custom React Flow node */
export interface CareerNodeData {
  nodeId: string;
  shortLabel: string;
  titleJa: string;
  stage: Stage;
  pathType: PathType;
  track: Track;
  subtrack?: string;
  styleKey?: string;
  isSelected: boolean;
  isConnected: boolean;
  [key: string]: unknown;
}

/**
 * Custom React Flow node for career path tiles.
 * Renders a compact card showing stage, label, and path type.
 */
const CareerNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const {
    shortLabel,
    stage,
    pathType,
    track,
    subtrack,
    styleKey,
    isSelected,
    isConnected,
  } = data as unknown as CareerNodeData;

  const classes = [
    'career-node',
    `track-${track}`,
    `path-${pathType}`,
    isSelected ? 'selected' : '',
    isConnected ? 'connected' : '',
    styleKey ? `style-${styleKey}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {/* Handles for edges */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-300 !border-0" />

      {/* Stage + path badges */}
      <div className="flex items-center gap-1 mb-1">
        <span className="stage-badge">{STAGE_LABELS[stage as Stage]}</span>
        <span className="path-badge">{PATH_TYPE_LABELS[pathType as PathType]}</span>
      </div>

      {/* Label */}
      <div className="font-semibold text-gray-800 leading-tight text-[13px]">
        {shortLabel}
      </div>

      {/* Subtrack tag */}
      {subtrack && (
        <div className="text-[10px] text-gray-400 mt-1 truncate">
          {subtrack}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-300 !border-0" />
    </div>
  );
};

export default memo(CareerNodeComponent);
