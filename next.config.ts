import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth Service (port 8081)
      {
        source: '/api/proxy/auth/:path*',
        destination: 'http://localhost:8081/:path*',
      },
      // Contest Service (port 8082)
      {
        source: '/api/proxy/contest/:path*',
        destination: 'http://localhost:8082/:path*',
      },
      // Leaderboard Service (port 8085)
      {
        source: '/api/proxy/leaderboard/:path*',
        destination: 'http://localhost:8085/:path*',
      },
    ];
  },
};

export default nextConfig;
