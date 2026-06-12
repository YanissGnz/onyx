import withSerwist from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

// Disable @serwist/next in development (doesn't support Turbopack)
// It will only run in production with webpack
const isProd = process.env.NODE_ENV === "production";

export default withSerwist({
  disable: !isProd,
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig);
