/**
 * Mock Career Path Data
 *
 * This file contains all seed data for the career path prototype.
 *
 * === HOW TO EDIT / ADD NODES ===
 * 1. Add a new CareerNode object to the appropriate section below
 * 2. Give it a unique `id` (convention: "{track}-{pathType}-{stage}" or similar)
 * 3. Set `position: { x, y }` — x for horizontal lane, y for vertical stage
 * 4. Add edges in the `edges` array to connect it to parent/child nodes
 *
 * === FUTURE: IMPORT FROM GOOGLE SHEETS / CSV ===
 * Replace this file's exports with a fetch/parse function:
 *   - Fetch CSV from Google Sheets publish URL
 *   - Map rows to CareerNode[] using column headers
 *   - Build edges from an adjacency column or separate sheet
 */

import type { CareerNode, CareerEdge, CareerDataSet, Track } from '../types/career';

// ---------------------------------------------------------------------------
// Layout constants — used to position nodes on the graph
// ---------------------------------------------------------------------------

/** Vertical spacing between stages (段階) */
const STAGE_Y_GAP = 150;
/** Base Y offset from top */
const BASE_Y = 50;
/** Y position for a given stage */
const stageY = (stage: number) => BASE_Y + (6 - stage) * STAGE_Y_GAP;

// === DEVELOPMENT TRACK (開発) =============================================

const DEV_SP_X = 180;  // Specialist column
const DEV_MG_X = 480;  // Manager column

