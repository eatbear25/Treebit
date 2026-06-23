# Treebit Design System

品牌方向：**Calm Organic（平靜自然）**。核心：「Small bits, big growth — 小小累積，慢慢成林」。
所有顏色以 CSS 變數（token）定義於 `app/_styles/globals.css`，元件一律使用 token，勿再寫死 hex。

## 01 TYPOGRAPHY

- **字體**
  - 中文主體：`Noto Sans TC`（`var(--font-noto)`，body 預設）
  - Latin / 數字：`Outfit`（`.font-outfit` → `var(--font-outfit)`）
  - 數據數字加 `.tnum`（`font-variant-numeric: tabular-nums`）
- **字重**：400 / 500 / 600 / 700 / (800–900 標題)
- **行高**：內文 1.5，標題 1.2

## 02 COLORS（sage 主色系）

品牌色階 `--brand-50 … --brand-900`：

| Token | Hex | 用途 |
|---|---|---|
| `--brand-50`  | `#F1F5F1` | 背景暈染、未打卡格底、圖表底 |
| `--brand-100` | `#E3ECE4` | 裝飾、active 底、hover |
| `--brand-200` | `#C6D8C0` | accent / input focus ring |
| `--brand-300` | `#A7C3A4` | hover 邊框 |
| `--brand-400` | `#8BAE89` | 圖表 |
| `--brand-500` | `#7BA17D` | ★ 主色 primary |
| `--brand-600` | `#5E8466` | hover / active |
| `--brand-700` | `#4F6F58` | 標題、已完成、強調 |
| `--brand-800` | `#3C5645` | — |
| `--brand-900` | `#2C3F33` | 深色文字 |

語義 token：`--primary`(=brand-500) / `--primary-foreground`(#fff) / `--surface`(#F6F5F0 頁面暖白) / `--card`(#fff) / `--muted`(#EFEEE8) / `--muted-foreground`(#8A8F86) / `--border`(#E5E3DA) / `--foreground`(#2E322E) / `--ring`(brand-200) / `--destructive`(#CC5C52)。

特殊：`--streak`(#E0A458 暖蜜色，**僅 streak / 統計重點使用**) + `--streak-foreground`。
圖表：`--chart-1…5`（sage 家族 + 對比暖色 #C9A66B）。

> 單一強調色原則：sage 為全站唯一 accent；streak 暖色不得外溢到一般 CTA／badge。

## 03 RADIUS & SHADOW

- `--radius: 0.875rem`（14px）。`rounded-lg`=14、`rounded-xl`=18、`rounded-2xl`=24。
- 卡片用較大圓角 + sage 染色柔陰影（如 `shadow-[0_10px_30px_-14px_rgba(79,111,88,0.25)]`），不用純黑陰影。
- 招牌斜角按鈕 `rounded-tl-xl rounded-br-xl` 為唯一刻意破格，保留為品牌記憶點。

## 04 BUTTONS（`components/ui/button.jsx`）

- **default / treebit**：`bg-primary` text-white，hover `bg-brand-600`，`active:scale-[0.98]`
- **outline / secondary / ghost**：走 shadcn token
- 互動三態：hover（位移/底色）、active（scale）、focus-visible（ring）

## 05 WHITESPACE

Spacing（px）：2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 128

## 06 LOGO

`public/icon.svg` ＝ ①成長階段樹（樹苗）。成長階段（種子→幼苗→樹苗→大樹）見 `public/logo-growth-stages.svg`，供未來隨 streak 演進使用。
