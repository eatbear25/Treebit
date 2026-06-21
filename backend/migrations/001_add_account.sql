-- Migration: 新增本地登入帳號欄位 account
-- 適用對象：已存在資料的 Supabase / PostgreSQL（全新建立請直接用 schema-postgresql.sql）
-- 用途：將登入方式從 email 改為 account（帳號）+ 密碼

-- 1) 新增 account 欄位（顯示名稱沿用既有的 username）
ALTER TABLE users ADD COLUMN IF NOT EXISTS account VARCHAR(50) DEFAULT NULL;

-- 2) 既有的本地帳號：先用 email 當預設 account，避免登入不了
--    （之後使用者可自行調整；新註冊帳號會直接寫入 account）
UPDATE users
SET account = split_part(email, '@', 1)
WHERE provider = 'local' AND account IS NULL AND email IS NOT NULL;

-- 3) 本地帳號的 account 必須唯一（Google 帳號 account 為 NULL，不受此限）
CREATE UNIQUE INDEX IF NOT EXISTS uniq_local_account
  ON users (account) WHERE provider = 'local';
