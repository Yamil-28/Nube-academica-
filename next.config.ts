import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Librerías de exportación de reportes (PDF y Excel): se cargan
  // directamente desde node_modules en el servidor, sin empaquetarlas.
  serverExternalPackages: ["exceljs", "jspdf", "jspdf-autotable"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
