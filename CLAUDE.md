# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

Treebit 是一個習慣養成追蹤網站，使用者可以建立習慣、設定每週任務並記錄打卡進度。

技術架構：
- **前端**：Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **後端**：Node.js + Express
- **認證**：JWT + Passport.js（支援本地與 Google OAuth）
- **資料庫**：MySQL
- **部署**：Vercel（前後端）+ Railway（MySQL）

## 開發指令

### 前端（frontend/）
```bash
npm install          # 安裝依賴
npm run dev         # 開發伺服器 (http://localhost:3000)
npm run build       # 生產環境建置
npm run start       # 啟動生產伺服器
npm run lint        # 執行 ESLint 檢查
```

### 後端（backend/）
```bash
npm install          # 安裝依賴
npm run dev         # 開發伺服器 (http://localhost:3001, 使用 nodemon)
npm start           # 啟動生產伺服器
```

### 環境變數設定
- 前後端各有 `.env.example`，需複製為 `.env` 並填入實際值
- 前端：`NEXT_PUBLIC_API_URL` 設定後端 API 網址
- 後端：資料庫連線、JWT Secret、Google OAuth、CORS 白名單等

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
- `users.provider`: 'local' 或 'google'（第三方登入）
- `habits.is_archived`: 封存狀態
- `habit_task_logs.is_completed`: 打卡狀態

### 後端架構（backend/）

**進入點**：`index.js`
- Express 應用主檔案
- CORS 設定：動態白名單（`FRONTEND_URL` 環境變數）
- 路由掛載：`/api/auth`、`/api/habits`

**路由模組**：
- `routes/auth.js`：註冊、登入、登出、Google OAuth、`/me` 端點
- `routes/habits.js`：習慣 CRUD、週期管理、任務與打卡、週記事
- `routes/docs/`：API 文件（Markdown）

**中間件**：
- `middlewares/authenticate.js`：
  - `authenticate`：必須登入（檢查 JWT）
  - `optionalAuthenticate`：可選登入
  - 支援 Bearer Token（header）與 Cookie 兩種方式

**設定檔**：
- `config/connect-mysql.js`：MySQL 連線池（支援 `DATABASE_URL` 或個別環境變數）
- `config/passport.js`：Google OAuth Strategy

**資料庫 Schema**：`schema.sql`（包含所有資料表結構）

### 前端架構（frontend/）

**Next.js App Router 結構**：
```
app/
  ├─ (auth)/              # 認證頁面群組（無需登入）
  │   ├─ login/
  │   ├─ register/
  │   └─ _components/     # 認證相關元件
  ├─ (main)/              # 主要功能（需登入）
  │   ├─ habits/          # 習慣管理（含動態路由 [habitId]）
  │   ├─ history/         # 歷史記錄（含動態路由 [historyId]）
  │   └─ layout.js        # 包含 Sidebar
  └─ _components/         # 全域元件（AuthGuard、GuestGuard）
```

**關鍵元件**：
- `contexts/AuthContext.js`：
  - 提供全域認證狀態（`user`, `isAuthenticated`, `loading`, `initialized`）
  - 方法：`login()`, `logout()`, `refreshUser()`
  - 透過 `/api/auth/me` 端點取得當前使用者

- `_components/AuthGuard.jsx`：保護需登入的頁面
- `_components/GuestGuard.jsx`：保護只允許訪客的頁面（如登入頁）
- `_components/Sidebar.jsx`：主要導航（習慣列表、封存、歷史）

**工具模組**：
- `utils/auth.js`：認證 API 呼叫（登入、註冊、登出、取得當前用戶）
- `lib/utils.js`：工具函式（如 `cn()` 用於 Tailwind 類別合併）

**UI 元件**：
- `components/ui/`：shadcn/ui 元件（button、dialog、form、input 等）
- 使用 Radix UI primitives
- Tailwind CSS 樣式（參考 `design-system.md`）

**樣式系統**：
- 主色：`#3D8D7A`（綠色系）
- 字型：Roboto, sans-serif
- 間距系統：2/4/8/12/16/24/32/48/64/80/96/128 px

### 認證流程

**JWT 認證**：
- Token 存放：Cookie（httpOnly）與 Bearer Header 雙重支援
- 生命週期：預設 7 天（`JWT_EXPIRES_IN`）
- Cookie 設定：生產環境使用 `secure: true` + `sameSite: 'none'`

**Google OAuth 流程**：
1. 前端導向 `/api/auth/google`
2. Passport.js 處理 Google 認證
3. Callback 至 `/api/auth/google/redirect`
4. 後端設定 JWT Cookie 並導向前端
5. 前端呼叫 `login()` 觸發 `refreshUser()` 更新狀態

### 習慣管理邏輯

**習慣與週期**：
- 建立習慣時指定 `total_weeks`（總週數）
- 每個習慣可有多個 `habit_weeks`（週期記錄）
- 週期包含 `start_date` 與 `week_number`

**任務與打卡**：
- 每週期可建立多個 `habit_week_tasks`（任務）
- 任務有 `target_days`（目標天數）
- 打卡記錄存在 `habit_task_logs`（date + is_completed）
- 台灣時區處理：使用 `getTaiwanDate()` 函式（UTC+8）

**封存功能**：
- `habits.is_archived = 1` 標記為封存
- 封存的習慣不會出現在主列表，但可在歷史頁面查看

## 開發注意事項

### 資料庫查詢
- 使用 `mysql2` 的 Promise API
- 所有查詢使用參數化語句防止 SQL Injection
- 權限檢查：習慣/週期操作前必須驗證 `user_id` 對應關係（`checkHabitOwner`, `checkWeekOwner`）

### 錯誤處理
- 後端統一使用 `sendResponse()` 函式回傳 JSON
- 前端認證錯誤自動清除 Token 並重新導向登入頁
- Token 過期處理：中間件自動清除 Cookie 並回傳 `requireLogin: true`

### CORS 配置
- 白名單機制：環境變數 `FRONTEND_URL` 支援逗號分隔多個網址
- 生產環境須設定正確的前端網址
- `credentials: true` 允許 Cookie 傳遞

### 表單驗證
- 前端：React Hook Form + Zod（`@hookform/resolvers`）
- 後端：Zod schema 驗證（`registerSchema`, `loginSchema` 等）
- 雙重驗證確保資料完整性

### 時區處理
- 伺服器使用 `getTaiwanDate()` 統一處理台灣時區（UTC+8）
- 打卡日期以台灣當日 00:00:00 為準
- 資料庫 `time_zone = "+00:00"` 設定

## 測試帳號
```
帳號：wang@test.com
密碼：Ss5566123
```

## Demo 網站
https://treebit-site.vercel.app/
