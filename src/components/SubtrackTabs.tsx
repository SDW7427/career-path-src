import React from 'react';
import type { Track } from '../types/career';

interface SubtrackTabsProps {
  track: Track;
  subtracks: string[];
  activeSubtrack: string;
  onSubtrackChange: (subtrack: string) => void;
  showLabel?: boolean;
}

const TRACK_THEME: Record<Track, { active: string; hover: string; badge: string }> = {
  development: {
    active: 'bg-blue-100 text-blue-800 border-blue-300',
    hover: 'hover:border-blue-200 hover:text-blue-700',
    badge: 'text-blue-600',
  },
  infrastructure: {
    active: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    hover: 'hover:border-cyan-200 hover:text-cyan-700',
    badge: 'text-cyan-600',
  },
  'it-support': {
    active: 'bg-violet-100 text-violet-800 border-violet-300',
    hover: 'hover:border-violet-200 hover:text-violet-700',
    badge: 'text-violet-600',
  },
};

const SubtrackTabs: React.FC<SubtrackTabsProps> = ({
  track,
  subtracks,
  activeSubtrack,
  onSubtrackChange,
  showLabel = true,
}) => {
  const theme = TRACK_THEME[track];

  if (subtracks.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className={`text-xs font-semibold ${theme.badge}`}>分類</span>}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSubtrackChange('all')}
          className={`px-3 py-1 rounded-full text-xs border transition-all ${
            activeSubtrack === 'all'
              ? theme.active
              : `bg-white text-gray-600 border-gray-200 ${theme.hover}`
          }`}
        >
          すべて
        </button>

        {subtracks.map((subtrack) => {
          const isActive = activeSubtrack === subtrack;
          return (
            <button
              key={subtrack}
              onClick={() => onSubtrackChange(subtrack)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                isActive
                  ? theme.active
                  : `bg-white text-gray-600 border-gray-200 ${theme.hover}`
              }`}
            >
              {subtrack}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubtrackTabs;
