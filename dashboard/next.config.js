/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/metrics/:path*',
        destination: process.env.DEVLAKE_ENDPOINT ? 
          `${process.env.DEVLAKE_ENDPOINT}/metrics/:path*` : 
          'http://localhost:8080/metrics/:path*',
      },
    ]
  },
  env: {
    DEVLAKE_ENDPOINT: process.env.DEVLAKE_ENDPOINT || 'http://localhost:8080',
    GRAFANA_ENDPOINT: process.env.GRAFANA_ENDPOINT || 'http://localhost:3002',
  },
}

module.exports = nextConfig