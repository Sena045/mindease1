import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Base must be relative for portable builds (fixes 404s on deploy)
    base: './',
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        API_KEY: JSON.stringify(env.VITE_API_KEY || process.env.API_KEY || '')
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        // Only externalize the AI SDK, bundle everything else (React, etc)
        external: ['@google/genai'],
        output: {
          // Simple naming to prevent hash mismatch errors during dev/refresh
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
