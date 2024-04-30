import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "src/background/background.html"),
        action: resolve(__dirname, "src/action/actionPopover.html"),
        editStats: resolve(__dirname, "src/edit-stats/editStats.html"),
        damageTool: resolve(__dirname, "src/damage-tool/damageTool.html"),
      },
    },
  },
});
