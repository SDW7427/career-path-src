import type { CareerDataSet, CareerNode, Stage } from '../types/career';
import { SHEET_SOURCES } from './sheetSources';
import { csvToObjects, parseCsv } from '../utils/csv';
import { allEdges as fallbackEdges, allNodes as fallbackNodes } from './careerData';

const REQUIRED_NODE_HEADERS = ['id', 'track', 'pathType', 'stage', 'position_x', 'position_y'] as const;
const HTML_RESPONSE_RE = /^\s*<(?:!doctype html|html|head|body)\b/i;

class SheetDataError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super([message, ...details].join('\n'));
    this.name = 'SheetDataError';
    this.details = details;
  }
}

function formatIssues(issues: string[], limit = 15): string[] {
  if (issues.length <= limit) return issues;
  const omitted = issues.length - limit;
  return [...issues.slice(0, limit), `…and ${omitted} more issue(s).`];
}

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

    const parts = line.split('|');
    for (let part of parts) {
      part = (part ?? '').trim();
      if (!part) continue;
      part = part.replace(/^[・\-*\u2022●◯□■]+\s*/u, '');
      if (!part) continue;
      out.push(part);
    }
  }
  return out;
}

function normalizeTrack(v: string): CareerNode['track'] | null {
  const s = (v ?? '').trim();
  if (s === 'development' || s === 'infrastructure' || s === 'it-support') return s;
  if (s === '開発') return 'development';
  if (s === 'インフラ') return 'infrastructure';
  if (s === 'ITサポート') return 'it-support';
  return null;
}

function normalizePathType(v: string): CareerNode['pathType'] | null {
  const s = (v ?? '').trim().toLowerCase();
  if (s === 'specialist' || s === 'manager' || s === 'common') return s;
  if (s === 'sp') return 'specialist';
  if (s === 'mg') return 'manager';
  if (s === '特化' || s === 'スペシャリスト') return 'specialist';
  if (s === '管理' || s === 'マネージャー') return 'manager';
  if (s === '共通') return 'common';
  return null;
}

function parseStageStrict(v: string): Stage | null {
  const s = (v ?? '').trim();
  const m = s.match(/[1-6]/);
  if (!m) return null;
  return Number(m[0]) as Stage;
}

function parseNumberStrict(v: string): number | null {
  const trimmed = (v ?? '').trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function withCacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}

function validateRequiredHeaders(
  csvText: string,
  requiredHeaders: readonly string[],
  sheetLabel: string
): Record<string, string>[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    throw new SheetDataError(`${sheetLabel} is empty.`);
  }

  const actualHeaders = rows[0].map((h) => h.trim());
  const missingHeaders = requiredHeaders.filter((header) => !actualHeaders.includes(header));
  if (missingHeaders.length > 0) {
    throw new SheetDataError(
      `${sheetLabel} is missing required column(s): ${missingHeaders.join(', ')}`,
      [`Available columns: ${actualHeaders.join(', ') || '(none)'}`]
    );
  }

  return csvToObjects(csvText);
}

