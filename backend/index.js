import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
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

app.set("trust proxy", 1);

// cors 設定白名單，只允許特定網址存取
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const whiteList = frontendUrl
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

console.log("🔍 CORS 設定檢查:");
console.log("FRONTEND_URL 環境變數:", process.env.FRONTEND_URL);
console.log("處理後的白名單:", whiteList);

app.use(
  cors({
    origin(origin, callback) {
      console.log("🌐 CORS Origin 檢查:");
      console.log("  請求來源 origin:", JSON.stringify(origin));
      console.log("  origin 類型:", typeof origin);
      console.log("  白名單:", JSON.stringify(whiteList));
      console.log("  是否包含:", whiteList.includes(origin));

      if (!origin) {
        console.log("  ✅ 無 origin，允許通過");
        return callback(null, true);
      }

      if (whiteList.includes(origin)) {
        console.log("  ✅ Origin 在白名單中，允許通過");
        return callback(null, true);
      }

      console.log("  ❌ Origin 不在白名單中，拒絕");
      return callback(
        new Error(
          `Not allowed by CORS. Origin: ${origin}, WhiteList: ${JSON.stringify(
            whiteList
          )}`
        )
      );
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

// *** 全域錯誤處理中間件 ***
app.use((error, req, res, next) => {
  console.error("全域錯誤:", error);
  res.status(500).json({ status: "error", message: "伺服器內部錯誤" });
});

// *** 404 頁面 ***
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "找不到請求的資源",
    path: req.path,
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Express Server 啟動: http://localhost:${port}`);
});
