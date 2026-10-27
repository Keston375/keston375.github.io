import { defineConfig } from 'vite';

// Served from the root of keston.xyz (user site), so base stays '/'.
export default defineConfig({
  base: '/',
  build: { target: 'es2022' },
});