const developmentTemplateNodes: CareerNode[] = [
  // --- Specialist ---
  {
    id: 'dev-sp-1',
    track: 'development',
    stage: 1,
    pathType: 'specialist',
    titleJa: 'プログラム改修／テスト',
    shortLabel: '改修/テスト',
    summary: '既存プログラムの改修やテスト実施を担当。コーディング基礎とテスト手法を習得する段階。',
    requiredSkills: ['基本的なプログラミング', 'テストケース作成', 'バグ報告'],
    requiredExperience: ['IT基礎研修修了'],
    recommendedCerts: ['基本情報技術者', 'JSTQB Foundation'],
    toolsEnvironmentsLanguages: ['Java', 'Python', 'Git', 'Eclipse/VSCode', 'JUnit'],
    nextStepConditions: ['テスト実務6ヶ月以上', '単体テスト設計可能', 'バグ修正を自力で完了できる'],
    tags: ['FE', 'BE', 'FS', 'Web', '業務系・基幹'],
    position: { x: DEV_SP_X, y: stageY(1) },
  },
  {
    id: 'dev-sp-2',
    track: 'development',
    stage: 2,
    pathType: 'specialist',
    titleJa: 'PG（プログラミング）',
    shortLabel: 'PG',
    summary: '機能単位のプログラミングを担当。詳細設計書に基づき実装・単体テストを行う。',
    requiredSkills: ['設計書読解', 'コーディング規約遵守', '単体テスト設計', 'SQL基礎'],
    requiredExperience: ['改修/テスト実務1年以上'],
    recommendedCerts: ['基本情報技術者', 'Oracle Java Silver'],
    toolsEnvironmentsLanguages: ['Java', 'JavaScript', 'SQL', 'Git', 'Docker基礎'],
    nextStepConditions: ['機能実装を単独で完了可能', 'コードレビュー指摘を理解・対応できる'],
    tags: ['FE', 'BE', 'FS', 'Web', '業務系・基幹', 'モバイル'],
    position: { x: DEV_SP_X, y: stageY(2) },
  },
  {
    id: 'dev-sp-3',
    track: 'development',
    stage: 3,
    pathType: 'specialist',
    titleJa: 'SE（詳細設計）',
    shortLabel: 'SE(詳細)',
    summary: '詳細設計書の作成とプログラマへの技術指示を担当。',
    requiredSkills: ['詳細設計書作成', 'DB設計基礎', 'コードレビュー', 'テスト計画'],
    requiredExperience: ['PG実務2年以上', '複数プロジェクト経験'],
    recommendedCerts: ['応用情報技術者', 'Oracle Java Gold'],
    toolsEnvironmentsLanguages: ['Java', 'Spring Boot', 'React/Vue', 'PostgreSQL', 'AWS基礎'],
    nextStepConditions: ['詳細設計を単独で完了可能', '後輩PGの技術指導ができる'],
    tags: ['FE', 'BE', 'FS', 'Web', '業務系・基幹'],
    canCoexistWith: ['dev-mg-3'],
    position: { x: DEV_SP_X, y: stageY(3) },
  },
  {
    id: 'dev-sp-4',
    track: 'development',
    stage: 4,
    pathType: 'specialist',
    titleJa: 'SE（基本設計）',
    shortLabel: 'SE(基本)',
    summary: '基本設計工程を担当。システム全体のアーキテクチャ検討や外部設計を行う。',
    requiredSkills: ['基本設計書作成', 'アーキテクチャ設計', 'API設計', '非機能要件定義'],
    requiredExperience: ['SE(詳細設計)実務2年以上'],
    recommendedCerts: ['データベーススペシャリスト', 'AWS SAA'],
    toolsEnvironmentsLanguages: ['システム設計ツール', 'クラウドサービス', 'CI/CD', 'Docker/K8s'],
    nextStepConditions: ['基本設計を主導できる', 'アーキテクチャ提案ができる'],
    tags: ['BE', 'FS', 'Web', '業務系・基幹'],
    canCoexistWith: ['dev-mg-4'],
    position: { x: DEV_SP_X, y: stageY(4) },
  },
  {
    id: 'dev-sp-5',
    track: 'development',
    stage: 5,
    pathType: 'specialist',
    titleJa: 'SE（要件定義・基本構想）',
    shortLabel: 'SE(要件)',
    summary: '顧客折衝を含む要件定義・基本構想フェーズを担当。',
    requiredSkills: ['要件定義', '顧客折衝', 'RFP分析', '提案書作成', '見積もり'],
    requiredExperience: ['SE(基本設計)実務3年以上', '顧客折衝経験'],
    recommendedCerts: ['システムアーキテクト', 'PMP'],
    toolsEnvironmentsLanguages: ['要件管理ツール', 'Jira', 'Confluence', 'クラウド設計'],
    nextStepConditions: ['要件定義を主導できる', '複数プロジェクトの技術判断ができる'],
    tags: ['FS', 'Web', '業務系・基幹'],
    canCoexistWith: ['dev-mg-5'],
    position: { x: DEV_SP_X, y: stageY(5) },
  },
  {
    id: 'dev-sp-6',
    track: 'development',
    stage: 6,
    pathType: 'specialist',
    titleJa: 'TL（テックリード／技術責任）',
    shortLabel: 'テックリード',
    summary: '技術選定・アーキテクチャ最終判断・技術チームの牽引を担う最上位技術職。',
    requiredSkills: ['技術戦略策定', 'アーキテクチャ最終判断', '技術チーム育成', 'OSS活用'],
    requiredExperience: ['SE(要件定義)実務3年以上', '大規模プロジェクトリード経験'],
    recommendedCerts: ['システムアーキテクト', 'AWS SAP', 'TOGAF'],
    toolsEnvironmentsLanguages: ['マルチクラウド', 'マイクロサービス', 'DevOps全般'],
    nextStepConditions: ['（最上位段階）'],
    tags: ['FS', 'Web', '業務系・基幹'],
    canCoexistWith: ['dev-mg-6'],
    position: { x: DEV_SP_X, y: stageY(6) },
  },

  // --- Manager ---
  {
    id: 'dev-mg-1',
    track: 'development',
    stage: 1,
    pathType: 'manager',
    titleJa: 'PMO補佐',
    shortLabel: 'PMO補佐',
    summary: 'プロジェクト管理事務の補佐。議事録、課題管理、進捗報告の補助を担当。',
    requiredSkills: ['議事録作成', '課題管理', 'Excel/スプレッドシート'],
    requiredExperience: ['IT基礎研修修了'],
    recommendedCerts: ['基本情報技術者'],
    toolsEnvironmentsLanguages: ['Excel', 'Backlog', 'Redmine', 'Teams'],
    nextStepConditions: ['PMO補佐実務6ヶ月以上', '議事録を正確に作成できる'],
    tags: ['PMO'],
    branchNote: '※暫定、後で見直す可能性あり',
    position: { x: DEV_MG_X, y: stageY(1) },
    styleKey: 'provisional',
  },
  {
    id: 'dev-mg-2',
    track: 'development',
    stage: 2,
    pathType: 'manager',
    titleJa: 'サブリーダー',
    shortLabel: 'サブリーダー',
    summary: 'チーム内のサブリーダーとして、タスク管理や進捗確認を担当。',
    requiredSkills: ['タスク管理', '進捗報告', 'メンバーフォロー'],
    requiredExperience: ['PGまたはPMO補佐実務1年以上'],
    recommendedCerts: ['基本情報技術者'],
    toolsEnvironmentsLanguages: ['Backlog', 'Jira', 'Excel', 'Teams'],
    nextStepConditions: ['小規模タスクの管理を単独でできる'],
    tags: [],
    position: { x: DEV_MG_X, y: stageY(2) },
  },
  {
    id: 'dev-mg-3',
    track: 'development',
    stage: 3,
    pathType: 'manager',
    titleJa: 'リーダー',
    shortLabel: 'リーダー',
    summary: '開発チームのリーダー。メンバー管理、品質管理、顧客報告を担当。',
    requiredSkills: ['チーム管理', '品質管理', '顧客報告', 'リスク管理基礎'],
    requiredExperience: ['サブリーダー実務1年以上'],
    recommendedCerts: ['応用情報技術者', 'PMP/CAPM'],
    toolsEnvironmentsLanguages: ['プロジェクト管理ツール', 'WBS', 'ガントチャート'],
    nextStepConditions: ['5名程度のチーム管理経験', '顧客報告を単独で実施可能'],
    tags: [],
    canCoexistWith: ['dev-sp-3'],
    position: { x: DEV_MG_X, y: stageY(3) },
  },
  {
    id: 'dev-mg-4',
    track: 'development',
    stage: 4,
    pathType: 'manager',
    titleJa: 'サブPL',
    shortLabel: 'サブPL',
    summary: 'プロジェクトリーダーの補佐。スコープ管理、スケジュール管理を担当。',
    requiredSkills: ['スコープ管理', 'スケジュール管理', '課題エスカレーション', '見積もり補佐'],
    requiredExperience: ['リーダー実務2年以上'],
    recommendedCerts: ['PMP', 'プロジェクトマネージャ試験'],
    toolsEnvironmentsLanguages: ['MS Project', 'Jira', 'Confluence'],
    nextStepConditions: ['中規模プロジェクトの管理補佐経験'],
    tags: [],
    canCoexistWith: ['dev-sp-4'],
    position: { x: DEV_MG_X, y: stageY(4) },
  },
  {
    id: 'dev-mg-5',
    track: 'development',
    stage: 5,
    pathType: 'manager',
    titleJa: 'PL／サブPM',
    shortLabel: 'PL/サブPM',
    summary: 'プロジェクトリーダーまたはサブPMとして、プロジェクト全体の推進を担当。',
    requiredSkills: ['プロジェクト計画', '予算管理', 'ステークホルダー管理', 'リスク管理'],
    requiredExperience: ['サブPL実務2年以上', '中規模プロジェクト経験'],
    recommendedCerts: ['PMP', 'プロジェクトマネージャ試験'],
    toolsEnvironmentsLanguages: ['PMツール全般', 'BIツール'],
    nextStepConditions: ['プロジェクト計画を主導できる', '予算管理ができる'],
    tags: [],
    canCoexistWith: ['dev-sp-5'],
    position: { x: DEV_MG_X, y: stageY(5) },
  },
  {
    id: 'dev-mg-6',
    track: 'development',
    stage: 6,
    pathType: 'manager',
    titleJa: 'PM／開発マネージャ',
    shortLabel: 'PM/開発Mgr',
    summary: 'プロジェクトマネージャまたは開発部門マネージャ。複数プロジェクトの統括。',
    requiredSkills: ['ポートフォリオ管理', '組織マネジメント', '戦略立案', '採用・育成'],
    requiredExperience: ['PL/PM実務3年以上', '大規模プロジェクト経験'],
    recommendedCerts: ['PgMP', 'プロジェクトマネージャ試験'],
    toolsEnvironmentsLanguages: ['経営管理ツール', 'BI/データ分析'],
    nextStepConditions: ['（最上位段階）'],
    tags: [],
    canCoexistWith: ['dev-sp-6'],
    position: { x: DEV_MG_X, y: stageY(6) },
  },
];

