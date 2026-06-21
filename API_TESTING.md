# Treebit API 測試手冊（Postman 第一輪）

本文件涵蓋**所有** API 端點、測試步驟、測試案例與預期狀態，供用 Postman 做第一輪手動測試。

---

## 一、前置準備

### 1. 啟動後端
```bash
cd backend
npm install
# 建立 .env（至少要有 JWT_SECRET，缺少會 exit 1）
npm run dev          # http://localhost:3001
```
資料庫請先用 `backend/schema-postgresql.sql` 建好（全新建庫不要跑 migrations）。

### 2. Postman 變數設定
建立一個 Environment，加入：

| 變數 | 初始值 | 用途 |
|---|---|---|
| `baseUrl` | `http://localhost:3001` | 後端位址 |
| `token` | （空） | 登入後自動帶入 |
| `habitId` | （空） | 測試過程記下 |
| `weekId` | （空） | 測試過程記下 |
| `taskId` | （空） | 測試過程記下 |
| `noteId` | （空） | 測試過程記下 |

### 3. 認證方式（二選一）
後端 `authenticate` 同時支援 **Bearer Token** 與 **Cookie**：

- **方式 A（推薦）Bearer Token**：在 `register`/`login` 的 **Tests** 分頁貼下面腳本，自動把 token 存起來；再到 Collection 的 Authorization 設為 `Bearer Token` → `{{token}}`。
  ```js
  const json = pm.response.json();
  if (json?.data?.token) pm.environment.set("token", json.data.token);
  ```
- **方式 B Cookie**：Postman 會自動保存登入回傳的 `accessToken` cookie 並在同網域請求自動帶上，什麼都不用設。

> ⚠️ 不要兩種混用造成混亂；第一輪建議用方式 A。

### 4. 統一回傳格式
所有端點都回傳：
```jsonc
{
  "success": true | false,
  "message": "說明文字",     // 視情況
  "data": { ... } | [ ... ], // 視情況
  "errors": [ ... ]          // 僅驗證失敗時
}
```
判斷成功：看 **HTTP 狀態碼** + `success` 欄位。

---

## 二、建議測試流程（資料有相依，照順序跑最順）

```
1. GET  /test                      健康檢查
2. POST /api/auth/register         註冊 → 存 token
3. GET  /api/auth/me               確認身分
4. POST /api/habits                建立習慣 → 記 habitId
5. GET  /api/habits/:habitId/weeks 取週次 → 記 weekId
6. POST /api/habits/weeks/:weekId/tasks   建任務 → 記 taskId
7. PATCH /api/habits/tasks/:taskId/logs   打卡
8. GET  /api/habits/weeks/:weekId/logs    確認打卡
9. POST /api/habits/weeks/:weekId/notes   建筆記 → 記 noteId
10. GET /api/habits/:habitId/stats        看統計
11. PATCH .../archive → GET /archived → PATCH .../restore
12. DELETE 習慣（驗證連帶刪除）
```

---

## 三、端點逐項測試

> 🔓 = 免登入　🔒 = 需登入（要帶 token）

### 0. 健康檢查 🔓
| # | 方法 | 路徑 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 0-1 | GET | `{{baseUrl}}/test` | 200 | `{ "message": "test work!" }` |
| 0-2 | GET | `{{baseUrl}}/` | 200 | 服務資訊（含 version） |
| 0-3 | GET | `{{baseUrl}}/api/auth/` | 200 | `success:true`，列出 auth 端點 |
| 0-4 | GET | `{{baseUrl}}/api/不存在` | 404 | `success:false`，`message:"找不到請求的資源"` |

---

