# Supabase PostgreSQL 遷移指南

## 第一步：註冊 Supabase 並建立專案

1. 前往 https://supabase.com/
2. 點擊 "Start your project" 並使用 GitHub 登入
3. 建立新專案：
   - Name: `Treebit`
   - Database Password: **請記下這個密碼！**
   - Region: 選擇 `Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`
   - 點擊 "Create new project"
4. 等待 2-3 分鐘讓專案建立完成

## 第二步：取得資料庫連線資訊

1. 在 Supabase 專案頁面，點擊左側選單的 **"Project Settings"**（齒輪圖示）
2. 點擊 **"Database"**
3. 找到 **"Connection string"** 區塊
4. 選擇 **"URI"** 模式
5. 複製連線字串，格式如下：
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@xxxxx.supabase.co:5432/postgres
   ```
6. 將 `[YOUR-PASSWORD]` 替換成您剛才設定的密碼

## 第三步：在 Supabase 執行資料庫 Schema

1. 在 Supabase 專案頁面，點擊左側選單的 **"SQL Editor"**
2. 點擊 **"New Query"**
3. 複製 `backend/schema-postgresql.sql` 的內容貼到編輯器
4. 點擊 **"Run"** 執行
5. 確認所有資料表都建立成功（左側會出現 users, habits 等表格）

## 第四步：更新後端程式碼

### 4.1 安裝新套件

```bash
cd backend
npm install pg
npm uninstall mysql2 express-mysql-session
```

### 4.2 修改所有檔案中的資料庫引用

將所有檔案中的：
```javascript
import db from "../config/connect-mysql.js";
```

改為：
```javascript
import db from "../config/connect-postgresql.js";
```

需要修改的檔案：
- `routes/auth.js`
- `routes/habits.js`
- `config/passport.js`
- 任何其他引用資料庫的檔案

### 4.3 更新環境變數

編輯您的 `.env` 檔案（或在 Vercel 設定環境變數）：

```env
# 從 Supabase 取得的連線字串
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@xxxxx.supabase.co:5432/postgres

# 其他設定保持不變
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://treebit-site.vercel.app
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://你的後端網址/api/auth/google/redirect
```

## 第五步：在 Vercel 更新環境變數

1. 前往 Vercel Dashboard
2. 選擇您的後端專案
3. 點擊 **"Settings"** > **"Environment Variables"**
4. 新增或更新 `DATABASE_URL` 變數，貼上 Supabase 的連線字串
5. **重新部署**專案

## 第六步：測試

### 本地測試

```bash
cd backend
npm install
npm run dev
```

訪問 `http://localhost:3001/test` 確認伺服器運作正常

### 測試資料庫連線

可以在 Supabase SQL Editor 執行查詢確認資料表是否正確：

```sql
SELECT * FROM users;
SELECT * FROM habits;
```

## 常見問題

### Q: 如何遷移現有的 MySQL 資料？

A: 如果您在 Railway 有現有資料：

1. 從 MySQL 匯出資料：
   ```bash
   mysqldump -h host -u user -p database > backup.sql
   ```

2. 使用工具轉換 SQL 格式（MySQL → PostgreSQL）
   - 線上工具：https://www.convert-in.com/mysql-to-postgres-sql.htm
   - 或手動調整

3. 在 Supabase SQL Editor 匯入

### Q: PostgreSQL 與 MySQL 有什麼語法差異？

A: 主要差異已在 `connect-postgresql.js` 中處理：
- `?` 參數 → `$1, $2...` （已自動轉換）
- `AUTO_INCREMENT` → `SERIAL` （schema 已更新）
- `TINYINT(1)` → `BOOLEAN` （schema 已更新）
- 查詢結果格式已轉換成與 mysql2 相容

### Q: 可以繼續使用 mysql2 的語法嗎？

A: 可以！我已經將 PostgreSQL 包裝成與 mysql2 相容的 API，所以您的現有程式碼**幾乎不需要修改**，只要：
1. 改用 `connect-postgresql.js`
2. 更新環境變數
3. 執行新的 schema

## 完成！

遷移完成後，您的 Treebit 將使用：
- ✅ **免費的 Supabase PostgreSQL**（500MB 儲存空間）
- ✅ 無需擔心費用問題
- ✅ 更穩定的資料庫服務

如有問題，可參考：
- Supabase 文件：https://supabase.com/docs
- PostgreSQL 文件：https://www.postgresql.org/docs/