// === INFRASTRUCTURE TRACK (インフラ) =======================================

const INFRA_SP_X = 180;
const INFRA_MG_X = 480;

const infrastructureTemplateNodes: CareerNode[] = [
  // --- Specialist ---
  {
    id: 'infra-sp-1',
    track: 'infrastructure',
    stage: 1,
    pathType: 'specialist',
    titleJa: 'キッティング・ヘルプデスク（オペレーター）',
    shortLabel: 'キッティング/HD',
    summary: 'PC設定、ヘルプデスク対応、基本的なIT運用を担当。ITサポートとの接続ポイント。',
    requiredSkills: ['PC基本操作', 'ヘルプデスク対応', 'キッティング作業'],
    requiredExperience: ['IT基礎研修修了'],
    recommendedCerts: ['ITパスポート', 'CompTIA A+'],
    toolsEnvironmentsLanguages: ['Windows', 'Active Directory基礎', 'ServiceDesk'],
    nextStepConditions: ['オペレーター実務6ヶ月以上'],
    tags: ['サーバ', 'ネットワーク'],
    branchNote: '※暫定（ITサポートとの接続を表現したい）',
    relatedNodeIds: ['its-hd-1'],
    position: { x: INFRA_SP_X, y: stageY(1) },
    styleKey: 'provisional',
  },
  {
    id: 'infra-sp-2',
    track: 'infrastructure',
    stage: 2,
    pathType: 'specialist',
    titleJa: '運用監視',
    shortLabel: '運用監視',
    summary: 'システムの監視運用。アラート対応、定常作業、障害一次対応を担当。',
    requiredSkills: ['監視ツール操作', 'ログ確認', '障害一次対応', '手順書に基づく作業'],
    requiredExperience: ['キッティング/ヘルプデスク実務6ヶ月以上'],
    recommendedCerts: ['LPIC-1', 'CompTIA Network+'],
    toolsEnvironmentsLanguages: ['Zabbix', 'Nagios', 'Linux基礎', 'シェルスクリプト'],
    nextStepConditions: ['監視実務1年以上', '障害一次対応を単独で可能'],
    tags: ['サーバ', 'ネットワーク'],
    position: { x: INFRA_SP_X, y: stageY(2) },
  },
  {
    id: 'infra-sp-3',
    track: 'infrastructure',
    stage: 3,
    pathType: 'specialist',
    titleJa: '運用保守',
    shortLabel: '運用保守',
    summary: 'サーバ・ネットワークの運用保守。定期メンテナンス、障害対応、改善提案を担当。',
    requiredSkills: ['サーバ運用', 'ネットワーク運用', '障害対応', '手順書作成'],
    requiredExperience: ['運用監視実務1年以上'],
    recommendedCerts: ['LPIC-2', 'CCNA'],
    toolsEnvironmentsLanguages: ['Linux', 'Windows Server', 'VMware', 'Ansible基礎'],
    nextStepConditions: ['運用保守を単独で担当可能', '改善提案ができる'],
    tags: ['サーバ', 'ネットワーク', '自動化'],
    canCoexistWith: ['infra-mg-3'],
    position: { x: INFRA_SP_X, y: stageY(3) },
  },
  {
    id: 'infra-sp-4',
    track: 'infrastructure',
    stage: 4,
    pathType: 'specialist',
    titleJa: '構築・設定',
    shortLabel: '構築/設定',
    summary: 'サーバ・ネットワーク環境の構築・設定を担当。設計書に基づくインフラ構築。',
    requiredSkills: ['サーバ構築', 'ネットワーク設定', 'クラウド構築', 'IaC基礎'],
    requiredExperience: ['運用保守実務2年以上'],
    recommendedCerts: ['LPIC-3', 'AWS SAA', 'CCNP'],
    toolsEnvironmentsLanguages: ['AWS/Azure/GCP', 'Terraform', 'Ansible', 'Docker'],
    nextStepConditions: ['中規模環境の構築を単独で可能'],
    tags: ['サーバ', 'ネットワーク', '自動化', 'クラウド'],
    canCoexistWith: ['infra-mg-4'],
    position: { x: INFRA_SP_X, y: stageY(4) },
  },
  {
    id: 'infra-sp-5',
    track: 'infrastructure',
    stage: 5,
    pathType: 'specialist',
    titleJa: 'システム設計',
    shortLabel: 'システム設計',
    summary: 'インフラアーキテクチャの設計。要件に基づく最適なインフラ構成の提案・設計。',
    requiredSkills: ['インフラ設計', '可用性設計', 'セキュリティ設計', 'コスト最適化'],
    requiredExperience: ['構築実務3年以上', '複数環境の設計経験'],
    recommendedCerts: ['AWS SAP', 'ネットワークスペシャリスト'],
    toolsEnvironmentsLanguages: ['マルチクラウド', 'Kubernetes', 'Terraform Enterprise'],
    nextStepConditions: ['大規模インフラ設計を主導可能'],
    tags: ['サーバ', 'ネットワーク', '自動化', 'クラウド'],
    canCoexistWith: ['infra-mg-5'],
    position: { x: INFRA_SP_X, y: stageY(5) },
  },
  {
    id: 'infra-sp-6',
    track: 'infrastructure',
    stage: 6,
    pathType: 'specialist',
    titleJa: 'TL（テックリード／技術責任）',
    shortLabel: 'テックリード',
    summary: 'インフラ領域の最上位技術職。技術戦略・標準化・チーム技術力向上を牽引。',
    requiredSkills: ['技術戦略策定', 'インフラ標準化', 'チーム育成', '技術選定'],
    requiredExperience: ['システム設計実務3年以上'],
    recommendedCerts: ['各種上位資格'],
    toolsEnvironmentsLanguages: ['全般'],
    nextStepConditions: ['（最上位段階）'],
    tags: ['サーバ', 'ネットワーク', '自動化', 'クラウド'],
    canCoexistWith: ['infra-mg-6'],
    position: { x: INFRA_SP_X, y: stageY(6) },
  },

  // --- Manager ---
  {
    id: 'infra-mg-2',
    track: 'infrastructure',
    stage: 2,
    pathType: 'manager',
    titleJa: 'サブリーダー',
    shortLabel: 'サブリーダー',
    summary: 'インフラチームのサブリーダー。タスク管理、メンバーフォローを担当。',
    requiredSkills: ['タスク管理', '進捗報告', 'メンバーフォロー'],
    requiredExperience: ['運用監視またはオペレーター実務1年以上'],
    recommendedCerts: ['LPIC-1', 'ITIL Foundation'],
    toolsEnvironmentsLanguages: ['チケット管理', 'Excel'],
    nextStepConditions: ['チーム内タスクの管理を単独でできる'],
    tags: [],
    position: { x: INFRA_MG_X, y: stageY(2) },
  },
  {
    id: 'infra-mg-3',
    track: 'infrastructure',
    stage: 3,
    pathType: 'manager',
    titleJa: 'リーダー',
    shortLabel: 'リーダー',
    summary: 'インフラチームリーダー。チーム管理、品質管理、顧客折衝を担当。',
    requiredSkills: ['チーム管理', '品質管理', '顧客報告'],
    requiredExperience: ['サブリーダー実務1年以上'],
    recommendedCerts: ['ITIL Foundation', '応用情報技術者'],
    toolsEnvironmentsLanguages: ['プロジェクト管理ツール'],
    nextStepConditions: ['5名規模のチーム管理経験'],
    tags: [],
    canCoexistWith: ['infra-sp-3'],
    position: { x: INFRA_MG_X, y: stageY(3) },
  },
  {
    id: 'infra-mg-4',
    track: 'infrastructure',
    stage: 4,
    pathType: 'manager',
    titleJa: 'サブPM',
    shortLabel: 'サブPM',
    summary: 'インフラPMの補佐。スケジュール管理、ベンダー調整を担当。',
    requiredSkills: ['スケジュール管理', 'ベンダー管理', '課題管理'],
    requiredExperience: ['リーダー実務2年以上'],
    recommendedCerts: ['PMP', 'ITIL Intermediate'],
    toolsEnvironmentsLanguages: ['MS Project', 'Jira'],
    nextStepConditions: ['中規模インフラプロジェクトの管理補佐経験'],
    tags: [],
    canCoexistWith: ['infra-sp-4'],
    position: { x: INFRA_MG_X, y: stageY(4) },
  },
  {
    id: 'infra-mg-5',
    track: 'infrastructure',
    stage: 5,
    pathType: 'manager',
    titleJa: 'PM',
    shortLabel: 'PM',
    summary: 'インフラプロジェクトマネージャ。プロジェクト全体の計画・推進・管理を担当。',
    requiredSkills: ['プロジェクト計画', '予算管理', 'リスク管理', 'ステークホルダー管理'],
    requiredExperience: ['サブPM実務2年以上'],
    recommendedCerts: ['PMP', 'プロジェクトマネージャ試験'],
    toolsEnvironmentsLanguages: ['PMツール全般'],
    nextStepConditions: ['大規模インフラプロジェクトのPM経験'],
    tags: [],
    canCoexistWith: ['infra-sp-5'],
    position: { x: INFRA_MG_X, y: stageY(5) },
  },
  {
    id: 'infra-mg-6',
    track: 'infrastructure',
    stage: 6,
    pathType: 'manager',
    titleJa: 'PM／インフラマネージャ',
    shortLabel: 'PM/インフラMgr',
    summary: 'インフラ部門マネージャ。複数プロジェクト統括、組織運営を担当。',
    requiredSkills: ['組織マネジメント', 'ポートフォリオ管理', '戦略立案'],
    requiredExperience: ['PM実務3年以上'],
    recommendedCerts: ['PgMP'],
    toolsEnvironmentsLanguages: ['経営管理ツール'],
    nextStepConditions: ['（最上位段階）'],
    tags: [],
    canCoexistWith: ['infra-sp-6'],
    position: { x: INFRA_MG_X, y: stageY(6) },
  },
];

