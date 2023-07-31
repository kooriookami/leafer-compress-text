import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
import path from 'path';

const buildLib = {
  lib: {
    entry: path.resolve(__dirname, 'src/compress-text/index.js'),
    name: 'LeaferCompressText',
    fileName: format => `${format}/index.js`,
  },
  rollupOptions: {
    // 确保外部化处理那些你不想打包进库的依赖
    external: ['leafer-ui'],
    output: {
      // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      globals: {
        'leafer-ui': 'leafer-ui',
      },
    },
    plugins: [
      copy({
        targets: [
          { src: 'LICENSE', dest: 'dist' },
          { src: 'README.md', dest: 'dist' },
          { src: 'package.json', dest: 'dist' },
          { src: 'process.png', dest: 'dist' },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
};

const buildWebsite = {
  outDir: 'docs',
};

export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'], // 扩展了.vue后缀
  },
  build: process.argv.includes('lib') ? buildLib : buildWebsite,
});
