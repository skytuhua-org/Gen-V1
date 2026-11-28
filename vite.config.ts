import { defineConfig, normalizePath, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
function devProxy() {
  const value = process.env.HARNESS_PORT ?? "4317";
  const port = Number(value);
  if (!/^\d{1,5}$/.test(value) || port < 1 || port > 65535) {
    throw new Error("HARNESS_PORT must be a port between 1 and 65535.");
  }
  const target = `http://127.0.0.1:${port}`;
  return { "/api": { target, changeOrigin: true }, "/widget-runtime": { target, changeOrigin: true } };
}

const katexFonts = /\/node_modules\/katex\/dist\/fonts\/KaTeX_[^/]+\.woff2?$/;

function katexWebFontFormats(): Plugin {
  return {
    name: "katex-web-font-formats",
    apply: "build",
    enforce: "pre",
    transform(css, id) {
      if (!normalizePath(id).endsWith("/node_modules/katex/dist/katex.min.css")) return;
      // Current browser and desktop targets support WOFF2. Keep the package's
      // original WOFF fallback and omit the duplicate TrueType format.
      return css.replace(/,url\(fonts\/KaTeX_[^()]+\.ttf\) format\("truetype"\)/g, "");
    },
  };
}

// Fixtures share the app root and plugins, not its live development proxy.
export const application = defineConfig({
  root: "apps/web",
  plugins: [react(), katexWebFontFormats()],
  // Prebundle the PDF renderer and the draft worker library so the first preview cannot trigger a dev page reload.
  optimizeDeps: { include: ["pdf-lib", "pdfjs-dist/legacy/build/pdf.mjs"] },
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
    assetsInlineLimit: filePath => katexFonts.test(normalizePath(filePath)) ? false : undefined,
  }
});

export default defineConfig(({ command }) => ({
  ...application,
  server: { host: "127.0.0.1", port: 5173, strictPort: true, proxy: command === "serve" && process.env.GEN_E2E !== "1" ? devProxy() : undefined }
}));
