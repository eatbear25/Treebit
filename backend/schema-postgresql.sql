-- PostgreSQL Schema for Treebit
-- 轉換自 MySQL schema.sql

-- 設定時區
SET TIME ZONE 'UTC';

-- --------------------------------------------------------
-- 資料表結構 `users`
-- --------------------------------------------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(10) NOT NULL DEFAULT 'local' CHECK (provider IN ('local', 'google')),
  provider_user_id VARCHAR(191) DEFAULT NULL,
  account VARCHAR(50) DEFAULT NULL,        -- 本地登入帳號（Google 帳號為 NULL）
  username VARCHAR(50) NOT NULL,           -- 顯示名稱
  email VARCHAR(100) DEFAULT NULL,         -- 本地帳號可為 NULL；Google 帳號才有
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT uniq_email_provider UNIQUE (email, provider),
  CONSTRAINT uniq_provider_provider_user_id UNIQUE (provider, provider_user_id)
);

-- 本地帳號的 account 必須唯一（Google 帳號 account 為 NULL，不受此限）
CREATE UNIQUE INDEX uniq_local_account ON users (account) WHERE provider = 'local';

-- 建立 updated_at 自動更新的 trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- 資料表結構 `habits`
-- --------------------------------------------------------

CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  total_weeks INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_habits_user_id ON habits(user_id);

CREATE TRIGGER habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- 資料表結構 `habit_weeks`
-- --------------------------------------------------------

CREATE TABLE habit_weeks (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  CONSTRAINT fk_habit_weeks_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

CREATE INDEX idx_habit_weeks_habit_id ON habit_weeks(habit_id);

-- --------------------------------------------------------
-- 資料表結構 `habit_week_tasks`
-- --------------------------------------------------------

CREATE TABLE habit_week_tasks (
  id SERIAL PRIMARY KEY,
  habit_week_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_days INTEGER NOT NULL,
  CONSTRAINT fk_habit_week_tasks_week FOREIGN KEY (habit_week_id) REFERENCES habit_weeks(id) ON DELETE CASCADE
);

CREATE INDEX idx_habit_week_tasks_week_id ON habit_week_tasks(habit_week_id);

-- --------------------------------------------------------
-- 資料表結構 `habit_task_logs`
-- --------------------------------------------------------

CREATE TABLE habit_task_logs (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL,
  CONSTRAINT fk_habit_task_logs_task FOREIGN KEY (task_id) REFERENCES habit_week_tasks(id) ON DELETE CASCADE,
  CONSTRAINT task_date_unique UNIQUE (task_id, date)
);

CREATE INDEX idx_habit_task_logs_task_id ON habit_task_logs(task_id);

-- --------------------------------------------------------
-- 資料表結構 `habit_weekly_notes`
-- --------------------------------------------------------

CREATE TABLE habit_weekly_notes (
  id SERIAL PRIMARY KEY,
  habit_week_id INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habit_weekly_notes_week FOREIGN KEY (habit_week_id) REFERENCES habit_weeks(id) ON DELETE CASCADE
);

CREATE INDEX idx_habit_weekly_notes_week_id ON habit_weekly_notes(habit_week_id);

CREATE TRIGGER habit_weekly_notes_updated_at
BEFORE UPDATE ON habit_weekly_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
