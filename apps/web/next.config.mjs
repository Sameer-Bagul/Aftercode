/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aftercode/shared', '@aftercode/engine'],
  experimental: {
    serverComponentsExternalPackages: ['execa', '@google/genai', 'ajv', 'glob'],
  },
  distDir: process.env.NEXT_BUILD_DIR || '.next',
};

export default nextConfig;
