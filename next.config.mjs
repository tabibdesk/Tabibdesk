/** @type {import('next').NextConfig} */

const nextConfig = {
  // Optimize @remixicon/react imports to avoid vendor-chunk resolution issues
  experimental: {
    optimizePackageImports: ['@remixicon/react'],
  },
  
  // Type checking enabled - all dead code removed
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint enabled during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimization for Netlify deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
