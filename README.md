<img width="100" src="./docs/icon.svg" alt="Treebit logo">

## 📖 專案簡介

Treebit 是一個專注於習慣養成的網站，幫助使用者建立每日與每週的目標，透過勾選 checkbox 記錄每天是否完成，把幾週的累積進度視覺化呈現，讓養成新習慣的過程更有成就感。發想靈感來自筆記軟體，但進一步簡化流程，讓使用者能更直覺地建立並追蹤習慣。

使用者登入後即可：

- 建立 / 管理習慣，並設定挑戰的總週數
- 為每一週新增任務、記事，並逐日打卡
- 追蹤每週達成率與整體進度
- 封存已完成的習慣，並在歷史頁面回顧
- 所有資料皆儲存在資料庫中，跨裝置也能保留完整進度

## 🔗 Demo 網站：https://treebit-site.vercel.app/

部署：Vercel（前端 + 後端）、Supabase（PostgreSQL 資料庫）

```bash
# 測試帳號
帳號：wang
密碼：Ss5566123
```

![Treebit 首頁](./docs/home.png)

![Treebit 手機畫面](./docs/app-screen.png)

## ✨ 功能介紹

#### 建立習慣

![Demo-01](./docs/demo-01.gif)

#### 新增每週任務、記事，及打卡功能

![Demo-02](./docs/demo-02.gif)

#### 封存任務

![Demo-03](./docs/demo-03.gif)

## 🛠 技術棧

| 分類     | 技術                                                          |
| -------- | ----------------------------------------------------------- |
| 前端     | Next.js 15（App Router）、React 19                            |
| 樣式     | Tailwind CSS、shadcn/ui（Radix UI）                          |
| 表單驗證 | React Hook Form + Zod                                        |
| 後端     | Node.js / Express                                            |
| 認證     | JWT + Passport.js（本地帳號密碼 + Google OAuth）             |
| 資料庫   | Supabase（PostgreSQL）                                       |
| 部署     | Vercel（前端、後端）                                         |

> 認證採用 JWT，token 同時支援 httpOnly Cookie 與 Bearer Header；本地帳號以「帳號 + 密碼」登入，另支援 Google 第三方登入。

## 🚀 本地開發 / 測試

### 1. 取得專案

```bash
git clone https://github.com/eatbear25/Treebit.git
cd Treebit
```

### 2. 準備資料庫（PostgreSQL）

本專案使用 PostgreSQL，本地測試有兩種做法，擇一即可：

**做法 A：本地安裝 PostgreSQL（推薦）**

1. 下載並安裝 [PostgreSQL 官方安裝包](https://www.postgresql.org/download/windows/)（會一併安裝 GUI 工具 **pgAdmin**）。
   - 安裝時設定的 superuser（預設帳號 `postgres`）密碼請記下來。
2. 用 pgAdmin（或 [DBeaver](https://dbeaver.io/)，可同時連 MySQL / PostgreSQL）連線，建立一個資料庫，例如 `treebit`。
3. 開啟 SQL 編輯器，貼上並執行 `backend/schema-postgresql.sql` 建立所有資料表。

> 💡 MySQL Workbench 只能連 MySQL，無法連 PostgreSQL；請改用 pgAdmin 或 DBeaver。

**做法 B：直接連 Supabase 測試（免安裝）**

把後端 `.env` 的 `DATABASE_URL` 指向 Supabase 連線字串即可，不需在本機安裝資料庫（缺點是本地測試會動到雲端資料）。

### 3. 設定環境變數

前後端各有 `.env.example`，請複製為 `.env` 並填入實際值：

```bash
# 後端 backend/.env（重點欄位）
DATABASE_URL=postgresql://postgres:你的密碼@localhost:5432/treebit
JWT_SECRET=請填一段夠長的隨機字串   # 必填，未設定後端不會啟動
FRONTEND_URL=http://localhost:3000
# Google 登入（選用）
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/redirect
```

### 4. 安裝與啟動

```bash
# 後端
cd backend
npm install
npm run dev   # http://localhost:3001

# 前端（另開一個終端機）
cd frontend
npm install
npm run dev   # http://localhost:3000
```

開啟 http://localhost:3000，即可註冊帳號並開始使用。

## 🗂 資料表設計

| Table              | 說明                               |
| ------------------ | ---------------------------------- |
| users              | 會員資訊（本地帳號 / Google）      |
| habits             | 習慣設定（標題、總週數、封存狀態） |
| habit_weeks        | 各習慣的週期與起始日               |
| habit_week_tasks   | 每週任務與目標天數                 |
| habit_task_logs    | 每日打卡完成紀錄                   |
| habit_weekly_notes | 每週記事                           |

關聯結構：

```
users
 └─ habits
     └─ habit_weeks
         ├─ habit_week_tasks
         │   └─ habit_task_logs
         └─ habit_weekly_notes
```

- 完整 schema：`backend/schema-postgresql.sql`
- 若是「既有資料庫」要套用帳號（account）登入的調整，請執行 `backend/migrations/001_add_account.sql`
