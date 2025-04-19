import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const BASE_URL = env.VITE_VIDEO_BASE;
  const VIDEO_PATH = env.VITE_VIDEO_PATH;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/_variables.scss" as *;`,
        },
      },
    },
    server: {
      proxy: {
        '/api/video': {
          target: BASE_URL,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/video.webm/, `${VIDEO_PATH}/video.webm`),
        },
        '/api/full.xml': {
          target: BASE_URL,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/full.xml/, `${VIDEO_PATH}/full.xml`),
        },
        '/api/transcript.vtt': {
          target: BASE_URL,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              /^\/api\/transcript.vtt/,
              `${VIDEO_PATH}/transcript.vtt`
            ),
        },
      },
    },
  };
});