// ---------------------------------------------------------------------------
// Generated subtrack variants (開発/インフラを複数分類で表示)
// ---------------------------------------------------------------------------

const DEV_WEB_SP_X = 80;
const DEV_WEB_MG_X = 260;
const DEV_MOBILE_SP_X = 500;
const DEV_MOBILE_MG_X = 680;

const INFRA_SERVER_SP_X = 80;
const INFRA_SERVER_MG_X = 260;
const INFRA_NETWORK_SP_X = 500;
const INFRA_NETWORK_MG_X = 680;

interface SubtrackVariant {
  idPrefix: string;
  subtrack: string;
  specialistX: number;
  managerX: number;
}

function toVariantId(id: string, originalPrefix: string, variantPrefix: string): string {
  return id.replace(new RegExp(`^${originalPrefix}-`), `${variantPrefix}-`);
}

function cloneNodesForVariant(
  nodes: CareerNode[],
  originalPrefix: string,
  variant: SubtrackVariant
): CareerNode[] {
  return nodes.map((node) => ({
    ...node,
    id: toVariantId(node.id, originalPrefix, variant.idPrefix),
    subtrack: variant.subtrack,
    canCoexistWith: node.canCoexistWith?.map((id) => toVariantId(id, originalPrefix, variant.idPrefix)),
    relatedNodeIds: node.relatedNodeIds?.map((id) =>
      id.startsWith(`${originalPrefix}-`) ? toVariantId(id, originalPrefix, variant.idPrefix) : id
    ),
    position: {
      x: node.pathType === 'specialist' ? variant.specialistX : variant.managerX,
      y: stageY(node.stage),
    },
  }));
}

