import type { MetadataRoute } from 'next';
import { getWebzyPublicConfig } from '@webzy/core';

export default function robots(): MetadataRoute.Robots {
  const cfg = getWebzyPublicConfig();
  const baseUrl = cfg.webUrl.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/themes',
          '/themes/*',
          '/pricing',
          '/request',
          '/contact',
          '/terms',
          '/privacy',
          '/refund',
          '/content-policy',
          '/takedown',
        ],
        disallow: [
          '/s/',
          '/preview/',
          '/create/',
          '/checkout',
          '/mock-pay/',
          '/success/',
          '/edit/',
          '/account',
          '/login',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
