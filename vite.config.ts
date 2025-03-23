import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
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
    outDir: 'dist'
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
