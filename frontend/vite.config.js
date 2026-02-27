import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { templateCompilerOptions } from '@tresjs/core'

const tresIsCustomElement = templateCompilerOptions?.template?.compilerOptions?.isCustomElement

const vueCompilerOptions = {
  ...templateCompilerOptions,
  template: {
    ...(templateCompilerOptions?.template || {}),
    compilerOptions: {
      ...(templateCompilerOptions?.template?.compilerOptions || {}),
      isCustomElement: (tag) => {
        if (tag.startsWith('a-')) return true
        return tresIsCustomElement ? tresIsCustomElement(tag) : false
      },
    },
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(vueCompilerOptions),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      // Ensure external dependencies are not bundled if they cause issues
      external: ['aframe', 'ar.js', 'three'],
    },
  },
})
