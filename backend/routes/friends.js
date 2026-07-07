import express from "express";
import { rateLimit } from "express-rate-limit";
import db from "../config/connect-postgresql.js";
import authenticate from "../middlewares/authenticate.js";
import { getTaiwanTodayYMD, computeCurrentStreak } from "../utils/date.js";

const router = express.Router();

// 好友碼只有約 92 萬種組合，限制送邀請頻率避免暴力枚舉（每 IP 15 分鐘 30 次）
const sendRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "嘗試次數過多，請稍後再試",
  },
});

// 統一回傳格式（同 habits 路由）
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

// 好友碼字元集：排除易混淆的 0/O/1/I
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomFriendCode() {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `TB-${code}`;
}

/**
 * 檢查兩人是否為已接受的好友（friendships 一對關係只存一列，需雙向比對）
 */
async function checkFriendship(userIdA, userIdB) {
  const [rows] = await db.query(
    `SELECT id FROM friendships
     WHERE status = 'accepted'
       AND ((requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?))`,
    [userIdA, userIdB, userIdB, userIdA]
  );
  return rows.length > 0;
}

/**
 * 取得兩人間的任意關係列（不限狀態），供送邀請時防重複
 */
async function findRelation(userIdA, userIdB) {
  const [rows] = await db.query(
    `SELECT * FROM friendships
     WHERE (requester_id = ? AND addressee_id = ?)
        OR (requester_id = ? AND addressee_id = ?)`,
    [userIdA, userIdB, userIdB, userIdA]
  );
  return rows[0] || null;
}

// --- 好友碼 ---

// 取得自己的好友碼（沒有就產生）
router.get("/me/code", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT friend_code FROM users WHERE id = ?`,
      [userId]
    );
    if (rows[0]?.friend_code) {
      return sendResponse(res, 200, true, { friend_code: rows[0].friend_code });
    }

    // 惰性產生；撞碼（UNIQUE 衝突）時重試
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomFriendCode();
      try {
        await db.query(`UPDATE users SET friend_code = ? WHERE id = ?`, [
          code,
          userId,
        ]);
        return sendResponse(res, 200, true, { friend_code: code });
      } catch (err) {
        // 23505 = PostgreSQL unique_violation，換一組碼再試
        if (err.code !== "23505") throw err;
      }
    }
    sendResponse(res, 500, false, null, "產生好友碼失敗，請稍後再試");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "取得好友碼失敗");
  }
});

// --- 邀請 ---

// 依好友碼送出邀請
router.post("/requests", authenticate, sendRequestLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const code =
      typeof req.body.code === "string"
        ? req.body.code.trim().toUpperCase()
        : "";

    if (!code) {
      return sendResponse(res, 400, false, null, "請輸入好友碼");
    }

    const [users] = await db.query(
      `SELECT id, username FROM users WHERE friend_code = ?`,
      [code]
    );
    if (users.length === 0) {
      return sendResponse(res, 404, false, null, "查無此好友碼");
    }

    const target = users[0];
    if (target.id === userId) {
      return sendResponse(res, 400, false, null, "不能加自己為好友");
    }

    const relation = await findRelation(userId, target.id);
    if (relation) {
      const message =
        relation.status === "accepted" ? "你們已經是好友了" : "已送過邀請，等待對方回覆";
      return sendResponse(res, 400, false, null, message);
    }

    await db.query(
      `INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)`,
      [userId, target.id]
    );

    sendResponse(res, 201, true, null, `已送出邀請給 ${target.username}`);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "送出邀請失敗");
  }
});

// 我收到的待確認邀請
router.get("/requests", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT f.id, f.created_at, u.id AS user_id, u.username
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.addressee_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );
    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢邀請失敗");
  }
});

// 接受 / 婉拒邀請（僅被邀請人本人可操作；婉拒＝刪列，之後可再邀）
router.patch("/requests/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    const { action } = req.body;

    if (action !== "accept" && action !== "decline") {
      return sendResponse(res, 400, false, null, "action 需為 accept 或 decline");
    }

    const [rows] = await db.query(
      `SELECT * FROM friendships WHERE id = ? AND status = 'pending'`,
      [requestId]
    );
    if (rows.length === 0) {
      return sendResponse(res, 404, false, null, "找不到該邀請");
    }
    if (rows[0].addressee_id !== userId) {
      return sendResponse(res, 403, false, null, "無權操作此邀請");
    }

    if (action === "accept") {
      await db.query(
        `UPDATE friendships SET status = 'accepted' WHERE id = ?`,
        [requestId]
      );
      return sendResponse(res, 200, true, null, "已成為好友");
    }

    await db.query(`DELETE FROM friendships WHERE id = ?`, [requestId]);
    sendResponse(res, 200, true, null, "已婉拒邀請");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "操作邀請失敗");
  }
});

// --- 好友列表 ---

// 已接受的好友列表（附「對我開放的習慣數」）
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT u.id, u.username, f.created_at,
        (SELECT COUNT(*)::int FROM habits h
          WHERE h.user_id = u.id AND h.visibility = 'friends'
            AND h.is_archived = false) AS shared_habits
       FROM friendships f
       JOIN users u ON u.id = CASE
         WHEN f.requester_id = ? THEN f.addressee_id
         ELSE f.requester_id
       END
       WHERE f.status = 'accepted'
         AND (f.requester_id = ? OR f.addressee_id = ?)
       ORDER BY u.username`,
      [userId, userId, userId]
    );
    sendResponse(res, 200, true, rows);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢好友列表失敗");
  }
});

