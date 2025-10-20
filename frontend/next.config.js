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
}

export default nextConfig
