import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import db from "./config/connect-mysql.js";
import passport from "passport";
import "./config/passport.js";

// 引入路由
import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habits.js";

const app = express();

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(passport.initialize());

// cors 設定白名單，只允許特定網址存取
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const whiteList = frontendUrl.split(",");

app.use(
  cors({
    origin: whiteList,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 基本路由
app.get("/", (req, res) => {
  res.json({
    message: "Treebit API 服務正在運行中",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
    },
  });
});

// *** 自訂路由 ***
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

// *** 全域錯誤處理中間件 ***
app.use((error, req, res, next) => {
  console.error("全域錯誤:", error);
  res.status(500).json({
    status: "error",
    message: "伺服器內部錯誤",
  });
});

// *** 404 頁面 ***
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "找不到請求的資源",
    path: req.path,
  });
});

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Express Server 啟動: http://localhost:${port}`);
});

// 測試資料庫連線
const testDB = async () => {
  try {
    await db.query("SELECT 1");
    console.log("資料庫連線成功");
  } catch (err) {
    console.error("資料庫連線失敗：", err);
  }
};

testDB();
