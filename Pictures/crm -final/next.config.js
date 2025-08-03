/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Disable static optimization for dynamic features
  trailingSlash: false,
  // Enable SWC minification for better performance
  swcMinify: true,
}

module.exports = nextConfig