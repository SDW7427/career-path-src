import type { CareerDataSet, CareerEdge, CareerNode, Stage } from '../types/career';
import { SHEET_SOURCES } from './sheetSources';
import { csvToObjects } from '../utils/csv';

/**
 * Split a cell value into a string list.
 *
 * Supports both:
 * - "a|b|c" (pipe)
 * - multi-line values (Google Sheets cells with line breaks)
 *
 * Also removes common bullet prefixes (・, -, ●, etc.).
 */
function splitList(v: string): string[] {
  const s = (v ?? '').replace(/\r\n/g, '\n').trim();
  if (!s) return [];

  const out: string[] = [];
  const lines = s.split('\n');
  for (const rawLine of lines) {
    const line = (rawLine ?? '').trim();
    if (!line) continue;

    // Allow both "|" and newlines as separators.
    const parts = line.split('|');
    for (let part of parts) {
      part = (part ?? '').trim();
      if (!part) continue;
      part = part.replace(/^[・\-\*\u2022●◯□■]+\s*/u, '');
      if (!part) continue;
      out.push(part);
    }
  }
  return out;
}

function toNumber(v: string): number | undefined {
  const n = Number((v ?? '').trim());
  return Number.isFinite(n) ? n : undefined;
}

function toStage(v: string): Stage {
  const s = (v ?? '').trim();
  // Accept values like "6", "G6", "段階6" etc.
  const m = s.match(/[1-6]/);
  if (m) return Number(m[0]) as Stage;
  return 1;
}

function normalizeTrack(v: string): CareerNode['track'] {
  const s = (v ?? '').trim();
  if (s === 'development' || s === 'infrastructure' || s === 'it-support') return s;
  // Allow Japanese labels in sheets
  if (s === '開発') return 'development';
  if (s === 'インフラ') return 'infrastructure';
  if (s === 'ITサポート') return 'it-support';
  // Fallback
  return 'development';
}

function normalizePathType(v: string): CareerNode['pathType'] {
  const s = (v ?? '').trim().toLowerCase();
  if (s === 'specialist' || s === 'manager' || s === 'common') return s as CareerNode['pathType'];
  // Allow common variants
  if (s === 'sp') return 'specialist';
  if (s === 'mg') return 'manager';
  if (s === '特化' || s === 'スペシャリスト') return 'specialist';
  if (s === '管理' || s === 'マネージャー') return 'manager';
  if (s === '共通') return 'common';
  return 'common';
}

function withCacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}

export async function loadCareerDataFromSheets(): Promise<CareerDataSet> {
  const [nodesCsv, edgesCsv] = await Promise.all([
    fetch(withCacheBust(SHEET_SOURCES.nodesCsvUrl), { cache: 'no-store' }).then((r) => r.text()),
    fetch(withCacheBust(SHEET_SOURCES.edgesCsvUrl), { cache: 'no-store' }).then((r) => r.text()),
  ]);

  const nodeRows = csvToObjects(nodesCsv);
  const edgeRows = csvToObjects(edgesCsv);

  const nodes: CareerNode[] = nodeRows
    .filter((r) => r.id && r.track && r.pathType)
    .map((r) => {
      const x = toNumber(r.position_x) ?? 180;
      const y = toNumber(r.position_y) ?? 50;

      return {
        id: r.id,
        track: normalizeTrack(r.track),
        subtrack: r.subtrack || undefined,
        stage: toStage(r.stage),
        pathType: normalizePathType(r.pathType),
        titleJa: r.titleJa || '',
        shortLabel: r.shortLabel || '',
        summary: r.summary || '',
        requiredSkills: splitList(r.requiredSkills),
        requiredExperience: splitList(r.requiredExperience),
        recommendedCerts: splitList(r.recommendedCerts),
        toolsEnvironmentsLanguages: splitList(r.toolsEnvironmentsLanguages),
        nextStepConditions: splitList(r.nextStepConditions),
        tags: splitList(r.tags),
        canCoexistWith: splitList(r.canCoexistWith),
        relatedNodeIds: splitList(r.relatedNodeIds),
        branchNote: r.branchNote || undefined,
        styleKey: r.styleKey || undefined,
        position: { x, y },
      };
    });

  const edges: CareerEdge[] = edgeRows
    .filter((r) => r.source && r.target)
    .map((r) => ({
      source: r.source,
      target: r.target,
      type: (r.type as CareerEdge['type']) || 'normal',
      label: r.label || undefined,
    }));

  return { nodes, edges };
}