async function fetchSheetCsv(url: string, sheetLabel: string): Promise<string> {
  let response: Response;

  try {
    response = await fetch(withCacheBust(url), { cache: 'no-store' });
  } catch (error) {
    throw new SheetDataError(
      `Failed to fetch ${sheetLabel}. Please check your network and the Google Sheets publish settings.`,
      [error instanceof Error ? error.message : String(error)]
    );
  }

  if (!response.ok) {
    throw new SheetDataError(
      `Failed to fetch ${sheetLabel}. HTTP ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new SheetDataError(`${sheetLabel} returned an empty response.`);
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (HTML_RESPONSE_RE.test(text)) {
    throw new SheetDataError(
      `${sheetLabel} returned HTML instead of CSV. The sheet may not be published correctly.`
    );
  }

  const looksLikeCsv = contentType.includes('csv') || text.includes(',') || text.includes('\n');
  if (!looksLikeCsv) {
    throw new SheetDataError(
      `${sheetLabel} did not look like CSV data. Received content-type: ${contentType || '(unknown)'}`
    );
  }

  return text;
}

function parseNodes(nodeRows: Record<string, string>[]): CareerNode[] {
  const issues: string[] = [];
  const nodes: CareerNode[] = [];
  const seenIds = new Set<string>();

  nodeRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const prefix = `Nodes row ${rowNumber}`;

    const id = (row.id ?? '').trim();
    if (!id) {
      issues.push(`${prefix}: id is required.`);
      return;
    }
    if (seenIds.has(id)) {
      issues.push(`${prefix}: duplicate id "${id}".`);
      return;
    }

    const track = normalizeTrack(row.track);
    if (!track) {
      issues.push(`${prefix} (${id}): invalid track "${row.track ?? ''}".`);
      return;
    }

    const pathType = normalizePathType(row.pathType);
    if (!pathType) {
      issues.push(`${prefix} (${id}): invalid pathType "${row.pathType ?? ''}".`);
      return;
    }

    const stage = parseStageStrict(row.stage);
    if (!stage) {
      issues.push(`${prefix} (${id}): invalid stage "${row.stage ?? ''}". Use 1-6.`);
      return;
    }

    const x = parseNumberStrict(row.position_x);
    const y = parseNumberStrict(row.position_y);
    if (x === null || y === null) {
      issues.push(
        `${prefix} (${id}): invalid position_x/position_y (received "${row.position_x ?? ''}", "${row.position_y ?? ''}").`
      );
      return;
    }

    const titleJa = (row.titleJa ?? '').trim();
    const shortLabel = (row.shortLabel ?? '').trim();
    if (!titleJa) {
      issues.push(`${prefix} (${id}): titleJa is required.`);
      return;
    }
    if (!shortLabel) {
      issues.push(`${prefix} (${id}): shortLabel is required.`);
      return;
    }

    seenIds.add(id);
    nodes.push({
      id,
      track,
      subtrack: (row.subtrack ?? '').trim() || undefined,
      stage,
      pathType,
      titleJa,
      shortLabel,
      summary: (row.summary ?? '').trim(),
      requiredSkills: splitList(row.requiredSkills),
      requiredExperience: splitList(row.requiredExperience),
      recommendedCerts: splitList(row.recommendedCerts),
      toolsEnvironmentsLanguages: splitList(row.toolsEnvironmentsLanguages),
      nextStepConditions: splitList(row.nextStepConditions),
      tags: splitList(row.tags),
      canCoexistWith: splitList(row.canCoexistWith),
      relatedNodeIds: splitList(row.relatedNodeIds),
      branchNote: (row.branchNote ?? '').trim() || undefined,
      styleKey: (row.styleKey ?? '').trim() || undefined,
      position: { x, y },
    });
  });

  if (nodes.length === 0) {
    issues.push('Nodes sheet did not contain any valid rows.');
  }

  if (issues.length > 0) {
    throw new SheetDataError('Nodes sheet validation failed.', formatIssues(issues));
  }

  return nodes;
}

function mergeSheetContentAndLayoutIntoFallback(sheetNodes: CareerNode[]): CareerNode[] {
  const sheetNodeById = new Map(sheetNodes.map((node) => [node.id, node]));
  const issues: string[] = [];

  for (const fallbackNode of fallbackNodes) {
    if (!sheetNodeById.has(fallbackNode.id)) {
      issues.push(`Nodes sheet is missing required node id "${fallbackNode.id}".`);
    }
  }

  for (const sheetNode of sheetNodes) {
    if (!fallbackNodes.some((fallbackNode) => fallbackNode.id === sheetNode.id)) {
      issues.push(`Nodes sheet contains unmapped node id "${sheetNode.id}" that does not exist in careerData.ts.`);
    }
  }

  if (issues.length > 0) {
    throw new SheetDataError(
      'Nodes sheet and local layout definition are out of sync.',
      formatIssues(issues)
    );
  }

  return fallbackNodes.map((fallbackNode) => {
    const sourceNode = sheetNodeById.get(fallbackNode.id);
    if (!sourceNode) return fallbackNode;

    return {
      ...fallbackNode,
      titleJa: sourceNode.titleJa,
      shortLabel: sourceNode.shortLabel,
      summary: sourceNode.summary,
      requiredSkills: sourceNode.requiredSkills,
      requiredExperience: sourceNode.requiredExperience,
      recommendedCerts: sourceNode.recommendedCerts,
      toolsEnvironmentsLanguages: sourceNode.toolsEnvironmentsLanguages,
      nextStepConditions: sourceNode.nextStepConditions,
      tags: sourceNode.tags,
      canCoexistWith: sourceNode.canCoexistWith,
      relatedNodeIds: sourceNode.relatedNodeIds,
      branchNote: sourceNode.branchNote,
      styleKey: sourceNode.styleKey,
      position: sourceNode.position,
    };
  });
}

export async function loadCareerDataFromSheets(): Promise<CareerDataSet> {
  const nodesCsv = await fetchSheetCsv(SHEET_SOURCES.nodesCsvUrl, 'Nodes sheet');
  const nodeRows = validateRequiredHeaders(nodesCsv, REQUIRED_NODE_HEADERS, 'Nodes sheet');
  const sheetNodes = parseNodes(nodeRows);
  const mergedNodes = mergeSheetContentAndLayoutIntoFallback(sheetNodes);

  return {
    nodes: mergedNodes,
    edges: fallbackEdges,
  };
}