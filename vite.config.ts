import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // CRITICAL: Set base to './' for relative paths in AI Studio/sandboxed environments
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
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-is'],
            charts: ['recharts'],
            utils: ['@google/genai']
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});