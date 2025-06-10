/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tensorflow/tfjs', '@tensorflow-models/face-detection']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    
    // TensorFlow.js設定
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })
    
    return config
  },
}

module.exports = nextConfig