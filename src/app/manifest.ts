import { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: site.bg,
    theme_color: site.accent,
    icons: [
      {
        // Primary mark — nearest to standard 512×512 square (any)
        src: '/icon-dark.png',
        sizes: '496x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Same mark declared as maskable so installable PWAs can crop it
        src: '/icon-dark.png',
        sizes: '496x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
