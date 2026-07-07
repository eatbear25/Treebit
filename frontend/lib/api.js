// API 位址統一出口：
// 開發環境直連後端；生產環境用相對路徑，由 next.config.js rewrites 代理到後端
// （瀏覽器視為同源，Cookie 是第一方、無 CORS 問題）。
export const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
