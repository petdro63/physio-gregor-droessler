import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({mode})=>({
  plugins: [react()],
  publicDir: mode==='firebase'?'output/firebase-public':mode==='production'?'output/node-public':'public',
  server: { middlewareMode: true },
  build: { outDir: mode==='firebase'?'output/firebase-dist':'dist' },
}));
