import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api': 'https://quiz-application-shantanu.onrender.com' // Proxy API calls to backend
      '/api': process.env.VITE_API_URL
    }
  }
});