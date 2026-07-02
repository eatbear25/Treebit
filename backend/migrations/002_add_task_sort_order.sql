-- 任務拖曳排序：habit_week_tasks 加入 sort_order
-- 既有資料以 id 回填（維持原建立順序）

ALTER TABLE habit_week_tasks
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE habit_week_tasks SET sort_order = id WHERE sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_habit_week_tasks_sort
  ON habit_week_tasks (habit_week_id, sort_order);
