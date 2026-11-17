import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Webzy - Digital Keepsakes & Celebration Websites',
    short_name: 'Webzy',
    description:
      'Make a beautiful animated website for birthdays, weddings, anniversaries and love notes in under 2 minutes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E11D63',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
