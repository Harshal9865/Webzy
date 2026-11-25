import type { WeddingThemeKey, WeddingTradition } from './schema';

export interface WeddingThemePalette {
  key: WeddingThemeKey;
  tradition: WeddingTradition;
  isDarkHero: boolean;
  ceremonyArtUrl: string;
  ceremonyBannerDark: boolean;
  pageBg: string;
  parchmentGradient: string;
  weaveStroke: string;
  galleryBandStyle: string;
  closingColophonBandStyle: string;
  pillAccent: string;
  topBarStyle: string;
  topBarMonogramStyle: string;
  topBarActionBtn: string;
  embeddedToolbarStyle: string;
  progressBarGradient: string;
  goldStroke: string;
  goldAccent: string;
  goldInk: string;
  paperSurface: string;
  outerBorder: string;
  innerRuleBorder: string;
  accentText: string;
  proseText: string;
  mutedInk: string;
  bodyInk: string;
  bodyInkSoft: string;
  bodyInkSubtle: string;
  bodyInkMuted: string;
  plaqueTint: string;
  tabletCardBg: string;
  medallionBg: string;
  mapBtnStyle: string;
  primaryBtn: string;
  activeAcceptStyle: string;
  activeMealStyle: string;
  focusUnderline: string;
  confirmSealBg: string;
  bandBgClass: string;
  countdownBandGradient: string;
  venueBandGradient: string;
  lifafaRadialStyle: string;
  footerBgClass: string;
  footerRadialStyle: string;
  ctaTextColor: string;
  ctaGradient: string;
  secondaryOrnamentHex: string;
  fallbackBg: string;
  fallbackIconTone: string;
  defaultInitials: [string, string];
}

