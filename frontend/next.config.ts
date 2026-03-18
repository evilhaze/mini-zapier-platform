import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: { unoptimized: true },
  // Avoid Next.js picking the monorepo root on Windows when multiple lockfiles exist.
  // This stabilizes dev/build output tracing paths and file watching.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
