-- 好友系統 v1：好友碼、習慣可見性、好友關係表
-- 設計文件：docs/superpowers/specs/2026-07-05-friends-system-design.md
-- （全新建立資料庫請直接用 schema-postgresql.sql，已包含本檔內容）

-- 好友碼（TB-XXXX）：首次進好友頁時由後端惰性產生，故允許 NULL
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS friend_code VARCHAR(8) UNIQUE;

-- 習慣可見性：'private'（預設）| 'friends'（全部已接受的好友可見）
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'friends'));

-- 好友關係：一對關係只存一列（requester → addressee），查詢時雙向比對
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL,
  addressee_id INTEGER NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_friendships_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_friendships_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uniq_friendship_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT chk_no_self_friend CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee
  ON friendships (addressee_id, status);
