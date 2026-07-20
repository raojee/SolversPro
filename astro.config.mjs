import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://solverspro.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/dashboard'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      }
    }),
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}']
      },
      manifest: {
        name: 'SolversPro',
        short_name: 'SolversPro',
        description: 'Free problem solvers for finance, health, math, and trades.',
        theme_color: '#1a1a2e',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});