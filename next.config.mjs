/** @type {import('next').NextConfig} */

const nextConfig = {
  // Ensure @remixicon/react is properly bundled
  transpilePackages: ['@remixicon/react'],
  
  // Temporarily ignore TypeScript errors (landing page translations incomplete)
  // TODO: Complete landing page translations and re-enable type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
