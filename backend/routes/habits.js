import express from "express";
import db from "../config/connect-mysql.js";
import authenticate from "../middlewares/authenticate.js";

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

// --- 習慣 ---

// 建立習慣
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, total_weeks } = req.body;

    if (!title || !total_weeks) {
      return sendResponse(res, 400, false, null, "標題和總週數為必填");
    }

    // 建立 habit
    const [result] = await db.query(
      `INSERT INTO habits (user_id, title, total_weeks) VALUES (?, ?, ?)`,
      [userId, title, total_weeks]
    );

    const habitId = result.insertId;

    // 建立 habit_weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < total_weeks; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekStartStr = weekStart.toISOString().slice(0, 10);

      await db.query(
        `INSERT INTO habit_weeks (habit_id, week_number, start_date)
         VALUES (?, ?, ?)`,
        [habitId, i + 1, weekStartStr]
      );
    }

    sendResponse(res, 201, true, { habit_id: habitId }, "新增習慣成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "建立習慣失敗");
  }
});

// 取得所有習慣
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT * FROM habits WHERE user_id = ? AND is_archived = 0 ORDER BY created_at DESC`,
      [userId]
    );
    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
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

// 封存習慣
router.patch("/:habitId/archive", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    await db.query(
      `UPDATE habits SET is_archived = 1 WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    sendResponse(res, 200, true, null, "習慣已封存");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "封存失敗");
  }
});

// 刪除習慣（連帶刪除所有週、任務、筆記、打卡）
router.delete("/:habitId", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // 先找 habit 所有 week id
    const [weeks] = await db.query(
      `SELECT id FROM habit_weeks WHERE habit_id = ?`,
      [habitId]
    );

    const weekIds = weeks.map((w) => w.id);

    if (weekIds.length > 0) {
      // 找所有 task id
      const [tasks] = await db.query(
        `SELECT id FROM habit_week_tasks WHERE habit_week_id IN (?)`,
        [weekIds]
      );

      const taskIds = tasks.map((t) => t.id);

      if (taskIds.length > 0) {
        // 刪 logs
        await db.query(`DELETE FROM habit_task_logs WHERE task_id IN (?)`, [
          taskIds,
        ]);
      }

      // 刪 tasks
      await db.query(
        `DELETE FROM habit_week_tasks WHERE habit_week_id IN (?)`,
        [weekIds]
      );

      // 刪 notes
      await db.query(
        `DELETE FROM habit_weekly_notes WHERE habit_week_id IN (?)`,
        [weekIds]
      );

      // 刪 weeks
      await db.query(`DELETE FROM habit_weeks WHERE id IN (?)`, [weekIds]);
    }

    // 最後刪 habit
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

    await db.query(
      `DELETE hwt, htl, hwn
       FROM habit_weeks hw
       LEFT JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
       LEFT JOIN habit_task_logs htl ON htl.task_id = hwt.id
       LEFT JOIN habit_weekly_notes hwn ON hwn.habit_week_id = hw.id
       WHERE hw.id = ?`,
      [weekId]
    );

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
    const { name, target_days } = req.body;

    if (!name || !target_days) {
      return sendResponse(res, 400, false, null, "任務名稱和目標天數必填");
    }

    const [result] = await db.query(
      `INSERT INTO habit_week_tasks (habit_week_id, name, target_days)
       VALUES (?, ?, ?)`,
      [weekId, name, target_days]
    );

    sendResponse(res, 201, true, { task_id: result.insertId }, "新增任務成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "新增任務失敗");
  }
});

// 查詢所有任務
router.get("/weeks/:weekId/tasks", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;

    const [rows] = await db.query(
      `SELECT * FROM habit_week_tasks WHERE habit_week_id = ?`,
      [weekId]
    );

    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 刪除任務
router.delete("/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    await db.query(`DELETE FROM habit_task_logs WHERE task_id = ?`, [taskId]);
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
    const { date, is_completed } = req.body;

    if (!date) {
      return sendResponse(res, 400, false, null, "日期必填");
    }

    // 強制轉成 0 或 1
    const completedValue =
      is_completed === true || is_completed === "true" ? 1 : 0;

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
        `INSERT INTO habit_task_logs (task_id, date, is_completed) VALUES (?, ?, ?)`,
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
    const { content } = req.body;

    if (!content) {
      return sendResponse(res, 400, false, null, "筆記內容不能為空");
    }

    const [result] = await db.query(
      `INSERT INTO habit_weekly_notes (habit_week_id, content) VALUES (?, ?)`,
      [weekId, content]
    );

    sendResponse(res, 201, true, { note_id: result.insertId }, "新增筆記成功");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "筆記操作失敗");
  }
});

// 查詢每週筆記
router.get("/weeks/:weekId/notes", authenticate, async (req, res) => {
  try {
    const weekId = req.params.weekId;

    const [rows] = await db.query(
      `SELECT * FROM habit_weekly_notes WHERE habit_week_id = ?`,
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
      const weekId = req.params.weekId;
      const noteId = req.params.noteId;

      await db.query(
        `DELETE FROM habit_weekly_notes
       WHERE id = ? AND habit_week_id = ?`,
        [noteId, weekId]
      );

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
    const weekId = req.params.weekId;
    const noteId = req.params.noteId;
    const { content } = req.body;

    if (!content) {
      return sendResponse(res, 400, false, null, "筆記內容不能為空");
    }

    await db.query(
      `UPDATE habit_weekly_notes
       SET content = ?, updated_at = NOW()
       WHERE id = ? AND habit_week_id = ?`,
      [content, noteId, weekId]
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
    sendResponse(res, 500, false, null, "查詢打卡記錄失敗");
  }
});

// 獲取習慣的統計資料（總達成率、總次數等）
router.get("/:habitId/stats", authenticate, async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // 確認習慣歸屬
    const [habitCheck] = await db.query(
      `SELECT * FROM habits WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    if (habitCheck.length === 0) {
      return sendResponse(res, 404, false, null, "找不到該習慣");
    }

    // 計算統計資料
    const [stats] = await db.query(
      `SELECT 
        COUNT(DISTINCT hw.id) as total_weeks,
        COUNT(htl.id) as total_logs,
        SUM(CASE WHEN htl.is_completed = 1 THEN 1 ELSE 0 END) as completed_logs,
        ROUND(
          (SUM(CASE WHEN htl.is_completed = 1 THEN 1 ELSE 0 END) / COUNT(htl.id)) * 100, 0
        ) as completion_rate
      FROM habits h
      LEFT JOIN habit_weeks hw ON hw.habit_id = h.id
      LEFT JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
      LEFT JOIN habit_task_logs htl ON htl.task_id = hwt.id
      WHERE h.id = ?`,
      [habitId]
    );

    sendResponse(res, 200, true, stats[0]);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢統計失敗");
  }
});

export default router;
