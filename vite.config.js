import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Root user site: served at https://umair-jm.github.io/ so base is "/".
export default defineConfig({
  base: "/",
  plugins: [react()],
});
