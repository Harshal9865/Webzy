import type { MetadataRoute } from 'next';
import { getWebzyPublicConfig } from '@webzy/core';
import { getActiveThemes } from '@webzy/themes';

export default function sitemap(): MetadataRoute.Sitemap {
  const cfg = getWebzyPublicConfig();
  const baseUrl = cfg.webUrl.replace(/\/+$/, '');
  const now = new Date();

  const staticRouteDefs: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1.0 },
    { path: '/weddings', priority: 0.95 },
    { path: '/themes', priority: 0.9 },
    { path: '/studio', priority: 0.85 },
    { path: '/pricing', priority: 0.85 },
    { path: '/request', priority: 0.8 },
    { path: '/contact', priority: 0.7 },
    { path: '/terms', priority: 0.5 },
    { path: '/privacy', priority: 0.5 },
    { path: '/refund', priority: 0.5 },
    { path: '/content-policy', priority: 0.5 },
    { path: '/takedown', priority: 0.5 },
  ];

  const staticRoutes = staticRouteDefs.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority,
  }));

  const themeRoutes = getActiveThemes({ includeMaanJao: cfg.flags.maanJaoTheme }).map((theme) => ({
    url: `${baseUrl}/themes/${theme.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...themeRoutes];
}
