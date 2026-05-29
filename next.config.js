/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Smaller dev compiles for heavy client libs
    optimizePackageImports: ['framer-motion'],
  },
}
module.exports = nextConfig
