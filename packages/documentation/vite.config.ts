import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import kiskadee from 'vite-plugin-kiskadee';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svg(), react(), tsconfigPaths(), kiskadee.default()],
});
