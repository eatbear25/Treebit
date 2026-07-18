# CLAUDE.md

所有回答一律使用繁體中文。

## 專案概述

Treebit：習慣養成追蹤網站。使用者建立習慣（設定總週數）→ 每週建任務（目標天數）→ 逐日打卡。另有好友系統（好友碼加好友、唯讀檢視好友分享的習慣）。

- 前端 `frontend/`：Next.js 15 App Router + React 19 + Tailwind CSS 4 + shadcn/ui（JavaScript，非 TypeScript）
- 後端 `backend/`：Express（ESM）+ pg 直連 PostgreSQL（Supabase）
- 認證：JWT（httpOnly Cookie 為主，亦支援 Bearer Header）+ Passport Google OAuth
- 部署：前後端各一個 Vercel 專案；生產環境前端用 rewrites 把 `/api/*` 代理到後端，瀏覽器只看到前端網域（同源，無 CORS / 第三方 Cookie 問題）

開發指令：`backend/` 跑 `npm run dev`（port 3001）、`frontend/` 跑 `npm run dev`（port 3000）。

## 鐵則（違反會出 bug）

1. **純日期永遠是字串**：`start_date`、打卡 `date`（DATE 型別）一律以 `"YYYY-MM-DD"` 字串處理，**禁止丟進 `new Date()` 做運算**。加減天數用 `addDaysToYMD()`、「今天」用 `getTaiwanTodayYMD()`（台灣時區）——後端在 `utils/date.js`、前端在 `lib/utils.js`。
2. **時間戳顯示**：`created_at` / `updated_at`（TIMESTAMPTZ）顯示時用前端 `formatTimestampToTaiwanYMD()`，不要 `.split('T')`。
3. **boolean 用 `true`/`false`**（不是 0/1）；前端判斷打卡狀態用 `=== true`。
4. **所有 SQL 都要參數化**。`db.query(sql, params)` 會把 `?` 依序轉成 `$1, $2…`，回傳 mysql2 相容的 `[rows, fields]`；需要交易時用 `db.pool.connect()` + `$N` 原生寫法。
5. **每個 habits / friends 路由都必須先驗證擁有權**再操作：`checkHabitOwner` / `checkWeekOwner` / `checkTaskOwner` / `checkNoteOwner`（habits.js 頂部）、好友資料用 `checkFriendship`（friends.js）。
6. 新增資料取 id 用 `RETURNING id`。
7. habits / friends 路由回應一律用 `sendResponse(res, status, success, data, message)`；auth.js 直接 `res.json({ success, message, data })`。
8. 前後端表單／輸入驗證都用 Zod。

## 資料庫

```
users ─┬─> habits ─> habit_weeks ─┬─> habit_week_tasks ─> habit_task_logs
       │                          └─> habit_weekly_notes
       └─ friendships（一對關係只存一列，status: pending/accepted，查詢需雙向比對）
```

重要欄位：

- `users.provider`：`'local'` 或 `'google'`；`users.account`：本地登入帳號（Google 為 NULL）；`users.username`：顯示名稱；`users.friend_code`：好友碼 TB-XXXX（首次進好友頁惰性產生）
- `habits.is_archived`（封存）、`habits.visibility`（`'private'` | `'friends'`）
- `habit_task_logs`：UNIQUE(task_id, date)，`is_completed` BOOLEAN

所有外鍵 `ON DELETE CASCADE`（刪 habit 會連帶刪除底下所有資料）。完整 schema 在 `backend/schema-postgresql.sql`；改 schema 時要同步新增 `backend/migrations/00X_*.sql`。

## 檔案地圖

後端：

- `index.js`：進入點（啟動前檢查 JWT_SECRET）、CORS 白名單（FRONTEND_URL，可逗號分隔多網域）
- `routes/auth.js`：註冊、登入（authLimiter 限流）、登出、/me、會員資料、改密碼、Google OAuth
- `routes/habits.js`：習慣 CRUD、週期、任務、打卡、週記事、統計（連續達標週數在程式端用 `computeWeeklyStreak` 算：週執行率＝各任務完成次數以目標封頂加總 ÷ 目標加總，達 85% 即該週達標，取自《The 12 Week Year》）
- `routes/friends.js`：好友碼、邀請、好友列表、好友習慣唯讀檢視
- `middlewares/authenticate.js`：`authenticate`（必須登入）/ `optionalAuthenticate`
- `config/connect-postgresql.js`：連線池 + DATE(1082) parser 直接回字串（時區安全的關鍵）
- `config/passport.js`：Google Strategy（沒設憑證時自動停用）

前端：

- `app/(auth)/`：login、register；`app/(main)/`：habits（含 `[habitId]`）、history（含 `[historyId]`）、friends（含 `[friendId]`）
- `app/_components/`：AuthGuard（未登入導 /login）、GuestGuard、Sidebar 等
- `contexts/AuthContext.js`：`user`、`isAuthenticated`、`initialized`；`login()` / `logout()` / `refreshUser()`
- `utils/auth.js`：`apiRequest()`（帶 credentials，401 自動導回 /login）
- `lib/utils.js`：`cn()` 與所有日期工具
- `lib/api.js`：`API_BASE_URL` 唯一出口（開發直連 localhost:3001，生產空字串走相對路徑由 rewrites 代理）——所有 fetch 都 `import { API_BASE_URL } from '@/lib/api'`，不要在各檔案自己宣告

## 認證重點

- 本地登入用 account + 密碼（不用 email）
- Google OAuth：前端連 `/api/auth/google` → callback `/api/auth/google/redirect` → 後端設 Cookie 並導回 `${FRONTEND_URL}/habits`。生產環境 callback URL 必須用**前端網域**（經 rewrites 代理），Cookie 才會是第一方
- Token 過期：後端清 Cookie 回 `requireLogin: true`（401），前端導回 /login
