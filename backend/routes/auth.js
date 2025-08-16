import express from "express";
import db from "../config/connect-mysql.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import authenticate, {
  optionalAuthenticate,
} from "../middlewares/authenticate.js";
import passport from "passport";

const router = express.Router();

const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// 本地 zod 驗證
const registerSchema = z.object({
  username: z
    .string({ message: "用戶名稱為必填欄位" })
    .min(2, { message: "用戶名稱至少需 2 個字" }),
  email: z
    .string({ message: "電子郵件欄為必填欄位" })
    .email("請輸入有效的電子郵件"),
  password: z
    .string({ message: "密碼為必填欄位" })
    .min(6, { message: "密碼至少需 6 個字" })
    .max(20, { message: "密碼最多 20 個字" }),
});

const loginSchema = z.object({
  email: z
    .string({ message: "電子郵件欄為必填欄位" })
    .email("請輸入有效的電子郵件"),
  password: z
    .string({ message: "密碼為必填欄位" })
    .min(1, { message: "請輸入密碼" }),
});

const updateProfileSchema = z.object({
  username: z.string().min(2, { message: "用戶名稱至少需 2 個字" }).optional(),
  email: z.string().email("請輸入有效的電子郵件").optional(),
  password: z.string().min(6).max(20).optional(),
});

router.use((req, res, next) => {
  console.log(`正在接收 auth 請求: ${req.method} ${req.path}`);
  next();
});

// *** 註冊 API ***
router.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    // 檢查用戶是否已存在
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? AND provider = 'local'",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "電子郵件已被註冊",
      });
    }

    // 用戶不存在就創建新用戶
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      "INSERT INTO users (provider, username, email, password_hash) VALUES ('local', ?, ?, ?)",
      [normalizedUsername, normalizedEmail, hashedPassword]
    );

    // 產生 JWT token
    const data = { id: result.insertId, provider: "local" };

    const token = jsonwebtoken.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // 設定cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      status: "success",
      message: "註冊成功",
      data: {
        user: data,
        token,
      },
    });
  } catch (error) {
    console.error("註冊錯誤:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "伺服器內部錯誤",
    });
  }
});

// *** 登入 API ***
router.post("/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 用 email 找尋用戶
    const [users] = await db.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = ? AND provider = 'local'",
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "登入失敗，請檢查電子郵件或密碼",
      });
    }

    const user = users[0];

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "登入失敗，請檢查電子郵件或密碼",
      });
    }

    // 更新最後登入時間
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // 產生 JWT token
    const data = { id: user.id, provider: "local" };

    const token = jsonwebtoken.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // 設定 cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: "success",
      message: "登入成功",
      data: {
        user: data,
        token,
      },
    });
  } catch (error) {
    console.error("登入錯誤:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "伺服器內部錯誤",
    });
  }
});

// *** 登出 API ***
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");

  return res.json({
    status: "success",
    message: "登出成功",
  });
});

// *** 驗證當前用戶 API  ***
router.get("/me", optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ data: { user: null } });
    }

    const [users] = await db.query(
      "SELECT id, username, email, provider, created_at, last_login FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(200).json({ data: { user: null } });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user: users[0],
      },
    });
  } catch (error) {
    console.error("獲取用戶資料錯誤:", error);
    return res.status(500).json({
      status: "error",
      message: "伺服器內部錯誤",
    });
  }
});

