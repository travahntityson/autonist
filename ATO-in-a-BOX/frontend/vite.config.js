// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Define the base public path when served in production.
  // Not strictly necessary, but good practice.
  base: '/', 
  
  // Development server configuration
  server: {
    // Vite will proxy API requests from the frontend (default: 5173) 
    // to your backend (default: 3001) in development.
    proxy: {
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
        // The rewrite rule is necessary if the backend does not expect '/api'
        // to be part of the request path, but we'll leave it as is for REST.
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
    // Open the browser automatically on server start
    open: true, 
  },
  
  // Build configuration
  build: {
    // Specify the output directory for production build files
    outDir: 'dist',
    // Generate sourcemaps for debugging production builds
    sourcemap: true,
  }
});