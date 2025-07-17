import express from "express";
import db from "../config/connect-mysql.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import authenticate, {
  optionalAuthenticate,
} from "../middlewares/authenticate.js";

const router = express.Router();

const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// zod 驗證
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
  username: z.string().min(2, { message: "用戶名稱至少需 2 個字" }),
  email: z.string().email("請輸入有效的電子郵件"),
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

    // 檢查用戶是否已存在
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
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
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // 產生 JWT token
    const data = {
      id: result.insertId,
      username,
      email,
    };

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
      "SELECT id, username, email, password_hash FROM users WHERE email = ?",
      [email]
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
    const data = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

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
      "SELECT id, username, email, created_at, last_login FROM users WHERE id = ?",
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
    const { username, email, password } = req.body;

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
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push("password_hash = ?");
      updateValues.push(hashedPassword);
    }

    // 加上 updated_at 欄位更新時間
    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // 加入 user id 作為 where 條件
    updateValues.push(req.user.id);

    await db.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // 清除舊的 JWT cookie，強制重新登入
    res.clearCookie("accessToken");

    return res.json({
      status: "success",
      message: "會員資料已更新，請重新登入",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("更新會員資料失敗:", error);
    return res.status(500).json({
      status: "error",
      message: "伺服器錯誤，更新失敗",
    });
  }
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
