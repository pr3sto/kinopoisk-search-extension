import { svelte } from '@sveltejs/vite-plugin-svelte';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';

function root(...paths: string[]): string {
  return path.resolve(__dirname, ...paths);
}

export default defineConfig(({ mode }) => ({
  plugins: [
    svelte(),
    webExtension({
      manifest: 'public/manifest.json',
      browser: process.env.TARGET || 'chrome',
      disableAutoLaunch: true,
      watchFilePaths: [root('src')],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    minify: mode !== 'development',
  },
}));