function cloneEdgesForVariant(
  edges: CareerEdge[],
  originalPrefix: string,
  variantPrefix: string
): CareerEdge[] {
  return edges.map((edge) => ({
    ...edge,
    source: toVariantId(edge.source, originalPrefix, variantPrefix),
    target: toVariantId(edge.target, originalPrefix, variantPrefix),
  }));
}

const developmentVariants: SubtrackVariant[] = [
  {
    idPrefix: 'dev-web',
    subtrack: 'Webアプリケーション',
    specialistX: DEV_WEB_SP_X,
    managerX: DEV_WEB_MG_X,
  },
  {
    idPrefix: 'dev-mobile',
    subtrack: 'モバイルアプリ',
    specialistX: DEV_MOBILE_SP_X,
    managerX: DEV_MOBILE_MG_X,
  },
];

const infrastructureVariants: SubtrackVariant[] = [
  {
    idPrefix: 'infra-server',
    subtrack: 'サーバー',
    specialistX: INFRA_SERVER_SP_X,
    managerX: INFRA_SERVER_MG_X,
  },
  {
    idPrefix: 'infra-network',
    subtrack: 'ネットワーク',
    specialistX: INFRA_NETWORK_SP_X,
    managerX: INFRA_NETWORK_MG_X,
  },
];

const developmentNodes: CareerNode[] = developmentVariants.flatMap((variant) =>
  cloneNodesForVariant(developmentTemplateNodes, 'dev', variant)
);

const infrastructureNodes: CareerNode[] = infrastructureVariants.flatMap((variant) =>
  cloneNodesForVariant(infrastructureTemplateNodes, 'infra', variant)
);

// === IT SUPPORT TRACK (ITサポート) =========================================

const ITS_HD_X = 100;   // ヘルプデスク column
const ITS_JS_X = 350;   // 情シス支援 column
const ITS_PMO_X = 600;  // PMO支援 column

