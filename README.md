# Career Path - キャリアパスモデル（育成面談用）

日本のSES企業向けに作成した、**React Flowベースのキャリアパス可視化ページ**です。  
育成面談・キャリア相談・評価設計のたたき台として使えるように、
**開発 / インフラ / ITサポート**をタブで切り替えながら、段階1〜6の進行をスキルツリー風に閲覧できます。

このREADMEは、**現在確定しているレイアウト基準**に合わせて更新しています。

---

## 1. 概要

このプロジェクトは、以下を一画面で扱うことを目的にしています。

- 区分ごとのキャリア段階（段階1〜6）
- Specialist / Manager の分岐
- 役割ごとの詳細情報（スキル、経験、資格、次ステップ条件 など）
- Google Sheets からの内容更新
- モバイルでの閲覧

UIは以下の構成です。

- 上部: タイトル / 区分タブ / 分類タブ
- 中段: 検索 / フィルタ / 凡例
- 左側: React Flow によるノードツリー
- 右側: 選択ノードの詳細パネル
- モバイル: 詳細ドロワー / フィルタドロワー / 操作チュートリアル

---

## 2. Quick Start

```bash
npm install
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:5173
```

本番ビルド:

```bash
npm run build
npm run preview
```

---

## 3. 使用技術

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- `@xyflow/react`（React Flow）

---

## 4. データの考え方

このページは、**レイアウト座標**と**表示内容**を分けて管理しています。

### レイアウト座標
- `src/data/careerData.ts`
- ノードの `id / track / subtrack / stage / pathType / position` を定義
- どのノードをどこに置くかはここが基準

### 表示内容
- `src/data/loadCareerDataFromSheets.ts`
- Google Sheets の公開CSVを読み込み
- `careerData.ts` の既存ノードIDに対して、内容だけを上書き
- シート取得に失敗した場合は fallback データを利用

つまり、**位置はコード管理 / 内容はSheets管理** の構成です。

---

## 5. 現在の画面仕様（確定版）

### 5-1. ノード表示ルール

- Specialist: 実線系
- Manager: **点線枠**
- Common: 共通ノード
- Stage 1 の共通ノードは横幅を広く取る
- 選択ノードは強調リング表示
- 接続ノードは弱めのハイライト表示

### 5-2. ノード幅

現在の基準は以下です。

- PC通常ノード: **156px**
- モバイル通常ノード: **148px**
- Stage 1 共通ノード: **236px**

関連CSS:
- `src/index.css`

### 5-3. ドラッグ制御

ノードは**マウスで直接ドラッグできないように固定**しています。

該当設定:
- `src/components/SkillTreeGraph.tsx`
- `nodesDraggable={false}`

### 5-4. エッジ表示ルール

- normal: 通常接続
- optional: 兼任可・補助的な接続（点線）
- cross-track: 区分をまたぐ補助接続

補足:
- インフラ / ITサポートの縦レーンは、**同じレーンのx座標を揃える方針**で見た目を安定させています
- 見た目を整える主手段は、エッジ種別の変更よりも**ノードのx位置統一**です

---

## 6. レイアウトの管理場所

調整内容ごとに、主に見るファイルは以下です。

### `src/data/careerData.ts`
ノードの座標管理。

主な用途:
- 各区分・分類の Specialist / Manager の x 座標
- Stage 1 共通ノードの x 座標
- 分類間のノードツリー距離

このファイルを触るケース:
- 開発 Web と モバイル の距離を変えたい
- インフラの サーバー と ネットワーク の間隔を変えたい
- 1段階ノードの中心位置を調整したい

### `src/components/StageLaneOverlay.tsx`
画面上部の分類ラベル・トラックラベルの位置管理。

主な用途:
- `Webアプリケーション` や `ネットワーク` の見出し位置
- `Specialist / Manager` ラベル位置
- 分類を区切る縦の破線位置

このファイルを触るケース:
- ノード位置は合っているのに、見出しだけズレて見える
- ラベル中央と Stage 1 ノード中央を合わせたい

### `src/components/SkillTreeGraph.tsx`
React Flow 側の描画制御。

主な用途:
- ノード / エッジ変換
- PC / モバイルでの微調整
- 初回 `fitView` の挙動
- レーン単位の x 軸整列
- ノードドラッグ禁止

このファイルを触るケース:
- モバイルだけ Stage 1 がズレる
- ある区分だけ縦のレーンが揃わない
- 初期表示位置やズーム感を調整したい

### `src/index.css`
全体の見た目管理。

主な用途:
- ノード幅
- Manager 点線枠
- hover / selected スタイル
- モバイル時のサイズ調整
- 特定ノードの折返し制御

---

## 7. 現在のレイアウト基準

以下は、今の画面で基準としている考え方です。

### 開発
- Webアプリケーション と モバイルアプリ の2分類
- 各分類で Specialist / Manager の2レーン
- Stage 1 は両レーンの中央に共通ノード
- PC / モバイルとも、**分類内トラック間距離はインフラと同じ基準**に揃える方針

### インフラ
- サーバー と ネットワーク の2分類
- 各分類で Specialist / Manager の2レーン
- Stage 1 は各分類中央に共通ノード
- 分類間の距離は、**開発と同じ見え方になること**を基準に調整

