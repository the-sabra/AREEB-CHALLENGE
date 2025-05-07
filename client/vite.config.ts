import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      typescript:true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Add optimizeDeps section to better handle Vue 3 types
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
})