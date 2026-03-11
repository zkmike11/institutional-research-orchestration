import type { NextConfig } from "next";

const apiUrl = process.env.API_URL
  ? process.env.API_URL.replace(/\/api$/, "")
  : "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