const itSupportNodes: CareerNode[] = [
  // --- ヘルプデスク ---
  {
    id: 'its-hd-1',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 1,
    pathType: 'manager',
    titleJa: 'キッティング・ヘルプデスク（オペレーター）',
    shortLabel: 'キッティング/HD',
    summary: 'PC設定・ヘルプデスク一次対応。IT基礎スキルの習得段階。',
    requiredSkills: ['PC基本操作', '電話対応', 'チケット起票'],
    requiredExperience: ['IT基礎研修修了'],
    recommendedCerts: ['ITパスポート'],
    toolsEnvironmentsLanguages: ['Windows', 'ServiceNow', 'Teams'],
    nextStepConditions: ['オペレーター実務6ヶ月以上'],
    tags: ['ヘルプデスク'],
    relatedNodeIds: ['infra-server-sp-1', 'infra-network-sp-1'],
    position: { x: ITS_HD_X, y: stageY(1) },
  },
  {
    id: 'its-hd-2',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 2,
    pathType: 'manager',
    titleJa: 'ジュニアオペレーター',
    shortLabel: 'Jr.オペレーター',
    summary: 'ヘルプデスク二次対応、ナレッジ蓄積、新人OJTを担当。',
    requiredSkills: ['トラブルシューティング', 'ナレッジ作成', 'OJT指導'],
    requiredExperience: ['オペレーター実務1年以上'],
    recommendedCerts: ['CompTIA A+', 'MOS'],
    toolsEnvironmentsLanguages: ['ServiceNow', 'Active Directory', 'Microsoft 365'],
    nextStepConditions: ['二次対応を単独で可能', 'ナレッジ記事作成実績'],
    tags: ['ヘルプデスク'],
    position: { x: ITS_HD_X, y: stageY(2) },
  },
  {
    id: 'its-hd-3',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 3,
    pathType: 'manager',
    titleJa: 'サブリーダー',
    shortLabel: 'サブリーダー',
    summary: 'ヘルプデスクチームのサブリーダー。シフト管理、エスカレーション対応。',
    requiredSkills: ['シフト管理', 'エスカレーション管理', 'KPI報告'],
    requiredExperience: ['Jr.オペレーター実務1年以上'],
    recommendedCerts: ['ITIL Foundation'],
    toolsEnvironmentsLanguages: ['ServiceNow', 'Excel', 'BI基礎'],
    nextStepConditions: ['チームの日常管理を補佐可能'],
    tags: ['ヘルプデスク'],
    position: { x: ITS_HD_X, y: stageY(3) },
  },
  {
    id: 'its-hd-4',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 4,
    pathType: 'manager',
    titleJa: 'リーダー',
    shortLabel: 'リーダー',
    summary: 'ヘルプデスクチームリーダー。品質管理、SLA管理、顧客報告を担当。',
    requiredSkills: ['チーム管理', 'SLA管理', '品質管理', '顧客報告'],
    requiredExperience: ['サブリーダー実務1年以上'],
    recommendedCerts: ['ITIL Intermediate', 'HDI-SCA'],
    toolsEnvironmentsLanguages: ['ServiceNow', 'Power BI', 'Excel VBA'],
    nextStepConditions: ['10名規模のチーム管理経験', 'SLA達成率管理'],
    tags: ['ヘルプデスク'],
    position: { x: ITS_HD_X, y: stageY(4) },
  },
  {
    id: 'its-hd-5',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 5,
    pathType: 'manager',
    titleJa: 'SV（スーパーバイザー）',
    shortLabel: 'SV',
    summary: 'ヘルプデスクスーパーバイザー。複数チーム管理、業務改善を推進。',
    requiredSkills: ['複数チーム管理', '業務改善', 'コスト管理', '提案活動'],
    requiredExperience: ['リーダー実務2年以上'],
    recommendedCerts: ['ITIL Expert', 'HDI-SCM'],
    toolsEnvironmentsLanguages: ['ITSM全般', 'データ分析ツール'],
    nextStepConditions: ['複数チームの統括経験', '業務改善提案の実績'],
    tags: ['ヘルプデスク'],
    position: { x: ITS_HD_X, y: stageY(5) },
  },
  {
    id: 'its-hd-6',
    track: 'it-support',
    subtrack: 'ITサポート',
    stage: 6,
    pathType: 'manager',
    titleJa: 'センター長／マネージャー',
    shortLabel: 'センター長',
    summary: 'ヘルプデスクセンター全体の統括。事業計画、P&L管理を担当。',
    requiredSkills: ['センター運営', 'P&L管理', '事業計画', '採用・育成'],
    requiredExperience: ['SV実務3年以上'],
    recommendedCerts: ['ITIL Master'],
    toolsEnvironmentsLanguages: ['経営管理ツール'],
    nextStepConditions: ['（最上位段階）'],
    tags: ['ヘルプデスク'],
    position: { x: ITS_HD_X, y: stageY(6) },
  },

  // --- 情シス支援 ---
  {
    id: 'its-js-2',
    track: 'it-support',
    subtrack: '情シス支援',
    stage: 2,
    pathType: 'manager',
    titleJa: '社内SE／情シスサポート',
    shortLabel: '情シスサポート',
    summary: '社内IT環境のサポート。アカウント管理、ソフト導入支援を担当。',
    requiredSkills: ['アカウント管理', 'ソフトウェア導入', '社内IT問い合わせ対応'],
    requiredExperience: ['ヘルプデスク実務1年以上'],
    recommendedCerts: ['基本情報技術者', 'CompTIA A+'],
    toolsEnvironmentsLanguages: ['Active Directory', 'Microsoft 365', 'Intune'],
    nextStepConditions: ['社内SEとしての基本業務を単独で可能'],
    tags: ['情シス'],
    relatedNodeIds: ['its-hd-2'],
    position: { x: ITS_JS_X, y: stageY(2) },
  },
  {
    id: 'its-js-3',
    track: 'it-support',
    subtrack: '情シス支援',
    stage: 3,
    pathType: 'manager',
    titleJa: '社内SE／情シス要員',
    shortLabel: '情シス要員',
    summary: '情報システム部門の一員として、社内システムの運用・改善を担当。',
    requiredSkills: ['社内システム運用', '業務改善提案', 'ベンダー窓口'],
    requiredExperience: ['情シスサポート実務1年以上'],
    recommendedCerts: ['応用情報技術者', 'ITIL Foundation'],
    toolsEnvironmentsLanguages: ['SaaS管理', 'VPN', 'セキュリティツール'],
    nextStepConditions: ['社内システム運用を主導可能'],
    tags: ['情シス'],
    position: { x: ITS_JS_X, y: stageY(3) },
  },
  {
    id: 'its-js-4',
    track: 'it-support',
    subtrack: '情シス支援',
    stage: 4,
    pathType: 'manager',
    titleJa: '情シス担当／IT担当',
    shortLabel: '情シス担当',
    summary: '情報システムの企画・導入・運用を担当。IT戦略の実行部隊。',
    requiredSkills: ['システム企画', 'IT予算管理', 'セキュリティ対策', 'ベンダー管理'],
    requiredExperience: ['情シス要員実務2年以上'],
    recommendedCerts: ['情報セキュリティマネジメント', 'AWS CLF'],
    toolsEnvironmentsLanguages: ['クラウド管理', 'MDM', 'EDR'],
    nextStepConditions: ['IT企画を主導可能', 'セキュリティ対策の立案'],
    tags: ['情シス'],
    position: { x: ITS_JS_X, y: stageY(4) },
  },
  {
    id: 'its-js-5',
    track: 'it-support',
    subtrack: '情シス支援',
    stage: 5,
    pathType: 'manager',
    titleJa: '情シスリーダー',
    shortLabel: '情シスリーダー',
    summary: '情報システム部門のリーダー。IT戦略策定、チーム管理を担当。',
    requiredSkills: ['IT戦略策定', 'チーム管理', '経営層報告', 'DX推進'],
    requiredExperience: ['情シス担当実務3年以上'],
    recommendedCerts: ['ITストラテジスト', '情報処理安全確保支援士'],
    toolsEnvironmentsLanguages: ['IT管理全般'],
    nextStepConditions: ['IT戦略の策定・実行経験'],
    tags: ['情シス'],
    position: { x: ITS_JS_X, y: stageY(5) },
  },
  {
    id: 'its-js-6',
    track: 'it-support',
    subtrack: '情シス支援',
    stage: 6,
    pathType: 'manager',
    titleJa: '情シスマネージャ',
    shortLabel: '情シスMgr',
    summary: '情報システム部門のマネージャ。IT統括、経営参画を担当。',
    requiredSkills: ['IT統括', '経営参画', 'DX戦略', '組織マネジメント'],
    requiredExperience: ['情シスリーダー実務3年以上'],
    recommendedCerts: ['ITストラテジスト'],
    toolsEnvironmentsLanguages: ['経営管理全般'],
    nextStepConditions: ['（最上位段階）'],
    tags: ['情シス'],
    position: { x: ITS_JS_X, y: stageY(6) },
  },

  // --- PMO支援 ---
  {
    id: 'its-pmo-1',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 1,
    pathType: 'manager',
    titleJa: 'PMO事務',
    shortLabel: 'PMO事務',
    summary: 'PMO事務作業。会議調整、資料作成、データ入力を担当。',
    requiredSkills: ['事務処理', '会議調整', '資料作成'],
    requiredExperience: ['IT基礎研修修了'],
    recommendedCerts: ['ITパスポート', 'MOS'],
    toolsEnvironmentsLanguages: ['Excel', 'PowerPoint', 'Teams', 'Backlog'],
    nextStepConditions: ['PMO事務実務6ヶ月以上'],
    tags: ['PMO'],
    position: { x: ITS_PMO_X, y: stageY(1) },
  },
  {
    id: 'its-pmo-2',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 2,
    pathType: 'manager',
    titleJa: 'PMO補佐',
    shortLabel: 'PMO補佐',
    summary: 'PMO業務の補佐。進捗集約、課題管理、報告書作成を担当。',
    requiredSkills: ['進捗集約', '課題管理', '報告書作成', '会議ファシリテーション補佐'],
    requiredExperience: ['PMO事務実務1年以上'],
    recommendedCerts: ['基本情報技術者', 'CAPM'],
    toolsEnvironmentsLanguages: ['Jira', 'Confluence', 'Excel', 'Power BI基礎'],
    nextStepConditions: ['定型PMO業務を単独で実施可能'],
    tags: ['PMO'],
    relatedNodeIds: ['dev-mg-1'],
    position: { x: ITS_PMO_X, y: stageY(2) },
  },
  {
    id: 'its-pmo-3',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 3,
    pathType: 'manager',
    titleJa: 'PMOアシスタント',
    shortLabel: 'PMOアシスタント',
    summary: 'PMOアシスタントとして、プロジェクト管理プロセスの運用を担当。',
    requiredSkills: ['PM手法理解', 'リスク管理補佐', 'ステータス報告', 'データ分析'],
    requiredExperience: ['PMO補佐実務1年以上'],
    recommendedCerts: ['PMP/CAPM', '応用情報技術者'],
    toolsEnvironmentsLanguages: ['Jira', 'MS Project', 'Tableau/Power BI'],
    nextStepConditions: ['PMOプロセスの改善提案ができる'],
    tags: ['PMO'],
    position: { x: ITS_PMO_X, y: stageY(3) },
  },
  {
    id: 'its-pmo-4',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 4,
    pathType: 'manager',
    titleJa: 'PMO担当',
    shortLabel: 'PMO担当',
    summary: 'PMO担当としてプロジェクト管理の標準化・推進を担当。',
    requiredSkills: ['PM標準化', 'プロセス改善', 'ガバナンス支援', 'PMOツール運用'],
    requiredExperience: ['PMOアシスタント実務2年以上'],
    recommendedCerts: ['PMP', 'プロジェクトマネージャ試験'],
    toolsEnvironmentsLanguages: ['PMOツール全般', 'BIツール'],
    nextStepConditions: ['PMO標準化の推進経験'],
    tags: ['PMO'],
    position: { x: ITS_PMO_X, y: stageY(4) },
  },
  {
    id: 'its-pmo-5',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 5,
    pathType: 'manager',
    titleJa: 'PMOリーダー',
    shortLabel: 'PMOリーダー',
    summary: 'PMOチームのリーダー。PMO組織運営、全社PM力向上を推進。',
    requiredSkills: ['PMO組織運営', 'PM教育', '経営報告', 'ポートフォリオ管理支援'],
    requiredExperience: ['PMO担当実務3年以上'],
    recommendedCerts: ['PgMP', 'P3O'],
    toolsEnvironmentsLanguages: ['PMOフレームワーク全般'],
    nextStepConditions: ['PMO組織の統括経験'],
    tags: ['PMO'],
    position: { x: ITS_PMO_X, y: stageY(5) },
  },
  {
    id: 'its-pmo-6',
    track: 'it-support',
    subtrack: 'PMO支援',
    stage: 6,
    pathType: 'manager',
    titleJa: 'PMOマネージャ',
    shortLabel: 'PMO Mgr',
    summary: 'PMO部門マネージャ。全社プロジェクトガバナンス、PMO戦略を統括。',
    requiredSkills: ['PMO戦略', 'ガバナンス統括', '経営参画', '組織マネジメント'],
    requiredExperience: ['PMOリーダー実務3年以上'],
    recommendedCerts: ['PgMP', 'P3O Practitioner'],
    toolsEnvironmentsLanguages: ['経営管理全般'],
    nextStepConditions: ['（最上位段階）'],
    tags: ['PMO'],
    position: { x: ITS_PMO_X, y: stageY(6) },
  },
];

