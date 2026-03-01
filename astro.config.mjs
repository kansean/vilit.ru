// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://vilit.ru',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: '0.0.0.0' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ru', locales: { ru: 'ru-RU' } },
    }),
    icon({
      iconDir: 'src/icons',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
