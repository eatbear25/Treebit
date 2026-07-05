# 好友系統 v1 設計文件

日期：2026-07-05
狀態：已與需求方確認定案
範疇：好友關係＋習慣分享唯讀查看（**不含**聊天、共同目標）

## 1. 背景與目標

Treebit 目前是純個人的習慣追蹤工具。長期願景是讓使用者能與朋友互相督促（共同目標、即時聊天），本期先建立地基：**好友關係**與**把習慣開放給好友唯讀查看**。

成功標準：

- 使用者能透過好友碼互加好友（送出邀請 → 對方接受）
- 使用者能把單一習慣設為「好友可見」，好友可瀏覽其進度、打卡格與統計（唯讀）
- 未被授權的使用者直接輸入他人習慣網址，行為與現況一致（404，不洩漏存在性）

刻意不做（YAGNI，留待後續）：即時聊天（技術選型未定：Vercel 無法跑 socket.io，屆時再評估獨立 WS 伺服器 vs Supabase Realtime）、共同目標（多人共享習慣）、好友動態 feed、挑人分享（本期為全好友開關）、邀請連結、即時通知（badge 數進頁時撈取即可）、習慣自訂分類。

## 2. 命名與導覽

- Sidebar 新增第三個項目「**好友**」（不帶數字 badge），置於「習慣管理」與「歷史紀錄」之間。
- 路由：`/friends`（頁面群組 `(main)` 內，受既有 AuthGuard 保護）。
- Icon：Phosphor `PiUsersThree` / `PiUsersThreeFill`（沿用現有雙態 icon 模式）。
- 待確認邀請數顯示在頁內 tab 標籤上（「待確認邀請 (2)」），不放進 Sidebar。

## 3. 資料模型

新增 migration `backend/migrations/003_add_friends.sql`：

```sql
ALTER TABLE users  ADD COLUMN friend_code VARCHAR(8) UNIQUE;
ALTER TABLE habits ADD COLUMN visibility  VARCHAR(10) NOT NULL DEFAULT 'private';
                                          -- 'private' | 'friends'

CREATE TABLE friendships (
  id            SERIAL PRIMARY KEY,
  requester_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(10) NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted'
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
```

設計要點：

- **好友碼**：格式 `TB-XXXX`，字元集排除易混淆的 `0/O/1/I`（如 `23456789ABCDEFGHJKMNPQRSTUVWXYZ`）。首次呼叫 `GET /api/friends/me/code` 時惰性產生並寫入；碰撞時重試。選好友碼而非帳號搜尋的原因：Google 使用者 `account` 為 NULL 搜不到、隨機碼無帳號枚舉風險。
- **friendships 一對關係只存一列**（requester → addressee）。查詢好友關係時雙向比對：`WHERE (requester_id = $a AND addressee_id = $b) OR (requester_id = $b AND addressee_id = $a)`。婉拒邀請＝直接刪除該列（可再次邀請）；移除好友＝刪除該列。
- **visibility 只有兩值**：`'private'`（預設）與 `'friends'`（全部已接受的好友可見）。本期不做挑人分享，故不需要 habit_shares 關聯表。

## 4. 後端 API

### 4.1 架構決策：獨立 `routes/friends.js`，habits.js 權限一字不改

好友唯讀查看**不**修改既有 `GET /habits/:habitId` 的 owner-only 邏輯，而是另開獨立路由模組。理由：

- `routes/habits.js` 已 786 行、22 條路由全靠 `checkHabitOwner` 系列把關；在其中混入「owner 或好友」分支，一失手就把寫入路由開洞。
- 唯讀場景的資料需求不同（一次取回整包供翻閱），獨立端點可以聚合回傳，前端 viewer 不必逐週 lazy load。

