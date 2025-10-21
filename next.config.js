/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    LLM_API_BASE_URL: process.env.LLM_API_BASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  }
}

module.exports = nextConfig
