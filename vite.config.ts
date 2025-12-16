import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // Basic React plugin only. No CDN injection plugins.
    plugins: [react()],
    base: '/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || process.env.API_KEY || '')
    },
    resolve: {
      // FORCE local node_modules resolution.
      conditions: ['node', 'import', 'module', 'browser', 'default'],
      // Prevent aliasing to remote URLs
      alias: []
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        // Ensure only local inputs are processed
        input: {
          main: './index.html',
        },
      }
    },
    server: {
      port: 3000,
      host: true
    }
  };
});