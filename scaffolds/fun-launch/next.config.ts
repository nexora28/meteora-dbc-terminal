import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
};

export default nextConfig;
