/** @type {import('next').NextConfig} */

const nextConfig = {
  // Ensure @remixicon/react is properly bundled
  transpilePackages: ['@remixicon/react'],
  
  // Type checking enabled - all dead code removed
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint enabled during build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
