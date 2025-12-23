/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exporta como sitio estático (genera /out/index.html)
  output: 'export',

  // Necesario para export estático si llegas a usar <Image />
  images: { unoptimized: true },
};

export default nextConfig;
