import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/otobusum-nerde/", // Proje ismine göre güncellenmiş base
});
