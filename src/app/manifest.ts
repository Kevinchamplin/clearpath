import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClearPath',
    short_name: 'ClearPath',
    description: 'Real-time Amtrak grade crossing monitor',
    theme_color: '#0f172a',
    background_color: '#f8fafc',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
