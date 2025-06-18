import express from "express";
import cors from "cors";
import "dotenv/config.js";
import db from "./config/connect-mysql.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// cors 設定白名單，只允許特定網址存取
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const whiteList = frontendUrl.split(",");

app.use(
  cors({
    origin: whiteList,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 根路由預設測試畫面
app.get("/", (req, res) => res.send("Express server is running."));

// 加上伺服器啟動與資料庫測試
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const testDB = async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ 資料庫連線成功");
  } catch (err) {
    console.error("❌ 資料庫連線失敗：", err);
  }
};
testDB();
