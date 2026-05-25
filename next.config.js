/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Smaller dev compiles for heavy client libs
    optimizePackageImports: ['framer-motion'],
  },
}
module.exports = nextConfig
