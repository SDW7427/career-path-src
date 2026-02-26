import type { CareerDataSet, CareerEdge, CareerNode, Stage } from '../types/career';
import { SHEET_SOURCES } from './sheetSources';
import { csvToObjects } from '../utils/csv';

function splitList(v: string): string[] {
  const s = (v ?? '').trim();
  if (!s) return [];
  return s
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean);
}

function toNumber(v: string): number | undefined {
  const n = Number((v ?? '').trim());
  return Number.isFinite(n) ? n : undefined;
}

function toStage(v: string): Stage {
  const n = Number((v ?? '').trim());
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5 || n === 6) return n;
  // 잘못 입력되면 일단 1로 fallback (원하면 여기서 throw로 바꿔도 됨)
  return 1;
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
        track: r.track as CareerNode['track'],
        subtrack: r.subtrack || undefined,
        stage: toStage(r.stage),
        pathType: r.pathType as CareerNode['pathType'],
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
