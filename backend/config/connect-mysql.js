import mysql from "mysql2/promise";
import "dotenv/config.js";

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_NAME,
  DATABASE_URL,
  NODE_ENV,
} = process.env;

console.log({ DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME, NODE_ENV });

// 判斷使用哪種連線方式
const dbConfig = DATABASE_URL
  ? // 生產環境：使用 DATABASE_URL (Railway, PlanetScale 等會提供)
    {
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
      // 生產環境通常需要 SSL
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }
  : // 開發環境：使用個別配置
    {
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
    };

const db = mysql.createPool(dbConfig);

export default db;