// *** 修改會員資料 ***
router.put("/profile", authenticate, async (req, res) => {
  try {
    // 先查 provider
    const [[u]] = await db.query(
      "SELECT provider FROM users WHERE id=? LIMIT 1",
      [req.user.id]
    );
    if (!u)
      return res.status(404).json({ status: "error", message: "找不到用戶" });

    if (u.provider === "google") {
      // Google 不允許改 email / 密碼
      delete req.body.email;
      delete req.body.password;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const { username, email, password } = validatedData;

    // 沒有任何欄位就不處理
    if (!username && !email && !password) {
      return res.status(400).json({
        status: "error",
        message: "請至少填寫一個欄位進行修改",
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (email) {
      // 只在 local 才可能進來：檢查 local 範圍唯一
      const [exists] = await db.query(
        "SELECT id FROM users WHERE email=? AND provider='local' AND id<>?",
        [email.toLowerCase(), req.user.id]
      );
      if (exists.length)
        return res
          .status(400)
          .json({ status: "error", message: "電子郵件已被使用" });
      updateFields.push("email = ?");
      updateValues.push(email.toLowerCase());
    }

    if (password) {
      if (u.provider === "google") {
        return res
          .status(400)
          .json({ status: "error", message: "Google 帳號不可設定密碼" });
      }
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push("password_hash = ?");
      updateValues.push(hashedPassword);
    }

    if (!updateFields.length)
      return res
        .status(400)
        .json({ status: "error", message: "請至少填寫一個欄位進行修改" });

    // 加上 updated_at 欄位更新時間
    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // 加入 user id 作為 where 條件
    updateValues.push(req.user.id);

    await db.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return res.json({
      status: "success",
      message: "會員資料已更新",
    });
  } catch (error) {
    console.error("更新會員資料失敗:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "伺服器內部錯誤",
    });
  }
});

// *** 更改密碼 ***
// router.put("/change-password", authenticate, async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   if (!oldPassword || !newPassword) {
//     return res.status(400).json({
//       status: "error",
//       message: "請輸入舊密碼與新密碼",
//     });
//   }

//   try {
//     const [users] = await db.query(
//       "SELECT password_hash FROM users WHERE id = ?",
//       [req.user.id]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "找不到用戶",
//       });
//     }

//     const user = users[0];
//     const isValid = await bcrypt.compare(oldPassword, user.password_hash);

//     if (!isValid) {
//       return res.status(401).json({
//         status: "error",
//         message: "舊密碼錯誤",
//       });
//     }

//     const hashed = await bcrypt.hash(newPassword, saltRounds);

//     await db.query(
//       "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
//       [hashed, req.user.id]
//     );

//     return res.json({
//       status: "success",
//       message: "密碼更新成功",
//     });
//   } catch (error) {
//     console.error("修改密碼失敗:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "伺服器錯誤，無法修改密碼",
//     });
//   }
// });

router.put("/change-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res
      .status(400)
      .json({ status: "error", message: "請輸入舊密碼與新密碼" });

  const [[u]] = await db.query(
    "SELECT provider, password_hash FROM users WHERE id=? LIMIT 1",
    [req.user.id]
  );
  if (!u)
    return res.status(404).json({ status: "error", message: "找不到用戶" });

  if (u.provider !== "local" || !u.password_hash) {
    return res
      .status(400)
      .json({ status: "error", message: "Google 帳號不可修改密碼" });
  }

  const isValid = await bcrypt.compare(oldPassword, u.password_hash);
  if (!isValid)
    return res.status(401).json({ status: "error", message: "舊密碼錯誤" });

  const hashed = await bcrypt.hash(newPassword, saltRounds);
  await db.query(
    "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [hashed, req.user.id]
  );
  return res.json({ status: "success", message: "密碼更新成功" });
});

// *** Google 登入 ***
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false,
  })
);

router.get("/google/redirect", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) return res.redirect(`${FRONTEND_URL}/login?oauth=failed`);

    const payload = { id: user.id, provider: "google" };
    const token = jsonwebtoken.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await db
      .query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])
      .catch(() => {});

    return res.redirect(`${FRONTEND_URL}/habits`);
  })(req, res, next);
});

// 測試路由
router.get("/", (req, res) => {
  return res.json({
    status: "success",
    message: "Auth API 運作正常",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      logout: "POST /api/auth/logout",
      me: "GET /api/auth/me",
    },
  });
});

export default router;
