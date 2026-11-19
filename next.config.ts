import type { NextConfig } from 'next';

/**
 * Exportación estática: el sitio se compila a HTML y se sirve sin servidor.
 * Ver docs/architecture/adr/ADR-001-nextjs-estatico.md
 *
 * Despliegue: Vercel (sin basePath). Si algún día se usa GitHub Pages,
 * habría que añadir basePath + assetPrefix y un .nojekyll.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    // Obligatorio con output: 'export'
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
