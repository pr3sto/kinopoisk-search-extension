import { svelte } from '@sveltejs/vite-plugin-svelte';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

function root(...paths: string[]): string {
  return path.resolve(__dirname, ...paths);
}

export default defineConfig(({ mode }) => ({
  plugins: [
    svelte(),
    webExtension({
      browser: process.env.TARGET || 'chrome',
      disableAutoLaunch: true,
      watchFilePaths: [root('src')],
      manifest: () => {
        const pkg = readJsonFile('package.json');
        const template = readJsonFile('public/manifest.json');
        return {
          version: pkg.version,
          ...template,
        };
      },
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
