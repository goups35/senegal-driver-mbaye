import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@google/generative-ai', 
      'groq-sdk', 
      'openai',
      '@supabase/supabase-js',
      'react-hook-form',
      'zod'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    serverComponentsExternalPackages: ['sharp'],
    // Enable aggressive tree shaking
    optimizeServerReact: true,
    // Precompile dynamic imports
    esmExternals: 'loose',
  },

  // Image optimization with advanced settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Enable image optimization quality
    quality: 85,
    // Add image loader for better performance
    loader: 'default',
    // Optimize for different viewports
    breakpoints: [640, 768, 1024, 1280, 1536],
  },

  // Bundle optimization with advanced settings
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Enable aggressive minification
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
        innerGraph: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // AI libraries chunk (largest)
            ai: {
              test: /[\\/]node_modules[\\/](@google\/generative-ai|groq-sdk|openai)[\\/]/,
              name: 'ai-libs',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            // React ecosystem
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form|@hookform)[\\/]/,
              name: 'react-libs',
              chunks: 'all',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Supabase and database
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 12,
              reuseExistingChunk: true,
            },
            // Form validation
            validation: {
              test: /[\\/]node_modules[\\/](zod|validator)[\\/]/,
              name: 'validation',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Utilities
            utils: {
              test: /[\\/]node_modules[\\/](clsx|tailwind-merge|isomorphic-dompurify)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 8,
              reuseExistingChunk: true,
            },
            // Common vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              minChunks: 2,
            },
          },
        },
        // Enable module concatenation
        providedExports: true,
      };

      // Add compression plugin
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );
    }

    // Bundle analyzer in development
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: false,
          analyzerPort: 8888,
        })
      );
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false,
                },
                {
                  name: 'removeXMLNS',
                  active: false,
                },
              ],
            },
          },
        },
      ],
    });

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Replace heavy libraries with lighter alternatives when possible
      'lodash': 'lodash-es',
    };

    // Tree shaking for specific libraries
    config.resolve.mainFields = isServer 
      ? ['main', 'module'] 
      : ['browser', 'module', 'main'];

    return config;
  },

  // Performance and security optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Static optimization
  generateStaticParams: true,
  
  // Output configuration for better caching
  output: 'standalone',

  // Headers for caching, security, and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/v1/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // Rewrites for better SEO and performance
  async rewrites() {
    return [
      // API versioning
      {
        source: '/api/v1/:path*',
        destination: '/api/v1/:path*',
      },
    ];
  },

  // Redirects for performance
  async redirects() {
    return [
      // Redirect old API routes to new ones
      {
        source: '/api/old-endpoint',
        destination: '/api/v1/new-endpoint',
        permanent: true,
      },
    ];
  },

  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: false,

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ESLint configuration
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: 'performance-optimized',
  },
};

export default nextConfig;