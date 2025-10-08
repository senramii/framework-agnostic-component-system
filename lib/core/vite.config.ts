import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/stylesheets/components/index.scss"),
        base: resolve(__dirname, "src/stylesheets/base.scss"),
      },
      name: "employeeManagement",
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
  },
})
