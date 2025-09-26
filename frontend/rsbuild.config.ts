import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  source: {
    define: {
      "process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": JSON.stringify(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY),
    },
    exclude: [
      /\.spec\.(tsx?|jsx?)$/,
      /\.test\.(tsx?|jsx?)$/,
      /__tests__/,
      /\.stories\.(tsx?|jsx?)$/,
    ],
  },
  html: {
    meta: {
      viewport: "initial-scale=1, width=device-width",
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
