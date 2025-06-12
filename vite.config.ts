import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Для доступа извне в development
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          telegram: ['@tma.js/sdk'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  define: {
    // Убираем предупреждения в production
    global: 'globalThis',
  }
})