// 好友分享的習慣列表（唯讀；欄位對齊 GET /habits 供 HabitCard 重用）
router.get("/:friendId/habits", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);

    if (!Number.isInteger(friendId) || !(await checkFriendship(userId, friendId))) {
      return sendResponse(res, 404, false, null, "找不到該好友");
    }

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
      WHERE h.user_id = ? AND h.visibility = 'friends' AND h.is_archived = false
      ORDER BY h.created_at DESC`,
      [friendId]
    );

    // 連續打卡：與 GET /habits 相同做法，程式端計算
    const [dateRows] = await db.query(
      `SELECT hw.habit_id, htl.date
       FROM habits h
       JOIN habit_weeks hw ON hw.habit_id = h.id
       JOIN habit_week_tasks hwt ON hwt.habit_week_id = hw.id
       JOIN habit_task_logs htl ON htl.task_id = hwt.id
       WHERE h.user_id = ? AND h.visibility = 'friends' AND h.is_archived = false
         AND htl.is_completed = true
       GROUP BY hw.habit_id, htl.date`,
      [friendId]
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

    const [friendRows] = await db.query(
      `SELECT id, username FROM users WHERE id = ?`,
      [friendId]
    );

    sendResponse(res, 200, true, { friend: friendRows[0], habits });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢好友習慣失敗");
  }
});

// 好友習慣的唯讀詳情：一次回傳 habit + weeks + tasks + logs + stats
// （不含週記事；權限不符一律 404，不洩漏資源存在性）
router.get("/habits/:habitId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.habitId;

    const [habits] = await db.query(
      `SELECT h.*, u.username AS owner_username
       FROM habits h
       JOIN users u ON u.id = h.user_id
       WHERE h.id = ? AND h.visibility = 'friends' AND h.is_archived = false`,
      [habitId]
    );
    if (
      habits.length === 0 ||
      !(await checkFriendship(userId, habits[0].user_id))
    ) {
      return sendResponse(res, 404, false, null, "找不到該習慣");
    }
    const habit = habits[0];

    const [weeks] = await db.query(
      `SELECT * FROM habit_weeks WHERE habit_id = ? ORDER BY week_number`,
      [habitId]
    );

    const [tasks] = await db.query(
      `SELECT hwt.* FROM habit_week_tasks hwt
       JOIN habit_weeks hw ON hw.id = hwt.habit_week_id
       WHERE hw.habit_id = ?
       ORDER BY hwt.sort_order, hwt.id`,
      [habitId]
    );

    const [logs] = await db.query(
      `SELECT htl.* FROM habit_task_logs htl
       JOIN habit_week_tasks hwt ON hwt.id = htl.task_id
       JOIN habit_weeks hw ON hw.id = hwt.habit_week_id
       WHERE hw.habit_id = ?
       ORDER BY htl.date`,
      [habitId]
    );

    // 統計：同 GET /:habitId/stats 的定義
    const completedLogs = logs.filter((l) => l.is_completed === true).length;
    const totalTargetDays = tasks.reduce(
      (sum, t) => sum + (t.target_days || 0),
      0
    );
    const weeksWithTasks = new Set(tasks.map((t) => t.habit_week_id)).size;
    const completedDates = [
      ...new Set(
        logs.filter((l) => l.is_completed === true).map((l) => l.date)
      ),
    ];
    const stats = {
      total_weeks: weeks.length,
      completed_logs: completedLogs,
      total_target_days: totalTargetDays,
      weeks_with_tasks: weeksWithTasks,
      current_streak: computeCurrentStreak(completedDates),
    };

    sendResponse(res, 200, true, { habit, weeks, tasks, logs, stats });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "查詢失敗");
  }
});

// 移除好友（刪除關係列，立即生效）
router.delete("/:friendId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);

    if (!Number.isInteger(friendId)) {
      return sendResponse(res, 404, false, null, "找不到該好友");
    }

    await db.query(
      `DELETE FROM friendships
       WHERE status = 'accepted'
         AND ((requester_id = ? AND addressee_id = ?)
           OR (requester_id = ? AND addressee_id = ?))`,
      [userId, friendId, friendId, userId]
    );

    sendResponse(res, 200, true, null, "已移除好友");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, null, "移除好友失敗");
  }
});

export default router;
