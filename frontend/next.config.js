/** @type {import('next').NextConfig} */
const nextConfig = {
  // 關閉React Strict Mode工具(避免useEffect執行兩次)
  reactStrictMode: false,
  // eslint設定
  eslint: {
    // 警告: 開啟以下的設定將會忽略所有在build時的eslint錯誤與警告，不建議在部署時直接使用，或請先自行修正eslint相關錯誤與警告
    ignoreDuringBuilds: true,
  },
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
  // 使用proxy來避免cors和cookie問題
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://treebit-backend.vercel.app/api/:path*',
      },
    ]
  },
}

export default nextConfig
