-- 習慣目標：建立習慣時選填的「可衡量目標」（取自《The 12 Week Year》：開始前先設定 12 週目標）
-- 僅本人可見，好友 API 回應會剔除此欄位
ALTER TABLE habits ADD COLUMN IF NOT EXISTS goal TEXT;
