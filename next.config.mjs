/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // Force clean build - no stale data cache
  generateBuildId: () => `build-${Date.now()}`,
};

export default nextConfig;