// ---------------------------------------------------------------------------
// Edges
// ---------------------------------------------------------------------------

const developmentTemplateEdges: CareerEdge[] = [
  // Specialist chain
  { source: 'dev-sp-1', target: 'dev-sp-2', type: 'normal' },
  { source: 'dev-sp-2', target: 'dev-sp-3', type: 'normal' },
  { source: 'dev-sp-3', target: 'dev-sp-4', type: 'normal' },
  { source: 'dev-sp-4', target: 'dev-sp-5', type: 'normal' },
  { source: 'dev-sp-5', target: 'dev-sp-6', type: 'normal' },
  // Manager chain
  { source: 'dev-mg-1', target: 'dev-mg-2', type: 'normal' },
  { source: 'dev-mg-2', target: 'dev-mg-3', type: 'normal' },
  { source: 'dev-mg-3', target: 'dev-mg-4', type: 'normal' },
  { source: 'dev-mg-4', target: 'dev-mg-5', type: 'normal' },
  { source: 'dev-mg-5', target: 'dev-mg-6', type: 'normal' },
  // Cross-over between specialist and manager (same stage only)
  { source: 'dev-sp-1', target: 'dev-mg-1', type: 'optional', label: '兼任可' },
  { source: 'dev-sp-2', target: 'dev-mg-2', type: 'optional', label: '兼任可' },
  { source: 'dev-sp-3', target: 'dev-mg-3', type: 'optional', label: '兼任可' },
  { source: 'dev-sp-4', target: 'dev-mg-4', type: 'optional', label: '兼任可' },
  { source: 'dev-sp-5', target: 'dev-mg-5', type: 'optional', label: '兼任可' },
  { source: 'dev-sp-6', target: 'dev-mg-6', type: 'optional', label: '兼任可' },
];

