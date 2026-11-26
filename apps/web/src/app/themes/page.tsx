import { getWebzyPublicConfig } from '@webzy/core';
import { getActiveThemes } from '@webzy/themes';
import { ThemesCatalogueClient } from '../../components/storefront/ThemesCatalogueClient';

export const revalidate = 300;

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const config = getWebzyPublicConfig();
  const params = await searchParams;
  const themes = getActiveThemes({ includeMaanJao: config.flags.maanJaoTheme }).filter(
    (t) => t.occasion !== 'wedding',
  );

  return <ThemesCatalogueClient themes={themes} initialOccasion={params.occasion} />;
}
