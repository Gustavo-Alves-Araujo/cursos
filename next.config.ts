const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "poabzfpiirsetoycsgsr.supabase.co",
      },
      {
        protocol: "https",
        hostname: "formacoesholisticas.online",
      },
      {
        protocol: "https",
        hostname: "editorainfinitto.com",
      },
      {
        protocol: "https",
        hostname: "membros.editorainfinitto.com",
      },
    ],
  },
  // Configuração para aceitar uploads de até 50MB
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

export default nextConfig;