`routes/friends.js` 全部路由掛 `authenticate`，統一以 `sendResponse()` 回傳：

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/friends/me/code` | 取得（無則產生）自己的好友碼 |
| POST | `/api/friends/requests` | body `{ code }`：依好友碼送出邀請 |
| GET | `/api/friends/requests` | 我收到的 pending 邀請（含對方 username） |
| PATCH | `/api/friends/requests/:id` | body `{ action: 'accept' \| 'decline' }`；僅 addressee 本人可操作 |
| GET | `/api/friends` | 已接受的好友列表（id、username、對我開放的習慣數） |
| DELETE | `/api/friends/:friendId` | 移除好友（刪 friendships 列，立即生效） |
| GET | `/api/friends/:friendId/habits` | 對方 `visibility='friends'` 且未封存的習慣卡（含進度聚合，欄位對齊既有 list API：`first_start_date`、`completed_logs`、`total_target_days`、`current_streak`、`weeks_with_tasks`） |
| GET | `/api/friends/habits/:habitId` | 唯讀詳情聚合：habit ＋ 全部 weeks ＋ tasks ＋ logs ＋ stats，一次回傳 |

`POST /requests` 的防呆（皆回 400，除查無此碼回 404）：查無此碼、自己加自己、已是好友、已有 pending（不論方向）。

共用權限 helper `checkFriendship(userIdA, userIdB)`：查 `status='accepted'` 的雙向關係。兩條唯讀路由的檢查順序：好友關係成立 → habit 屬於該好友 → `visibility='friends'` → 未封存；任一不符**一律回 404**（與現有「找不到該習慣」語義一致，不洩漏資源存在性）。

### 4.2 habits.js 唯一新增

`PATCH /api/habits/:habitId/visibility`（owner-only，走既有 `checkHabitOwner`）：body `{ visibility: 'private' | 'friends' }`，Zod 驗證枚舉值。

## 5. 前端頁面與 UX

全部遵循 design-system.md：暖白背景＋白卡浮起、文字綠用 `text-brand-700`、主要 CTA 斜角 `bg-brand-700 hover:bg-brand-800`、選中狀態用 `bg-card + shadow-sm` 不用淡綠底、「⋯」選單用 `PiDotsThreeBold`、刪除確認 AlertDialog 加 `bg-destructive` 且標題含對象名稱。

### 5.1 `/friends` 好友頁（兩個 tab）

版型對齊「我的習慣」頁：左上標題「好友」，右上斜角 CTA「+ 加好友」。

```
┌─ 好友 ─────────────────────────  [+ 加好友] ─┐
│  [ 好友 ]  [ 待確認邀請 (2) ]                  │  ← 選中 tab 白卡浮起
│                                              │
│  tab 1「好友」：                              │
│  │ Ⓜ 小美    分享 2 個習慣            [⋯]  │  ← 整列可點進 /friends/[id]
│  │ Ⓐ 阿明    尚未分享習慣             [⋯]  │     ⋯ 內含「移除好友」
│                                              │
│  tab 2「待確認邀請」：                         │
│  │ Ⓓ 大衛              [接受]  [婉拒]      │  ← 接受＝斜角實心、婉拒＝ghost
└──────────────────────────────────────────────┘
```

- 頭像沿用 ProfileDialog 的縮寫圓圈。
- 「+ 加好友」開 dialog（白底 `bg-card`）：上半顯示我的好友碼＋複製鈕（複製後 toast「已複製」）；下半輸入朋友的好友碼＋「送出邀請」斜角 CTA。送出成功 toast「邀請已送出」，錯誤依 API 訊息顯示（查無此碼／已是好友／已送過邀請）。
- 空狀態文案（直白、不玩雙關）：好友 tab「還沒有好友。把你的好友碼傳給朋友，一起養成習慣。」；邀請 tab「目前沒有新的邀請」。
- 移除好友需 AlertDialog 確認，標題「確定要移除好友「小美」嗎？」，說明文字提示「移除後對方將無法再看到你分享的習慣」。

### 5.2 三層查看動線

1. `/friends`（好友 tab）→ 點好友列
2. `/friends/[friendId]`：對方頁面。頁首「Ⓜ 小美」＋返回鍵；內容為對方開放的習慣卡格狀排列，**重用 `HabitCard` 加 `readOnly` prop**：保留進度條、達成率、streak、成長階段 icon，隱藏「⋯」選單，按鈕文字「查看任務」→「查看」。空狀態：「小美還沒有分享任何習慣」。
3. `/friends/[friendId]/habits/[habitId]`：唯讀詳情 viewer。**新開輕量頁面重用展示元件**（`WeekNavigation`、`TaskTable` 加 `readOnly` prop、`HabitStats`），不在既有詳情頁埋唯讀分支（該頁已 600+ 行且充滿 mutation handler）。可翻閱各週查看打卡歷史；打卡格純顯示不可點；無新增任務／記事按鈕。頁首顯示習慣名稱＋「小美的習慣」標註＋返回鍵。

資料來源：第 2 層打 `GET /api/friends/:friendId/habits`；第 3 層打 `GET /api/friends/habits/:habitId` 一次取回整包，週切換為純前端操作。

### 5.3 分享入口與可見性標示

- 習慣詳情頁「⋯」選單新增「分享給好友」開關項（Switch），切換即打 `PATCH /:habitId/visibility`，成功 toast「已開放好友查看」／「已改回私人」。
- 已分享的習慣，自己的卡片右上角顯示小型 `PiUsersThree` 徽章（tooltip「好友可見」）。
- **本期不做**習慣列表的分類 tab——僅有分享功能時徽章已足夠，segmented 分類（個人／共同）留到共同目標期。

### 5.4 隱私邊界（預設從嚴）

| 給好友看 | 不給看 |
|---|---|
| 習慣名稱、開始日、總週數 | **週記事**（habit_weekly_notes，最私密） |
| 各週任務與打卡格（唯讀） | 已封存習慣 |
| 統計 tiles、達成率、streak、成長階段 | 其他 `visibility='private'` 的習慣 |

關閉分享或移除好友**立即生效**：每次請求都重新驗證好友關係與 visibility，無快取。

### 5.5 順手修繕

既有詳情頁的錯誤狀態（「找不到該習慣」一行粗體字）加上「回習慣管理」返回按鈕與基本排版，供無權限／不存在時的著陸體驗。

## 6. 錯誤處理摘要

- 後端：好友碼查無 → 404；重複邀請／自加／已是好友 → 400（訊息區分）；非 addressee 操作邀請 → 403；唯讀路由任何權限不符 → 404。
- 前端：API 錯誤以 toast 呈現（沿用既有 `toast.error` 模式）；401 走既有的自動登出導回登入頁機制。

## 7. 實作順序與驗證

實作順序：

1. Migration `003_add_friends.sql`（**需在 Supabase 手動執行**，與 001/002 相同流程）
2. `routes/friends.js`（好友碼、邀請、列表、移除）＋ `index.js` 掛載
3. `/friends` 頁（兩 tab ＋ 加好友 dialog）＋ Sidebar 加項
4. `PATCH /:habitId/visibility` ＋ 詳情頁分享開關 ＋ 卡片徽章
5. 唯讀路由（`:friendId/habits`、`habits/:habitId`）＋ 第 2、3 層頁面（HabitCard／TaskTable 的 readOnly prop）
6. 錯誤頁修繕

手動驗證清單（專案無自動化測試，比照現有流程）：

- [ ] 兩個測試帳號互加好友：送邀請 → 接受 → 雙方列表都看得到
- [ ] 婉拒後可重新邀請；移除好友後列表消失
- [ ] 自加、重複邀請、亂碼皆得到正確錯誤訊息
- [ ] A 開分享 → B 能看到卡片與唯讀詳情、翻週看打卡；看不到週記事
- [ ] A 關分享（或移除 B）→ B 直接輸入原網址得到 404 畫面
- [ ] 非好友直接輸入 `/friends/habits/:id` API 與頁面皆 404
- [ ] 唯讀頁上點打卡格無任何反應、無編輯入口
- [ ] Google 帳號（account=NULL）能正常產生好友碼並互加

## 8. 未來擴充的接點（僅記錄，不實作）

- 共同目標：屆時新增 `habit_members` 表；唯讀 viewer 的雙排打卡格可基於本期 readOnly 元件擴充。
- 聊天：獨立 socket.io 伺服器（作品集展示）或 Supabase Realtime（零基建）擇一；`friendships` 表即為聊天授權依據。
- 挑人分享：`visibility` 增值 `'selected'` ＋ `habit_shares` 表，API 介面可維持不變。
