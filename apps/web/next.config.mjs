/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aftercode/shared', '@aftercode/engine'],
  experimental: {
    serverComponentsExternalPackages: ['execa', '@google/genai', 'ajv', 'glob'],
  },
};

export default nextConfig;
