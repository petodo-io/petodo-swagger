import { defineConfig } from "vite";
import { resolve } from "path";
import { userscriptPlugin } from "./vite-plugin-userscript.js";

export default defineConfig({
  plugins: [userscriptPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.js"),
      name: "PetodoSwagger",
      formats: ["iife"],
      fileName: () => "petodo-swagger.user.js",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        // Инлайним CSS в JS
        inlineDynamicImports: true,
        // Формат для userscript
        format: "iife",
        // Убираем хэши из имени файла
        entryFileNames: "petodo-swagger.user.js",
      },
    },
    // Минификация для production (отключена для отладки)
    minify: false,
    // Увеличиваем лимит предупреждений
    chunkSizeWarningLimit: 1000,
  },
  // Для разработки
  server: {
    port: 3000,
  },
  css: {
    // Отключаем автоматический inject, обрабатываем вручную через ?inline
    inject: false,
  },
});
