import { notFound, redirect } from 'next/navigation';
import { getWebzyPublicConfig } from '@webzy/core';
import { getActiveThemes, getThemeById } from '@webzy/themes';
import { ThemeDemoClient } from '../../../components/storefront/ThemeDemoClient';

export const revalidate = 300;

export function generateStaticParams() {
  const config = getWebzyPublicConfig();
  return getActiveThemes({ includeMaanJao: config.flags.maanJaoTheme }).map((theme) => ({
    id: theme.id,
  }));
}

export default async function ThemeDemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const config = getWebzyPublicConfig();
  const { id } = await params;
  const theme = getThemeById(id, { includeMaanJao: config.flags.maanJaoTheme });

  if (!theme) {
    notFound();
  }

  if (theme.occasion === 'wedding') {
    redirect(`/weddings/${theme.id}`);
  }

  return (
    <ThemeDemoClient theme={theme} defaultValidityDays={config.defaultValidityDays} />
  );
}