const infrastructureTemplateEdges: CareerEdge[] = [
  // Specialist chain
  { source: 'infra-sp-1', target: 'infra-sp-2', type: 'normal' },
  { source: 'infra-sp-2', target: 'infra-sp-3', type: 'normal' },
  { source: 'infra-sp-3', target: 'infra-sp-4', type: 'normal' },
  { source: 'infra-sp-4', target: 'infra-sp-5', type: 'normal' },
  { source: 'infra-sp-5', target: 'infra-sp-6', type: 'normal' },
  // Manager chain
  { source: 'infra-mg-2', target: 'infra-mg-3', type: 'normal' },
  { source: 'infra-mg-3', target: 'infra-mg-4', type: 'normal' },
  { source: 'infra-mg-4', target: 'infra-mg-5', type: 'normal' },
  { source: 'infra-mg-5', target: 'infra-mg-6', type: 'normal' },
  // Cross-over between specialist and manager (same stage only)
  { source: 'infra-sp-2', target: 'infra-mg-2', type: 'optional', label: '兼任可' },
  { source: 'infra-sp-3', target: 'infra-mg-3', type: 'optional', label: '兼任可' },
  { source: 'infra-sp-4', target: 'infra-mg-4', type: 'optional', label: '兼任可' },
  { source: 'infra-sp-5', target: 'infra-mg-5', type: 'optional', label: '兼任可' },
  { source: 'infra-sp-6', target: 'infra-mg-6', type: 'optional', label: '兼任可' },
];

const developmentEdges: CareerEdge[] = [
  ...cloneEdgesForVariant(developmentTemplateEdges, 'dev', 'dev-web'),
  ...cloneEdgesForVariant(developmentTemplateEdges, 'dev', 'dev-mobile'),
  // 段階1は Web/モバイル共通
  { source: 'dev-web-sp-1', target: 'dev-mobile-sp-1', type: 'optional', label: '共通' },
  { source: 'dev-web-mg-1', target: 'dev-mobile-mg-1', type: 'optional', label: '共通' },
];

const infrastructureEdges: CareerEdge[] = [
  ...cloneEdgesForVariant(infrastructureTemplateEdges, 'infra', 'infra-server'),
  ...cloneEdgesForVariant(infrastructureTemplateEdges, 'infra', 'infra-network'),
  // 段階1は サーバー/ネットワーク共通
  { source: 'infra-server-sp-1', target: 'infra-network-sp-1', type: 'optional', label: '共通' },
];

const developmentEdges: CareerEdge[] = [
  ...cloneEdgesForVariant(developmentTemplateEdges, 'dev', 'dev-web'),
  ...cloneEdgesForVariant(developmentTemplateEdges, 'dev', 'dev-mobile'),
  // 段階1は Web/モバイル共通
  { source: 'dev-web-sp-1', target: 'dev-mobile-sp-1', type: 'optional', label: '共通' },
  { source: 'dev-web-mg-1', target: 'dev-mobile-mg-1', type: 'optional', label: '共通' },
];

const infrastructureEdges: CareerEdge[] = [
  ...cloneEdgesForVariant(infrastructureTemplateEdges, 'infra', 'infra-server'),
  ...cloneEdgesForVariant(infrastructureTemplateEdges, 'infra', 'infra-network'),
  // 段階1は サーバー/ネットワーク共通
  { source: 'infra-server-sp-1', target: 'infra-network-sp-1', type: 'optional', label: '共通' },
];

const itSupportEdges: CareerEdge[] = [
  // ヘルプデスク chain
  { source: 'its-hd-1', target: 'its-hd-2', type: 'normal' },
  { source: 'its-hd-2', target: 'its-hd-3', type: 'normal' },
  { source: 'its-hd-3', target: 'its-hd-4', type: 'normal' },
  { source: 'its-hd-4', target: 'its-hd-5', type: 'normal' },
  { source: 'its-hd-5', target: 'its-hd-6', type: 'normal' },
  // 情シス支援 chain
  { source: 'its-js-2', target: 'its-js-3', type: 'normal' },
  { source: 'its-js-3', target: 'its-js-4', type: 'normal' },
  { source: 'its-js-4', target: 'its-js-5', type: 'normal' },
  { source: 'its-js-5', target: 'its-js-6', type: 'normal' },
  // PMO支援 chain
  { source: 'its-pmo-1', target: 'its-pmo-2', type: 'normal' },
  { source: 'its-pmo-2', target: 'its-pmo-3', type: 'normal' },
  { source: 'its-pmo-3', target: 'its-pmo-4', type: 'normal' },
  { source: 'its-pmo-4', target: 'its-pmo-5', type: 'normal' },
  { source: 'its-pmo-5', target: 'its-pmo-6', type: 'normal' },
  // Cross-links within IT support
  { source: 'its-hd-1', target: 'its-pmo-2', type: 'optional', label: 'PMOへ' },
  { source: 'its-hd-2', target: 'its-js-2', type: 'optional', label: '情シスへ' },
  { source: 'its-hd-2', target: 'its-pmo-2', type: 'optional', label: 'PMOへ' },
];

// Cross-track edges (connecting different tracks)
const crossTrackEdges: CareerEdge[] = [
  // ヘルプデスク → インフラ entry
  { source: 'its-hd-1', target: 'infra-server-sp-1', type: 'cross-track', label: 'インフラへ' },
  // PMO支援 → 開発マネジメント entry
  { source: 'its-pmo-2', target: 'dev-web-mg-1', type: 'cross-track', label: '開発PMOへ' },
];

// ---------------------------------------------------------------------------
// Combined dataset — exported per track and as full set
// ---------------------------------------------------------------------------

export const allNodes: CareerNode[] = [
  ...developmentNodes,
  ...infrastructureNodes,
  ...itSupportNodes,
];

export const allEdges: CareerEdge[] = [
  ...developmentEdges,
  ...infrastructureEdges,
  ...itSupportEdges,
  ...crossTrackEdges,
];

export const fullDataSet: CareerDataSet = {
  nodes: allNodes,
  edges: allEdges,
};

/**
 * Helper: Get nodes filtered by track
 */
export function getNodesByTrack(track: Track): CareerNode[] {
  return allNodes.filter((n) => n.track === track);
}

/**
 * Helper: Get edges relevant to a set of node IDs
 * (includes cross-track edges that touch these nodes)
 */
export function getEdgesForNodes(nodeIds: Set<string>): CareerEdge[] {
  return allEdges.filter(
    (e) => nodeIds.has(e.source) || nodeIds.has(e.target)
  );
}

/**
 * Helper: Get a single node by ID
 */
export function getNodeById(id: string): CareerNode | undefined {
  return allNodes.find((n) => n.id === id);
}