### 1. 註冊 `POST /api/auth/register` 🔓
Body（JSON）：
```json
{ "account": "testuser", "password": "test1234" }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 1-1 | 正常註冊 | 上方 body | **201** | `success:true`、`data.token`、Set-Cookie |
| 1-2 | 帳號重複 | 同一帳號再送一次 | **400** | `message:"此帳號已被註冊"` |
| 1-3 | 帳號太短 | `account:"a"` | **400** | `errors` 含「帳號至少需 2 個字」 |
| 1-4 | 密碼太短 | `password:"123"` | **400** | `errors` 含「密碼至少需 6 個字」 |
| 1-5 | 缺欄位 | `{}` | **400** | `message:"輸入資料驗證失敗"`、`errors` |
| 1-6 | 頻率限制 | 15 分鐘內連送 >20 次 | **429** | `message:"嘗試次數過多，請稍後再試"` |

---

### 2. 登入 `POST /api/auth/login` 🔓
Body：
```json
{ "account": "testuser", "password": "test1234" }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 2-1 | 正常登入 | 上方 body | **200** | `success:true`、`data.token`、Set-Cookie |
| 2-2 | 密碼錯誤 | `password:"wrong"` | **401** | `message:"登入失敗，請檢查帳號或密碼"` |
| 2-3 | 帳號不存在 | `account:"nobody"` | **401** | 同上（不洩漏哪個錯） |
| 2-4 | 缺欄位 | `{}` | **400** | `errors` |

---

### 3. 取得當前用戶 `GET /api/auth/me` 🔓（可帶可不帶）
| # | 案例 | 預期狀態 | 預期內容 |
|---|---|---|---|
| 3-1 | 已登入 | 200 | `data.user`：`{id, account, username, email, provider, created_at, last_login}` |
| 3-2 | 未登入（清掉 token/cookie） | 200 | `data.user: null` |

---

### 4. 修改顯示名稱 `PUT /api/auth/profile` 🔒
Body：
```json
{ "username": "新名字" }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 4-1 | 正常修改 | 上方 body | 200 | `message:"會員資料已更新"` |
| 4-2 | 名稱太短 | `username:"a"` | 400 | `errors`（至少 2 字） |
| 4-3 | 未帶 token | — | 401 | `message:"請先登入以繼續使用"`（`code:NO_TOKEN`） |

---

### 5. 更改密碼 `PUT /api/auth/change-password` 🔒
Body：
```json
{ "oldPassword": "test1234", "newPassword": "newpass123" }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 5-1 | 正常更改 | 上方 body | 200 | `message:"密碼更新成功"` |
| 5-2 | 舊密碼錯 | `oldPassword:"xxx"` | 401 | `message:"舊密碼錯誤"` |
| 5-3 | 新密碼太短 | `newPassword:"123"` | 400 | `errors`（至少 6 字） |
| 5-4 | 未帶 token | — | 401 | `NO_TOKEN` |
> 改完密碼後要用新密碼重新登入拿新 token。

### 6. Google 登入 🔓
`GET /api/auth/google`、`GET /api/auth/google/redirect` 是瀏覽器導向流程，**Postman 不適合測**，請用瀏覽器實測（且需設好 Google 憑證）。

---

### 7. 建立習慣 `POST /api/habits` 🔒
Body：
```json
{ "title": "每天喝水", "total_weeks": 4 }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 7-1 | 正常建立 | 上方 body | **201** | `data.habit_id`，並自動建立 4 週 |
| 7-2 | 缺標題 | `title:""` | 400 | `message:"標題為必填"` |
| 7-3 | 週數非法 | `total_weeks:0` 或 `100` 或 `"abc"` | 400 | `message:"總週數需為 1~52 的整數"` |
| 7-4 | 未帶 token | — | 401 | `NO_TOKEN` |
> 記下回傳的 `habit_id` → 設到環境變數 `habitId`。

---

### 8. 習慣查詢 / 封存 / 刪除 🔒
| # | 方法 | 路徑 | 預期狀態 | 說明 |
|---|---|---|---|---|
| 8-1 | GET | `/api/habits` | 200 | `data` 為未封存習慣陣列（新→舊） |
| 8-2 | GET | `/api/habits/{{habitId}}` | 200 | 單一習慣；不存在/非本人 → **404** |
| 8-3 | GET | `/api/habits/{{habitId}}/weeks` | 200 | 該習慣所有週次（記下一個 `weekId`） |
| 8-4 | PATCH | `/api/habits/{{habitId}}/archive` | 200 | `message:"封存習慣成功"` |
| 8-5 | GET | `/api/habits/archived` | 200 | 應出現剛封存的習慣 |
| 8-6 | PATCH | `/api/habits/{{habitId}}/restore` | 200 | `message:"恢復習慣成功"` |
| 8-7 | DELETE | `/api/habits/{{habitId}}` | 200 | 連帶刪週/任務/打卡/筆記（**不報錯**） |

權限案例：用**另一個帳號**的 token 打上面的 `archive/restore/weeks` → 預期 **403**；打 `GET /:habitId` → **404**。

---

### 9. 週次 `DELETE /api/habits/weeks/:weekId` 🔒
| # | 案例 | 路徑 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 9-1 | 刪除週次 | `/api/habits/weeks/{{weekId}}` | 200 | `message:"刪除週次成功"`（連帶刪任務/打卡/筆記） |
| 9-2 | 非本人 | 用他人 token | 403 | `message:"無權刪除此週次"` |

> 測完整流程時，這步建議放最後，否則會把後面要用的週次刪掉。

---

### 10. 每週任務 🔒
**建立** `POST /api/habits/weeks/{{weekId}}/tasks`
```json
{ "name": "喝 2000cc", "target_days": 7 }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 10-1 | 正常建立 | 上方 body | **201** | `data.task_id`（記到 `taskId`） |
| 10-2 | 缺名稱 | `name:""` | 400 | `message:"任務名稱必填"` |
| 10-3 | 目標天數非法 | `target_days:0`/`8`/`"x"` | 400 | `message:"目標天數需為 1~7 的整數"` |
| 10-4 | 非本人週次 | 他人 token | 403 | `message:"無權新增任務至此週次"` |

