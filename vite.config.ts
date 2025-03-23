import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        typescript: true
      }
    })
  ],
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: false
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8'
    }
  }
})