### ITサポート
- ITサポート / 情シス支援 / PMO支援 の3レーン
- 基本は単一レーン構成
- 縦方向の接続が読みやすくなるよう、同じ分類内の x 軸を揃える

---

## 8. ノードを追加・編集する方法

### 8-1. 新しいノードを追加する

`src/data/careerData.ts` に追加します。

```ts
{
  id: 'dev-web-sp-7',
  track: 'development',
  subtrack: 'Webアプリケーション',
  stage: 7,
  pathType: 'specialist',
  titleJa: '新しい役職名',
  shortLabel: '短縮名',
  summary: '説明',
  requiredSkills: [],
  requiredExperience: [],
  recommendedCerts: [],
  toolsEnvironmentsLanguages: [],
  nextStepConditions: [],
  tags: [],
  position: { x: 60, y: 950 },
}
```

### 8-2. エッジを追加する

```ts
{ source: 'dev-web-common-1', target: 'dev-web-sp-2', type: 'normal' }
{ source: 'dev-web-common-1', target: 'dev-web-mg-2', type: 'optional' }
```

### 8-3. 追加時の注意

- まず `id` 命名規則を既存に合わせる
- 先にノードを置き、その後に見出し位置を必要なら `StageLaneOverlay.tsx` で調整
- レーンの縦線が曲がる場合、エッジより先に **x 座標統一** を疑う

---

## 9. Google Sheets 連携

読み込み処理:
- `src/data/loadCareerDataFromSheets.ts`
- `src/data/sheetSources.ts`

前提:
- Google Sheets は公開CSVとして取得できる状態にする
- 必須列は最低限以下
  - `id`
  - `titleJa`
  - `shortLabel`

その他の列:
- `summary`
- `requiredSkills`
- `requiredExperience`
- `recommendedCerts`
- `toolsEnvironmentsLanguages`
- `nextStepConditions`
- `tags`
- `branchNote`

メモ:
- 複数値セルは `|` 区切り、または改行区切りで利用可能
- シートに存在しない `id` や不足している `id` はエラーになります

---

## 10. モバイル調整メモ

このプロジェクトは、PCとモバイルで完全に同じ見え方にはなりません。  
理由は以下です。

- ノード幅が異なる
- `fitView` の padding が異なる
- Stage 1 共通ノードの見え方が横幅差の影響を受けやすい

そのため、モバイルでは `SkillTreeGraph.tsx` 側で一部微調整を入れています。

モバイルだけズレるときの確認順は以下です。

1. `index.css` のノード幅
2. `careerData.ts` の共通ノード x
3. `SkillTreeGraph.tsx` のモバイル補正値
4. `StageLaneOverlay.tsx` のラベル位置

---

## 11. 主なファイル構成

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── CareerNode.tsx
│   ├── ControlBar.tsx
│   ├── DetailPanel.tsx
│   ├── LoadingSkeleton.tsx
│   ├── MobileDetailDrawer.tsx
│   ├── MobileFilterDrawer.tsx
│   ├── MobileGestureTutorial.tsx
│   ├── SkillTreeGraph.tsx
│   ├── StageLaneOverlay.tsx
│   ├── SubtrackTabs.tsx
│   └── TrackTabs.tsx
├── data/
│   ├── careerData.ts
│   ├── loadCareerDataFromSheets.ts
│   └── sheetSources.ts
├── hooks/
│   └── useCareerPathState.ts
├── types/
│   └── career.ts
└── utils/
    └── csv.ts
```

---

## 12. まず確認すべき修正ポイント早見表

### タイトルが2行になる
- `src/index.css`
- ノード幅 or 特定ノードの `white-space` を確認

### Stage 1 が中央からズレる
- `src/data/careerData.ts`
- `src/components/SkillTreeGraph.tsx`
- `src/components/StageLaneOverlay.tsx`

### Specialist / Manager の距離を変えたい
- `src/data/careerData.ts`
- `src/components/StageLaneOverlay.tsx`

### 分類同士の距離を変えたい
- `src/data/careerData.ts`
- `src/components/StageLaneOverlay.tsx`

### 縦のエッジが曲がる
- まず `src/data/careerData.ts` の x 軸を確認
- 次に `src/components/SkillTreeGraph.tsx` のレーン整列処理を確認

### ノードを動かせないようにしたい / 解除したい
- `src/components/SkillTreeGraph.tsx`
- `nodesDraggable` を確認

---

## 13. 今後拡張しやすいポイント

- 社員ごとの現在地 / 目標地点の表示
- 習熟度や保有資格のオーバーレイ
- 検索ワードの同義語対応
- 面談履歴や評価コメントの連携
- 部署や職種別の表示切替
- Sheets以外のCMS / API連携

---

## 14. 補足

この画面は、レイアウト調整が見た目に直結するため、  
**「ノード座標」 と 「見出し位置」 を別々に見て調整する**のが基本です。

特に以下を分けて考えると崩れにくいです。

- ノード自体の位置 → `careerData.ts`
- 見出し・ラベルの位置 → `StageLaneOverlay.tsx`
- PC / モバイル差分 → `SkillTreeGraph.tsx`
- サイズ / 折返し / 枠線 → `index.css`

