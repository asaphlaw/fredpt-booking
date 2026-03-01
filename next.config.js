/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@vercel/postgres']
}

module.exports = nextConfig
