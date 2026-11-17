export * from './schema';
export * from './data/launchThemes';
export * from './data/payloadBuilder';
export * from './components/TapToOpenCover';
export * from './components/ThemeCardArt';
export * from './components/ThemeRenderer';

export function getThemesRegistrySummary(): {
  schemaVersion: string;
  status: 'phase1_themes_ready';
} {
  return {
    schemaVersion: '1.0',
    status: 'phase1_themes_ready',
  };
}
