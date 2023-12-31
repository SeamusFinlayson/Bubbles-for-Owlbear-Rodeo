import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "src/background/background.html"),
        action: resolve(__dirname, "src/action/actionPopover.html"),
        popover: resolve(__dirname, "src/edit-stats/editStatsGm.html"),
        playerPopover: resolve(__dirname, "src/edit-stats/editStatsPlayer.html"),
        nameTagPopover: resolve(__dirname, "src/name-tags/nameTagPopover.html"),
        playerNameTagPopover: resolve(__dirname, "src/name-tags/playerNameTagPopover.html"),
      },
    },
  },
});