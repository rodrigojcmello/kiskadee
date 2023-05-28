/* eslint-disable import/no-extraneous-dependencies, import/no-default-export */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [svgr(), react(), tsconfigPaths()],
});