export const WEDDING_THEME_PALETTES: Record<WeddingThemeKey, WeddingThemePalette> = {
  emerald: {
    key: 'emerald',
    tradition: 'hindu',
    isDarkHero: false,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-emerald-wide.jpg',
    ceremonyBannerDark: false,
    pageBg: 'bg-[#F6F3EB] text-[#1F3325]',
    parchmentGradient: 'linear-gradient(180deg, #FAF7F0 0%, #F5F2E9 52%, #EFECE2 100%)',
    weaveStroke: '#5A4A28',
    galleryBandStyle: 'bg-[#ECE7DA]/75 border-y border-[#C5A059]/25',
    closingColophonBandStyle: 'bg-[#16271B] border-t border-[#D4AF37]/45',
    pillAccent: 'border-[#C5A059]/60 bg-[#FAF7F0]/95 text-[#1B3121]',
    topBarStyle: 'border-[#C5A059]/40 bg-[#FAF7F0]/90 text-[#1C2F21]',
    topBarMonogramStyle: 'border-[#C5A059]/75 bg-[#1B3121] text-[#F6E1A1] ring-2 ring-[#C5A059]/25',
    topBarActionBtn: 'border-[#C5A059]/45 bg-[#FFFDF8]/85 text-[#1C2F21] hover:border-[#C5A059] hover:bg-white',
    embeddedToolbarStyle: 'border-[#C5A059]/35 bg-[#FAF7F0]/95 text-[#1C2F21]',
    progressBarGradient: 'linear-gradient(90deg, #8C6D23 0%, #D4AF37 55%, #F5E09A 100%)',
    goldStroke: '#C5A059',
    goldAccent: '#D9B664',
    goldInk: 'text-[#8C6D23]',
    paperSurface: 'bg-[#FFFDF8]',
    outerBorder: 'border-[#C5A059]/55',
    innerRuleBorder: 'border-[#C5A059]/28',
    accentText: 'text-[#1D3423]',
    proseText: 'text-[#243628]/90',
    mutedInk: 'text-[#243628]/55',
    bodyInk: 'text-[#243628]',
    bodyInkSoft: 'text-[#243628]/80',
    bodyInkSubtle: 'text-[#243628]/70',
    bodyInkMuted: 'text-[#243628]/65',
    plaqueTint: 'bg-[#F8F5EC]/65 border-[#C5A059]/25',
    tabletCardBg: 'md:bg-[#F7F4EC]/75',
    medallionBg: 'bg-[#1B3121] border-[#C5A059]/70 text-[#F7DC8C]',
    mapBtnStyle: 'border-[#C5A059]/55 bg-[#F8F5EC]/75 text-[#1D3423] hover:bg-[#1B3121] hover:text-[#F6E1A1] hover:border-[#1B3121]',
    primaryBtn: 'bg-[#1B3322] text-[#FCE9B8] border border-[#C5A059]/55 hover:bg-[#132518]',
    activeAcceptStyle: 'border-[#1B3322] bg-[#1B3322] text-[#FCE9B8] shadow-sm',
    activeMealStyle: 'border-[#1B3322] bg-[#1B3322]/[0.08] text-[#1B3322]',
    focusUnderline: 'focus:border-[#223B29]',
    confirmSealBg: 'bg-[#1B3322]',
    bandBgClass: 'bg-[#182C1E]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(226, 188, 92, 0.16) 0%, rgba(24, 44, 30, 0) 68%), linear-gradient(180deg, #142519 0%, #182C1E 50%, #132318 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(232, 193, 92, 0.16) 0%, rgba(24, 44, 30, 0) 66%), linear-gradient(180deg, #15261A 0%, #1A3021 50%, #132318 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(56, 98, 68, 0.56) 0%, rgba(24, 44, 30, 0.98) 60%, #112016 100%)',
    footerBgClass: 'bg-[#142419]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(49, 86, 59, 0.34) 0%, rgba(20, 36, 25, 0.98) 65%, #0F1B13 100%)',
    ctaTextColor: 'text-[#15261A]',
    ctaGradient: 'linear-gradient(135deg, #D9B35A 0%, #F7E3A3 50%, #CE9F3E 100%)',
    secondaryOrnamentHex: '#38513D',
    fallbackBg: 'bg-gradient-to-b from-[#F4F2EA] to-[#EAE7DC]',
    fallbackIconTone: 'text-[#2D4F35]/40',
    defaultInitials: ['A', 'K'],
  },
  'royal-red': {
    key: 'royal-red',
    tradition: 'hindu',
    isDarkHero: true,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-royal-wide.jpg',
    ceremonyBannerDark: true,
    pageBg: 'bg-[#F9F3EE] text-[#2E161E]',
    parchmentGradient: 'linear-gradient(180deg, #FCF7F3 0%, #F7EFE9 55%, #F2E7E0 100%)',
    weaveStroke: '#5E382E',
    galleryBandStyle: 'bg-[#F1E6DF]/80 border-y border-[#D4AF37]/25',
    closingColophonBandStyle: 'bg-[#26040A] border-t border-[#E5C158]/45',
    pillAccent: 'border-[#D4AF37]/65 bg-[#2B050B]/95 text-[#FFF8E7]',
    topBarStyle: 'border-[#D4AF37]/40 bg-[#26040A]/95 text-[#FFF7E6]',
    topBarMonogramStyle: 'border-[#E5C158]/75 bg-[#4D0814] text-[#FCE39A] ring-2 ring-[#E5C158]/25',
    topBarActionBtn: 'border-[#D4AF37]/40 bg-[#3C0711]/80 text-[#FFF7E6] hover:border-[#EBC86A] hover:bg-[#500A16]',
    embeddedToolbarStyle: 'border-[#D4AF37]/35 bg-[#2B050B]/95 text-[#FFF7E6]',
    progressBarGradient: 'linear-gradient(90deg, #A97B22 0%, #E5C158 55%, #FFF0B8 100%)',
    goldStroke: '#D4AF37',
    goldAccent: '#E5C158',
    goldInk: 'text-[#967022]',
    paperSurface: 'bg-[#FFFDFB]',
    outerBorder: 'border-[#D4AF37]/55',
    innerRuleBorder: 'border-[#D4AF37]/28',
    accentText: 'text-[#5C0B19]',
    proseText: 'text-[#331720]/90',
    mutedInk: 'text-[#331720]/55',
    bodyInk: 'text-[#311720]',
    bodyInkSoft: 'text-[#311720]/80',
    bodyInkSubtle: 'text-[#311720]/70',
    bodyInkMuted: 'text-[#311720]/65',
    plaqueTint: 'bg-[#FBF4EE]/65 border-[#D4AF37]/25',
    tabletCardBg: 'md:bg-[#FBF3F0]/75',
    medallionBg: 'bg-[#4B0814] border-[#E5C158]/70 text-[#FCE39A]',
    mapBtnStyle: 'border-[#D4AF37]/55 bg-[#FBF3ED]/80 text-[#5A0B18] hover:bg-[#4B0814] hover:text-[#FCE39A] hover:border-[#4B0814]',
    primaryBtn: 'bg-[#5A0B18] text-[#FCE9B8] border border-[#D4AF37]/55 hover:bg-[#430711]',
    activeAcceptStyle: 'border-[#5A0B18] bg-[#5A0B18] text-[#FCE9B8] shadow-sm',
    activeMealStyle: 'border-[#5A0B18] bg-[#5A0B18]/[0.08] text-[#5A0B18]',
    focusUnderline: 'focus:border-[#6B0F1E]',
    confirmSealBg: 'bg-[#5A0B18]',
    bandBgClass: 'bg-[#2C050C]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(245, 200, 96, 0.17) 0%, rgba(44, 5, 12, 0) 68%), linear-gradient(180deg, #24040A 0%, #2C050C 50%, #200308 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(245, 200, 96, 0.18) 0%, rgba(44, 5, 12, 0) 66%), linear-gradient(180deg, #25040A 0%, #2F060E 50%, #1F0308 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(124, 18, 38, 0.62) 0%, rgba(44, 5, 12, 0.98) 60%, #1E0308 100%)',
    footerBgClass: 'bg-[#24040A]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(114, 15, 34, 0.42) 0%, rgba(36, 4, 10, 0.98) 65%, #1A0207 100%)',
    ctaTextColor: 'text-[#29040A]',
    ctaGradient: 'linear-gradient(135deg, #DFB54E 0%, #FCE6A0 50%, #D29E35 100%)',
    secondaryOrnamentHex: '#6B0F1E',
    fallbackBg: 'bg-gradient-to-b from-[#FAF0EC] to-[#F3E2DE]',
    fallbackIconTone: 'text-[#6B0F1E]/40',
    defaultInitials: ['R', 'S'],
  },
  'royal-blue': {
    key: 'royal-blue',
    tradition: 'hindu',
    isDarkHero: true,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-indigo-wide.jpg',
    ceremonyBannerDark: true,
    pageBg: 'bg-[#F4F5FA] text-[#17223B]',
    parchmentGradient: 'linear-gradient(180deg, #F9FAFD 0%, #F1F3FA 55%, #E7EBF5 100%)',
    weaveStroke: '#35486E',
    galleryBandStyle: 'bg-[#E8ECF6]/80 border-y border-[#C7A75A]/30',
    closingColophonBandStyle: 'bg-[#0C162C] border-t border-[#DFBE6B]/45',
    pillAccent: 'border-[#DFBE6B]/65 bg-[#0F1C36]/95 text-[#FFF8E6]',
    topBarStyle: 'border-[#DFBE6B]/40 bg-[#0D1830]/95 text-[#FFF7E6]',
    topBarMonogramStyle: 'border-[#DFBE6B]/75 bg-[#1B2F59] text-[#F9E3A6] ring-2 ring-[#DFBE6B]/25',
    topBarActionBtn: 'border-[#DFBE6B]/40 bg-[#17284A]/85 text-[#FFF7E6] hover:border-[#F0D388] hover:bg-[#223866]',
    embeddedToolbarStyle: 'border-[#DFBE6B]/35 bg-[#0F1C36]/95 text-[#FFF7E6]',
    progressBarGradient: 'linear-gradient(90deg, #8E7432 0%, #DFBE6B 55%, #FFF2C4 100%)',
    goldStroke: '#C7A75A',
    goldAccent: '#DFBE6B',
    goldInk: 'text-[#876926]',
    paperSurface: 'bg-[#FDFEFF]',
    outerBorder: 'border-[#C7A75A]/55',
    innerRuleBorder: 'border-[#C7A75A]/28',
    accentText: 'text-[#132447]',
    proseText: 'text-[#1E2E4D]/90',
    mutedInk: 'text-[#1E2E4D]/55',
    bodyInk: 'text-[#1A2A48]',
    bodyInkSoft: 'text-[#1A2A48]/80',
    bodyInkSubtle: 'text-[#1A2A48]/70',
    bodyInkMuted: 'text-[#1A2A48]/65',
    plaqueTint: 'bg-[#F3F5FB]/75 border-[#C7A75A]/28',
    tabletCardBg: 'md:bg-[#F2F5FC]/80',
    medallionBg: 'bg-[#132447] border-[#DFBE6B]/70 text-[#F9E3A6]',
    mapBtnStyle: 'border-[#C7A75A]/55 bg-[#F2F5FB]/85 text-[#132447] hover:bg-[#132447] hover:text-[#F9E3A6] hover:border-[#132447]',
    primaryBtn: 'bg-[#132447] text-[#FCEAB9] border border-[#DFBE6B]/55 hover:bg-[#0D1A35]',
    activeAcceptStyle: 'border-[#132447] bg-[#132447] text-[#FCEAB9] shadow-sm',
    activeMealStyle: 'border-[#132447] bg-[#132447]/[0.08] text-[#132447]',
    focusUnderline: 'focus:border-[#1B315E]',
    confirmSealBg: 'bg-[#132447]',
    bandBgClass: 'bg-[#0F1C36]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(223, 190, 107, 0.17) 0%, rgba(15, 28, 54, 0) 68%), linear-gradient(180deg, #0A1429 0%, #10203F 50%, #0A1326 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(223, 190, 107, 0.18) 0%, rgba(15, 28, 54, 0) 66%), linear-gradient(180deg, #0B162C 0%, #132547 50%, #091224 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(35, 62, 118, 0.62) 0%, rgba(15, 28, 54, 0.98) 60%, #081021 100%)',
    footerBgClass: 'bg-[#0B1428]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(32, 58, 108, 0.42) 0%, rgba(11, 20, 40, 0.98) 65%, #070E1D 100%)',
    ctaTextColor: 'text-[#0E1A33]',
    ctaGradient: 'linear-gradient(135deg, #D4B055 0%, #FCE7A6 50%, #C69C3B 100%)',
    secondaryOrnamentHex: '#1A305C',
    fallbackBg: 'bg-gradient-to-b from-[#EEF1F8] to-[#E2E7F3]',
    fallbackIconTone: 'text-[#1B315E]/40',
    defaultInitials: ['M', 'D'],
  },
  'temple-gold': {
    key: 'temple-gold',
    tradition: 'hindu',
    isDarkHero: false,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-temple-wide.jpg',
    ceremonyBannerDark: true,
    pageBg: 'bg-[#FCF6EA] text-[#3B1710]',
    parchmentGradient: 'linear-gradient(180deg, #FFFBF1 0%, #FBF2E0 55%, #F4E6CA 100%)',
    weaveStroke: '#7A471E',
    galleryBandStyle: 'bg-[#F4E8D2]/80 border-y border-[#C88D2E]/30',
    closingColophonBandStyle: 'bg-[#360E0B] border-t border-[#E8BA55]/45',
    pillAccent: 'border-[#C88D2E]/65 bg-[#3D120D]/95 text-[#FFF7E2]',
    topBarStyle: 'border-[#C88D2E]/45 bg-[#FFFBF2]/92 text-[#47140F]',
    topBarMonogramStyle: 'border-[#C88D2E]/75 bg-[#5A1812] text-[#FCE197] ring-2 ring-[#C88D2E]/25',
    topBarActionBtn: 'border-[#C88D2E]/45 bg-[#FFFDF8]/90 text-[#47140F] hover:border-[#C88D2E] hover:bg-white',
    embeddedToolbarStyle: 'border-[#C88D2E]/35 bg-[#FFFBF2]/95 text-[#47140F]',
    progressBarGradient: 'linear-gradient(90deg, #9C5A16 0%, #E0A83A 55%, #FFF0B3 100%)',
    goldStroke: '#C88D2E',
    goldAccent: '#E8BA55',
    goldInk: 'text-[#965B17]',
    paperSurface: 'bg-[#FFFDF6]',
    outerBorder: 'border-[#C88D2E]/55',
    innerRuleBorder: 'border-[#C88D2E]/28',
    accentText: 'text-[#5C1812]',
    proseText: 'text-[#3D1C14]/90',
    mutedInk: 'text-[#3D1C14]/55',
    bodyInk: 'text-[#3B1A12]',
    bodyInkSoft: 'text-[#3B1A12]/80',
    bodyInkSubtle: 'text-[#3B1A12]/70',
    bodyInkMuted: 'text-[#3B1A12]/65',
    plaqueTint: 'bg-[#FCF3E2]/70 border-[#C88D2E]/28',
    tabletCardBg: 'md:bg-[#FAF0DD]/75',
    medallionBg: 'bg-[#5A1812] border-[#E8BA55]/75 text-[#FCE197]',
    mapBtnStyle: 'border-[#C88D2E]/55 bg-[#FBF2E1]/80 text-[#5C1812] hover:bg-[#5A1812] hover:text-[#FCE197] hover:border-[#5A1812]',
    primaryBtn: 'bg-[#5A1812] text-[#FCE8B2] border border-[#E8BA55]/55 hover:bg-[#44110C]',
    activeAcceptStyle: 'border-[#5A1812] bg-[#5A1812] text-[#FCE8B2] shadow-sm',
    activeMealStyle: 'border-[#5A1812] bg-[#5A1812]/[0.08] text-[#5A1812]',
    focusUnderline: 'focus:border-[#6B1C14]',
    confirmSealBg: 'bg-[#5A1812]',
    bandBgClass: 'bg-[#3C100C]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(242, 188, 76, 0.2) 0%, rgba(60, 16, 12, 0) 68%), linear-gradient(180deg, #320C09 0%, #46130E 50%, #2A0A07 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(242, 188, 76, 0.2) 0%, rgba(60, 16, 12, 0) 66%), linear-gradient(180deg, #340D0A 0%, #4B1510 50%, #2B0A08 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(132, 42, 22, 0.62) 0%, rgba(60, 16, 12, 0.98) 60%, #260806 100%)',
    footerBgClass: 'bg-[#310C09]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(118, 36, 20, 0.42) 0%, rgba(49, 12, 9, 0.98) 65%, #200705 100%)',
    ctaTextColor: 'text-[#310C09]',
    ctaGradient: 'linear-gradient(135deg, #DEA43C 0%, #FDE49B 50%, #CA8D24 100%)',
    secondaryOrnamentHex: '#6B1C14',
    fallbackBg: 'bg-gradient-to-b from-[#FAF0DD] to-[#F1DFBE]',
    fallbackIconTone: 'text-[#6B1C14]/40',
    defaultInitials: ['A', 'K'],
  },
  'rose-ivory': {
    key: 'rose-ivory',
    tradition: 'hindu',
    isDarkHero: false,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-rose-wide.jpg',
    ceremonyBannerDark: false,
    pageBg: 'bg-[#FDF6F6] text-[#4A2530]',
    parchmentGradient: 'linear-gradient(180deg, #FFFDFC 0%, #FCF3F4 55%, #F6E7EA 100%)',
    weaveStroke: '#8F5D6B',
    galleryBandStyle: 'bg-[#F5E7EA]/80 border-y border-[#C7985A]/30',
    closingColophonBandStyle: 'bg-[#46202C] border-t border-[#E6C487]/45',
    pillAccent: 'border-[#C7985A]/60 bg-[#FFFBFB]/95 text-[#542634]',
    topBarStyle: 'border-[#C7985A]/40 bg-[#FFFBFB]/92 text-[#542634]',
    topBarMonogramStyle: 'border-[#C7985A]/75 bg-[#5F2A3A] text-[#FCEAD0] ring-2 ring-[#C7985A]/25',
    topBarActionBtn: 'border-[#C7985A]/45 bg-[#FFFDFD]/90 text-[#542634] hover:border-[#C7985A] hover:bg-white',
    embeddedToolbarStyle: 'border-[#C7985A]/35 bg-[#FFFBFB]/95 text-[#542634]',
    progressBarGradient: 'linear-gradient(90deg, #A37242 0%, #D9AE73 55%, #FBE6C2 100%)',
    goldStroke: '#C7985A',
    goldAccent: '#E2BC84',
    goldInk: 'text-[#916434]',
    paperSurface: 'bg-[#FFFDFD]',
    outerBorder: 'border-[#C7985A]/50',
    innerRuleBorder: 'border-[#C7985A]/26',
    accentText: 'text-[#5E2839]',
    proseText: 'text-[#4C2632]/90',
    mutedInk: 'text-[#4C2632]/55',
    bodyInk: 'text-[#47232E]',
    bodyInkSoft: 'text-[#47232E]/80',
    bodyInkSubtle: 'text-[#47232E]/70',
    bodyInkMuted: 'text-[#47232E]/65',
    plaqueTint: 'bg-[#FDF4F5]/75 border-[#C7985A]/28',
    tabletCardBg: 'md:bg-[#FBF0F2]/80',
    medallionBg: 'bg-[#5E2839] border-[#E2BC84]/75 text-[#FCEAD0]',
    mapBtnStyle: 'border-[#C7985A]/55 bg-[#FDF3F5]/80 text-[#5E2839] hover:bg-[#5E2839] hover:text-[#FCEAD0] hover:border-[#5E2839]',
    primaryBtn: 'bg-[#5E2839] text-[#FCEAD0] border border-[#E2BC84]/55 hover:bg-[#491E2C]',
    activeAcceptStyle: 'border-[#5E2839] bg-[#5E2839] text-[#FCEAD0] shadow-sm',
    activeMealStyle: 'border-[#5E2839] bg-[#5E2839]/[0.08] text-[#5E2839]',
    focusUnderline: 'focus:border-[#733246]',
    confirmSealBg: 'bg-[#5E2839]',
    bandBgClass: 'bg-[#4C2130]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(235, 195, 134, 0.18) 0%, rgba(76, 33, 48, 0) 68%), linear-gradient(180deg, #421C29 0%, #562536 50%, #3A1724 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(235, 195, 134, 0.18) 0%, rgba(76, 33, 48, 0) 66%), linear-gradient(180deg, #441D2A 0%, #5A2738 50%, #3B1825 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(132, 62, 84, 0.56) 0%, rgba(76, 33, 48, 0.98) 60%, #341420 100%)',
    footerBgClass: 'bg-[#3E1A26]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(118, 52, 72, 0.4) 0%, rgba(62, 26, 38, 0.98) 65%, #2C101A 100%)',
    ctaTextColor: 'text-[#3E1A26]',
    ctaGradient: 'linear-gradient(135deg, #DDB477 0%, #FCE8C7 50%, #C79958 100%)',
    secondaryOrnamentHex: '#733246',
    fallbackBg: 'bg-gradient-to-b from-[#FCF1F3] to-[#F3E1E5]',
    fallbackIconTone: 'text-[#733246]/40',
    defaultInitials: ['T', 'V'],
  },
  'christian-ivory': {
    key: 'christian-ivory',
    tradition: 'christian',
    isDarkHero: false,
    ceremonyArtUrl: '/templates/weddings/art/ceremony-christian-wide.jpg',
    ceremonyBannerDark: false,
    pageBg: 'bg-[#FAF8F4] text-[#28332B]',
    parchmentGradient: 'linear-gradient(180deg, #FFFEFC 0%, #F9F6F0 55%, #F1ECE2 100%)',
    weaveStroke: '#7A7260',
    galleryBandStyle: 'bg-[#F0ECE4]/80 border-y border-[#C49A55]/28',
    closingColophonBandStyle: 'bg-[#263329] border-t border-[#DEC082]/45',
    pillAccent: 'border-[#C49A55]/60 bg-[#FFFEFB]/95 text-[#2B382E]',
    topBarStyle: 'border-[#C49A55]/40 bg-[#FFFEFB]/92 text-[#2B382E]',
    topBarMonogramStyle: 'border-[#C49A55]/75 bg-[#2F3F33] text-[#F9E8C4] ring-2 ring-[#C49A55]/25',
    topBarActionBtn: 'border-[#C49A55]/45 bg-[#FFFFFF]/90 text-[#2B382E] hover:border-[#C49A55] hover:bg-white',
    embeddedToolbarStyle: 'border-[#C49A55]/35 bg-[#FFFEFB]/95 text-[#2B382E]',
    progressBarGradient: 'linear-gradient(90deg, #9C7838 0%, #D9B775 55%, #FAF0D7 100%)',
    goldStroke: '#C49A55',
    goldAccent: '#DEC082',
    goldInk: 'text-[#87652C]',
    paperSurface: 'bg-[#FFFFFF]',
    outerBorder: 'border-[#C49A55]/50',
    innerRuleBorder: 'border-[#C49A55]/26',
    accentText: 'text-[#2B3B30]',
    proseText: 'text-[#314035]/90',
    mutedInk: 'text-[#314035]/55',
    bodyInk: 'text-[#2D3B31]',
    bodyInkSoft: 'text-[#2D3B31]/80',
    bodyInkSubtle: 'text-[#2D3B31]/70',
    bodyInkMuted: 'text-[#2D3B31]/65',
    plaqueTint: 'bg-[#F8F5EE]/75 border-[#C49A55]/28',
    tabletCardBg: 'md:bg-[#F6F3EC]/80',
    medallionBg: 'bg-[#2F3F33] border-[#DEC082]/75 text-[#F9E8C4]',
    mapBtnStyle: 'border-[#C49A55]/55 bg-[#F8F5EE]/80 text-[#2B3B30] hover:bg-[#2F3F33] hover:text-[#F9E8C4] hover:border-[#2F3F33]',
    primaryBtn: 'bg-[#2F3F33] text-[#F9E8C4] border border-[#DEC082]/55 hover:bg-[#223025]',
    activeAcceptStyle: 'border-[#2F3F33] bg-[#2F3F33] text-[#F9E8C4] shadow-sm',
    activeMealStyle: 'border-[#2F3F33] bg-[#2F3F33]/[0.08] text-[#2F3F33]',
    focusUnderline: 'focus:border-[#3A4F3F]',
    confirmSealBg: 'bg-[#2F3F33]',
    bandBgClass: 'bg-[#26342A]',
    countdownBandGradient:
      'radial-gradient(ellipse 68% 82% at 50% 48%, rgba(226, 196, 132, 0.16) 0%, rgba(38, 52, 42, 0) 68%), linear-gradient(180deg, #212E25 0%, #2B3B30 50%, #1E2A22 100%)',
    venueBandGradient:
      'radial-gradient(ellipse 62% 72% at 28% 50%, rgba(226, 196, 132, 0.16) 0%, rgba(38, 52, 42, 0) 66%), linear-gradient(180deg, #222F26 0%, #2E3F33 50%, #1F2B23 100%)',
    lifafaRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(72, 96, 78, 0.54) 0%, rgba(38, 52, 42, 0.98) 60%, #1B261E 100%)',
    footerBgClass: 'bg-[#202C24]',
    footerRadialStyle:
      'radial-gradient(ellipse at 50% 0%, rgba(62, 84, 68, 0.36) 0%, rgba(32, 44, 36, 0.98) 65%, #17201A 100%)',
    ctaTextColor: 'text-[#202C24]',
    ctaGradient: 'linear-gradient(135deg, #D9B775 0%, #FAF0D7 50%, #C49A55 100%)',
    secondaryOrnamentHex: '#4F6353',
    fallbackBg: 'bg-gradient-to-b from-[#F7F4ED] to-[#ECE7DC]',
    fallbackIconTone: 'text-[#4F6353]/40',
    defaultInitials: ['C', 'A'],
  },
};

export function getWeddingThemePalette(theme?: WeddingThemeKey): WeddingThemePalette {
  return WEDDING_THEME_PALETTES[theme ?? 'emerald'] ?? WEDDING_THEME_PALETTES.emerald;
}
