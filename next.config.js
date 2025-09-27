/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security Configuration
  serverExternalPackages: [],

  // Image Domains Security
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
        port: '',
        pathname: '**',
      }
    ],
  },

  // Additional Security Headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },

  // Redirects for security
  async redirects() {
    return [
      // Force HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://senegal-driver-mbaye.vercel.app/:path*',
          permanent: true,
        }
      ] : [])
    ]
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Strict mode for better security
  reactStrictMode: true,

  // Webpack configuration for security
  webpack: (config) => {
    // Security-related webpack configurations
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig