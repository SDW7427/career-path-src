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
// NOTE: "※" は消さない（原文表示したい）ので prefix から除外
const BULLET_PREFIX_RE = /^[\s・●•▪◦◉◆◇*\-－ー]+/;

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  accentClass?: string;
}> = ({ title, children, accentClass = 'bg-gray-300' }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      <span className={`inline-block w-1.5 h-4 rounded-full ${accentClass}`} />
      <h4 className="text-sm font-bold text-gray-800 tracking-wide">{title}</h4>
    </div>
    <div className="bg-white/60 rounded-lg border border-gray-100 p-3">
      {children}
    </div>
  </div>
);

/** TagList */
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

/** Bullet list (for normal sentences) */
const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;
  return (
    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
};

/** Subsection list: distinct visual from bullets */
const SubsectionList: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items.length) return <span className="text-xs text-gray-300">-</span>;
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="text-xs text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-200 bg-gray-50/50 rounded-sm py-1 pr-2"
        >
          {item}
        </div>
      ))}
    </div>
  );
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
    const fallbackSection: ParsedSection = { title: '', items: [], groups: [] };
    sections.push(fallbackSection);
    currentSection = fallbackSection;
    return fallbackSection;
  };

  for (const rawLine of lines) {
    const candidate = normalizeLine(rawLine);

    const markerMatch = candidate.match(SECTION_MARKER_RE);
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

    if (SUBHEADER_RE.test(candidate)) {
      hasMarkerOrSubheader = true;
      const section = ensureSection();
      const group: ParsedGroup = {
        title: candidate,
        items: [],
      };
      section.groups.push(group);
      currentGroup = group;
      continue;
    }

    if (!candidate) continue;

    if (currentGroup) {
      currentGroup.items.push(candidate);
    } else {
      ensureSection().items.push(candidate);
    }
  }

  if (!hasMarkerOrSubheader) return null;
  return { sections };
}

/** 対応ドメイン例：用語は全部チップ、ただし「※」行は注記として原文表示 */
const FORCE_CHIP_SECTIONS = new Set(['対応ドメイン例']);
function splitDomainItems(items: string[]) {
  const notes = items.filter((x) => x.startsWith('※'));
  const chips = items.filter((x) => !x.startsWith('※'));
  return { chips, notes };
}

/**
 * ✅ “ソタイトル(セクション見出し)”として目立たせたいタイトル一覧
 * - 役割 / 共通業務 / 分野別業務 / 対応ドメイン例 / 開発分野の対象範囲
 * - スキル：共通必須 / 選択必須（4領域中...） / 尚可
 * - 経験：共通必須 / 選択必須（4領域中...） / 尚可
 * - 資格：共通推奨 / 分野別推奨 / 尚可
 */
const EMPHASIZE_SUBTITLE_EXACT = new Set([
  '役割',
  '共通業務',
  '分野別業務',
  '対応ドメイン例',
  '開発分野の対象範囲',

  '共通必須',
  '尚可',

  '共通推奨',
  '分野別推奨',
]);

function isEmphasizedSubtitle(title: string): boolean {
  if (!title) return false;
  if (EMPHASIZE_SUBTITLE_EXACT.has(title)) return true;

  // 選択必須（4領域中2つ以上） / 選択必須（4領域中2〜3つ以上）など揺れ対応
  if (title.startsWith('選択必須（4領域中')) return true;

  // 分野別推奨（～）の揺れ対応
  if (title.startsWith('分野別推奨')) return true;

  return false;
}

