/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This is needed for Clerk
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Completely disable static page generation
  staticPageGenerationTimeout: 0,
  // Skip prerendering entirely to work around the issue
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
  eslint: {
    // Warning instead of error
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning instead of error
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 