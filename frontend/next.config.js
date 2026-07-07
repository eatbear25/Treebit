/** @type {import('next').NextConfig} */
const nextConfig = {
  // 關閉React Strict Mode工具(避免useEffect執行兩次)
  reactStrictMode: false,
  // sass設定，修正新版本sass導致的過多棄用警告訊息
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  // API 反向代理：將前端的 /api 請求轉發到後端伺服器。
  // 生產環境（Vercel 前端專案）必須設定 BACKEND_URL 環境變數指向後端網域，
  // 未設定時退回 localhost（僅適用本地開發）。
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
