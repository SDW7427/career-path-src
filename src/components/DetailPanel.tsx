import React from 'react';
import type {
  CareerNode,
} from '../types/career';
import {
  TRACK_LABELS,
  STAGE_LABELS,
  PATH_TYPE_LABELS,
  type Stage,
} from '../types/career';

interface DetailPanelProps {
  node: CareerNode | null;
  onNodeClick: (nodeId: string) => void;
  getNodeById: (nodeId: string) => CareerNode | undefined;
}

/** Section wrapper for consistency */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{title}</h4>
    {children}
  </div>
);

/** Render a list of strings as compact tags/pills */
const TagList: React.FC<{ items: string[]; color?: string }> = ({ items, color = 'bg-gray-100 text-gray-700' }) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className={`inline-block text-xs px-2 py-0.5 rounded-md ${color}`}>
          {item}
        </span>
      ))}
    </div>
  );
};

/** Render a list as bullet points */
const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;
  return (
    <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

/**
 * Right-side detail panel showing full information for the selected career node.
 * Shows a placeholder when no node is selected.
 */
const DetailPanel: React.FC<DetailPanelProps> = ({ node, onNodeClick, getNodeById }) => {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="text-4xl mb-4 opacity-30">🎯</div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">ノードを選択してください</h3>
        <p className="text-xs text-gray-300 leading-relaxed max-w-[240px]">
          左のキャリアマップからノードをクリックすると、
          役職の詳細情報がここに表示されます。
        </p>
        <div className="mt-6 text-xs text-gray-200 space-y-1">
          <p>💡 マウスホイールでズーム</p>
          <p>💡 ドラッグで移動</p>
          <p>💡 タブで軸を切り替え</p>
        </div>
      </div>
    );
  }

  const trackColorClass = {
    development: 'bg-blue-500',
    infrastructure: 'bg-cyan-500',
    'it-support': 'bg-violet-500',
  }[node.track];

  const trackBadgeClass = {
    development: 'bg-blue-100 text-blue-700',
    infrastructure: 'bg-cyan-100 text-cyan-700',
    'it-support': 'bg-violet-100 text-violet-700',
  }[node.track];

  const pathBadgeClass = {
    specialist: 'bg-sky-100 text-sky-700',
    manager: 'bg-amber-100 text-amber-700',
    common: 'bg-gray-100 text-gray-600',
  }[node.pathType];

  // Resolve related nodes for clickable links
  const relatedNodes = (node.relatedNodeIds || [])
    .map((id) => getNodeById(id))
    .filter(Boolean) as CareerNode[];

  const coexistNodes = (node.canCoexistWith || [])
    .map((id) => getNodeById(id))
    .filter(Boolean) as CareerNode[];

  return (
    <div className="h-full overflow-y-auto p-5">
      {/* Header bar */}
      <div className={`${trackColorClass} h-1.5 rounded-full mb-4`} />

      {/* Role title */}
      <h2 className="text-lg font-bold text-gray-800 leading-snug mb-2">
        {node.titleJa}
      </h2>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${trackBadgeClass}`}>
          {TRACK_LABELS[node.track]}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {STAGE_LABELS[node.stage as Stage]}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${pathBadgeClass}`}>
          {PATH_TYPE_LABELS[node.pathType]}
        </span>
        {node.subtrack && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-600">
            {node.subtrack}
          </span>
        )}
      </div>

      {/* Summary */}
      <Section title="概要">
        <p className="text-sm text-gray-600 leading-relaxed">{node.summary}</p>
      </Section>

      {/* Required Skills */}
      <Section title="必要スキル">
        <TagList items={node.requiredSkills} color="bg-blue-50 text-blue-700" />
      </Section>

      {/* Required Experience */}
      <Section title="必要経験">
        <BulletList items={node.requiredExperience} />
      </Section>

      {/* Recommended Certifications */}
      <Section title="推奨資格">
        <TagList items={node.recommendedCerts} color="bg-green-50 text-green-700" />
      </Section>

      {/* Tools / Environments / Languages */}
      <Section title="ツール・環境・言語">
        <TagList items={node.toolsEnvironmentsLanguages} color="bg-gray-50 text-gray-600" />
      </Section>

      {/* Next Step Conditions */}
      <Section title="次の段階に上がる条件">
        <BulletList items={node.nextStepConditions} />
      </Section>

      {/* Tags */}
      {node.tags.length > 0 && (
        <Section title="タグ">
          <TagList items={node.tags} />
        </Section>
      )}

      {/* Branch / Coexist Note */}
      {node.branchNote && (
        <Section title="兼任/分岐メモ">
          <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
            {node.branchNote}
          </p>
        </Section>
      )}

      {/* Coexist Nodes */}
      {coexistNodes.length > 0 && (
        <Section title="兼任可能な役職">
          <div className="space-y-1">
            {coexistNodes.map((cn) => (
              <button
                key={cn.id}
                onClick={() => onNodeClick(cn.id)}
                className="block w-full text-left text-xs px-2 py-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {cn.shortLabel}（{STAGE_LABELS[cn.stage as Stage]}）
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Related Nodes */}
      {relatedNodes.length > 0 && (
        <Section title="関連ノード">
          <div className="space-y-1">
            {relatedNodes.map((rn) => (
              <button
                key={rn.id}
                onClick={() => onNodeClick(rn.id)}
                className="block w-full text-left text-xs px-2 py-1.5 rounded bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {rn.shortLabel}（{TRACK_LABELS[rn.track]} / {STAGE_LABELS[rn.stage as Stage]}）
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ID for debugging / data reference */}
      <div className="mt-6 pt-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-300">Node ID: {node.id}</p>
      </div>
    </div>
  );
};

export default DetailPanel;
