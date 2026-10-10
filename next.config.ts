import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "visit-heavily-jenny-utilize.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "visit-heavily-jenny-utilize.trycloudflare.com",
        "*.trycloudflare.com",
      ],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
