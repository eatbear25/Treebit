import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import passport from "passport";
import "./config/passport.js";

// 引入路由
import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habits.js";
import friendRoutes from "./routes/friends.js";

// 啟動前檢查必要環境變數（缺少安全相關設定就直接終止）
if (!process.env.JWT_SECRET) {
  console.error("❌ 缺少必要環境變數 JWT_SECRET，請於 .env 設定後再啟動");
  process.exit(1);
}

const app = express();

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(passport.initialize());

app.set("trust proxy", 1);

// cors 設定白名單，只允許特定網址存取
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const whiteList = frontendUrl
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin(origin, callback) {
      // 無 origin（如同源請求、Server 對 Server）一律放行
      if (!origin || whiteList.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 測試路由
app.get("/test", (req, res) => {
  res.json({ message: "test work!" });
});

// 基本路由
app.get("/", (req, res) => {
  res.json({
    message: "Treebit API 服務正在運行中",
    version: "1.0.0",
    endpoints: { auth: "/api/auth" },
  });
});

// *** 自訂路由 ***
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/friends", friendRoutes);

// *** 全域錯誤處理中間件 ***
app.use((error, req, res, next) => {
  console.error("全域錯誤:", error);
  res.status(500).json({ success: false, message: "伺服器內部錯誤" });
});

// *** 404 頁面 ***
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "找不到請求的資源",
    path: req.path,
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Express Server 啟動: http://localhost:${port}`);
});