| # | 方法 | 路徑 | 預期 | 說明 |
|---|---|---|---|---|
| 10-5 | GET | `/api/habits/weeks/{{weekId}}/tasks` | 200 | 任務陣列 |
| 10-6 | PATCH | `/api/habits/weeks/{{weekId}}/tasks/{{taskId}}` | 200 | body 同建立；驗證規則相同 |
| 10-7 | DELETE | `/api/habits/tasks/{{taskId}}` | 200 | `message:"刪除任務成功"`（連帶刪打卡） |

---

### 11. 打卡 🔒
**更新打卡** `PATCH /api/habits/tasks/{{taskId}}/logs`
```json
{ "date": "2026-06-21", "is_completed": true }
```
| # | 案例 | 輸入 | 預期狀態 | 預期內容 |
|---|---|---|---|---|
| 11-1 | 打卡（新增） | 上方 body | 200 | `message:"更新打卡成功"` |
| 11-2 | 取消打卡（更新） | 同日期 `is_completed:false` | 200 | 同一筆被更新（不會重複） |
| 11-3 | 日期格式錯 | `date:"2026/6/21"` 或缺 | 400 | `message:"日期格式需為 YYYY-MM-DD"` |
| 11-4 | 非本人任務 | 他人 token | 403 | `message:"無權修改此任務打卡"` |

| # | 方法 | 路徑 | 預期 | 說明 |
|---|---|---|---|---|
| 11-5 | GET | `/api/habits/tasks/{{taskId}}/logs` | 200 | 單一任務打卡紀錄（依日期） |
| 11-6 | GET | `/api/habits/weeks/{{weekId}}/logs` | 200 | 整週打卡（含 `task_name`） |

> 🔁 **重整驗證**：打卡後再呼叫 11-5/11-6，`is_completed` 應為 `true`（對應前端「重整後打卡仍在」）。

---

### 12. 每週筆記 🔒
**新增** `POST /api/habits/weeks/{{weekId}}/notes`
```json
{ "content": "這週狀況不錯" }
```
| # | 方法 | 路徑 | 輸入 | 預期 | 預期內容 |
|---|---|---|---|---|---|
| 12-1 | POST | `/weeks/{{weekId}}/notes` | 上方 body | 201 | `data.note_id`（記到 `noteId`） |
| 12-2 | POST | 同上 | `content:""` | 400 | `message:"筆記內容不能為空"` |
| 12-3 | GET | `/weeks/{{weekId}}/notes` | — | 200 | 筆記陣列（依建立時間） |
| 12-4 | PATCH | `/weeks/{{weekId}}/notes/{{noteId}}` | `{content:"更新內容"}` | 200 | `message:"更新筆記成功"` |
| 12-5 | DELETE | `/weeks/{{weekId}}/notes/{{noteId}}` | — | 200 | `message:"刪除筆記成功"` |
| 12-6 | 任一 | 他人 token | — | 403 | 無權… |

（路徑前綴皆為 `/api/habits`）

---

