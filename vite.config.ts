import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Par Ici',
        short_name: 'Par Ici',
        display: 'standalone',
        background_color: '#030712',
        theme_color: '#030712',
        icons: [
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          // exclude audio and data from SW cache — always stream fresh
        ],
      },
    }),
  ],
})
