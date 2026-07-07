<img width="100" src="./docs/icon.svg" alt="Treebit logo">

# Treebit — 每天一點點，長出你的習慣之樹

Treebit 是一個習慣養成追蹤網站。建立習慣、設定挑戰週數，為每一週安排任務並逐日打卡，看著累積的進度把一棵樹慢慢養大。

**🔗 Demo：** https://treebit-site.vercel.app/

![Treebit 首頁](./docs/home.png)

![Treebit 手機畫面](./docs/app-screen.png)

## ✨ 功能

- **習慣管理**：建立習慣並設定總週數，可重新命名、封存、恢復、刪除
- **每週任務與打卡**：每週自訂任務與目標天數，逐日勾選打卡；支援拖曳排序、一鍵匯入上週任務
- **進度視覺化**：每週達成率、整體進度、連續打卡天數（streak）、樹的成長階段
- **週記事**：為每一週留下筆記
- **歷史回顧**：封存完成的習慣，在歷史頁面回顧成果
- **好友系統**：以好友碼（TB-XXXX）互加好友，可選擇把習慣分享給好友唯讀檢視
- **深色模式**、響應式設計（手機底部導覽列）

#### 建立習慣

![Demo-01](./docs/demo-01.gif)

#### 新增每週任務、記事，及打卡

![Demo-02](./docs/demo-02.gif)

#### 封存任務

![Demo-03](./docs/demo-03.gif)

## 🛠 技術棧

| 分類     | 技術                                             |
| -------- | ------------------------------------------------ |
| 前端     | Next.js 15（App Router）、React 19               |
| 樣式     | Tailwind CSS 4、shadcn/ui（Radix UI）            |
| 表單驗證 | React Hook Form + Zod（前後端皆用 Zod）          |
| 後端     | Node.js / Express（ESM）                         |
| 認證     | JWT（httpOnly Cookie）+ Passport.js Google OAuth |
| 資料庫   | PostgreSQL（Supabase）                           |
| 部署     | Vercel（前端、後端各一個專案）                   |

**架構重點**：生產環境中，前端透過 Next.js rewrites 把 `/api/*` 代理到後端專案，瀏覽器只跟前端網域溝通——Cookie 是第一方、無 CORS 與第三方 Cookie 問題。

## 🗂 資料表設計

```
users ─┬─> habits ─> habit_weeks ─┬─> habit_week_tasks ─> habit_task_logs（打卡）
       │                          └─> habit_weekly_notes（週記事）
       └─ friendships（好友關係）
```

| Table              | 說明                                         |
| ------------------ | -------------------------------------------- |
| users              | 會員（本地帳號 / Google，含好友碼）          |
| habits             | 習慣（標題、總週數、封存狀態、好友可見性）   |
| habit_weeks        | 各習慣的週期與起始日                         |
| habit_week_tasks   | 每週任務與目標天數                           |
| habit_task_logs    | 每日打卡紀錄（UNIQUE(task_id, date)）        |
| habit_weekly_notes | 每週記事                                     |
| friendships        | 好友關係（pending / accepted，一對關係一列） |

- 完整 schema：`backend/schema-postgresql.sql`（全新建立資料庫用）
- 既有資料庫的增量調整：依序執行 `backend/migrations/` 內的 SQL

## 🚀 本地開發

### 1. 取得專案

```bash
git clone https://github.com/eatbear25/Treebit.git
cd Treebit
```

### 2. 準備資料庫（擇一）

**做法 A：本地 PostgreSQL（推薦）**

1. 安裝 [PostgreSQL](https://www.postgresql.org/download/)（附 pgAdmin）
2. 建立資料庫 `treebit`，執行 `backend/schema-postgresql.sql` 建立所有資料表

**做法 B：直連 Supabase**

把後端 `.env` 的 `DATABASE_URL` 指向 Supabase 連線字串（缺點：本地測試會動到雲端資料）。

### 3. 設定環境變數

前後端各有 `.env.example`，複製為 `.env` 填入實際值：

```bash
# backend/.env（重點欄位）
DATABASE_URL=postgresql://postgres:你的密碼@localhost:5432/treebit
JWT_SECRET=一段夠長的隨機字串    # 必填，未設定後端不會啟動
FRONTEND_URL=http://localhost:3000
# Google 登入（選用，不設定則停用 Google 登入）
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/redirect
```

### 4. 安裝與啟動

```bash
# 後端
cd backend && npm install && npm run dev   # http://localhost:3001

# 前端（另開終端機）
cd frontend && npm install && npm run dev  # http://localhost:3000
```

## ☁️ 部署（Vercel + Supabase）

前後端是**兩個獨立的 Vercel 專案**，部署順序：Supabase → 後端 → 前端 → Google OAuth。

### 1. Supabase（資料庫）

1. 建立專案後，到 **SQL Editor** 執行 `backend/schema-postgresql.sql`
2. 到 **Connect（連線資訊）** 複製 **Transaction pooler** 的連線字串（port `6543`）——Vercel 是 serverless，務必用 pooler，不要用 Direct connection（port 5432），否則連線數很快耗盡

### 2. 後端專案

Vercel 新增專案 → 匯入此 repo → **Root Directory 設為 `backend`** → 環境變數：

| 變數                   | 值                                                    |
| ---------------------- | ----------------------------------------------------- |
| `DATABASE_URL`         | Supabase Transaction pooler 連線字串（port 6543）     |
| `JWT_SECRET`           | 隨機長字串（可用 `openssl rand -base64 48` 產生）     |
| `NODE_ENV`             | `production`                                          |
| `FRONTEND_URL`         | 前端網址，如 `https://treebit-site.vercel.app`        |
| `GOOGLE_CLIENT_ID`     | Google OAuth 用戶端 ID                                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 用戶端密鑰                               |
| `GOOGLE_CALLBACK_URL`  | **前端網域** + `/api/auth/google/redirect`（見下方）  |

### 3. 前端專案

Vercel 再新增一個專案 → 同一個 repo → **Root Directory 設為 `frontend`** → 環境變數：

| 變數          | 值                                                       |
| ------------- | -------------------------------------------------------- |
| `BACKEND_URL` | 後端網址，如 `https://treebit-backend.vercel.app`（必填，rewrites 代理目標） |

### 4. Google OAuth（Google Cloud Console）

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → 建立 OAuth 2.0 用戶端 ID（網頁應用程式）
2. **已授權的重新導向 URI** 填：
   - `https://<前端網域>/api/auth/google/redirect`（生產）
   - `http://localhost:3001/api/auth/google/redirect`（本地開發）

> ⚠️ 生產環境的 callback 一定要走**前端網域**：Google 導回前端網域 → rewrites 代理到後端 → 後端的 Set-Cookie 落在前端網域，成為第一方 Cookie。若 callback 直接填後端網域，Cookie 會落在後端網域，前端拿不到登入狀態（跨網域第三方 Cookie 會被瀏覽器擋掉）。

### 5. 部署後檢查

- `https://<前端網域>/api/auth/me` 回傳 `{"success":true,...}` → 代理正常
- 註冊 / 登入 / Google 登入 / 打卡各流程走一遍
