# Career Path - キャリアパスモデル（育成面談用）

Game-style skill-tree career path visualization for a Japanese SES company.
Built as a desktop-first wireframe prototype for HR / 育成面談 use.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser (desktop recommended).

## File Structure

```
src/
├── types/
│   └── career.ts            # Data model TypeScript types & enums
├── data/
│   └── careerData.ts        # Mock career data (nodes + edges)
├── hooks/
│   └── useCareerPathState.ts # Central state management hook
├── components/
│   ├── TrackTabs.tsx         # Track selector tabs (開発/インフラ/ITサポート)
│   ├── ControlBar.tsx        # Search box, filter chips, legend
│   ├── SkillTreeGraph.tsx    # React Flow graph (left pane)
│   ├── CareerNode.tsx        # Custom React Flow node component
│   ├── StageLaneOverlay.tsx  # Stage lane labels (段階1~6)
│   └── DetailPanel.tsx       # Right-side detail panel
├── App.tsx                   # Main layout shell
├── main.tsx                  # Entry point
└── index.css                 # Global styles + Tailwind + React Flow overrides
```

## Screen Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Title + Track Tabs (開発 / インフラ / IT)   │
├─────────────────────────────────────────────────────┤
│ Control Bar: Search | Filters | Legend               │
├────────────────────────────────┬────────────────────┤
│                                │                    │
│   Skill Tree Graph (2/3)       │  Detail Panel (1/3)│
│   React Flow canvas            │  Selected node info│
│   Stage 1→6 vertical           │                    │
│   Specialist | Manager cols    │  Skills, Certs,    │
│                                │  Experience, etc.  │
│                                │                    │
└────────────────────────────────┴────────────────────┘
```

## How to Add / Edit Career Nodes

### 1. Add a new node

Open `src/data/careerData.ts` and add to the appropriate array:

```typescript
{
  id: 'dev-sp-7',           // Unique ID (convention: track-pathType-stage)
  track: 'development',      // 'development' | 'infrastructure' | 'it-support'
  stage: 7,                  // Stage number (add to Stage type if >6)
  pathType: 'specialist',    // 'specialist' | 'manager' | 'common'
  titleJa: '新しい役職名',
  shortLabel: '短縮名',
  summary: '役職の説明文...',
  requiredSkills: ['スキル1', 'スキル2'],
  requiredExperience: ['経験1'],
  recommendedCerts: ['資格1'],
  toolsEnvironmentsLanguages: ['ツール1'],
  nextStepConditions: ['条件1'],
  tags: ['タグ1'],
  position: { x: 180, y: 950 },  // Adjust for layout
}
```

### 2. Add edges (connections)

```typescript
{ source: 'dev-sp-6', target: 'dev-sp-7', type: 'normal' }
// type: 'normal' | 'optional' (dashed) | 'cross-track' (animated dashed)
```

### 3. Position guide

- X axis: column position (Specialist ~180px, Manager ~480px)
- Y axis: stage position — use `stageY(n)` helper: `50 + (stage-1) * 150`
- For ITサポート, three sub-columns at x=100, 350, 600

## Data Model

See `src/types/career.ts` for the full TypeScript schema. Key fields:

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `track` | Top-level domain (開発/インフラ/ITサポート) |
| `subtrack` | Optional subdivision (e.g., ヘルプデスク, PMO支援) |
| `stage` | Career level 1-6 (段階) |
| `pathType` | specialist / manager / common |
| `titleJa` | Full Japanese title |
| `shortLabel` | Short label for graph nodes |
| `requiredSkills[]` | List of required skills |
| `requiredExperience[]` | List of required experience |
| `recommendedCerts[]` | Recommended certifications |
| `toolsEnvironmentsLanguages[]` | Tools, languages, platforms |
| `nextStepConditions[]` | Conditions to advance |
| `tags[]` | Freeform tags for search/filter |
| `canCoexistWith[]` | IDs of coexistable roles (兼任可能) |
| `relatedNodeIds[]` | Cross-reference links |
| `position` | `{ x, y }` for graph layout |
| `branchNote` | Optional memo text |

## Visual Conventions

| Element | Style |
|---|---|
| 開発 nodes | Blue border |
| インフラ nodes | Cyan/teal border |
| ITサポート nodes | Violet border |
| Specialist | Solid border, light blue fill |
| Manager | Dashed border, light yellow fill |
| Common | Solid border, neutral fill |
| Selected node | Strong color ring |
| Connected neighbors | Yellow ring highlight |
| Optional/兼任 edges | Dashed gray |
| Cross-track edges | Dashed amber, animated |

## Future Extensibility

The codebase is designed for these planned additions:

1. **Per-person proficiency overlay** — Uncomment `proficiencyStatus`, `isCurrent`, `isTarget` fields in `career.ts`
2. **Google Sheets / CSV import** — Replace the data arrays in `careerData.ts` with a fetch + parse function
3. **Japanese search synonyms** — Extend the search filter in `useCareerPathState.ts`
4. **Subtrack collapse/expand** — Add toggle state per subtrack in the ITサポート view
5. **Employee-specific view** — Layer a "current position" + "target position" overlay on top of the graph

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- @xyflow/react (React Flow) for the skill-tree graph
