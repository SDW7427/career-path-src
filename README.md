# Career Path - キャリアパスモデル（育成面談用）

Game-style skill-tree career path visualization for a Japanese SES company.
Built as a desktop-first wireframe prototype for HR / 育成面談 use.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Google Sheets Data Contract

This project currently loads **node content only** from the published Google Sheets **Nodes** sheet.
Node structure, positions, layout, and all edges are still defined locally in `src/data/careerData.ts`.

### Required Nodes sheet columns

These columns must exist in the Nodes sheet:

- `id`
- `titleJa`
- `shortLabel`

### Optional Nodes sheet columns

These columns may exist, and will be reflected in the detail/search UI when present:

- `summary`
- `requiredSkills`
- `requiredExperience`
- `recommendedCerts`
- `toolsEnvironmentsLanguages`
- `nextStepConditions`
- `tags`
- `branchNote`

If the optional columns are removed, the app will still work, but the corresponding sections in the detail panel or search index will become empty.

### Columns that are no longer needed in the sheet

The following kinds of columns are not read from the sheet anymore and can be safely omitted there:

- layout / structure columns such as `track`, `subtrack`, `stage`, `pathType`, `position`, `styleKey`
- relationship columns such as `canCoexistWith`, `relatedNodeIds`

### Edge sheet status

A separate **Edges** sheet is no longer used by the app.
All edge definitions are read from `src/data/careerData.ts`.

## File Structure

```
src/
├── types/
│   └── career.ts            # Data model TypeScript types & enums
├── data/
│   ├── careerData.ts        # Local node structure, positions, and all edges
│   ├── loadCareerDataFromSheets.ts # Loads Nodes sheet content and merges by id
│   └── sheetSources.ts      # Published Google Sheets URLs
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

## How to Edit Data

### 1. Edit visible content in Google Sheets

Use the published **Nodes** sheet when you want to change:

- `titleJa`
- `shortLabel`
- `summary`
- `requiredSkills`
- `requiredExperience`
- `recommendedCerts`
- `toolsEnvironmentsLanguages`
- `nextStepConditions`
- `tags`
- `branchNote`

Important: `id` values in the sheet must exactly match the local node IDs in `src/data/careerData.ts`.

### 2. Edit structure / layout in code

Open `src/data/careerData.ts` when you need to change:

- node existence
- track / subtrack structure
- stage placement
- x / y positions
- coexist / related links
- all edges

### 3. Update the published Nodes sheet URL

Open `src/data/sheetSources.ts` when the published Google Sheets URL changes.

## Data Model

See `src/types/career.ts` for the full TypeScript schema.
Note that not every field below is loaded from Google Sheets today; several structural fields remain code-managed in `careerData.ts`.

Key fields:

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
2. **Full sheet-driven structure** — Move track/subtrack/stage/position/edge definitions from `careerData.ts` into external data when needed
3. **Japanese search synonyms** — Extend the search filter in `useCareerPathState.ts`
4. **Subtrack collapse/expand** — Add toggle state per subtrack in the ITサポート view
5. **Employee-specific view** — Layer a "current position" + "target position" overlay on top of the graph

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- @xyflow/react (React Flow) for the skill-tree graph
