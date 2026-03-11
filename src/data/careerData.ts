const STAGE_Y_GAP = 150;
const BASE_Y = 50;
const stageY = (stage: number) => BASE_Y + (6 - stage) * STAGE_Y_GAP;

const STAGES = [1, 2, 3, 4, 5, 6] as const;

/** 일반 노드 폭 */
const DEFAULT_NODE_WIDTH = 140;
/** 1단계 공통 노드 폭 */
const COMMON_NODE_WIDTH = 212;
/** 공통 노드 시각 보정값 */
const COMMON_VISUAL_NUDGE_X = 8;
/** 공통 노드 left 기준 보정 */
const COMMON_X_OFFSET =
  Math.round((DEFAULT_NODE_WIDTH - COMMON_NODE_WIDTH) / 2) + COMMON_VISUAL_NUDGE_X;

// Development
const DEV_WEB_SP_X = 80;
const DEV_WEB_MG_X = 260;
const DEV_WEB_COMMON_X =
  Math.round((DEV_WEB_SP_X + DEV_WEB_MG_X) / 2) + COMMON_X_OFFSET;

const DEV_MOBILE_SP_X = 500;
const DEV_MOBILE_MG_X = 680;
const DEV_MOBILE_COMMON_X =
  Math.round((DEV_MOBILE_SP_X + DEV_MOBILE_MG_X) / 2) + COMMON_X_OFFSET;

// Infrastructure
const INFRA_SERVER_SP_X = 80;
const INFRA_SERVER_MG_X = 260;
const INFRA_SERVER_COMMON_X =
  Math.round((INFRA_SERVER_SP_X + INFRA_SERVER_MG_X) / 2) + COMMON_X_OFFSET;

const INFRA_NETWORK_SP_X = 500;
const INFRA_NETWORK_MG_X = 680;
const INFRA_NETWORK_COMMON_X =
  Math.round((INFRA_NETWORK_SP_X + INFRA_NETWORK_MG_X) / 2) + COMMON_X_OFFSET;

// IT Support
const ITS_IT_X = 100;
const ITS_JOSIS_X = 350;
const ITS_PMO_X = 600;