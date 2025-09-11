/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable experimental features if needed
  },
  // Configure for Replit environment
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Development server configuration for Replit proxy
  webpack: (config, { dev, isServer }) => {
    // Allow hot reloading in Replit iframe
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  
  // Compress responses
  compress: true,
  
  // Power-of-two value
  generateEtags: true,
  
  // Disable X-Powered-By header
  poweredByHeader: false,
  
  // Trailing slash handling
  trailingSlash: false,
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: [],
  },
};

module.exports = nextConfig;