### 13. 統計 `GET /api/habits/{{habitId}}/stats` 🔒
| # | 案例 | 預期狀態 | 預期內容 |
|---|---|---|---|
| 13-1 | 有打卡資料 | 200 | `data`：`total_weeks`、`total_logs`、`completed_logs`、`completion_rate`（**非 0**） |
| 13-2 | 非本人 | 403 | `message:"無權查看此習慣統計"` |
| 13-3 | 已封存的習慣 | 403 | 統計只算未封存習慣 |

---

## 四、跨端點重點案例彙整

| 類型 | 怎麼測 | 預期 |
|---|---|---|
| **未登入保護** | 任一 🔒 端點不帶 token | 401 `NO_TOKEN` |
| **Token 過期/亂填** | `Authorization: Bearer 亂碼` | 401 `INVALID_TOKEN`/`MALFORMED_TOKEN` |
| **越權存取** | A 建資料，用 B 的 token 操作 A 的資源 | weeks/tasks/notes/stats → 403；`GET /habits/:id` → 404 |
| **連帶刪除** | 刪習慣後查其週/任務/打卡 | 全部查不到（CASCADE） |
| **打卡冪等** | 同 taskId+date 連打兩次 | 只會有一筆（UNIQUE task_id+date） |
| **時區正確性** | 建習慣後看第一週 `start_date` | 應等於**台灣今天**（非 UTC 昨天/明天） |

---

## 五、測試後清理
```sql
-- 直接清掉測試帳號（會 CASCADE 連帶刪光其習慣資料）
DELETE FROM users WHERE account = 'testuser';
```

---

## 附錄：完整端點索引（共 32 條）

| # | 方法 | 路徑 | 認證 |
|---|---|---|---|
| 1 | GET | `/test` | 🔓 |
| 2 | GET | `/` | 🔓 |
| 3 | GET | `/api/auth/` | 🔓 |
| 4 | POST | `/api/auth/register` | 🔓 |
| 5 | POST | `/api/auth/login` | 🔓 |
| 6 | POST | `/api/auth/logout` | 🔓 |
| 7 | GET | `/api/auth/me` | 🔓* |
| 8 | PUT | `/api/auth/profile` | 🔒 |
| 9 | PUT | `/api/auth/change-password` | 🔒 |
| 10 | GET | `/api/auth/google` | 🔓 |
| 11 | GET | `/api/auth/google/redirect` | 🔓 |
| 12 | POST | `/api/habits` | 🔒 |
| 13 | GET | `/api/habits` | 🔒 |
| 14 | GET | `/api/habits/archived` | 🔒 |
| 15 | GET | `/api/habits/:habitId` | 🔒 |
| 16 | DELETE | `/api/habits/:habitId` | 🔒 |
| 17 | PATCH | `/api/habits/:habitId/archive` | 🔒 |
| 18 | PATCH | `/api/habits/:habitId/restore` | 🔒 |
| 19 | GET | `/api/habits/:habitId/weeks` | 🔒 |
| 20 | DELETE | `/api/habits/weeks/:weekId` | 🔒 |
| 21 | POST | `/api/habits/weeks/:weekId/tasks` | 🔒 |
| 22 | GET | `/api/habits/weeks/:weekId/tasks` | 🔒 |
| 23 | PATCH | `/api/habits/weeks/:weekId/tasks/:taskId` | 🔒 |
| 24 | DELETE | `/api/habits/tasks/:taskId` | 🔒 |
| 25 | PATCH | `/api/habits/tasks/:taskId/logs` | 🔒 |
| 26 | GET | `/api/habits/tasks/:taskId/logs` | 🔒 |
| 27 | GET | `/api/habits/weeks/:weekId/logs` | 🔒 |
| 28 | POST | `/api/habits/weeks/:weekId/notes` | 🔒 |
| 29 | GET | `/api/habits/weeks/:weekId/notes` | 🔒 |
| 30 | PATCH | `/api/habits/weeks/:weekId/notes/:noteId` | 🔒 |
| 31 | DELETE | `/api/habits/weeks/:weekId/notes/:noteId` | 🔒 |
| 32 | GET | `/api/habits/:habitId/stats` | 🔒 |

> *`/api/auth/me` 用 optional 認證：帶 token 回用戶資料，不帶則回 `user:null`。
