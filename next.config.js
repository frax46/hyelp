/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This is needed for Clerk
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Improve hydration by optimizing client references
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Increase timeout for static page generation
  staticPageGenerationTimeout: 300,
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Don't make builds fail on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't make builds fail on TS errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Improve performance by enabling React strict mode
  reactStrictMode: true,
  // Improve performance by compressing
  compress: true,
  // Configure trailing slashes
  trailingSlash: false,
  // Improve SEO
  poweredByHeader: false,
}

module.exports = nextConfig 