const StructuredContent: React.FC<{
  parsed: ParsedStructuredText;
  chipColor?: string;
}> = ({ parsed, chipColor }) => {
  return (
    <div className="space-y-3">
      {parsed.sections.map((section, sectionIndex) => {
        const forceChips = FORCE_CHIP_SECTIONS.has(section.title);
        const emphasize = isEmphasizedSubtitle(section.title);

        const renderItems = (items: string[]) => {
          if (!items.length) return <span className="text-xs text-gray-300">-</span>;

          if (forceChips) {
            const { chips, notes } = splitDomainItems(items);
            return (
              <div className="space-y-2">
                {chips.length > 0 && (
                  <TagList items={chips} color={chipColor} wrapLong />
                )}
                {notes.map((n, i) => (
                  <p
                    key={i}
                    className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 border border-gray-100 rounded px-2 py-1"
                  >
                    {n}
                  </p>
                ))}
              </div>
            );
          }

          // ✅ 강조 소제목은 불렛이 아니라 “콜아웃 리스트” 스타일로 구분
          if (emphasize) return <SubsectionList items={items} />;

          // default: bullets
          return <BulletList items={items} />;
        };

        return (
          <div key={`${section.title || 'section'}-${sectionIndex}`} className="space-y-2">
            {section.title && (
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {section.title}
                </h5>
                {emphasize && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5">
                    SUB
                  </span>
                )}
              </div>
            )}

            {section.items.length > 0 && renderItems(section.items)}

            {section.groups.map((group, groupIndex) => (
              <div key={`${group.title}-${groupIndex}`} className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded px-2 py-1">
                  {group.title}
                </div>

                <div className="pl-1">
                  {renderItems(group.items)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

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

  const summaryStructured = parseStructuredText(node.summary, { stripLeadingHeading: '概要' });
  const skillsStructured = parseStructuredText(node.requiredSkills.join('\n'), { stripLeadingHeading: '必要スキル' });
  const experienceStructured = parseStructuredText(node.requiredExperience.join('\n'), { stripLeadingHeading: '必要経験' });
  const certsStructured = parseStructuredText(node.recommendedCerts.join('\n'), { stripLeadingHeading: '推奨資格' });

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

  const accent = {
    summary: 'bg-gray-400',
    skill: trackColorClass,
    exp: 'bg-gray-400',
    cert: 'bg-emerald-400',
    tools: 'bg-slate-400',
    next: 'bg-amber-400',
    tags: 'bg-gray-400',
    coexist: 'bg-amber-400',
    related: 'bg-slate-400',
  };

  const relatedNodes = (node.relatedNodeIds || [])
    .map((id) => getNodeById(id))
    .filter(Boolean) as CareerNode[];

  const coexistNodes = (node.canCoexistWith || [])
    .map((id) => getNodeById(id))
    .filter(Boolean) as CareerNode[];

  return (
    <div className="h-full overflow-y-auto p-5 bg-gradient-to-b from-white to-gray-50">
      <div className={`${trackColorClass} h-1.5 rounded-full mb-4`} />

      <h2 className="text-lg font-bold text-gray-800 leading-snug mb-2">
        {node.titleJa}
      </h2>

      <div className="flex flex-wrap gap-1.5 mb-5">
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

      <Section title="概要" accentClass={accent.summary}>
        {summaryStructured ? (
          <StructuredContent parsed={summaryStructured} />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{node.summary}</p>
        )}
      </Section>

      <Section title="スキル" accentClass={accent.skill}>
        {skillsStructured ? (
          <StructuredContent parsed={skillsStructured} chipColor="bg-blue-50 text-blue-700" />
        ) : (
          <TagList items={node.requiredSkills} color="bg-blue-50 text-blue-700" wrapLong />
        )}
      </Section>

      <Section title="経験" accentClass={accent.exp}>
        {experienceStructured ? (
          <StructuredContent parsed={experienceStructured} />
        ) : (
          <BulletList items={node.requiredExperience} />
        )}
      </Section>

      <Section title="資格" accentClass={accent.cert}>
        {certsStructured ? (
          <StructuredContent parsed={certsStructured} chipColor="bg-green-50 text-green-700" />
        ) : (
          <TagList items={node.recommendedCerts} color="bg-green-50 text-green-700" wrapLong />
        )}
      </Section>

      <Section title="ツール・環境・言語" accentClass={accent.tools}>
        <TagList items={node.toolsEnvironmentsLanguages} color="bg-gray-50 text-gray-700" />
      </Section>

      <Section title="次の段階に上がる条件" accentClass={accent.next}>
        <BulletList items={node.nextStepConditions} />
      </Section>

      {node.tags.length > 0 && (
        <Section title="タグ" accentClass={accent.tags}>
          <TagList items={node.tags} />
        </Section>
      )}

      {node.branchNote && (
        <Section title="兼任/分岐メモ" accentClass="bg-amber-400">
          <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 whitespace-pre-line border border-amber-100">
            {node.branchNote}
          </p>
        </Section>
      )}

      {coexistNodes.length > 0 && (
        <Section title="兼任可能な役職" accentClass={accent.coexist}>
          <div className="space-y-1.5">
            {coexistNodes.map((cn) => (
              <button
                key={cn.id}
                onClick={() => onNodeClick(cn.id)}
                className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-100"
              >
                <span className="font-semibold">{cn.shortLabel}</span>
                <span className="text-[11px] text-amber-700">（{STAGE_LABELS[cn.stage as Stage]}）</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {relatedNodes.length > 0 && (
        <Section title="関連ノード" accentClass={accent.related}>
          <div className="space-y-1.5">
            {relatedNodes.map((rn) => (
              <button
                key={rn.id}
                onClick={() => onNodeClick(rn.id)}
                className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="font-semibold">{rn.shortLabel}</span>
                <span className="text-[11px] text-gray-600">
                  （{TRACK_LABELS[rn.track]} / {STAGE_LABELS[rn.stage as Stage]}）
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}

      <div className="mt-6 pt-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-300">Node ID: {node.id}</p>
      </div>
    </div>
  );
};

export default DetailPanel;