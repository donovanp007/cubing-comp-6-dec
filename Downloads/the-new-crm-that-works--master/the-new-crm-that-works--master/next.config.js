/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15
  // Always run on port 3012
  serverRuntimeConfig: {
    port: 3012
  }
}

module.exports = nextConfig