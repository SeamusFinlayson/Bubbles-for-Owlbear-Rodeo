import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "background.html"),
        action: resolve(__dirname, "actionPopover.html"),
        popover: resolve(__dirname, "popover.html"),
        playerPopover: resolve(__dirname, "playerPopover.html"),
        nameTagPopover: resolve(__dirname, "src/nameTagPopover.html"),
        playerNameTagPopover: resolve(__dirname, "src/playerNameTagPopover.html"),
      },
    },
  },
});