import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.2.2'],
  // Ensure monorepo packages written in TS/ESM are transpiled by Next
  transpilePackages: ['@kiskadee/react-components', '@kiskadee/react-headless', '@kiskadee/core']
};

export default nextConfig;
