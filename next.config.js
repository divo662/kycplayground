/** @type {import('next').nextConfig} */
const nextConfig = {
  experimental: {
    // Remove deprecated serverActions option
  },
  images: {
    domains: ['cloud.appwrite.io', 'fra.cloud.appwrite.io'],
  },
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig 