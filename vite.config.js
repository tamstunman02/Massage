import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Scales px font sizes below 18px up so the smallest text is about 13px
function scaleFontSize(px) {
  if (px >= 18) return px
  return Math.round((13 + ((px - 9) * 5) / 9) * 10) / 10
}

const readableFonts = () => ({
  postcssPlugin: 'readable-fonts',
  Once(root) {
    const file = root.source?.input?.file || ''
    if (!file.endsWith('main.css')) return
    root.walkDecls('font-size', (decl) => {
      decl.value = decl.value.replace(/^(\d+(?:\.\d+)?)px$/, (_, size) => {
        const value = Number(size)
        return `${value < 9 ? 13 : scaleFontSize(value)}px`
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: { plugins: [readableFonts()] },
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
