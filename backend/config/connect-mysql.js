import mysql from "mysql2/promise";
import "dotenv/config.js";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

console.log({ DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME });

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export default db;
