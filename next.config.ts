import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      '@google/generative-ai', 
      'groq-sdk', 
      'openai',
      '@supabase/supabase-js',
      'react-hook-form',
      'zod'
    ],
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
  },

  // Bundle optimization with advanced settings
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Enable aggressive minification
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // AI libraries - heavy, split separately
            aiLibs: {
              test: /[\\/]node_modules[\\/](@google\/generative-ai|groq-sdk|openai)[\\/]/,
              name: 'ai-libs',
              priority: 30,
            },
            // React ecosystem
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-libs',
              priority: 25,
            },
            // Supabase
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 20,
            },
            // Form validation
            validation: {
              test: /[\\/]node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/,
              name: 'validation',
              priority: 15,
            },
            // Utilities
            utils: {
              test: /[\\/]node_modules[\\/](clsx|tailwind-merge)[\\/]/,
              name: 'utils',
              priority: 10,
            },
            // Default vendors
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 5,
            },
          },
        },
      }
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-analysis.html'
      }))
    }

    return config
  },

  // Performance and security optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
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
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      // Cache static assets aggressively
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache API responses for a short time
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300'
          }
        ]
      }
    ]
  }
}

export default nextConfig