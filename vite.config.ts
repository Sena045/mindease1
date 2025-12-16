import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || process.env.API_KEY || '')
    },
    resolve: {
      // CRITICAL: Forces Vite to look for 'node' exports.
      // Fixes [commonjs--resolver] error for @google/genai in production builds.
      conditions: ['node', 'import', 'module', 'browser', 'default']
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true
    },
    server: {
      port: 3000,
      host: true
    }
  };
});