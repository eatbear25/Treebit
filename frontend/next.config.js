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
  // 使用proxy來避免cors和cookie問題
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'production'
            ? 'https://treebit-backend.vercel.app/api/:path*'
            : 'http://localhost:3002/api/:path*',
      },
    ]
  },
}

export default nextConfig
