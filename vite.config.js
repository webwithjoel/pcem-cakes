import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'copy-shop-images',
      closeBundle() {
        const source = resolve(projectRoot, 'images');
        if (!existsSync(source)) {
          throw new Error('Expected the supplied image assets in the images directory.');
        }
        cpSync(source, resolve(projectRoot, 'dist', 'images'), { recursive: true });
      },
    },
  ],
});
