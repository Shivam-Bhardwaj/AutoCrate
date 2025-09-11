/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable native SWC minifier to avoid SIGBUS
  experimental: {
    // Enable experimental features if needed
  },
  // Configure for Replit environment
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Note: allowedDevOrigins disabled due to pattern.split errors in Replit environment
  // Cross-origin warnings are non-critical and do not affect functionality
  
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