import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.2.2'],
  // The Showcase does not use request-dependent metadata. Keep metadata in the
  // initial document head so browser tooling cannot mutate Next's temporary
  // hidden streaming boundary before React hydrates it.
  htmlLimitedBots: /.*/,
  // Ensure monorepo packages written in TS/ESM are transpiled by Next
  transpilePackages: [
    '@kiskadee/icons',
    '@kiskadee/react-components',
    '@kiskadee/react-headless',
    '@kiskadee/runtime',
    '@kiskadee/core'
  ]
};

export default nextConfig;
