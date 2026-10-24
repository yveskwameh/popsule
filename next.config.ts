import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the same Wi-Fi load the dev server with hot reload.
  // Update if the Mac's LAN address changes.
  allowedDevOrigins: ["192.168.1.4"],
  cacheComponents: true,
  // The Lab became "Build your jar"; old share links keep working.
  async redirects() {
    return [{ source: "/lab", destination: "/build", permanent: true }];
  },
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
