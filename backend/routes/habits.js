import express from "express";
import db from "../config/connect-postgresql.js";
import authenticate from "../middlewares/authenticate.js";
import {
  getTaiwanTodayYMD,
  addDaysToYMD,
  computeCurrentStreak,
} from "../utils/date.js";

const router = express.Router();

// 統一回傳格式
const sendResponse = (
  res,
  status = 200,
  success = true,
  data = null,
  message = null
) => {
  const response = { success };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  res.status(status).json(response);
};

/**
 * 檢查 habit 是否屬於該 user
 */
async function checkHabitOwner(habitId, userId, includeArchived = false) {
  let query = `SELECT * FROM habits WHERE id = ? AND user_id = ?`;
  const params = [habitId, userId];

  if (!includeArchived) {
    query += ` AND is_archived = false`;
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
}

/**
 * 檢查 week 是否屬於該 user
 */
async function checkWeekOwner(weekId, userId) {
  const [rows] = await db.query(
    `SELECT h.* 
     FROM habit_weeks hw
     JOIN habits h ON h.id = hw.habit_id
     WHERE hw.id = ? AND h.user_id = ?`,
    [weekId, userId]
  );
  return rows.length > 0;
}

/**
 * 檢查 task 是否屬於該 user
 */
async function checkTaskOwner(taskId, userId) {
  const [rows] = await db.query(
    `SELECT h.*
     FROM habit_week_tasks hwt
     JOIN habit_weeks hw ON hw.id = hwt.habit_week_id
     JOIN habits h ON h.id = hw.habit_id
     WHERE hwt.id = ? AND h.user_id = ?`,
    [taskId, userId]
  );
  return rows.length > 0;
}

/**
 * 檢查 note 是否屬於該 user
 */
async function checkNoteOwner(noteId, userId) {
  const [rows] = await db.query(
    `SELECT h.*
     FROM habit_weekly_notes hwn
     JOIN habit_weeks hw ON hw.id = hwn.habit_week_id
     JOIN habits h ON h.id = hw.habit_id
     WHERE hwn.id = ? AND h.user_id = ?`,
    [noteId, userId]
  );
  return rows.length > 0;
}

// --- 習慣 ---

// 建立習慣
router.post("/", authenticate, async (req, res) => {
  const userId = req.user.id;

  // 驗證輸入
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const totalWeeks = Number(req.body.total_weeks);

  if (!title) {
    return sendResponse(res, 400, false, null, "標題為必填");
  }
  if (!Number.isInteger(totalWeeks) || totalWeeks < 1 || totalWeeks > 52) {
    return sendResponse(res, 400, false, null, "總週數需為 1~52 的整數");
  }

  // habit 與其所有週次必須一次成功，包進交易避免中途失敗留下半套資料
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO habits (user_id, title, total_weeks) VALUES ($1, $2, $3) RETURNING id`,
      [userId, title, totalWeeks]
    );
    const habitId = result.rows[0].id;

    // 以台灣時區的今天為第一週起始日，往後每 7 天一週
    const today = getTaiwanTodayYMD();
    for (let i = 0; i < totalWeeks; i++) {
      const weekStartStr = addDaysToYMD(today, i * 7);
      await client.query(
        `INSERT INTO habit_weeks (habit_id, week_number, start_date)
         VALUES ($1, $2, $3)`,
        [habitId, i + 1, weekStartStr]
      );
    }

    await client.query("COMMIT");
    sendResponse(res, 201, true, { habit_id: habitId }, "新增習慣成功");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    sendResponse(res, 500, false, null, "建立習慣失敗");
  } finally {
    client.release();
  }
});

// 取得所有習慣
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // 附帶進度統計：第一週起始日、已完成打卡數、目標總次數（供列表卡片顯示進度）
    // 用子查詢聚合，避免 JOIN 造成 target_days 隨打卡筆數重複計算
    const [rows] = await db.query(
      `SELECT h.*,
        (SELECT MIN(hw.start_date) FROM habit_weeks hw WHERE hw.habit_id = h.id) AS first_start_date,
        (SELECT COUNT(*)::int FROM habit_weeks hw
           JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
           JOIN habit_task_logs htl ON htl.task_id = hwt.id
          WHERE hw.habit_id = h.id AND htl.is_completed = true) AS completed_logs,
        (SELECT COALESCE(SUM(hwt.target_days), 0)::int FROM habit_weeks hw
           JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
          WHERE hw.habit_id = h.id) AS total_target_days,
        (SELECT COUNT(DISTINCT hw.id)::int FROM habit_weeks hw
           JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
          WHERE hw.habit_id = h.id) AS weeks_with_tasks
      FROM habits h
      WHERE h.user_id = ? AND h.is_archived = false
      ORDER BY h.created_at DESC`,
      [userId]
    );

    // 連續打卡天數：一次撈出所有習慣「有完成打卡的日期」，於程式端計算 streak
    const [dateRows] = await db.query(
      `SELECT hw.habit_id, htl.date
       FROM habits h
       JOIN habit_weeks hw ON hw.habit_id = h.id
       JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
       JOIN habit_task_logs htl ON htl.task_id = hwt.id
       WHERE h.user_id = ? AND h.is_archived = false AND htl.is_completed = true
       GROUP BY hw.habit_id, htl.date`,
      [userId]
    );

    const datesByHabit = new Map();
    for (const row of dateRows) {
      if (!datesByHabit.has(row.habit_id)) datesByHabit.set(row.habit_id, []);
      datesByHabit.get(row.habit_id).push(row.date);
    }

    const today = getTaiwanTodayYMD();
    const habits = rows.map((h) => ({
      ...h,
      current_streak: computeCurrentStreak(datesByHabit.get(h.id) || [], today),
    }));

    sendResponse(res, 200, true, habits);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 獲取封存的習慣列表
router.get("/archived", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // 同列表 API：附帶進度統計，供歷史卡片顯示成果回顧
    const [rows] = await db.query(
      `SELECT h.*,
        (SELECT MIN(hw.start_date) FROM habit_weeks hw WHERE hw.habit_id = h.id) AS first_start_date,
        (SELECT COUNT(*)::int FROM habit_weeks hw
           JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
           JOIN habit_task_logs htl ON htl.task_id = hwt.id
          WHERE hw.habit_id = h.id AND htl.is_completed = true) AS completed_logs,
        (SELECT COALESCE(SUM(hwt.target_days), 0)::int FROM habit_weeks hw
           JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
          WHERE hw.habit_id = h.id) AS total_target_days
      FROM habits h
      WHERE h.user_id = ? AND h.is_archived = true
      ORDER BY h.updated_at DESC`,
      [userId]
    );
    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢封存習慣失敗");
  }
});

// 封存習慣
router.patch("/:habitId/archive", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    const isOwner = await checkHabitOwner(habitId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權封存此習慣");
    }

    await db.query(
      `UPDATE habits SET is_archived = true, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    sendResponse(res, 200, true, null, "封存習慣成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "封存習慣失敗");
  }
});

// 恢復習慣
router.patch("/:habitId/restore", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // 檢查是否為該用戶的習慣（包含已封存的）
    const isOwner = await checkHabitOwner(habitId, userId, true);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權恢復此習慣");
    }

    await db.query(
      `UPDATE habits SET is_archived = false, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    sendResponse(res, 200, true, null, "恢復習慣成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "恢復習慣失敗");
  }
});

// 切換習慣可見性（'private' 僅自己 | 'friends' 好友可見）
router.patch("/:habitId/visibility", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    const { visibility } = req.body;

    if (visibility !== "private" && visibility !== "friends") {
      return sendResponse(res, 400, false, null, "visibility 需為 private 或 friends");
    }

    const isOwner = await checkHabitOwner(habitId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權修改此習慣");
    }

    await db.query(`UPDATE habits SET visibility = ? WHERE id = ?`, [
      visibility,
      habitId,
    ]);

    sendResponse(
      res,
      200,
      true,
      { visibility },
      visibility === "friends" ? "已開放好友查看" : "已改回私人"
    );
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "更新可見性失敗");
  }
});

// 查看單一習慣
router.get("/:habitId", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM habits WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    if (rows.length === 0) {
      return sendResponse(res, 404, false, null, "找不到該習慣");
    }

    sendResponse(res, 200, true, rows[0]);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 刪除習慣（連帶刪除所有週、任務、筆記、打卡）
router.delete("/:habitId", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // 檢查是否為該用戶的習慣（包含已封存的）
    const isOwner = await checkHabitOwner(habitId, userId, true);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權刪除此習慣");
    }

    // schema 各外鍵皆設定 ON DELETE CASCADE，刪除 habit 會連帶刪除
    // weeks → tasks → logs / notes，無需手動逐表刪除
    await db.query(`DELETE FROM habits WHERE id = ? AND user_id = ?`, [
      habitId,
      userId,
    ]);

    sendResponse(res, 200, true, null, "刪除習慣成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "刪除失敗");
  }
});

// 查詢 habit 的所有週
router.get("/:habitId/weeks", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    const isOwner = await checkHabitOwner(habitId, userId, true);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權存取此習慣");
    }

    const [rows] = await db.query(
      `SELECT * FROM habit_weeks WHERE habit_id = ?`,
      [habitId]
    );

    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 刪除週
router.delete("/weeks/:weekId", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權刪除此週次");
    }

    // ON DELETE CASCADE 會連帶刪除該週的 tasks、logs、notes
    await db.query(`DELETE FROM habit_weeks WHERE id = ?`, [weekId]);

    sendResponse(res, 200, true, null, "刪除週次成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "刪除週次失敗");
  }
});

// --- 每週任務 ---

// 建立任務
router.post("/weeks/:weekId/tasks", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權新增任務至此週次");
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const targetDays = Number(req.body.target_days);
    if (!name) {
      return sendResponse(res, 400, false, null, "任務名稱必填");
    }
    if (!Number.isInteger(targetDays) || targetDays < 1 || targetDays > 7) {
      return sendResponse(res, 400, false, null, "目標天數需為 1~7 的整數");
    }

    // sort_order 排在該週最後（供拖曳排序）
    const [result] = await db.query(
      `INSERT INTO habit_week_tasks (habit_week_id, name, target_days, sort_order)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM habit_week_tasks WHERE habit_week_id = ?))
       RETURNING id`,
      [weekId, name, targetDays, weekId]
    );

    sendResponse(res, 201, true, { task_id: result[0].id }, "新增任務成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "新增任務失敗");
  }
});

// 查詢所有任務
router.get("/weeks/:weekId/tasks", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權查詢此週次的任務");
    }

    const [rows] = await db.query(
      `SELECT * FROM habit_week_tasks WHERE habit_week_id = ? ORDER BY sort_order, id`,
      [weekId]
    );

    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 調整任務排序（拖曳排序）：依傳入的 task_ids 順序重設 sort_order
router.patch("/weeks/:weekId/tasks-order", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權調整此週次的任務排序");
    }

    const taskIds = req.body.task_ids;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return sendResponse(res, 400, false, null, "task_ids 需為非空陣列");
    }

    // 確認所有任務都屬於這個週次，避免跨週亂序
    const [rows] = await db.query(
      `SELECT id FROM habit_week_tasks WHERE habit_week_id = ?`,
      [weekId]
    );
    const validIds = new Set(rows.map((r) => Number(r.id)));
    const ids = taskIds.map(Number);
    if (!ids.every((id) => validIds.has(id))) {
      return sendResponse(res, 400, false, null, "包含不屬於此週次的任務");
    }

    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          `UPDATE habit_week_tasks SET sort_order = $1 WHERE id = $2 AND habit_week_id = $3`,
          [i + 1, ids[i], weekId]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    sendResponse(res, 200, true, null, "任務排序已更新");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "更新任務排序失敗");
  }
});

// 編輯任務
router.patch("/weeks/:weekId/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const isOwner = await checkTaskOwner(taskId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權編輯此任務");
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const targetDays = Number(req.body.target_days);
    if (!name) {
      return sendResponse(res, 400, false, null, "任務名稱必填");
    }
    if (!Number.isInteger(targetDays) || targetDays < 1 || targetDays > 7) {
      return sendResponse(res, 400, false, null, "目標天數需為 1~7 的整數");
    }

    await db.query(
      `UPDATE habit_week_tasks
       SET name = ?, target_days = ?
       WHERE id = ?`,
      [name, targetDays, taskId]
    );

    sendResponse(res, 200, true, null, "編輯任務成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "編輯任務失敗");
  }
});

// 刪除任務
router.delete("/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const isOwner = await checkTaskOwner(taskId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權刪除此任務");
    }

    // habit_task_logs 設有 ON DELETE CASCADE，刪除任務會自動連帶刪除其打卡
    await db.query(`DELETE FROM habit_week_tasks WHERE id = ?`, [taskId]);

    sendResponse(res, 200, true, null, "刪除任務成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "刪除失敗");
  }
});

// --- 打卡紀錄 ---

// 更新打卡紀錄
router.patch("/tasks/:taskId/logs", authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const isOwner = await checkTaskOwner(taskId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權修改此任務打卡");
    }

    const { date, is_completed } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return sendResponse(res, 400, false, null, "日期格式需為 YYYY-MM-DD");
    }

    const completedValue =
      is_completed === true || is_completed === "true" ? true : false;

    const [exist] = await db.query(
      `SELECT * FROM habit_task_logs WHERE task_id = ? AND date = ?`,
      [taskId, date]
    );

    if (exist.length > 0) {
      await db.query(
        `UPDATE habit_task_logs SET is_completed = ? WHERE task_id = ? AND date = ?`,
        [completedValue, taskId, date]
      );
    } else {
      await db.query(
        `INSERT INTO habit_task_logs (task_id, date, is_completed)
         VALUES (?, ?, ?)`,
        [taskId, date, completedValue]
      );
    }

    sendResponse(res, 200, true, null, "更新打卡成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "打卡失敗");
  }
});

// --- 每週筆記 ---

// 新增每週筆記
router.post("/weeks/:weekId/notes", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權新增此週次筆記");
    }

    const { content } = req.body;
    if (!content) {
      return sendResponse(res, 400, false, null, "筆記內容不能為空");
    }

    const [result] = await db.query(
      `INSERT INTO habit_weekly_notes (habit_week_id, content) VALUES (?, ?) RETURNING id`,
      [weekId, content]
    );

    sendResponse(res, 201, true, { note_id: result[0].id }, "新增筆記成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "筆記操作失敗");
  }
});

// 查詢每週筆記
router.get("/weeks/:weekId/notes", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權查詢此週次筆記");
    }

    const [rows] = await db.query(
      `SELECT * FROM habit_weekly_notes WHERE habit_week_id = ? ORDER BY created_at ASC`,
      [weekId]
    );

    sendResponse(res, 200, true, rows || []);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢筆記失敗");
  }
});

// 刪除每週筆記
router.delete(
  "/weeks/:weekId/notes/:noteId",
  authenticate,
  async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const userId = req.user.id;

      const isOwner = await checkNoteOwner(noteId, userId);
      if (!isOwner) {
        return sendResponse(res, 403, false, null, "無權刪除此筆記");
      }

      await db.query(`DELETE FROM habit_weekly_notes WHERE id = ?`, [noteId]);

      sendResponse(res, 200, true, null, "刪除筆記成功");
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, false, null, "刪除筆記失敗");
    }
  }
);

// 編輯筆記
router.patch("/weeks/:weekId/notes/:noteId", authenticate, async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user.id;

    const isOwner = await checkNoteOwner(noteId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權編輯此筆記");
    }

    const { content } = req.body;
    if (!content) {
      return sendResponse(res, 400, false, null, "筆記內容不能為空");
    }

    await db.query(
      `UPDATE habit_weekly_notes
       SET content = ?
       WHERE id = ?`,
      [content, noteId]
    );

    sendResponse(res, 200, true, null, "更新筆記成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "筆記更新失敗");
  }
});

// 查詢某個任務的所有打卡記錄
router.get("/tasks/:taskId/logs", authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const isOwner = await checkTaskOwner(taskId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權查詢此任務的打卡紀錄");
    }

    const [rows] = await db.query(
      `SELECT * FROM habit_task_logs WHERE task_id = ? ORDER BY date`,
      [taskId]
    );

    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢打卡記錄失敗");
  }
});

// 查詢某週所有任務的打卡記錄（用於顯示整週的打卡狀態）
router.get("/weeks/:weekId/logs", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;
    const userId = req.user.id;

    const isOwner = await checkWeekOwner(weekId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權查看此週次資料");
    }

    const [rows] = await db.query(
      `SELECT htl.*, hwt.name as task_name 
       FROM habit_task_logs htl
       JOIN habit_week_tasks hwt ON htl.task_id = hwt.id
       WHERE hwt.habit_week_id = ?
       ORDER BY hwt.id, htl.date`,
      [weekId]
    );

    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢打卡紀錄失敗");
  }
});

// 獲取習慣的統計資料（總達成率、總次數等）
router.get("/:habitId/stats", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    const isOwner = await checkHabitOwner(habitId, userId);
    if (!isOwner) {
      return sendResponse(res, 403, false, null, "無權查看此習慣統計");
    }

    // 計算統計資料。total_target_days 用子查詢聚合，
    // 避免與打卡 JOIN 後 target_days 隨筆數重複計算
    const [stats] = await db.query(
      `SELECT
        COUNT(DISTINCT ha.id) as total_weeks,
        COUNT(htl.id)::int as total_logs,
        COALESCE(SUM(CASE WHEN htl.is_completed = true THEN 1 ELSE 0 END), 0)::int as completed_logs,
        (SELECT COALESCE(SUM(hwt2.target_days), 0)::int FROM habit_weeks hw2
           JOIN habit_week_tasks hwt2 ON hwt2.habit_week_id = hw2.id
          WHERE hw2.habit_id = h.id) as total_target_days,
        (SELECT COUNT(DISTINCT hw4.id)::int FROM habit_weeks hw4
           JOIN habit_week_tasks hwt4 ON hwt4.habit_week_id = hw4.id
          WHERE hw4.habit_id = h.id) as weeks_with_tasks,
        ROUND(
          SUM(CASE WHEN htl.is_completed = true THEN 1 ELSE 0 END)::numeric
            / NULLIF(COUNT(htl.id), 0) * 100, 0
        ) as completion_rate
      FROM habits h
      LEFT JOIN habit_weeks ha ON ha.habit_id = h.id
      LEFT JOIN habit_week_tasks hwt ON hwt.habit_week_id = ha.id
      LEFT JOIN habit_task_logs htl ON htl.task_id = hwt.id
      WHERE h.id = ?
      GROUP BY h.id`,
      [habitId]
    );

    if (!stats.length) {
      return sendResponse(res, 404, false, null, "找不到該習慣");
    }

    // 連續打卡天數（每天至少完成一次即延續）
    const [dateRows] = await db.query(
      `SELECT htl.date
       FROM habit_weeks hw
       JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
       JOIN habit_task_logs htl ON htl.task_id = hwt.id
       WHERE hw.habit_id = ? AND htl.is_completed = true
       GROUP BY htl.date`,
      [habitId]
    );
    const current_streak = computeCurrentStreak(dateRows.map((r) => r.date));

    sendResponse(res, 200, true, { ...stats[0], current_streak });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢統計失敗");
  }
});

export default router;
