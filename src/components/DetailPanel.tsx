import React from 'react';
import type { CareerNode } from '../types/career';
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

interface ParsedGroup {
  title: string;
  items: string[];
}

interface ParsedSection {
  title: string; // can be empty for fallback section
  items: string[];
  groups: ParsedGroup[];
}

interface ParsedStructuredText {
  sections: ParsedSection[];
}

const SECTION_MARKER_RE = /^[【〖](.+)[】〗]$/; // 【...】 or 〖...〗
const SUBHEADER_RE = /^[A-Z]\.\s+/;            // A. / B. / C. ...
const BULLET_PREFIX_RE = /^[\s・●•▪◦◉◆◇※*\-－ー]+/;

/** Section wrapper for consistency */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{title}</h4>
    {children}
  </div>
);

/** Render a list of strings as compact tags/pills */
const TagList: React.FC<{ items: string[]; color?: string; wrapLong?: boolean }> = ({
  items,
  color = 'bg-gray-100 text-gray-700',
  wrapLong = false,
}) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;

  return (
    <div className="flex flex-wrap gap-1 min-w-0">
      {items.map((item, i) => (
        <span
          key={i}
          className={[
            'inline-block text-xs px-2 py-0.5 rounded-md',
            color,
            wrapLong ? 'whitespace-normal break-words max-w-full leading-snug' : '',
          ].join(' ')}
        >
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

/** Use tags for short lists, bullets for long / sentence-like lists */
const SmartList: React.FC<{ items: string[]; tagColor?: string }> = ({ items, tagColor }) => {
  const shouldUseBullets = items.length > 12 || items.some((x) => (x ?? '').length >= 26);
  return shouldUseBullets ? <BulletList items={items} /> : <TagList items={items} color={tagColor} />;
};

function normalizeLine(line: string): string {
  return line.replace(BULLET_PREFIX_RE, '').trim();
}

function preprocessText(text: string, stripLeadingHeading?: string): string {
  const rawLines = (text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());

  while (rawLines.length && !rawLines[0]) rawLines.shift();

  if (stripLeadingHeading && rawLines.length) {
    if (rawLines[0] === stripLeadingHeading) {
      rawLines.shift();
      while (rawLines.length && !rawLines[0]) rawLines.shift();
    }
  }

  return rawLines.join('\n');
}

function parseStructuredText(
  text: string,
  options?: { stripLeadingHeading?: string }
): ParsedStructuredText | null {
  const preprocessed = preprocessText(text, options?.stripLeadingHeading);

  const lines = preprocessed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  let currentSection: ParsedSection | null = null;
  let currentGroup: ParsedGroup | null = null;
  const sections: ParsedSection[] = [];
  let hasMarkerOrSubheader = false;

  const ensureSection = (): ParsedSection => {
    if (currentSection) return currentSection;
    // fallback section title is empty to avoid showing "その他"
    const fallbackSection: ParsedSection = { title: '', items: [], groups: [] };
    sections.push(fallbackSection);
    currentSection = fallbackSection;
    return fallbackSection;
  };

  for (const rawLine of lines) {
    // headerCandidate strips bullet prefix so "・A. フロントエンド" also works
    const headerCandidate = normalizeLine(rawLine);

    const markerMatch = headerCandidate.match(SECTION_MARKER_RE);
    if (markerMatch) {
      hasMarkerOrSubheader = true;
      const section: ParsedSection = {
        title: markerMatch[1].trim(),
        items: [],
        groups: [],
      };
      sections.push(section);
      currentSection = section;
      currentGroup = null;
      continue;
    }

    if (SUBHEADER_RE.test(headerCandidate)) {
      hasMarkerOrSubheader = true;
      const section = ensureSection();
      const group: ParsedGroup = {
        title: headerCandidate,
        items: [],
      };
      section.groups.push(group);
      currentGroup = group;
      continue;
    }

    if (!headerCandidate) continue;

    if (currentGroup) {
      currentGroup.items.push(headerCandidate);
    } else {
      ensureSection().items.push(headerCandidate);
    }
  }

  if (!hasMarkerOrSubheader) return null;
  return { sections };
}

/** chip candidate rules */
function isChipItem(item: string): boolean {
  // short & non-sentence-ish => chip
  if (!item) return false;
  if (item.length > 18) return false;
  if (item.includes('。')) return false;
  return true;
}

/** Render mixed chips + bullets in one block (readability upgrade) */
const MixedList: React.FC<{ items: string[]; chipColor?: string }> = ({ items, chipColor }) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;

  // order-preserving rendering: keep original item order, but render chips and bullets in runs
  const blocks: React.ReactNode[] = [];
  let chipBuf: string[] = [];
  let bulletBuf: string[] = [];

  const flushChips = () => {
    if (!chipBuf.length) return;
    if (chipBuf.length > 16) {
      blocks.push(<BulletList key={`b-from-chips-${blocks.length}`} items={chipBuf} />);
    } else {
      blocks.push(<TagList key={`chips-${blocks.length}`} items={chipBuf} color={chipColor} />);
    }
    chipBuf = [];
  };

  const flushBullets = () => {
    if (!bulletBuf.length) return;
    blocks.push(<BulletList key={`bullets-${blocks.length}`} items={bulletBuf} />);
    bulletBuf = [];
  };

  for (const it of items) {
    if (isChipItem(it)) {
      flushBullets();
      chipBuf.push(it);
    } else {
      flushChips();
      bulletBuf.push(it);
    }
  }

  flushChips();
  flushBullets();

  return <div className="space-y-2">{blocks}</div>;
};

const FORCE_CHIP_SECTIONS = new Set(['対応ドメイン例']);

const StructuredContent: React.FC<{
  parsed: ParsedStructuredText;
  chipColor?: string;
}> = ({ parsed, chipColor }) => {
  return (
    <div className="space-y-3">
      {parsed.sections.map((section, sectionIndex) => {
        const forceChips = FORCE_CHIP_SECTIONS.has(section.title);

        return (
          <div key={`${section.title || 'section'}-${sectionIndex}`} className="space-y-2">
            {section.title && (
              <h5 className="text-[11px] font-bold text-gray-600 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
                {section.title}
              </h5>
            )}

            {section.items.length > 0 && (
              forceChips ? (
                <TagList items={section.items} color={chipColor} wrapLong />
              ) : (
                <MixedList items={section.items} chipColor={chipColor} />
              )
            )}

            {section.groups.map((group, groupIndex) => (
              <div key={`${group.title}-${groupIndex}`} className="space-y-1.5">
                {/* group header visibility upgrade */}
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded px-2 py-1">
                  {group.title}
                </div>

                <div className="pl-1">
                  {forceChips ? (
                    <TagList items={group.items} color={chipColor} wrapLong />
                  ) : (
                    <MixedList items={group.items} chipColor={chipColor} />
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
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

  // remove redundant first line like "概要" / "必要スキル" etc.
  const summaryStructured = parseStructuredText(node.summary, { stripLeadingHeading: '概要' });
  const requiredSkillsStructured = parseStructuredText(node.requiredSkills.join('\n'), { stripLeadingHeading: '必要スキル' });
  const requiredExperienceStructured = parseStructuredText(node.requiredExperience.join('\n'), { stripLeadingHeading: '必要経験' });
  const recommendedCertsStructured = parseStructuredText(node.recommendedCerts.join('\n'), { stripLeadingHeading: '推奨資格' });

  const trackColorClass =
    {
      development: 'bg-blue-500',
      infrastructure: 'bg-cyan-500',
      'it-support': 'bg-violet-500',
    }[node.track];

  const trackBadgeClass =
    {
      development: 'bg-blue-100 text-blue-700',
      infrastructure: 'bg-cyan-100 text-cyan-700',
      'it-support': 'bg-violet-100 text-violet-700',
    }[node.track];

  const pathBadgeClass =
    {
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
        {summaryStructured ? (
          <StructuredContent parsed={summaryStructured} />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{node.summary}</p>
        )}
      </Section>

      {/* Required Skills */}
      <Section title="必要スキル">
        {requiredSkillsStructured ? (
          <StructuredContent parsed={requiredSkillsStructured} chipColor="bg-blue-50 text-blue-700" />
        ) : (
          <SmartList items={node.requiredSkills} tagColor="bg-blue-50 text-blue-700" />
        )}
      </Section>

      {/* Required Experience */}
      <Section title="必要経験">
        {requiredExperienceStructured ? (
          <StructuredContent parsed={requiredExperienceStructured} />
        ) : (
          <BulletList items={node.requiredExperience} />
        )}
      </Section>

      {/* Recommended Certifications */}
      <Section title="推奨資格">
        {recommendedCertsStructured ? (
          <StructuredContent parsed={recommendedCertsStructured} chipColor="bg-green-50 text-green-700" />
        ) : (
          <SmartList items={node.recommendedCerts} tagColor="bg-green-50 text-green-700" />
        )}
      </Section>

      {/* Tools / Environments / Languages */}
      <Section title="ツール・環境・言語">
        <SmartList items={node.toolsEnvironmentsLanguages} tagColor="bg-gray-50 text-gray-600" />
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
          <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 whitespace-pre-line">
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