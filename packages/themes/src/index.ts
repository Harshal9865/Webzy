export * from './schema';
export * from './data/launchThemes';
export * from './data/payloadBuilder';
export * from './catalogPricing';
export * from './components/TapToOpenCover';
export * from './components/ThemeCardArt';
export * from './components/ThemeRenderer';
export * from './occasions/shared/OccasionPrimitives';
export * from './occasions/BirthdayConfettiSite';
export * from './occasions/BirthdayAshirwadSite';
export * from './occasions/WillYouSite';
export * from './occasions/OurTimelineSite';
export * from './occasions/MaanJaoSite';
export * from './occasions/MakeThemSmileSite';
export * from './occasions/OurYearWrappedSite';
export * from './occasions/HarvestGreetingSite';
export * from './occasions/BusinessGreetingSite';
export * from './occasions/PortfolioSite';
export * from './occasions/SmallBusinessSite';
export * from './weddings';

export function getThemesRegistrySummary(): {
  schemaVersion: string;
  status: 'phase1_themes_ready';
} {
  return {
    schemaVersion: '1.0',
    status: 'phase1_themes_ready',
  };
}
