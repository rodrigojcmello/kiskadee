import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure monorepo packages written in TS/ESM are transpiled by Next
  transpilePackages: [
    "@kiskadee/react-components",
    "@kiskadee/react-headless",
    "@kiskadee/core"
  ]
};

export default nextConfig;
