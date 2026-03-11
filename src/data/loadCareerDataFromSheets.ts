import type { CareerDataSet, CareerNode } from '../types/career';
import { SHEET_SOURCES } from './sheetSources';
import { csvToObjects, parseCsv } from '../utils/csv';
import { allEdges as fallbackEdges, allNodes as fallbackNodes } from './careerData';

const REQUIRED_NODE_HEADERS = ['id', 'titleJa', 'shortLabel'] as const;
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

function parseSheetContentRows(nodeRows: Record<string, string>[]): CareerNode[] {
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

    const baseNode = fallbackNodes.find((node) => node.id === id);
    if (!baseNode) {
      issues.push(`${prefix}: unmapped node id "${id}". This id does not exist in local careerData.ts.`);
      return;
    }

    seenIds.add(id);
    nodes.push({
      ...baseNode,
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
    });
  });

  const fallbackIds = new Set(fallbackNodes.map((node) => node.id));
  fallbackIds.forEach((id) => {
    if (!seenIds.has(id)) {
      issues.push(`Nodes sheet is missing required node id "${id}".`);
    }
  });

  if (issues.length > 0) {
    throw new SheetDataError('Nodes sheet validation failed.', formatIssues(issues));
  }

  return nodes;
}

export async function loadCareerDataFromSheets(): Promise<CareerDataSet> {
  const nodesCsv = await fetchSheetCsv(SHEET_SOURCES.nodesCsvUrl, 'Nodes sheet');
  const nodeRows = validateRequiredHeaders(nodesCsv, REQUIRED_NODE_HEADERS, 'Nodes sheet');
  const nodes = parseSheetContentRows(nodeRows);

  return {
    nodes,
    edges: fallbackEdges,
  };
}