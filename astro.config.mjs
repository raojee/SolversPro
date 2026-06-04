import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://solverspro.com',
  output: 'static',
  integrations: [sitemap(), react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});