import type { NextConfig } from "next";

const pagesPath = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  ...(pagesPath
    ? { output: "export", basePath: pagesPath, trailingSlash: true }
    : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
