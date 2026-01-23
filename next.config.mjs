/** @type {import('next').NextConfig} */

const nextConfig = {
  // Ensure @remixicon/react is properly bundled
  transpilePackages: ['@remixicon/react'],
};

export default nextConfig;
