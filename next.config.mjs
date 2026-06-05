/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Native Node.js packages that must not be bundled by webpack
  // Next.js 14 uses experimental.serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@aws-sdk/client-s3"],
  },
};

export default nextConfig;
