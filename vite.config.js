import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: './public',
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: '../postcss.config.js',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand']
  },
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react', '@heroicons/react']
        }
      }
    }
  }
})