/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.qrserver.com'], // Permitir este dominio para cargar imágenes
  },
};

export default nextConfig;
