import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config.js";

const { DATABASE_URL, NODE_ENV } = process.env;

console.log({ DATABASE_URL: DATABASE_URL ? "已設定" : "未設定", NODE_ENV });

// PostgreSQL 連線設定
const dbConfig = DATABASE_URL
  ? // 使用 DATABASE_URL (Supabase, Neon 等會提供)
    {
      connectionString: DATABASE_URL,
      ssl:
        NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }
  : // 開發環境：使用個別配置（如果需要）
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      ssl: false,
    };

const pool = new Pool(dbConfig);

// 測試連線
pool.on("connect", () => {
  console.log("✅ PostgreSQL 資料庫連線成功");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL 連線錯誤:", err);
});

// 包裝成與 mysql2 相容的 API
const db = {
  query: async (text, params) => {
    // PostgreSQL 使用 $1, $2... 而不是 ?
    // 轉換查詢參數格式
    let convertedText = text;
    if (params && params.length > 0) {
      let index = 1;
      convertedText = text.replace(/\?/g, () => `$${index++}`);
    }

    const result = await pool.query(convertedText, params);

    // 轉換成 mysql2 的回傳格式 [rows, fields]
    return [result.rows, result.fields];
  },

  // 保留原始的 pool 以供需要時使用
  pool,
};

export default db;
