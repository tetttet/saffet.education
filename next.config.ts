import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Light photo copies from `npm run images`: the hash in each name changes with the photo, so browsers keep them for a year.
  async headers() {
    return [{ source: "/_opt/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
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
