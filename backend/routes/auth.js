import express from "express";
import db from "../config/connect-postgresql.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import authenticate, {
  optionalAuthenticate,
} from "../middlewares/authenticate.js";
import passport from "passport";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

const saltRounds = 10;

// 限制登入 / 註冊頻率，降低暴力嘗試風險（每 IP 15 分鐘 20 次）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "嘗試次數過多，請稍後再試",
  },
});

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const isProd = process.env.NODE_ENV === "production";

const cookieBaseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

function setAuthCookie(res, token, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  res.cookie("accessToken", token, {
    ...cookieBaseOptions,
    maxAge: maxAgeMs,
  });
}

function clearAuthCookie(res) {
  res.clearCookie("accessToken", { ...cookieBaseOptions });
}
/** ------------------------------------------------------------------- */

// 本地 zod 驗證
const registerSchema = z.object({
  account: z
    .string({ message: "帳號為必填欄位" })
    .min(2, { message: "帳號至少需 2 個字" })
    .max(50, { message: "帳號最多 50 個字" }),
  password: z
    .string({ message: "密碼為必填欄位" })
    .min(6, { message: "密碼至少需 6 個字" })
    .max(20, { message: "密碼最多 20 個字" }),
});

const loginSchema = z.object({
  account: z
    .string({ message: "帳號為必填欄位" })
    .min(1, { message: "請輸入帳號" }),
  password: z
    .string({ message: "密碼為必填欄位" })
    .min(1, { message: "請輸入密碼" }),
});

// 會員資料只開放修改顯示名稱（密碼有專用 API）
const updateProfileSchema = z.object({
  username: z.string().min(2, { message: "用戶名稱至少需 2 個字" }).optional(),
});

// 更改密碼：新密碼長度規則與註冊一致（6~20）
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "請輸入舊密碼" }),
  newPassword: z
    .string()
    .min(6, { message: "密碼至少需 6 個字" })
    .max(20, { message: "密碼最多 20 個字" }),
});

// *** 註冊 API ***
router.post("/register", authLimiter, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { account, password } = validatedData;
    const normalizedAccount = account.trim();

    // 檢查帳號是否已存在
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE account = ? AND provider = 'local'",
      [normalizedAccount],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "此帳號已被註冊",
      });
    }

    // 建立用戶（顯示名稱預設與帳號相同，之後可於會員資料修改）
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await db.query(
      "INSERT INTO users (provider, account, username, password_hash) VALUES ('local', ?, ?, ?) RETURNING id",
      [normalizedAccount, normalizedAccount, hashedPassword],
    );

    // 產生 JWT & 設定 Cookie
    const data = { id: result[0].id, provider: "local" };
    const token = jsonwebtoken.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
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
        success: false,
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "伺服器內部錯誤",
    });
  }
});

// *** 登入 API ***
router.post("/login", authLimiter, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { account, password } = validatedData;

    // 用帳號找尋用戶
    const [users] = await db.query(
      "SELECT id, username, account, password_hash FROM users WHERE account = ? AND provider = 'local'",
      [account.trim()],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "登入失敗，請檢查帳號或密碼",
      });
    }

    const user = users[0];

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "登入失敗，請檢查帳號或密碼",
      });
    }

    // 更新最後登入時間
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // 產生 JWT & 設定 Cookie
    const data = { id: user.id, provider: "local" };
    const token = jsonwebtoken.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);

    return res.json({
      success: true,
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
        success: false,
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "伺服器內部錯誤",
    });
  }
});

// *** 登出 API ***
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({
    success: true,
    message: "登出成功",
  });
});

// *** 驗證當前用戶 API  ***
router.get("/me", optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ success: true, data: { user: null } });
    }

    const [users] = await db.query(
      "SELECT id, account, username, email, provider, created_at, last_login FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(200).json({ success: true, data: { user: null } });
    }

    return res.status(200).json({
      success: true,
      data: { user: users[0] },
    });
  } catch (error) {
    console.error("獲取用戶資料錯誤:", error);
    return res.status(500).json({
      success: false,
      message: "伺服器內部錯誤",
    });
  }
});

// *** 修改會員資料 ***
router.put("/profile", authenticate, async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const { username } = validatedData;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "請填寫要修改的顯示名稱",
      });
    }

    await db.query(
      "UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [username.trim(), req.user.id],
    );

    return res.json({ success: true, message: "會員資料已更新" });
  } catch (error) {
    console.error("更新會員資料失敗:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "伺服器內部錯誤",
    });
  }
});

// *** 更改密碼 ***
router.put("/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

    const [[u]] = await db.query(
      "SELECT provider, password_hash FROM users WHERE id=? LIMIT 1",
      [req.user.id],
    );
    if (!u)
      return res.status(404).json({ success: false, message: "找不到用戶" });

    if (u.provider !== "local" || !u.password_hash) {
      return res
        .status(400)
        .json({ success: false, message: "Google 帳號不可修改密碼" });
    }

    const isValid = await bcrypt.compare(oldPassword, u.password_hash);
    if (!isValid)
      return res.status(401).json({ success: false, message: "舊密碼錯誤" });

    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [hashed, req.user.id],
    );
    return res.json({ success: true, message: "密碼更新成功" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "輸入資料驗證失敗",
        errors: error.errors,
      });
    }

    console.error("更改密碼失敗:", error);
    return res.status(500).json({
      success: false,
      message: "伺服器內部錯誤",
    });
  }
});

// *** Google 登入 ***
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false,
  }),
);

router.get("/google/redirect", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) return res.redirect(`${FRONTEND_URL}/login?oauth=failed`);

    const payload = { id: user.id, provider: "google" };
    const token = jsonwebtoken.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    setAuthCookie(res, token); // ← 統一用共用函式

    await db
      .query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])
      .catch(() => {});

    return res.redirect(`${FRONTEND_URL}/habits`);
  })(req, res, next);
});

// 測試路由
router.get("/", (req, res) => {
  return res.json({
    success: true,
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
