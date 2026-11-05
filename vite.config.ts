import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative paths let the same build run at a domain root or under /swatchproof/.
  base: './',
  plugins: [react()],
});
