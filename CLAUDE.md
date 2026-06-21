# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

Treebit 是一個習慣養成追蹤網站，使用者可以建立習慣、設定每週任務並逐日打卡記錄進度。

技術架構：
- **前端**：Next.js 15（App Router）+ React 19 + Tailwind CSS + shadcn/ui
- **後端**：Node.js + Express
- **認證**：JWT + Passport.js（本地「帳號 + 密碼」與 Google OAuth）
- **資料庫**：Supabase（PostgreSQL）
- **部署**：Vercel（前端與後端皆部署於 Vercel）

## 開發指令

### 前端（frontend/）
```bash
npm install          # 安裝依賴
npm run dev          # 開發伺服器 (http://localhost:3000)
npm run build        # 生產環境建置
npm run start        # 啟動生產伺服器
npm run lint         # 執行 ESLint 檢查
```

### 後端（backend/）
```bash
npm install          # 安裝依賴
npm run dev          # 開發伺服器 (http://localhost:3001, 使用 nodemon)
npm start            # 啟動生產伺服器
```

### 環境變數設定
- 前後端各有 `.env.example`，需複製為 `.env` 並填入實際值
- 前端：以 `NODE_ENV` 判斷 API 位址（開發連 `http://localhost:3001`，生產走 Next.js rewrites 代理）
- 後端：`DATABASE_URL`（Supabase）、`JWT_SECRET`（必填，未設定後端會直接終止）、`FRONTEND_URL`（CORS 白名單）、Google OAuth 等

## 架構設計

### 資料庫結構
核心資料表關聯：
```
users (會員)
  └─> habits (習慣)
        └─> habit_weeks (週期)
              ├─> habit_week_tasks (任務)
              │     └─> habit_task_logs (打卡記錄)
              └─> habit_weekly_notes (週記事)
```

重要欄位：
- `users.provider`: 'local' 或 'google'
- `users.account`: 本地登入帳號（Google 帳號為 NULL，有 `provider='local'` 的部分唯一索引）
- `users.username`: 顯示名稱（可於會員資料修改；註冊時預設等於 account）
- `habits.is_archived`: 封存狀態（BOOLEAN）
- `habit_task_logs.is_completed`: 打卡狀態（BOOLEAN）

所有外鍵皆設定 `ON DELETE CASCADE`，刪除 habit / week 會自動連帶刪除底下資料。

### 後端架構（backend/）

**進入點**：`index.js`
- Express 應用主檔案；啟動前檢查 `JWT_SECRET`，缺少即終止
- CORS：動態白名單（`FRONTEND_URL`，逗號分隔多網址）
- 路由掛載：`/api/auth`、`/api/habits`

**路由模組**：
- `routes/auth.js`：註冊、登入、登出、Google OAuth、`/me`、會員資料、改密碼（登入/註冊有 `express-rate-limit` 防暴力嘗試）
- `routes/habits.js`：習慣 CRUD、週期、任務、打卡、週記事、統計

**中間件**：`middlewares/authenticate.js`
- `authenticate`：必須登入；`optionalAuthenticate`：可選登入
- 支援 Bearer Token（header）與 Cookie 兩種方式

**設定 / 工具**：
- `config/connect-postgresql.js`：PostgreSQL 連線池，並包裝成與 mysql2 相容的 `[rows, fields]` 回傳格式、把 `?` 轉成 `$1`；另設定 DATE(1082) parser 直接回傳字串避免時區位移
- `config/passport.js`：Google OAuth Strategy
- `utils/date.js`：`getTaiwanTodayYMD()`、`addDaysToYMD()`（純日期字串運算）

**資料庫 Schema**：
- `schema-postgresql.sql`（全新建立用）
- `migrations/`（既有資料庫的增量調整，如 `001_add_account.sql`）

### 前端架構（frontend/）

**Next.js App Router 結構**：
```
app/
  ├─ (auth)/              # 認證頁面（login、register）
  │   └─ _components/     # LoginForm、RegisterForm、AuthHeader
  ├─ (main)/              # 主要功能（需登入）
  │   ├─ habits/          # 習慣管理（含 [habitId] 動態路由）
  │   ├─ history/         # 歷史記錄（含 [historyId] 動態路由）
  │   └─ layout.js        # 含 Sidebar
  └─ _components/         # 全域元件（AuthGuard、GuestGuard 等）
```

**關鍵模組**：
- `contexts/AuthContext.js`：全域認證狀態（`user`, `isAuthenticated`, `loading`, `initialized`）；方法 `login()`, `logout()`, `refreshUser()`；透過 `/api/auth/me` 取得當前使用者
- `utils/auth.js`：認證 API 呼叫（`login(account, password)`、`register(account, password)`、`logout`、`getCurrentUser`）
- `lib/utils.js`：`cn()`、日期工具（見下方時區處理）

### 認證流程

**JWT 認證**：
- token 存放：httpOnly Cookie 與 Bearer Header 雙重支援
- 生命週期：預設 7 天（`JWT_EXPIRES_IN`）
- Cookie：生產環境 `secure: true` + `sameSite: 'none'`

**本地登入**：以 `account`（帳號）+ 密碼登入，不使用 email。

**Google OAuth**：前端導向 `/api/auth/google` → Passport 處理 → callback `/api/auth/google/redirect` → 後端設 JWT Cookie 並導回前端 `/habits`。

### 習慣管理邏輯
- 建立習慣時指定 `total_weeks`，後端以「台灣時區今天」為第一週起始日，逐週建立 `habit_weeks`
- 每週可建立多個任務（`target_days` 目標天數），打卡記錄存於 `habit_task_logs`（date + is_completed）
- 封存：`habits.is_archived = true`，不出現在主列表，可於歷史頁查看

## 開發注意事項

### 資料庫查詢
- 透過 `connect-postgresql.js` 的相容層，查詢仍可用 `?` 佔位符與 `[rows]` 解構（內部轉為 pg 的 `$1`）
- 新增資料取 id 用 PostgreSQL 的 `RETURNING id`
- boolean 欄位請用 `true`/`false`（不是 0/1）；前端判斷打卡狀態用 `=== true`
- 所有查詢使用參數化語句；習慣/週期操作前以 `checkHabitOwner` / `checkWeekOwner` 等驗證擁有者

### 時區處理（重要）
- **純日期**（`start_date`、打卡 `date`，DATE 型別）：一律當字串 `YYYY-MM-DD` 處理，不要丟進 `new Date()` 做運算
  - 後端：`utils/date.js` 的 `getTaiwanTodayYMD()`、`addDaysToYMD()`
  - 前端：`lib/utils.js` 的 `formatDateToLocalYMD()`、`addDaysToYMD()`、`getWeekDates()`
- **時間戳**（`created_at`、`updated_at`，TIMESTAMP）：顯示時用 `lib/utils.js` 的 `formatTimestampToTaiwanYMD()`（以 `Asia/Taipei` 轉換），不要直接 `.split('T')`

### 錯誤處理
- 後端統一以 `sendResponse()` 回傳 JSON（habits）
- 前端認證錯誤（401）自動清除 token 並導回登入頁；token 過期中間件會清除 Cookie 並回傳 `requireLogin: true`

### 表單驗證
- 前端：React Hook Form + Zod
- 後端：Zod schema（`registerSchema`, `loginSchema` 等）

## 測試帳號
```
帳號：wang
密碼：Ss5566123
```

## Demo 網站
https://treebit-site.vercel.app/
