import type { MetadataRoute } from 'next';
import { getWebzyPublicConfig } from '@webzy/core';
import { getActiveThemes } from '@webzy/themes';

export default function sitemap(): MetadataRoute.Sitemap {
  const cfg = getWebzyPublicConfig();
  const baseUrl = cfg.webUrl.replace(/\/+$/, '');
  const now = new Date();

  const staticRoutes = [
    '',
    '/themes',
    '/pricing',
    '/request',
    '/contact',
    '/terms',
    '/privacy',
    '/refund',
    '/content-policy',
    '/takedown',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : path === '/themes' ? 0.9 : 0.7,
  }));

  const themeRoutes = getActiveThemes({ includeMaanJao: cfg.flags.maanJaoTheme }).map((theme) => ({
    url: `${baseUrl}/themes/${theme.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...themeRoutes];
}
