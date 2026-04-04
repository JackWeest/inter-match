import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Mantém o Supabase liberado (para fotos antigas que ainda estão lá)
      {
        protocol: 'https',
        hostname: 'pelofnnecqpuxjwxbxhm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // 2. 💉 CIRURGIA: Libera o Cloudinary para as fotos novas!
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;