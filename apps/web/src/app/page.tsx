import { getWebzyPublicConfig } from '@webzy/core';
import { getActiveThemes } from '@webzy/themes';
import { HomeClient } from '../components/storefront/HomeClient';

export const revalidate = 300;

export default function HomePage() {
  const config = getWebzyPublicConfig();
  const themes = getActiveThemes({ includeMaanJao: config.flags.maanJaoTheme });

  return <HomeClient themes={themes} />;
}
