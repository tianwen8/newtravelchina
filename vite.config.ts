import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

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
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8'
    }
  },
  preview: {
    port: 4173,
    strictPort: false,
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  }
})
