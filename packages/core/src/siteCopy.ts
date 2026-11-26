import type { LanguageCode } from './types';

export interface SiteCopy {
  common: {
    myOrders: string;
    myProfile: string;
    signIn: string;
    signOut: string;
    signingOut: string;
    chooseLanguageTitle: string;
    chooseLanguageSubtitle: string;
    explore: string;
    save: string;
    browseAllThemes: string;
    back: string;
    selected: string;
    tapToSelect: string;
    oneTimePayment: string;
    copyLink: string;
    copied: string;
    openFullScreen: string;
    shareWhatsapp: string;
    allOccasions: string;
    languageLabel: string;
    budgetLabel: string;
    anyPrice: string;
    resetFilters: string;
    noThemesMatch: string;
    daysLink: string;
    gstInclusive: string;
  };
  home: {
    chooseCelebrationTitle: string;
    chooseCelebrationSubtitle: string;
    hubs: {
      weddings: { tag: string; title: string; subtitle: string };
      birthdays: { tag: string; title: string; subtitle: string };
      romance: { tag: string; title: string; subtitle: string };
      festivals: { tag: string; title: string; subtitle: string };
    };
    studioStripTitle: string;
    studioStripBody: string;
    studioStripCta: string;
    instantDeliveryNote: string;
  };
  pricing: {
    headline: string;
    subtitle: string;
    tiers: {
      ready_made: {
        badge: string;
        title: string;
        subtitle: string;
        baseNote: string;
        validity: string;
        features: [string, string, string, string, string];
        ctaLabel: string;
      };
      semi_custom: {
        badge: string;
        title: string;
        subtitle: string;
        baseNote: string;
        validity: string;
        features: [string, string, string, string, string];
        ctaLabel: string;
      };
      studio_bespoke: {
        badge: string;
        title: string;
        subtitle: string;
        baseNote: string;
        validity: string;
        features: [string, string, string, string, string];
        ctaLabel: string;
      };
    };
    optionalExtrasEyebrow: string;
    addonsHeading: string;
    addonsSubhead: string;
    clearExtras: string;
    addedLabel: string;
    addLabel: string;
    addons: {
      pin: { badge: string; title: string; description: string; highlight: string };
      video: { badge: string; title: string; description: string; highlight: string };
      extend_14d: { badge: string; title: string; description: string; highlight: string };
      extend_21d: { badge: string; title: string; description: string; highlight: string };
      lifetime: { badge: string; title: string; description: string; highlight: string };
      extend: { badge: string; title: string; description: string; highlight: string };
    };
    yourSelectedPlan: string;
    estimatedTotal: string;
    studioAddonsNote: string;
    fromPrefix: string;
    guarantees: Array<{ title: string; body: string }>;
  };
  studio: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    steps: [
      { num: string; title: string; detail: string },
      { num: string; title: string; detail: string },
      { num: string; title: string; detail: string },
    ];
    step1Heading: string;
    step1Subtitle: string;
    goToForm: string;
    categories: {
      coaching: { badge: string; title: string; subtitle: string; features: [string, string, string, string] };
      medical: { badge: string; title: string; subtitle: string; features: [string, string, string, string] };
      ecommerce: { badge: string; title: string; subtitle: string; features: [string, string, string, string] };
      wedding_bespoke: { badge: string; title: string; subtitle: string; features: [string, string, string, string] };
      custom_business: { badge: string; title: string; subtitle: string; features: [string, string, string, string] };
    };
    step2Heading: string;
    selectedPrefix: string;
    freeCallIncluded: string;
    preferWhatsapp: string;
    fields: {
      fullName: string;
      businessName: string;
      email: string;
      phone: string;
      city: string;
      websiteType: string;
      notes: string;
    };
    submitIdle: string;
    submitBusy: string;
    sendWhatsapp: string;
    noAdvanceNote: string;
    successTitlePrefix: string;
    messageWhatsappNow: string;
    submitAnother: string;
    readyMadeHeading: string;
    readyMadeBody: string;
    exploreOccasions: string;
    viewWeddings: string;
  };
  weddings: {
    heroEyebrow: string;
    heroTitleLead: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    exploreCollectionCta: string;
    customizePrefix: string;
    stageHint: string;
    guarantees: [string, string, string, string];
    collectionEyebrow: string;
    collectionHeading: string;
    collectionSubtitle: string;
    artEyebrow: string;
    artHeading: string;
    artSubtitle: string;
    ledgerEyebrow: string;
    ledgerHeading: string;
    ledgerBody: string;
    tryLabel: string;
    ledgerPlaceholder: string;
    openLiveGreeting: string;
    personalizedLinkLabel: string;
    unlimitedPerFamily: string;
    craftEyebrow: string;
    craftHeading: string;
    pricingEyebrow: string;
    pricingHeading: string;
    pricingSubtitle: string;
    optionalEnhancements: string;
    tailorAtCheckout: string;
    beginCustomizing: string;
    journeyEyebrow: string;
    journeyHeading: string;
    conciergeEyebrow: string;
    conciergeHeading: string;
    conciergeBody: string;
    conciergeCta: string;
    exploreAllOccasions: string;
    card: {
      customizeAndPay: string;
      interactiveDemo: string;
      fullScreen: string;
      optionalAtCheckout: string;
      daysLive: string;
    };
    demo: {
      backToWeddings: string;
      openFullScreen: string;
      showOpeningGate: string;
      jumpInside: string;
      guestTesterLabel: string;
      guestTesterHint: string;
      insideEdition: string;
      noAccountNote: string;
    };
  };
  account: {
    ordersTitle: string;
    ordersSubtitle: string;
    allOrders: string;
    liveLinks: string;
    paidReceipts: string;
    searchOrders: string;
    profileTitle: string;
    profileSubtitle: string;
    preferredLanguageTitle: string;
    preferredLanguageSubtitle: string;
    signInTitle: string;
    signInSubtitle: string;
    sendCodeBtn: string;
    verifyCodeBtn: string;
    customRequestEyebrow: string;
    customRequestTitle: string;
    customRequestSubtitle: string;
    checkoutReviewAndPay: string;
    checkoutOrderSummary: string;
    checkoutOptionalAddons: string;
    checkoutTotalGst: string;
    checkoutPayByUpi: string;
  };
}

const EN_SITE: SiteCopy = {
  common: {
    myOrders: 'My Orders',
    myProfile: 'My Profile',
    signIn: 'Sign in',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    chooseLanguageTitle: 'Choose your language',
    chooseLanguageSubtitle: 'Select any Indian language — changes the whole website',
    explore: 'Explore',
    save: 'Save',
    browseAllThemes: 'Browse all themes',
    back: 'Back',
    selected: 'Selected',
    tapToSelect: 'Tap to select',
    oneTimePayment: 'One-time payment',
    copyLink: 'Copy Link',
    copied: 'Copied',
    openFullScreen: 'Open Full-Screen Preview',
    shareWhatsapp: 'Share on WhatsApp',
    allOccasions: 'All occasions',
    languageLabel: 'Language',
    budgetLabel: 'Budget',
    anyPrice: 'Any price',
    resetFilters: 'Reset filters',
    noThemesMatch: 'No themes match these filters.',
    daysLink: 'days link',
    gstInclusive: 'GST-inclusive',
  },
  home: {
    chooseCelebrationTitle: 'Choose your celebration',
    chooseCelebrationSubtitle: 'Personalized mobile websites ready in minutes',
    hubs: {
      weddings: {
        tag: 'Weddings',
        title: 'Hindu Vivah Patrikas',
        subtitle: 'Animated palace doors, wax seals, muhurat & guest RSVPs.',
      },
      birthdays: {
        tag: 'Birthdays',
        title: 'Birthdays & Milestones',
        subtitle: 'Interactive balloon taps, confetti bursts & memories.',
      },
      romance: {
        tag: 'Romance',
        title: 'Love & Cheer-Up',
        subtitle: 'Playful proposals, apology cards & sweet notes.',
      },
      festivals: {
        tag: 'Festivals & Family',
        title: 'Family & Festivals',
        subtitle: 'Diwali, New Year, holiday wraps & family greetings.',
      },
    },
    studioStripTitle: 'Webzy Custom Made for Businesses & Weddings',
    studioStripBody:
      'Custom websites for doctors, coaching institutes, shops, and grand weddings — built for you.',
    studioStripCta: 'Explore Custom Made →',
    instantDeliveryNote: 'Instant delivery over WhatsApp · Transparent one-time pricing',
  },
  pricing: {
    headline: 'Simple Plans for Every Indian Celebration',
    subtitle:
      'One-time GST-inclusive pricing with no monthly charges. Pick a product family below or estimate your hosting duration.',
    tiers: {
      ready_made: {
        badge: 'Instant Delivery',
        title: 'Occasion Celebration Sites',
        subtitle:
          'Interactive celebration websites for birthdays, romance, anniversaries, family notes, festivals, and business cards.',
        baseNote: '7-day base hosting included · Ready-made Lifetime Hosting eligible',
        validity: '7 days hosting included',
        features: [
          'Ready in under 3 minutes',
          '1-tap WhatsApp link & QR code',
          'Interactive animations & personal photos',
          'Receiver opens with zero app or login',
          'Free 24-hour edit window after purchase',
        ],
        ctaLabel: 'Browse All Occasions →',
      },
      semi_custom: {
        badge: 'Most Popular',
        title: 'Royal Wedding Invitations',
        subtitle:
          'Six Hindu and Christian wedding editions with animated palace or cathedral doors, ceremony schedules, maps, and RSVPs.',
        baseNote: 'Complete 6-edition wedding suite · Ready-made Lifetime Hosting eligible',
        validity: '7 days hosting included',
        features: [
          'Parting palace & cathedral doors with wax-seal covers',
          'Custom art for phone, tablet & laptop screens',
          'Unlimited personalized family ?to= WhatsApp links',
          'Up to 6 uploaded couple & family photos',
          'Free 24-hour edit window after publishing',
        ],
        ctaLabel: 'Explore Wedding Collection →',
      },
      studio_bespoke: {
        badge: 'Custom Built For You',
        title: 'Custom Made Websites',
        subtitle:
          'Bespoke websites for coaching institutes, clinics, shops, and grand multi-event destination weddings.',
        baseNote: 'Custom quote confirmed after a free 15-minute consultation call',
        validity: 'Custom build · .in / .com domain at actuals',
        features: [
          'Multi-page business or wedding portal',
          'Google Maps directions & WhatsApp inquiry button',
          'Custom .in / .com domain at registrar actuals',
          'Free 15-minute planning call with our designer',
          'Priority WhatsApp support after launch',
        ],
        ctaLabel: 'Explore Custom Made →',
      },
    },
    optionalExtrasEyebrow: 'Hosting Duration & Privacy',
    addonsHeading: 'Tailor Hosting Duration & Add-Ons',
    addonsSubhead: 'Your chosen add-ons are automatically remembered when you reach checkout.',
    clearExtras: 'Clear selected extras',
    addedLabel: 'Added',
    addLabel: '+ Add',
    addons: {
      pin: {
        badge: 'Privacy',
        title: 'Secret PIN Lock',
        description:
          'Protect your page with a 4-digit secret PIN so only invited family or your recipient can open it.',
        highlight: 'Works on Occasions & Weddings',
      },
      video: {
        badge: 'WhatsApp & Instagram',
        title: 'Status Video Export',
        description:
          'Download a ready-to-post vertical keepsake video right after checkout for WhatsApp Status and Stories.',
        highlight: 'Instant 9:16 video download',
      },
      extend_14d: {
        badge: '2 Weeks Live',
        title: 'Extend to 14 Days',
        description:
          'Keep your link active for 14 full days instead of 7 — great for birthday week celebrations.',
        highlight: '14 days active hosting',
      },
      extend_21d: {
        badge: '3 Weeks Live',
        title: 'Extend to 21 Days',
        description:
          'Keep your page online for 21 full days — ideal for multi-week ceremonies and family gatherings.',
        highlight: '21 days active hosting',
      },
      lifetime: {
        badge: 'Never Expires',
        title: 'Lifetime Hosting (Ready-Made)',
        description:
          'Keep your celebration or wedding site online permanently with zero renewal fees. Applies to ready-made product sites only.',
        highlight: 'Permanent hosting · Ready-made only',
      },
      extend: {
        badge: 'Keep It 3 Months',
        title: '3 Months (90 Days) Validity',
        description:
          'Keep your link active for 3 full months (90 days total hosting) for Occasions and Weddings.',
        highlight: '3 months (90 days) active hosting',
      },
    },
    yourSelectedPlan: 'Your Selected Plan',
    estimatedTotal: 'Estimated Total (GST incl.)',
    studioAddonsNote:
      'Lifetime ₹500 add-on applies to Ready-Made sites only (Custom Made billed per build/domain).',
    fromPrefix: 'From',
    guarantees: [
      {
        title: '100% Mobile Ready',
        body: 'Loads smoothly on every phone browser and works cleanly on 4G/5G networks.',
      },
      {
        title: 'Zero App Download',
        body: 'Family and friends open your link directly from WhatsApp with no login required.',
      },
      {
        title: 'Free 24-Hour Edits',
        body: 'Fix any spelling mistake or update your message for free within 24 hours of publishing.',
      },
      {
        title: 'Instant GST Receipt',
        body: 'Clear one-time payment via UPI or Card with an emailed receipt and no hidden renewals.',
      },
    ],
  },
  studio: {
    eyebrow: 'Webzy Custom Made · Bespoke Websites Made Easy',
    headline: 'We Build Your Website For You',
    subtitle:
      'No technical knowledge needed. Whether you run a coaching institute, clinic, local shop, or are planning a grand family wedding, our team designs and launches your website for you.',
    steps: [
      { num: '1', title: 'Pick what you need', detail: 'Tap your business or wedding type below.' },
      {
        num: '2',
        title: 'Share your name & phone',
        detail: 'Fill the short 1-minute form or message us on WhatsApp.',
      },
      {
        num: '3',
        title: 'Get a free 15-min call',
        detail: 'Our designer calls you within 24 hours with exact price & timeline.',
      },
    ],
    step1Heading: 'Step 1: Choose what you want us to build',
    step1Subtitle: 'Tap one option below to select it for your request.',
    goToForm: 'Go to Request Form ↓',
    categories: {
      coaching: {
        badge: 'Education',
        title: 'Coaching & Institutes',
        subtitle: 'Batches, demo class booking, faculty profiles & fee inquiries',
        features: [
          'Course & batch details clearly listed',
          'Direct WhatsApp admission button',
          'Teacher & results showcase',
          'Notes & timetable downloads',
        ],
      },
      medical: {
        badge: 'Healthcare',
        title: 'Doctors & Clinics',
        subtitle: 'OPD timings, clinic Google Map pin & 1-tap WhatsApp appointments',
        features: [
          'Doctor qualifications & services',
          'Clinic hours & instant directions',
          'Patient FAQs & care instructions',
          'Direct WhatsApp appointment booking',
        ],
      },
      ecommerce: {
        badge: 'Retail & Shops',
        title: 'Shops & Boutiques',
        subtitle: 'Product catalog, UPI payment checkout & WhatsApp order alerts',
        features: [
          'Fast mobile product showcase',
          'UPI & card checkout with zero commission',
          'Instant WhatsApp order notification',
          'Easy price & photo updates',
        ],
      },
      wedding_bespoke: {
        badge: 'Grand Weddings',
        title: 'Destination Shaadi Portal',
        subtitle: 'Custom .in/.com domain, multi-resort maps & hotel arrival guide',
        features: [
          'Your own custom wedding web address',
          'Venue maps, travel & hotel check-in guide',
          'Unlimited personalized family links',
          'Private family photo gallery & RSVP list',
        ],
      },
      custom_business: {
        badge: 'Local Services',
        title: 'Local Services & Offices',
        subtitle: 'Gyms, salons, real estate, consultants, CAs & local brands',
        features: [
          'Clean mobile-first design for your brand',
          'Direct phone call & WhatsApp inquiry buttons',
          'Google Maps location & customer reviews',
          'Fast loading on every smartphone',
        ],
      },
    },
    step2Heading: 'Step 2: Reserve Your Custom Made Slot',
    selectedPrefix: 'Selected:',
    freeCallIncluded: 'Free 15-minute consultation call included.',
    preferWhatsapp: 'Prefer WhatsApp? Chat directly →',
    fields: {
      fullName: 'Your full name *',
      businessName: 'Business / Clinic / Family Name',
      email: 'Email address *',
      phone: 'WhatsApp / Phone Number',
      city: 'Your City',
      websiteType: 'Website Type',
      notes: 'Tell us briefly what you need (Optional)',
    },
    submitIdle: 'Request Free 15-Min Call & Quote →',
    submitBusy: 'Saving your request...',
    sendWhatsapp: 'Send on WhatsApp',
    noAdvanceNote: 'No advance payment needed to inquire · Or email us anytime at',
    successTitlePrefix: 'Request Received for',
    messageWhatsappNow: 'Message Us on WhatsApp Now →',
    submitAnother: 'Submit another request',
    readyMadeHeading: 'Want an instant celebration website right now?',
    readyMadeBody:
      'Our ready-made Weddings, Birthdays, Anniversaries, and Festival pages go live in 3 minutes starting at ₹29.',
    exploreOccasions: 'Explore Occasions →',
    viewWeddings: 'View Wedding Invites →',
  },
  weddings: {
    heroEyebrow: 'Webzy Atelier · Indian Wedding Collection',
    heroTitleLead: 'Couture Wedding Websites,',
    heroTitleAccent: 'Alive on Every Screen.',
    heroSubtitle:
      'Move beyond forgotten PDF forwards. Welcome loved ones with bespoke Hindu and Christian wedding editions — parting palace & cathedral doors, silk zari covers, ceremony dress palettes, and personalized greetings for every family on WhatsApp.',
    exploreCollectionCta: 'Explore All 6 Editions',
    customizePrefix: 'Customize',
    stageHint: 'Tap the medallion or wax seal inside the stage to open',
    guarantees: [
      'Instant UPI & GST Receipt',
      '24h Free Edits',
      '7-Day Active Link',
      'Private & Unindexed',
    ],
    collectionEyebrow: 'The 2026–27 Couture Collection',
    collectionHeading: 'Six Bespoke Worlds of Indian Celebration',
    collectionSubtitle:
      'Explore Hindu Vivah and Christian Wedding editions — each opens with bespoke animated artistry and unfolds into a complete multi-day wedding website.',
    artEyebrow: 'Original Architectural Artwork',
    artHeading: 'Composed Separately for Phone, Tablet & Wide Screens',
    artSubtitle:
      'Every Webzy wedding edition includes dedicated vertical 9:16 mobile art, panoramic 16:9 courtyard or chapel murals for tablets and laptops, embossed covers, and bespoke ceremony illustrations.',
    ledgerEyebrow: 'Personalization',
    ledgerHeading: "The Calligrapher's Guest Ledger",
    ledgerBody:
      'Never send an impersonal forward again. Type any family name below to compose an individual WhatsApp invitation link that greets them by name on the cover and pre-fills their RSVP card.',
    tryLabel: 'Try:',
    ledgerPlaceholder: 'Type a family name (e.g. Dr. Mehta & Family)',
    openLiveGreeting: 'Open Live Greeting →',
    personalizedLinkLabel: 'Personalized WhatsApp Link',
    unlimitedPerFamily: 'Unlimited Per Family',
    craftEyebrow: 'Craft & Architecture',
    craftHeading: 'The Art Inside Every Invitation',
    pricingEyebrow: 'Transparent Atelier Tariff',
    pricingHeading: 'Honest One-Time Pricing',
    pricingSubtitle:
      'One GST-inclusive payment for your complete wedding website. Add extra privacy, vertical status video export, or extended validity only if you wish at checkout.',
    optionalEnhancements: 'Optional Enhancements',
    tailorAtCheckout: 'Tailor at Checkout',
    beginCustomizing: 'Begin Customizing',
    journeyEyebrow: 'The Atelier Journey',
    journeyHeading: 'Design Freely First. Pay Once When Ready.',
    conciergeEyebrow: 'Bespoke Destination Concierge · From ₹2,999+',
    conciergeHeading: 'Planning a Multi-Resort Destination Shaadi?',
    conciergeBody:
      'Commission our studio for a custom wedding portal on your personal .in or .com domain — complete with custom illustrated venue maps, hotel room allocation guides, and curated photography galleries.',
    conciergeCta: 'Book Custom Wedding Build (From ₹2,999+) →',
    exploreAllOccasions: 'Explore All Occasions',
    card: {
      customizeAndPay: 'Customize & Pay',
      interactiveDemo: 'Interactive Demo',
      fullScreen: 'Full-Screen',
      optionalAtCheckout: 'Optional at checkout:',
      daysLive: 'days live',
    },
    demo: {
      backToWeddings: 'Back to Webzy Atelier',
      openFullScreen: 'Open Full-Screen Preview',
      showOpeningGate: 'Show Opening Gate',
      jumpInside: 'Jump Inside',
      guestTesterLabel: "Calligrapher's Guest Tester",
      guestTesterHint:
        'Type any family name to watch the live invitation greeting update immediately.',
      insideEdition: 'Inside This Edition',
      noAccountNote:
        'No account required to begin customizing · Pay once via Razorpay UPI at checkout',
    },
  },
  account: {
    ordersTitle: 'My Orders & Live Links',
    ordersSubtitle: 'View your published Webzy links, receipts, and free 24-hour edits.',
    allOrders: 'All Orders',
    liveLinks: 'Live Links',
    paidReceipts: 'Paid Receipts',
    searchOrders: 'Search by name, link or invoice...',
    profileTitle: 'My Profile',
    profileSubtitle: 'Manage your name, WhatsApp number, and preferred language.',
    preferredLanguageTitle: 'Website Language',
    preferredLanguageSubtitle: 'Choose your preferred language for the entire Webzy website.',
    signInTitle: 'Sign in with your email',
    signInSubtitle:
      'We will send a 6-digit verification code to your email — no password needed.',
    sendCodeBtn: 'Send 6-Digit Code →',
    verifyCodeBtn: 'Verify Code & Sign In →',
    customRequestEyebrow: 'Custom Made Requests',
    customRequestTitle: 'Need something built specially for you?',
    customRequestSubtitle:
      'Share your brief for wedding invites, milestone timelines, or brand launches. We reply within 24 hours.',
    checkoutReviewAndPay: 'Review & Pay',
    checkoutOrderSummary: 'Order summary',
    checkoutOptionalAddons: 'Optional Add-Ons',
    checkoutTotalGst: 'Total (GST-inclusive)',
    checkoutPayByUpi: 'Pay by UPI',
  },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function mergeSiteCopy(overrides: DeepPartial<SiteCopy>): SiteCopy {
  return {
    common: { ...EN_SITE.common, ...(overrides.common ?? {}) },
    home: {
      ...EN_SITE.home,
      ...(overrides.home ?? {}),
      hubs: {
        weddings: { ...EN_SITE.home.hubs.weddings, ...(overrides.home?.hubs?.weddings ?? {}) },
        birthdays: { ...EN_SITE.home.hubs.birthdays, ...(overrides.home?.hubs?.birthdays ?? {}) },
        romance: { ...EN_SITE.home.hubs.romance, ...(overrides.home?.hubs?.romance ?? {}) },
        festivals: { ...EN_SITE.home.hubs.festivals, ...(overrides.home?.hubs?.festivals ?? {}) },
      },
    },
    pricing: {
      ...EN_SITE.pricing,
      ...(overrides.pricing ?? {}),
      tiers: {
        ready_made: {
          ...EN_SITE.pricing.tiers.ready_made,
          ...(overrides.pricing?.tiers?.ready_made ?? {}),
        },
        semi_custom: {
          ...EN_SITE.pricing.tiers.semi_custom,
          ...(overrides.pricing?.tiers?.semi_custom ?? {}),
        },
        studio_bespoke: {
          ...EN_SITE.pricing.tiers.studio_bespoke,
          ...(overrides.pricing?.tiers?.studio_bespoke ?? {}),
        },
      },
      addons: {
        pin: { ...EN_SITE.pricing.addons.pin, ...(overrides.pricing?.addons?.pin ?? {}) },
        video: { ...EN_SITE.pricing.addons.video, ...(overrides.pricing?.addons?.video ?? {}) },
        extend_14d: { ...EN_SITE.pricing.addons.extend_14d, ...(overrides.pricing?.addons?.extend_14d ?? {}) },
        extend_21d: { ...EN_SITE.pricing.addons.extend_21d, ...(overrides.pricing?.addons?.extend_21d ?? {}) },
        lifetime: { ...EN_SITE.pricing.addons.lifetime, ...(overrides.pricing?.addons?.lifetime ?? {}) },
        extend: { ...EN_SITE.pricing.addons.extend, ...(overrides.pricing?.addons?.extend ?? {}) },
      },
      guarantees: (overrides.pricing?.guarantees as SiteCopy['pricing']['guarantees']) ?? EN_SITE.pricing.guarantees,
    },
    studio: {
      ...EN_SITE.studio,
      ...(overrides.studio ?? {}),
      steps: (overrides.studio?.steps as SiteCopy['studio']['steps']) ?? EN_SITE.studio.steps,
      categories: {
        coaching: { ...EN_SITE.studio.categories.coaching, ...(overrides.studio?.categories?.coaching ?? {}) },
        medical: { ...EN_SITE.studio.categories.medical, ...(overrides.studio?.categories?.medical ?? {}) },
        ecommerce: { ...EN_SITE.studio.categories.ecommerce, ...(overrides.studio?.categories?.ecommerce ?? {}) },
        wedding_bespoke: {
          ...EN_SITE.studio.categories.wedding_bespoke,
          ...(overrides.studio?.categories?.wedding_bespoke ?? {}),
        },
        custom_business: {
          ...EN_SITE.studio.categories.custom_business,
          ...(overrides.studio?.categories?.custom_business ?? {}),
        },
      },
      fields: { ...EN_SITE.studio.fields, ...(overrides.studio?.fields ?? {}) },
    },
    weddings: {
      ...EN_SITE.weddings,
      ...(overrides.weddings ?? {}),
      guarantees: (overrides.weddings?.guarantees as SiteCopy['weddings']['guarantees']) ?? EN_SITE.weddings.guarantees,
      card: { ...EN_SITE.weddings.card, ...(overrides.weddings?.card ?? {}) },
      demo: { ...EN_SITE.weddings.demo, ...(overrides.weddings?.demo ?? {}) },
    },
    account: { ...EN_SITE.account, ...(overrides.account ?? {}) },
  };
}

export const SITE_COPY: Record<LanguageCode, SiteCopy> = {
  en: EN_SITE,

  hi: mergeSiteCopy({
    common: {
      myOrders: 'मेरे ऑर्डर',
      myProfile: 'मेरी प्रोफ़ाइल',
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      signingOut: 'साइन आउट हो रहा है...',
      chooseLanguageTitle: 'अपनी भाषा चुनें',
      chooseLanguageSubtitle: 'कोई भी भारतीय भाषा चुनें — पूरी वेबसाइट तुरंत बदल जाएगी',
      explore: 'देखें',
      save: 'बचत',
      browseAllThemes: 'सभी थीम्स देखें',
      back: 'वापस',
      selected: 'चुना गया',
      tapToSelect: 'चुनने के लिए टैप करें',
      oneTimePayment: 'एक बार का भुगतान',
      copyLink: 'लिंक कॉपी करें',
      copied: 'कॉपी हो गया',
      openFullScreen: 'फुल-स्क्रीन प्रीव्यू देखें',
      shareWhatsapp: 'WhatsApp पर शेयर करें',
      allOccasions: 'सभी अवसर',
      languageLabel: 'भाषा',
      budgetLabel: 'बजट',
      anyPrice: 'कोई भी कीमत',
      resetFilters: 'फ़िल्टर रीसेट करें',
      noThemesMatch: 'इन फ़िल्टर से कोई थीम नहीं मिली।',
      daysLink: 'दिन तक लाइव',
      gstInclusive: 'GST शामिल',
    },
    home: {
      chooseCelebrationTitle: 'अपना अवसर चुनें',
      chooseCelebrationSubtitle: 'मिनटों में तैयार होने वाली सुंदर मोबाइल वेबसाइट्स',
      hubs: {
        weddings: { tag: 'विवाह', title: 'विवाह निमंत्रण (हिंदू व क्रिश्चियन)', subtitle: 'खुलते महल व चर्च के द्वार, 6 विशेष थीम, कार्यक्रम और RSVP।' },
        birthdays: { tag: 'जन्मदिन', title: 'जन्मदिन और यादें', subtitle: 'गुब्बारों पर टैप, कन्फेटी और यादगार संदेश।' },
        romance: { tag: 'प्यार', title: 'प्यार और मनाना', subtitle: 'प्यारे प्रपोज़ल, माफ़ी कार्ड और दिल के नोट्स।' },
        festivals: { tag: 'त्योहार और परिवार', title: 'परिवार और त्योहार', subtitle: 'दीपावली, नया साल और पारिवारिक शुभकामनाएँ।' },
      },
      studioStripTitle: 'बिज़नेस और शादियों के लिए Webzy कस्टम मेड',
      studioStripBody: 'डॉक्टर, कोचिंग संस्थान, दुकानों और शाही शादियों के लिए कस्टम वेबसाइट — हम खुद बनाकर देंगे।',
      studioStripCta: 'कस्टम मेड देखें →',
      instantDeliveryNote: 'WhatsApp पर तुरंत डिलीवरी · साफ़ एक-मुश्त कीमत',
    },
    pricing: {
      headline: 'हर भारतीय उत्सव के लिए सरल प्लान',
      subtitle: 'एक बार का भुगतान (GST शामिल), कोई मासिक शुल्क नहीं। नीचे किसी भी प्लान पर टैप करके कुल खर्च देखें।',
      tiers: {
        ready_made: {
          badge: 'तुरंत डिलीवरी',
          title: 'रेडी-मेड सेलिब्रेशन',
          subtitle: 'जन्मदिन, प्यार, परिवार और त्योहारों के लिए आसान इंटरैक्टिव कार्ड्स।',
          baseNote: 'अवसर कार्ड ₹29 से शुरू (उदाहरण ₹49)',
          validity: '7 दिन होस्टिंग शामिल',
          features: ['3 मिनट में तैयार', '1-टैप WhatsApp लिंक और QR कोड', 'सुंदर एनीमेशन और फ़ोटो', 'बिना ऐप या लॉगिन के खुलेगा', 'पब्लिश के बाद 24 घंटे फ्री एडिट'],
          ctaLabel: 'सभी अवसर देखें →',
        },
        semi_custom: {
          badge: 'सबसे लोकप्रिय',
          title: 'विवाह निमंत्रण वेबसाइट',
          subtitle: 'हिंदू और क्रिश्चियन विवाह के लिए 6 विशेष थीम, कार्यक्रम, मैप और RSVP के साथ।',
          baseNote: 'सभी 6 couture विवाह वेबसाइट थीम ₹499 से शुरू',
          validity: '7 दिन होस्टिंग शामिल',
          features: ['खुलते महल के द्वार और मोम की मुहर', 'फ़ोन, टैबलेट और लैपटॉप के लिए विशेष कला', 'हर परिवार के नाम का अलग WhatsApp लिंक', '6 फ़ोटो अपलोड की सुविधा', 'पब्लिश के बाद 24 घंटे फ्री एडिट'],
          ctaLabel: 'विवाह संग्रह देखें →',
        },
        studio_bespoke: {
          badge: 'विशेष रूप से निर्मित',
          title: 'कस्टम मेड वेबसाइट्स',
          subtitle: 'कोचिंग, क्लिनिक, दुकानों और भव्य डेस्टिनेशन शादियों के लिए खास वेबसाइट।',
          baseNote: 'फ्री 15-मिनट कॉल के बाद सटीक कीमत तय होगी',
          validity: 'कस्टम निर्माण · .in / .com डोमेन वास्तविक दर पर',
          features: ['मल्टी-पेज बिज़नेस या विवाह पोर्टल', 'Google Maps लोकेशन और WhatsApp बटन', 'कस्टम डोमेन (.in / .com) वास्तविक दर पर', 'डिज़ाइनर के साथ 15-मिनट फ्री कॉल', 'लॉन्च के बाद प्राथमिकता WhatsApp सपोर्ट'],
          ctaLabel: 'कस्टम मेड स्लॉट बुक करें →',
        },
      },
      optionalExtrasEyebrow: 'अतिरिक्त सुविधाएँ (वैकल्पिक)',
      addonsHeading: 'जोड़ने के लिए किसी भी विकल्प पर टैप करें',
      addonsSubhead: 'आपकी चुनी हुई सुविधाएँ चेकआउट पर अपने आप जुड़ जाएँगी।',
      clearExtras: 'चुने हुए विकल्प हटाएँ',
      addedLabel: 'जुड़ गया',
      addLabel: '+ जोड़ें',
      addons: {
        pin: { badge: 'गोपनीयता', title: 'सीक्रेट PIN लॉक', description: '4 अंकों का गुप्त PIN लगाएँ ताकि सिर्फ़ आमंत्रित लोग ही पेज खोल सकें।', highlight: 'अवसर और विवाह दोनों पर उपलब्ध' },
        video: { badge: 'WhatsApp और Instagram', title: 'स्टेटस वीडियो एक्सपोर्ट', description: 'चेकआउट के तुरंत बाद WhatsApp Status के लिए 9:16 वीडियो डाउनलोड करें।', highlight: 'तुरंत 9:16 वीडियो डाउनलोड' },
        extend_14d: { badge: '2 सप्ताह लाइव', title: '14 दिन तक बढ़ाएँ', description: 'अपने लिंक को 7 की जगह पूरे 14 दिन तक लाइव रखें।', highlight: '14 दिन सक्रिय होस्टिंग' },
        extend_21d: { badge: '3 सप्ताह लाइव', title: '21 दिन तक बढ़ाएँ', description: 'मल्टी-वीक कार्यक्रमों और परिवार के लिए 21 दिन की सक्रिय वैधता।', highlight: '21 दिन सक्रिय होस्टिंग' },
        lifetime: { badge: 'स्थायी होस्टिंग', title: 'लाइफटाइम होस्टिंग (रेडी-मेड)', description: 'अपने रेडी-मेड उत्सव या विवाह पेज को बिना नवीनीकरण शुल्क के हमेशा के लिए ऑनलाइन रखें। केवल रेडी-मेड प्रोडक्ट साइट्स के लिए।', highlight: 'स्थायी होस्टिंग · केवल रेडी-मेड' },
        extend: { badge: '3 महीने तक लाइव', title: '3 महीने (90 दिन) वैधता', description: 'लिंक को पूरे 3 महीने (90 दिन) तक सक्रिय रखें — अवसर और विवाह दोनों के लिए।', highlight: '3 महीने (90 दिन) होस्टिंग' },
      },
      yourSelectedPlan: 'आपका चुना हुआ प्लान',
      estimatedTotal: 'अनुमानित कुल राशि (GST शामिल)',
      studioAddonsNote: '₹500 लाइफटाइम होस्टिंग केवल रेडी-मेड प्रोडक्ट साइट्स पर लागू है (कस्टम मेड प्रोजेक्ट के अनुसार तय होता है)।',
      fromPrefix: 'शुरुआत',
      guarantees: [
        { title: '100% मोबाइल फ़्रेंडली', body: 'हर फ़ोन ब्राउज़र और 4G/5G नेटवर्क पर आसानी से खुलता है।' },
        { title: 'कोई ऐप डाउनलोड नहीं', body: 'परिवार और दोस्त बिना लॉगिन सीधे WhatsApp से खोल सकते हैं।' },
        { title: '24 घंटे फ्री सुधार', body: 'पब्लिश के 24 घंटे के भीतर कोई भी स्पेलिंग या संदेश फ्री में बदलें।' },
        { title: 'तुरंत GST रसीद', body: 'UPI या कार्ड से एक बार भुगतान, तुरंत ईमेल पर रसीद।' },
      ],
    },
    studio: {
      eyebrow: 'Webzy कस्टम मेड · आसान कस्टम वेबसाइट',
      headline: 'हम आपकी वेबसाइट खुद बनाकर देंगे',
      subtitle: 'किसी तकनीकी जानकारी की ज़रूरत नहीं। कोचिंग, क्लिनिक, दुकान या भव्य शादी — हमारी टीम पूरी वेबसाइट तैयार करके देगी।',
      steps: [
        { num: '1', title: 'अपना प्रकार चुनें', detail: 'नीचे अपने बिज़नेस या शादी के विकल्प पर टैप करें।' },
        { num: '2', title: 'अपना नाम और फ़ोन दें', detail: '1 मिनट का छोटा फॉर्म भरें या सीधे WhatsApp करें।' },
        { num: '3', title: 'फ्री 15-मिनट कॉल पाएँ', detail: '24 घंटे में हमारे डिज़ाइनर कॉल करके पूरी योजना और कीमत बताएँगे।' },
      ],
      step1Heading: 'चरण 1: आप किसके लिए वेबसाइट बनवाना चाहते हैं?',
      step1Subtitle: 'अपना विकल्प चुनने के लिए नीचे टैप करें।',
      goToForm: 'फॉर्म पर जाएँ ↓',
      categories: {
        coaching: { badge: 'शिक्षा', title: 'कोचिंग और संस्थान', subtitle: 'बैच जानकारी, डेमो क्लास, शिक्षक परिचय और एडमिशन पूछताछ', features: ['कोर्स और बैच की साफ़ जानकारी', 'सीधा WhatsApp एडमिशन बटन', 'शिक्षकों और परिणामों की झलक', 'नोट्स और टाइमटेबल डाउनलोड'] },
        medical: { badge: 'स्वास्थ्य', title: 'डॉक्टर और क्लिनिक', subtitle: 'OPD समय, Google Map लोकेशन और 1-टैप WhatsApp अपॉइंटमेंट', features: ['डॉक्टर की योग्यता और सेवाएँ', 'क्लिनिक समय और लोकेशन मैप', 'मरीज़ों के सवाल-जवाब', 'सीधा WhatsApp अपॉइंटमेंट बटन'] },
        ecommerce: { badge: 'दुकान और बुटीक', title: 'दुकान और ई-कॉमर्स', subtitle: 'प्रोडक्ट कैटलॉग, UPI पेमेंट और WhatsApp ऑर्डर अलर्ट', features: ['तेज़ मोबाइल प्रोडक्ट कैटलॉग', 'बिना कमीशन UPI और कार्ड पेमेंट', 'तुरंत WhatsApp ऑर्डर सूचना', 'कीमत और फ़ोटो बदलना आसान'] },
        wedding_bespoke: { badge: 'शाही विवाह', title: 'डेस्टिनेशन शादी पोर्टल', subtitle: 'अपना .in/.com डोमेन, होटल गाइड और सभी कार्यक्रमों के मैप', features: ['अपना विशेष वेब एड्रेस', 'वेन्यू मैप और होटल चेक-इन गाइड', 'हर परिवार के लिए अलग लिंक', 'निजी फ़ोटो गैलरी और RSVP सूची'] },
        custom_business: { badge: 'स्थानीय सेवाएँ', title: 'स्थानीय सेवाएँ और ऑफिस', subtitle: 'जिम, सैलून, प्रॉपर्टी, सलाहकार, CA और लोकल बिज़नेस', features: ['आपके ब्रांड के अनुसार डिज़ाइन', 'सीधा कॉल और WhatsApp बटन', 'Google Maps और ग्राहक रिव्यू', 'हर स्मार्टफोन पर तेज़ लोडिंग'] },
      },
      step2Heading: 'चरण 2: अपना कस्टम मेड स्लॉट बुक करें',
      selectedPrefix: 'चुना गया:',
      freeCallIncluded: '15 मिनट की फ्री सलाह कॉल शामिल है।',
      preferWhatsapp: 'सीधे WhatsApp पर बात करें →',
      fields: {
        fullName: 'आपका पूरा नाम *',
        businessName: 'बिज़नेस / क्लिनिक / परिवार का नाम',
        email: 'ईमेल पता *',
        phone: 'WhatsApp / फ़ोन नंबर',
        city: 'आपका शहर',
        websiteType: 'वेबसाइट का प्रकार',
        notes: 'आपको क्या सुविधाएँ चाहिए? (वैकल्पिक)',
      },
      submitIdle: 'फ्री 15-मिनट कॉल और कोटेशन लें →',
      submitBusy: 'आपका अनुरोध सहेजा जा रहा है...',
      sendWhatsapp: 'WhatsApp पर भेजें',
      noAdvanceNote: 'पूछताछ के लिए कोई एडवांस पेमेंट नहीं · या ईमेल करें',
      successTitlePrefix: 'अनुरोध प्राप्त हुआ:',
      messageWhatsappNow: 'अभी WhatsApp पर संदेश भेजें →',
      submitAnother: 'नया अनुरोध भेजें',
      readyMadeHeading: 'क्या आपको तुरंत तैयार सेलिब्रेशन वेबसाइट चाहिए?',
      readyMadeBody: 'हमारे रेडी-मेड विवाह, जन्मदिन, सालगिरह और त्योहार पेज ₹29 से 3 मिनट में तैयार हो जाते हैं।',
      exploreOccasions: 'अवसर देखें →',
      viewWeddings: 'विवाह निमंत्रण देखें →',
    },
    weddings: {
      heroEyebrow: 'Webzy Atelier · हिंदू विवाह संग्रह',
      heroTitleLead: 'शाही विवाह पत्रिका,',
      heroTitleAccent: 'हर स्क्रीन पर जीवंत।',
      heroSubtitle: 'साधारण PDF से आगे बढ़ें। शुभ मंत्र, खुलते महल के द्वार, सिंदूरी मोम की मुहर, कार्यक्रम की ड्रेस थीम और हर परिवार के नाम से व्यक्तिगत WhatsApp निमंत्रण भेजें।',
      exploreCollectionCta: 'विवाह संग्रह देखें',
      customizePrefix: 'कस्टमाइज़ करें:',
      stageHint: 'खोलने के लिए भीतर बने स्वर्ण पदक या मोम की मुहर पर टैप करें',
      guarantees: ['तुरंत UPI और GST रसीद', '24 घंटे फ्री सुधार', '7 दिन सक्रिय लिंक', 'निजी और सुरक्षित'],
      collectionEyebrow: '2026–27 विवाह संग्रह',
      collectionHeading: 'भारतीय उत्सव की छह शाही शैलियाँ',
      collectionSubtitle: 'प्रत्येक संस्करण सुंदर खुलने वाले एनीमेशन के साथ पूरे विवाह उत्सव की जानकारी मोबाइल पर प्रस्तुत करता है।',
      artEyebrow: 'मूल भारतीय लघु चित्रकला',
      artHeading: 'फ़ोन, टैबलेट और बड़ी स्क्रीन के लिए अलग कला',
      artSubtitle: 'प्रत्येक संस्करण में मोबाइल के लिए 9:16 चित्र, टैबलेट व लैपटॉप के लिए 16:9 भव्य दृश्य और विवाह मंडप कला शामिल है।',
      ledgerEyebrow: 'व्यक्तिगत निमंत्रण',
      ledgerHeading: 'हर परिवार के नाम का अलग लिंक',
      ledgerBody: 'नीचे किसी भी परिवार का नाम लिखें और तुरंत उनका व्यक्तिगत WhatsApp निमंत्रण लिंक देखें।',
      tryLabel: 'उदाहरण:',
      ledgerPlaceholder: 'परिवार का नाम लिखें (जैसे: शर्मा परिवार)',
      openLiveGreeting: 'लाइव निमंत्रण खोलें →',
      personalizedLinkLabel: 'व्यक्तिगत WhatsApp लिंक',
      unlimitedPerFamily: 'असीमित परिवार लिंक',
      craftEyebrow: 'कला और विशेषताएँ',
      craftHeading: 'हर निमंत्रण में शामिल सुविधाएँ',
      pricingEyebrow: 'पारदर्शी मूल्य',
      pricingHeading: 'सीधी और एक-मुश्त कीमत',
      pricingSubtitle: 'पूरी विवाह वेबसाइट के लिए एक ही भुगतान (GST शामिल)। अतिरिक्त सुविधाएँ चेकआउट पर चुनें।',
      optionalEnhancements: 'वैकल्पिक सुविधाएँ',
      tailorAtCheckout: 'चेकआउट पर जोड़ें',
      beginCustomizing: 'कस्टमाइज़ शुरू करें',
      journeyEyebrow: 'आसान प्रक्रिया',
      journeyHeading: 'पहले फ्री में बनाएँ, तैयार होने पर पेमेंट करें।',
      conciergeEyebrow: 'कस्टम डेस्टिनेशन शादी · ₹2,999+ से',
      conciergeHeading: 'क्या आप डेस्टिनेशन वेडिंग की योजना बना रहे हैं?',
      conciergeBody: 'अपने .in या .com डोमेन पर कस्टम वेन्यू मैप, होटल गाइड और फ़ोटो गैलरी के साथ खास पोर्टल बनवाएँ।',
      conciergeCta: 'कस्टम विवाह वेबसाइट बुक करें →',
      exploreAllOccasions: 'सभी अवसर देखें',
      card: {
        customizeAndPay: 'कस्टमाइज़ और पेमेंट',
        interactiveDemo: 'लाइव डेमो',
        fullScreen: 'फुल-स्क्रीन',
        optionalAtCheckout: 'चेकआउट पर वैकल्पिक:',
        daysLive: 'दिन लाइव',
      },
      demo: {
        backToWeddings: 'विवाह संग्रह पर वापस जाएँ',
        openFullScreen: 'फुल-स्क्रीन प्रीव्यू देखें',
        showOpeningGate: 'मुख्य द्वार दिखाएँ',
        jumpInside: 'अंदर देखें',
        guestTesterLabel: 'अतिथि नाम परीक्षण',
        guestTesterHint: 'किसी भी परिवार का नाम लिखें और लाइव निमंत्रण तुरंत बदलते देखें।',
        insideEdition: 'इस संस्करण में शामिल',
        noAccountNote: 'शुरू करने के लिए लॉगिन ज़रूरी नहीं · चेकआउट पर एक बार UPI भुगतान',
      },
    },
    account: {
      ordersTitle: 'मेरे ऑर्डर और लाइव लिंक',
      ordersSubtitle: 'अपने पब्लिश किए गए लिंक, रसीदें और 24 घंटे के फ्री एडिट देखें।',
      allOrders: 'सभी ऑर्डर',
      liveLinks: 'लाइव लिंक',
      paidReceipts: 'रसीदें',
      searchOrders: 'नाम, लिंक या इनवॉइस से खोजें...',
      profileTitle: 'मेरी प्रोफ़ाइल',
      profileSubtitle: 'अपना नाम, WhatsApp नंबर और पसंदीदा भाषा बदलें।',
      preferredLanguageTitle: 'वेबसाइट की भाषा',
      preferredLanguageSubtitle: 'पूरी Webzy वेबसाइट के लिए अपनी पसंदीदा भाषा चुनें।',
      signInTitle: 'ईमेल से साइन इन करें',
      signInSubtitle: 'हम आपके ईमेल पर 6 अंकों का कोड भेजेंगे — पासवर्ड की ज़रूरत नहीं।',
      sendCodeBtn: '6-अंकों का कोड भेजें →',
      verifyCodeBtn: 'कोड सत्यापित करें →',
      customRequestEyebrow: 'कस्टम मेड अनुरोध',
      customRequestTitle: 'कुछ खास और अलग बनवाना चाहते हैं?',
      customRequestSubtitle: 'अपनी आवश्यकता भेजें। हम 24 घंटे के भीतर ईमेल या 15-मिनट कॉल पर संपर्क करेंगे।',
      checkoutReviewAndPay: 'समीक्षा और भुगतान',
      checkoutOrderSummary: 'ऑर्डर सारांश',
      checkoutOptionalAddons: 'वैकल्पिक अतिरिक्त सुविधाएँ',
      checkoutTotalGst: 'कुल राशि (GST शामिल)',
      checkoutPayByUpi: 'UPI से भुगतान करें',
    },
  }),

  hinglish: mergeSiteCopy({
    common: {
      myOrders: 'Mere Orders',
      myProfile: 'Meri Profile',
      signIn: 'Sign in',
      signOut: 'Sign out',
      signingOut: 'Sign out ho raha hai...',
      chooseLanguageTitle: 'Apni bhasha chuno',
      chooseLanguageSubtitle: 'Koi bhi Indian language chuno — poori website turant badlegi',
      explore: 'Dekho',
      save: 'Bachat',
      browseAllThemes: 'Saare themes dekho',
      back: 'Wapas',
      selected: 'Selected',
      tapToSelect: 'Tap karke chuno',
      oneTimePayment: 'Ek baar payment',
      copyLink: 'Link copy karo',
      copied: 'Copy ho gaya',
      openFullScreen: 'Full-Screen Preview Kholo',
      shareWhatsapp: 'WhatsApp par bhejo',
      allOccasions: 'Saare occasions',
      languageLabel: 'Bhasha',
      budgetLabel: 'Budget',
      anyPrice: 'Koi bhi price',
      resetFilters: 'Filters reset karo',
      noThemesMatch: 'Is filter mein koi theme nahi mili.',
      daysLink: 'din live',
      gstInclusive: 'GST shamil',
    },
    home: {
      chooseCelebrationTitle: 'Kaun sa celebration hai?',
      chooseCelebrationSubtitle: 'Minute mein taiyaar hone wali interactive mobile websites',
      hubs: {
        weddings: { tag: 'Shaadi', title: 'Hindu Vivah Patrikas', subtitle: 'Khulte mahal ke darwaze, wax seal, muhurat aur RSVP.' },
        birthdays: { tag: 'Birthday', title: 'Birthdays & Milestones', subtitle: 'Balloon tap, confetti aur pyaari yaadein.' },
        romance: { tag: 'Pyaar', title: 'Love & Cheer-Up', subtitle: 'Cute proposals, sorry cards aur dil ki baatein.' },
        festivals: { tag: 'Tyohar & Parivaar', title: 'Family & Festivals', subtitle: 'Diwali, New Year aur parivaar ke liye cards.' },
      },
      studioStripTitle: 'Business ke liye Webzy Custom Made',
      studioStripBody: 'Doctors, coaching, shops aur grand weddings ke liye custom website — hum khud bana kar denge.',
      studioStripCta: 'Custom Made dekho →',
      instantDeliveryNote: 'WhatsApp par turant delivery · Saaf one-time pricing',
    },
    pricing: {
      headline: 'Har Indian Celebration ke liye Simple Plans',
      subtitle: 'Ek baar ka GST-inclusive payment, koi monthly fee nahi. Niche kisi bhi plan par tap karke total dekho.',
      tiers: {
        ready_made: { validity: '7 din hosting shamil' },
        semi_custom: { validity: '7 din hosting shamil' },
        studio_bespoke: {
          title: 'Custom Made Websites',
          validity: 'Custom build · .in / .com domain actuals par',
          ctaLabel: 'Explore Custom Made →',
        },
      },
      optionalExtrasEyebrow: 'Optional Extras',
      addonsHeading: 'Add karne ke liye tap karo',
      addonsSubhead: 'Aapke chune hue extras checkout par apne aap select milenge.',
      clearExtras: 'Selected extras hatao',
      addedLabel: 'Jud gaya',
      addLabel: '+ Jodo',
      addons: {
        extend_14d: {
          badge: '2 Hafte Live',
          title: '14 Din Tak Badhao',
          description: '7 din ki jagah poore 14 din link active rakhein — birthday week ke liye best.',
          highlight: '14 din active hosting',
        },
        extend_21d: {
          badge: '3 Hafte Live',
          title: '21 Din Tak Badhao',
          description: 'Multi-week celebrations aur parivaar ke liye poore 21 din active hosting.',
          highlight: '21 din active hosting',
        },
        lifetime: {
          badge: 'Never Expires',
          title: 'Lifetime Hosting (Ready-Made)',
          description: 'Apne ready-made celebration ya wedding page ko bina kisi renewal ke hamesha online rakhein. Sirf ready-made product sites ke liye.',
          highlight: 'Permanent hosting · Ready-made only',
        },
        extend: {
          badge: '3 Mahine Live',
          title: '3 Mahine (90 Din) Validity',
          description: 'Occasion ya Wedding page ko poore 3 mahine (90 din) tak live rakhein.',
          highlight: '3 mahine (90 din) hosting',
        },
      },
      yourSelectedPlan: 'Aapka Chuna Hua Plan',
      estimatedTotal: 'Estimated Total (GST shamil)',
      studioAddonsNote: '₹500 Lifetime Hosting sirf Ready-Made sites par lagu hota hai (Custom Made build aur domain ke hisaab se quote hota hai).',
      fromPrefix: 'Shuru',
    },
    studio: {
      eyebrow: 'Webzy Custom Made · Custom Websites Aasaan',
      headline: 'Hum Aapki Website Khud Bana Kar Denge',
      subtitle: 'Koi technical jhanjhat nahi. Coaching, clinic, shop ya grand shaadi — hamari team poori website ready karegi.',
      step1Heading: 'Step 1: Kya banwana hai chuno',
      step1Subtitle: 'Niche apna business ya shaadi option tap karo.',
      goToForm: 'Form par jao ↓',
      step2Heading: 'Step 2: Apna Custom Made Slot Book Karo',
      preferWhatsapp: 'Seedha WhatsApp par baat karo →',
      submitIdle: 'Free 15-Min Call & Quote Lo →',
      sendWhatsapp: 'WhatsApp par bhejo',
    },
    weddings: {
      heroEyebrow: 'Webzy Atelier · Hindu Vivah Collection',
      heroTitleLead: 'Shahi Vivah Patrikas,',
      heroTitleAccent: 'Har Screen Par Khaas.',
      exploreCollectionCta: 'Collection Dekho',
      customizePrefix: 'Customize karo:',
      stageHint: 'Kholne ke liye andar medallion ya wax seal par tap karo',
      collectionHeading: 'Shaadi ke Chhah Royal Editions',
      pricingHeading: 'Seedha One-Time Pricing',
      journeyHeading: 'Pehle Free Banao. Ready Hone Par Pay Karo.',
    },
    account: {
      ordersTitle: 'Mere Orders aur Live Links',
      ordersSubtitle: 'Apne live links, receipts aur 24 ghante ke free edits dekho.',
      profileTitle: 'Meri Profile',
      preferredLanguageTitle: 'Website ki Bhasha',
      signInTitle: 'Email se sign in karo',
    },
  }),

  gu: mergeSiteCopy({
    common: {
      myOrders: 'મારા ઓર્ડર',
      myProfile: 'મારી પ્રોફાઇલ',
      signIn: 'સાઇન ઇન',
      signOut: 'સાઇન આઉટ',
      signingOut: 'સાઇન આઉટ થઈ રહ્યું છે...',
      chooseLanguageTitle: 'તમારી ભાષા પસંદ કરો',
      chooseLanguageSubtitle: 'કોઈપણ ભારતીય ભાષા પસંદ કરો — આખી વેબસાઇટ તરત બદલાશે',
      explore: 'જુઓ',
      save: 'બચત',
      browseAllThemes: 'બધી થીમ્સ જુઓ',
      back: 'પાછા જાઓ',
      selected: 'પસંદ કરેલ',
      tapToSelect: 'પસંદ કરવા ટૅપ કરો',
      oneTimePayment: 'એક જ વાર ચુકવણી',
      copyLink: 'લિંક કોપી કરો',
      copied: 'કોપી થયું',
      openFullScreen: 'ફુલ-સ્ક્રીન પ્રીવ્યુ ખોલો',
      shareWhatsapp: 'WhatsApp પર શેર કરો',
      allOccasions: 'બધા પ્રસંગો',
      languageLabel: 'ભાષા',
      budgetLabel: 'બજેટ',
      anyPrice: 'કોઈપણ કિંમત',
      resetFilters: 'ફિલ્ટર રીસેટ કરો',
      noThemesMatch: 'આ ફિલ્ટર મુજબ કોઈ થીમ મળી નથી.',
      daysLink: 'દિવસ લાઈવ',
      gstInclusive: 'GST સહિત',
    },
    home: {
      chooseCelebrationTitle: 'તમારો પ્રસંગ પસંદ કરો',
      chooseCelebrationSubtitle: 'મિનિટોમાં તૈયાર થતી સુંદર મોબાઇલ વેબસાઇટ્સ',
      hubs: {
        weddings: { tag: 'લગ્ન', title: 'હિંદુ લગ્ન કંકોત્રી', subtitle: 'ખુલતા મહેલના દરવાજા, શાહી મહોર, મુહૂર્ત અને RSVP.' },
        birthdays: { tag: 'જન્મદિવસ', title: 'જન્મદિવસ અને યાદો', subtitle: 'બલૂન ટૅપ, કન્ફેટી અને ખાસ સંદેશાઓ.' },
        romance: { tag: 'પ્રેમ', title: 'પ્રેમ અને શુભેચ્છા', subtitle: 'પ્રપોઝલ, સોરી કાર્ડ અને દિલની વાત.' },
        festivals: { tag: 'તહેવાર અને પરિવાર', title: 'પરિવાર અને તહેવારો', subtitle: 'દિવાળી, નવું વર્ષ અને પારિવારિક શુભેચ્છાઓ.' },
      },
      studioStripTitle: 'વ્યવસાય માટે Webzy કસ્ટમ મેડ',
      studioStripBody: 'ડોક્ટર, કોચિંગ ક્લાસ, દુકાનો અને ભવ્ય લગ્નો માટે કસ્ટમ વેબસાઇટ — અમે બનાવી આપીશું.',
      studioStripCta: 'કસ્ટમ મેડ જુઓ →',
      instantDeliveryNote: 'WhatsApp પર તરત ડિલિવરી · સ્પષ્ટ એક-વારની કિંમત',
    },
    pricing: {
      headline: 'દરેક ભારતીય પ્રસંગ માટે સરળ પ્લાન',
      subtitle: 'એક જ વાર ચુકવણી (GST સહિત), કોઈ માસિક ચાર્જ નહીં. કુલ અંદાજ જોવા નીચે કોઈપણ પ્લાન પસંદ કરો.',
      tiers: {
        ready_made: {
          badge: 'તરત ડિલિવરી',
          title: 'રેડી-મેડ પ્રસંગો',
          subtitle: 'જન્મદિવસ, પ્રેમ, પરિવાર અને તહેવારો માટે સરળ ઇન્ટરેક્ટિવ કાર્ડ.',
          baseNote: 'પ્રસંગ કાર્ડ ₹29 થી શરૂ (ઉદાહરણ ₹49)',
          validity: '7 દિવસ હોસ્ટિંગ સામેલ',
          features: ['3 મિનિટમાં તૈયાર', '1-ટૅપ WhatsApp લિંક અને QR કોડ', 'સુંદર એનિમેશન અને ફોટા', 'કોઈ એપ કે લોગિન વગર ખુલે', 'પબ્લિશ પછી 24 કલાક ફ્રી સુધારો'],
          ctaLabel: 'બધા પ્રસંગો જુઓ →',
        },
        semi_custom: {
          badge: 'સૌથી લોકપ્રિય',
          title: 'હિંદુ લગ્ન કંકોત્રી',
          subtitle: 'મહેલના દરવાજા અને મીણની મહોર સાથે સંપૂર્ણ લગ્ન વેબસાઇટ, કાર્યક્રમો અને RSVP.',
          baseNote: 'સંપૂર્ણ સ્વર્ણ વાટિકા અથવા સિંદૂરા મહેલ લગ્ન વેબસાઇટ',
          validity: '7 દિવસ હોસ્ટિંગ સામેલ',
          features: ['ખુલતા મહેલના દરવાજા અને મીણની મહોર', 'ફોન, ટેબ્લેટ અને લેપટોપ માટે ખાસ કલા', 'દરેક પરિવાર માટે અલગ WhatsApp લિંક', '6 ફોટા અપલોડ કરવાની સુવિધા', 'પબ્લિશ પછી 24 કલાક ફ્રી સુધારો'],
          ctaLabel: 'લગ્ન કલેક્શન જુઓ →',
        },
        studio_bespoke: {
          badge: 'ખાસ તમારા માટે',
          title: 'કસ્ટમ મેડ વેબસાઇટ્સ',
          subtitle: 'કોચિંગ, ક્લિનિક, દુકાનો અને ભવ્ય ડેસ્ટિનેશન લગ્નો માટે કસ્ટમ વેબસાઇટ.',
          baseNote: 'ફ્રી 15-મિનિટ કોલ પછી ચોક્કસ કિંમત નક્કી થશે',
          validity: 'કસ્ટમ નિર્માણ · .in / .com ડોમેન વાસ્તવિક દરે',
          features: ['મલ્ટી-પેજ બિઝનેસ કે લગ્ન પોર્ટલ', 'Google Maps અને WhatsApp બટન', 'કસ્ટમ ડોમેન (.in / .com) વાસ્તવિક દરે', 'ડિઝાઇનર સાથે 15-મિનિટ ફ્રી કોલ', 'લોન્ચ પછી WhatsApp સપોર્ટ'],
          ctaLabel: 'કસ્ટમ મેડ સ્લોટ બુક કરો →',
        },
      },
      addons: {
        lifetime: {
          badge: 'કાયમી હોસ્ટિંગ',
          title: 'લાઇફટાઇમ હોસ્ટિંગ (રેડી-મેડ)',
          description: 'તમારી રેડી-મેડ શુભેચ્છા કે લગ્ન વેબસાઇટને કોઈપણ રિન્યુઅલ ચાર્જ વગર કાયમ માટે ઓનલાઇન રાખો. ફક્ત રેડી-મેડ સાઇટ્સ માટે.',
          highlight: 'કાયમી હોસ્ટિંગ · ફક્ત રેડી-મેડ',
        },
      },
      optionalExtrasEyebrow: 'વૈકલ્પિક સુવિધાઓ',
      addonsHeading: 'ઉમેરવા માટે કોઈપણ સુવિધા પર ટૅપ કરો',
      addonsSubhead: 'તમારી પસંદ કરેલી સુવિધાઓ ચેકઆઉટ પર આપમેળે જોડાઈ જશે.',
      clearExtras: 'પસંદગી દૂર કરો',
      addedLabel: 'ઉમેરાયું',
      addLabel: '+ ઉમેરો',
      yourSelectedPlan: 'તમારો પસંદ કરેલો પ્લાન',
      estimatedTotal: 'અંદાજિત કુલ રકમ (GST સહિત)',
      fromPrefix: 'શરૂઆત',
    },
    studio: {
      eyebrow: 'Webzy કસ્ટમ મેડ · સરળ કસ્ટમ વેબસાઇટ',
      headline: 'અમે તમારી વેબસાઇટ બનાવી આપીશું',
      subtitle: 'કોઈ ટેકનિકલ જ્ઞાનની જરૂર નથી. કોચિંગ, ક્લિનિક, દુકાન કે ભવ્ય લગ્ન — અમારી ટીમ તમારી વેબસાઇટ તૈયાર કરશે.',
      step1Heading: 'પગલું 1: તમારે શેના માટે વેબસાઇટ જોઈએ છે?',
      step1Subtitle: 'નીચે એક વિકલ્પ પસંદ કરો.',
      goToForm: 'ફોર્મ પર જાઓ ↓',
      step2Heading: 'પગલું 2: તમારો પ્રાયોરિટી સ્લોટ બુક કરો',
      selectedPrefix: 'પસંદ કરેલ:',
      freeCallIncluded: 'ફ્રી 15-મિનિટ સલાહ કોલ સામેલ છે.',
      preferWhatsapp: 'સીધા WhatsApp પર વાત કરો →',
      fields: {
        fullName: 'તમારું પૂરું નામ *',
        businessName: 'વ્યવસાય / ક્લિનિક / પરિવારનું નામ',
        email: 'ઈમેલ સરનામું *',
        phone: 'WhatsApp / ફોન નંબર',
        city: 'તમારું શહેર',
        websiteType: 'વેબસાઇટનો પ્રકાર',
        notes: 'તમને કઈ સુવિધાઓ જોઈએ છે? (વૈકલ્પિક)',
      },
      submitIdle: 'ફ્રી 15-મિનિટ કોલ અને ભાવ મેળવો →',
      submitBusy: 'તમારી વિનંતી સાચવી રહ્યા છીએ...',
      sendWhatsapp: 'WhatsApp પર મોકલો',
      readyMadeHeading: 'શું તમારે અત્યારે જ પ્રસંગની વેબસાઇટ જોઈએ છે?',
      exploreOccasions: 'પ્રસંગો જુઓ →',
      viewWeddings: 'લગ્ન કંકોત્રી જુઓ →',
    },
    weddings: {
      heroEyebrow: 'Webzy Atelier · હિંદુ લગ્ન સંગ્રહ',
      heroTitleLead: 'શાહી લગ્ન કંકોત્રી,',
      heroTitleAccent: 'દરેક સ્ક્રીન પર જીવંત.',
      exploreCollectionCta: 'કલેક્શન જુઓ',
      customizePrefix: 'કસ્ટમાઇઝ કરો:',
      stageHint: 'ખોલવા માટે અંદરના ગોલ્ડ મેડલ કે મહોર પર ટૅપ કરો',
      collectionHeading: 'ભારતીય ઉત્સવની છ શાહી શૈલીઓ',
      artHeading: 'ફોન, ટેબ્લેટ અને મોટી સ્ક્રીન માટે અલગ કલા',
      ledgerHeading: 'દરેક પરિવારના નામની અલગ લિંક',
      openLiveGreeting: 'લાઈવ કંકોત્રી ખોલો →',
      pricingHeading: 'સરળ અને સ્પષ્ટ એક-વારની કિંમત',
      beginCustomizing: 'કસ્ટમાઇઝ શરૂ કરો',
      journeyHeading: 'પહેલા ફ્રીમાં બનાવો, તૈયાર થાય ત્યારે પેમેન્ટ કરો.',
      card: { customizeAndPay: 'કસ્ટમાઇઝ અને પેમેન્ટ', interactiveDemo: 'લાઈવ ડેમો', fullScreen: 'ફુલ-સ્ક્રીન', optionalAtCheckout: 'ચેકઆઉટ પર વૈકલ્પિક:', daysLive: 'દિવસ લાઈવ' },
      demo: { backToWeddings: 'લગ્ન સંગ્રહ પર પાછા જાઓ', openFullScreen: 'ફુલ-સ્ક્રીન પ્રીવ્યુ', showOpeningGate: 'મુખ્ય દ્વાર જુઓ', jumpInside: 'અંદર જુઓ', guestTesterLabel: 'અતિથિ નામ પરીક્ષણ', insideEdition: 'આ આવૃત્તિમાં સામેલ' },
    },
    account: {
      ordersTitle: 'મારા ઓર્ડર અને લાઈવ લિંક',
      profileTitle: 'મારી પ્રોફાઇલ',
      preferredLanguageTitle: 'વેબસાઇટની ભાષા',
      signInTitle: 'ઈમેલ વડે સાઇન ઇન કરો',
      checkoutReviewAndPay: 'સમીક્ષા અને ચુકવણી',
      checkoutOrderSummary: 'ઓર્ડર સારાંશ',
      checkoutOptionalAddons: 'વૈકલ્પિક સુવિધાઓ',
      checkoutTotalGst: 'કુલ રકમ (GST સહિત)',
      checkoutPayByUpi: 'UPI થી ચુકવો',
    },
  }),

  mr: mergeSiteCopy({
    common: {
      myOrders: 'माझे ऑर्डर',
      myProfile: 'माझी प्रोफाइल',
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      signingOut: 'साइन आउट होत आहे...',
      chooseLanguageTitle: 'तुमची भाषा निवडा',
      chooseLanguageSubtitle: 'कोणतीही भारतीय भाषा निवडा — संपूर्ण वेबसाइट लगेच बदलेल',
      explore: 'पहा',
      save: 'बचत',
      browseAllThemes: 'सर्व थीम्स पहा',
      back: 'मागे',
      selected: 'निवडलेले',
      tapToSelect: 'निवडण्यासाठी टॅप करा',
      oneTimePayment: 'एकदाच पेमेंट',
      copyLink: 'लिंक कॉपी करा',
      copied: 'कॉपी झाले',
      openFullScreen: 'फुल-स्क्रीन प्रिव्ह्यू उघडा',
      shareWhatsapp: 'WhatsApp वर शेअर करा',
      allOccasions: 'सर्व प्रसंग',
      languageLabel: 'भाषा',
      budgetLabel: 'बजेट',
      anyPrice: 'कोणतीही किंमत',
      resetFilters: 'फिल्टर रीसेट करा',
      noThemesMatch: 'या फिल्टरसाठी कोणतीही थीम सापडली नाही.',
      daysLink: 'दिवस लाइव्ह',
      gstInclusive: 'GST सह',
    },
    home: {
      chooseCelebrationTitle: 'तुमचा प्रसंग निवडा',
      chooseCelebrationSubtitle: 'काही मिनिटांत तयार होणाऱ्या सुंदर मोबाइल वेबसाइट्स',
      hubs: {
        weddings: { tag: 'लग्नपत्रिका', title: 'हिंदू विवाह पत्रिका', subtitle: 'उघडणारे राजवाड्याचे दरवाजे, शाही मुद्रा, मुहूर्त व RSVP.' },
        birthdays: { tag: 'वाढदिवस', title: 'वाढदिवस आणि आठवणी', subtitle: 'फुग्यांवर टॅप, कन्फेटी आणि गोड शुभेच्छा.' },
        romance: { tag: 'प्रेम', title: 'प्रेम आणि शुभेच्छा', subtitle: 'प्रपोजल, माफी कार्ड आणि मनातील भावना.' },
        festivals: { tag: 'सण आणि कुटुंब', title: 'कुटुंब आणि सण', subtitle: 'दिवाळी, नवीन वर्ष आणि कौटुंबिक शुभेच्छा.' },
      },
      studioStripTitle: 'व्यवसायासाठी Webzy कस्टम मेड',
      studioStripBody: 'डॉक्टर, कोचिंग क्लासेस, दुकाने आणि भव्य लग्नांसाठी कस्टम वेबसाइट — आम्ही बनवून देऊ.',
      studioStripCta: 'कस्टम मेड पहा →',
      instantDeliveryNote: 'WhatsApp वर त्वरित डिलिव्हरी · पारदर्शक एकदाच किंमत',
    },
    pricing: {
      headline: 'प्रत्येक भारतीय उत्सवासाठी सोपे प्लॅन्स',
      subtitle: 'एकदाच पेमेंट (GST सह), कोणतेही मासिक शुल्क नाही. एकूण अंदाज पाहण्यासाठी कोणताही प्लॅन निवडा.',
      tiers: {
        ready_made: {
          badge: 'त्वरित डिलिव्हरी',
          title: 'रेडी-मेड शुभेच्छा',
          subtitle: 'वाढदिवस, प्रेम, कुटुंब आणि सणांसाठी सोपे डिजिटल कार्ड्स.',
          baseNote: 'प्रसंग कार्ड ₹29 पासून सुरू (उदाहरण ₹49)',
          validity: '7 दिवस होस्टिंग समाविष्ट',
          features: ['3 मिनिटांत तयार', '1-टॅप WhatsApp लिंक व QR कोड', 'सुंदर अ‍ॅनिमेशन व फोटो', 'ॲप किंवा लॉगिनशिवाय उघडते', 'पब्लिश नंतर 24 तास मोफत सुधारणा'],
          ctaLabel: 'सर्व प्रसंग पहा →',
        },
        semi_custom: {
          badge: 'सर्वाधिक लोकप्रिय',
          title: 'हिंदू लग्नपत्रिका वेबसाइट',
          subtitle: 'राजवाड्याचे दरवाजे आणि मेणाच्या मुद्रेसह संपूर्ण लग्न वेबसाइट, कार्यक्रम व RSVP.',
          baseNote: 'संपूर्ण स्वर्ण वाटिका किंवा सिंदूरा महल लग्नपत्रिका',
          validity: '7 दिवस होस्टिंग समाविष्ट',
          features: ['उघडणारे दरवाजे व शाही मुद्रा', 'फोन, टॅबलेट व लॅपटॉपसाठी खास कला', 'प्रत्येक कुटुंबासाठी वेगळी WhatsApp लिंक', '6 फोटो अपलोड करण्याची सोय', 'पब्लिश नंतर 24 तास मोफत सुधारणा'],
          ctaLabel: 'लग्नपत्रिका संग्रह पहा →',
        },
        studio_bespoke: {
          badge: 'खास तुमच्यासाठी',
          title: 'कस्टम मेड वेबसाइट्स',
          subtitle: 'कोचिंग, क्लिनिक, दुकाने आणि भव्य डेस्टिनेशन लग्नांसाठी खास वेबसाइट.',
          baseNote: '15 मिनिटांच्या मोफत कॉलनंतर अचूक दर कळवले जातील',
          validity: 'कस्टम बांधणी · .in / .com डोमेन प्रत्यक्ष दरात',
          features: ['मल्टी-पेज व्यवसाय किंवा विवाह पोर्टल', 'Google Maps व WhatsApp बटन', 'कस्टम डोमेन (.in / .com) प्रत्यक्ष दरात', 'डिझायनरसोबत 15-मिनिट मोफत कॉल', 'लाँचनंतर WhatsApp सपोर्ट'],
          ctaLabel: 'कस्टम मेड स्लॉट बुक करा →',
        },
      },
      addons: {
        lifetime: {
          badge: 'कायमचे होस्टिंग',
          title: 'लाइफटाइम होस्टिंग (रेडी-मेड)',
          description: 'तुमची रेडी-मेड शुभेच्छा किंवा लग्न वेबसाइट नूतनीकरण शुल्काशिवाय कायमची ऑनलाइन ठेवा. फक्त रेडी-मेड साइट्ससाठी.',
          highlight: 'कायमचे होस्टिंग · फक्त रेडी-मेड',
        },
      },
      optionalExtrasEyebrow: 'पर्यायी सुविधा',
      addonsHeading: 'जोडण्यासाठी कोणत्याही सुविधेवर टॅप करा',
      addonsSubhead: 'तुम्ही निवडलेल्या सुविधा चेकआउटवर आपोआप जोडल्या जातील.',
      clearExtras: 'निवड काढून टाका',
      addedLabel: 'जोडले',
      addLabel: '+ जोडा',
      yourSelectedPlan: 'तुमचा निवडलेला प्लॅन',
      estimatedTotal: 'अंदाजित एकूण रक्कम (GST सह)',
      fromPrefix: 'सुरुवात',
    },
    studio: {
      eyebrow: 'Webzy कस्टम मेड · सोपी कस्टम वेबसाइट',
      headline: 'आम्ही तुमची वेबसाइट बनवून देऊ',
      subtitle: 'तांत्रिक ज्ञानाची गरज नाही. कोचिंग, क्लिनिक, दुकान किंवा भव्य लग्न — आमची टीम तुमची वेबसाइट तयार करून देईल.',
      step1Heading: 'टप्पा 1: तुम्हाला कशासाठी वेबसाइट हवी आहे?',
      step1Subtitle: 'खालीलपैकी एक पर्याय निवडा.',
      goToForm: 'फॉर्मवर जा ↓',
      step2Heading: 'टप्पा 2: तुमचा प्राधान्य स्लॉट बुक करा',
      selectedPrefix: 'निवडलेले:',
      freeCallIncluded: '15 मिनिटांचा मोफत सल्ला कॉल समाविष्ट.',
      preferWhatsapp: 'थेट WhatsApp वर बोला →',
      fields: {
        fullName: 'तुमचे पूर्ण नाव *',
        businessName: 'व्यवसाय / क्लिनिक / कुटुंबाचे नाव',
        email: 'ईमेल पत्ता *',
        phone: 'WhatsApp / फोन नंबर',
        city: 'तुमचे शहर',
        websiteType: 'वेबसाइट प्रकार',
        notes: 'तुम्हाला काय हवे आहे थोडक्यात लिहा (पर्यायी)',
      },
      submitIdle: 'मोफत 15-मिनिट कॉल आणि कोटेशन घ्या →',
      submitBusy: 'तुमची विनंती जतन होत आहे...',
      sendWhatsapp: 'WhatsApp वर पाठवा',
      readyMadeHeading: 'लगेच तयार होणारी शुभेच्छा वेबसाइट हवी आहे का?',
      exploreOccasions: 'प्रसंग पहा →',
      viewWeddings: 'लग्नपत्रिका पहा →',
    },
    weddings: {
      heroEyebrow: 'Webzy Atelier · हिंदू विवाह संग्रह',
      heroTitleLead: 'शाही विवाह पत्रिका,',
      heroTitleAccent: 'प्रत्येक स्क्रीनवर जिवंत.',
      exploreCollectionCta: 'संग्रह पहा',
      customizePrefix: 'तयार करा:',
      stageHint: 'उघडण्यासाठी आतील पदक किंवा मुद्रेवर टॅप करा',
      collectionHeading: 'भारतीय सोहळ्यांचे सहा शाही प्रकार',
      artHeading: 'फोन, टॅबलेट आणि मोठ्या स्क्रीनसाठी स्वतंत्र कला',
      ledgerHeading: 'प्रत्येक कुटुंबाच्या नावाची स्वतंत्र लिंक',
      openLiveGreeting: 'थेट पत्रिका उघडा →',
      pricingHeading: 'सोपी आणि स्पष्ट एकदाच किंमत',
      beginCustomizing: 'तयार करण्यास सुरुवात करा',
      journeyHeading: 'आधी मोफत तयार करा, पसंत पडल्यावर पेमेंट करा.',
      card: { customizeAndPay: 'तयार करा आणि पेमेंट', interactiveDemo: 'थेट डेमो', fullScreen: 'फुल-स्क्रीन', optionalAtCheckout: 'चेकआउटवर पर्यायी:', daysLive: 'दिवस लाइव्ह' },
      demo: { backToWeddings: 'लग्नपत्रिका संग्रहाकडे परत', openFullScreen: 'फुल-स्क्रीन प्रिव्ह्यू', showOpeningGate: 'मुख्य द्वार पहा', jumpInside: 'आतील भाग पहा', guestTesterLabel: 'अतिथी नाव चाचणी', insideEdition: 'या आवृत्तीमध्ये समाविष्ट' },
    },
    account: {
      ordersTitle: 'माझे ऑर्डर आणि लाइव्ह लिंक्स',
      profileTitle: 'माझी प्रोफाइल',
      preferredLanguageTitle: 'वेबसाइटची भाषा',
      signInTitle: 'ईमेलने साइन इन करा',
      checkoutReviewAndPay: 'तपासा आणि पेमेंट करा',
      checkoutOrderSummary: 'ऑर्डर सारांश',
      checkoutOptionalAddons: 'पर्यायी सुविधा',
      checkoutTotalGst: 'एकूण रक्कम (GST सह)',
      checkoutPayByUpi: 'UPI ने पेमेंट करा',
    },
  }),

  pa: mergeSiteCopy({
    common: {
      myOrders: 'ਮੇਰੇ ਆਰਡਰ',
      myProfile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ',
      signIn: 'ਸਾਈਨ ਇਨ',
      signOut: 'ਸਾਈਨ ਆਊਟ',
      chooseLanguageTitle: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
      chooseLanguageSubtitle: 'ਕੋਈ ਵੀ ਭਾਰਤੀ ਭਾਸ਼ਾ ਚੁਣੋ — ਪੂਰੀ ਵੈੱਬਸਾਈਟ ਤੁਰੰਤ ਬਦਲੇਗੀ',
      explore: 'ਵੇਖੋ',
      save: 'ਬਚਤ',
      browseAllThemes: 'ਸਾਰੇ ਥੀਮ ਵੇਖੋ',
      back: 'ਪਿੱਛੇ',
      selected: 'ਚੁਣਿਆ ਗਿਆ',
      tapToSelect: 'ਚੁਣਨ ਲਈ ਟੈਪ ਕਰੋ',
      oneTimePayment: 'ਇੱਕ ਵਾਰ ਭੁਗਤਾਨ',
      copyLink: 'ਲਿੰਕ ਕਾਪੀ ਕਰੋ',
      copied: 'ਕਾਪੀ ਹੋ ਗਿਆ',
      openFullScreen: 'ਫੁੱਲ-ਸਕ੍ਰੀਨ ਪ੍ਰੀਵਿਊ',
      shareWhatsapp: 'WhatsApp ਤੇ ਸਾਂਝਾ ਕਰੋ',
      allOccasions: 'ਸਾਰੇ ਮੌਕੇ',
      languageLabel: 'ਭਾਸ਼ਾ',
      budgetLabel: 'ਬਜਟ',
      anyPrice: 'ਕੋਈ ਵੀ ਕੀਮਤ',
      resetFilters: 'ਫਿਲਟਰ ਰੀਸੈੱਟ ਕਰੋ',
      daysLink: 'ਦਿਨ ਲਾਈਵ',
      gstInclusive: 'GST ਸਮੇਤ',
    },
    home: {
      chooseCelebrationTitle: 'ਆਪਣਾ ਮੌਕਾ ਚੁਣੋ',
      chooseCelebrationSubtitle: 'ਮਿੰਟਾਂ ਵਿੱਚ ਤਿਆਰ ਹੋਣ ਵਾਲੀਆਂ ਸੁੰਦਰ ਮੋਬਾਈਲ ਵੈੱਬਸਾਈਟਾਂ',
      hubs: {
        weddings: { tag: 'ਵਿਆਹ', title: 'ਸ਼ਾਹੀ ਵਿਆਹ ਸੱਦਾ', subtitle: 'ਖੁੱਲ੍ਹਦੇ ਮਹਿਲ ਦੇ ਦਰਵਾਜ਼ੇ, ਮੋਹਰ, ਮੁਹੂਰਤ ਅਤੇ RSVP।' },
        birthdays: { tag: 'ਜਨਮਦਿਨ', title: 'ਜਨਮਦਿਨ ਅਤੇ ਯਾਦਾਂ', subtitle: 'ਗੁਬਾਰੇ, ਕਨਫੈਟੀ ਅਤੇ ਪਿਆਰੇ ਸੁਨੇਹੇ।' },
        romance: { tag: 'ਪਿਆਰ', title: 'ਪਿਆਰ ਅਤੇ ਸ਼ੁਭਕਾਮਨਾਵਾਂ', subtitle: 'ਖਾਸ ਪ੍ਰਪੋਜ਼ਲ, ਮਾਫ਼ੀ ਕਾਰਡ ਅਤੇ ਦਿਲ ਦੀਆਂ ਗੱਲਾਂ।' },
        festivals: { tag: 'ਤਿਉਹਾਰ ਅਤੇ ਪਰਿਵਾਰ', title: 'ਪਰਿਵਾਰ ਅਤੇ ਤਿਉਹਾਰ', subtitle: 'ਦੀਵਾਲੀ, ਨਵਾਂ ਸਾਲ ਅਤੇ ਪਰਿਵਾਰਕ ਸੁਨੇਹੇ।' },
      },
      studioStripTitle: 'ਕਾਰੋਬਾਰ ਲਈ Webzy ਕਸਟਮ ਮੇਡ',
      studioStripBody: 'ਡਾਕਟਰ, ਕੋਚਿੰਗ, ਦੁਕਾਨਾਂ ਅਤੇ ਵੱਡੇ ਵਿਆਹਾਂ ਲਈ ਕਸਟਮ ਵੈੱਬਸਾਈਟ — ਅਸੀਂ ਖੁਦ ਬਣਾ ਕੇ ਦੇਵਾਂਗੇ।',
      studioStripCta: 'ਕਸਟਮ ਮੇਡ ਵੇਖੋ →',
    },
    pricing: {
      headline: 'ਹਰ ਭਾਰਤੀ ਜਸ਼ਨ ਲਈ ਸਰਲ ਪਲੈਨ',
      subtitle: 'ਇੱਕ ਵਾਰ ਭੁਗਤਾਨ (GST ਸਮੇਤ), ਕੋਈ ਮਹੀਨਾਵਾਰ ਚਾਰਜ ਨਹੀਂ। ਹੇਠਾਂ ਕਿਸੇ ਵੀ ਪਲੈਨ ਤੇ ਟੈਪ ਕਰੋ।',
      addonsHeading: 'ਸ਼ਾਮਲ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ',
      addons: {
        lifetime: {
          badge: 'ਸਦਾ ਲਈ ਹੋਸਟਿੰਗ',
          title: 'ਲਾਈਫਟਾਈਮ ਹੋਸਟਿੰਗ (ਰੇਡੀ-ਮੇਡ)',
          description: 'ਆਪਣੇ ਰੇਡੀ-ਮੇਡ ਜਸ਼ਨ ਜਾਂ ਵਿਆਹ ਦੇ ਪੇਜ ਨੂੰ ਬਿਨਾਂ ਕਿਸੇ ਨਵਿਆਉਣ ਫੀਸ ਦੇ ਹਮੇਸ਼ਾ ਲਈ ਆਨਲਾਈਨ ਰੱਖੋ। ਸਿਰਫ਼ ਰੇਡੀ-ਮੇਡ ਸਾਈਟਾਂ ਲਈ।',
          highlight: 'ਸਥਾਈ ਹੋਸਟਿੰਗ · ਸਿਰਫ਼ ਰੇਡੀ-ਮੇਡ',
        },
      },
      yourSelectedPlan: 'ਤੁਹਾਡਾ ਚੁਣਿਆ ਪਲੈਨ',
      estimatedTotal: 'ਅੰਦਾਜ਼ਨ ਕੁੱਲ ਰਕਮ (GST ਸਮੇਤ)',
      addedLabel: 'ਜੁੜ ਗਿਆ',
      addLabel: '+ ਜੋੜੋ',
    },
    studio: {
      eyebrow: 'Webzy ਕਸਟਮ ਮੇਡ · ਆਸਾਨ ਕਸਟਮ ਵੈੱਬਸਾਈਟ',
      headline: 'ਅਸੀਂ ਤੁਹਾਡੀ ਵੈੱਬਸਾਈਟ ਖੁਦ ਬਣਾਵਾਂਗੇ',
      step1Heading: 'ਕਦਮ 1: ਤੁਸੀਂ ਕਿਸ ਲਈ ਵੈੱਬਸਾਈਟ ਚਾਹੁੰਦੇ ਹੋ?',
      step2Heading: 'ਕਦਮ 2: ਆਪਣਾ ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
      submitIdle: 'ਫ੍ਰੀ 15-ਮਿੰਟ ਕਾਲ ਅਤੇ ਕੀਮਤ ਲਓ →',
      sendWhatsapp: 'WhatsApp ਤੇ ਭੇਜੋ',
    },
    weddings: {
      heroTitleLead: 'ਸ਼ਾਹੀ ਵਿਆਹ ਸੱਦਾ ਪੱਤਰ,',
      heroTitleAccent: 'ਹਰ ਸਕ੍ਰੀਨ ਤੇ ਜੀਵੰਤ।',
      exploreCollectionCta: 'ਕਲੈਕਸ਼ਨ ਵੇਖੋ',
      customizePrefix: 'ਬਣਾਓ:',
      collectionHeading: 'ਭਾਰਤੀ ਜਸ਼ਨ ਦੀਆਂ ਛੇ ਸ਼ਾਹੀ ਸ਼ੈਲੀਆਂ',
      pricingHeading: 'ਸਿੱਧੀ ਇੱਕ-ਵਾਰ ਕੀਮਤ',
    },
    account: {
      ordersTitle: 'ਮੇਰੇ ਆਰਡਰ ਅਤੇ ਲਾਈਵ ਲਿੰਕ',
      profileTitle: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ',
      preferredLanguageTitle: 'ਵੈੱਬਸਾਈਟ ਦੀ ਭਾਸ਼ਾ',
      signInTitle: 'ਈਮੇਲ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ',
    },
  }),

  bn: mergeSiteCopy({
    common: {
      myOrders: 'আমার অর্ডার',
      myProfile: 'আমার প্রোফাইল',
      signIn: 'সাইন ইন',
      signOut: 'সাইন আউট',
      chooseLanguageTitle: 'আপনার ভাষা বেছে নিন',
      chooseLanguageSubtitle: 'যেকোনো ভারতীয় ভাষা বেছে নিন — পুরো ওয়েবসাইট সঙ্গে সঙ্গে বদলে যাবে',
      explore: 'দেখুন',
      save: 'সাশ্রয়',
      browseAllThemes: 'সব থিম দেখুন',
      back: 'পেছনে',
      selected: 'নির্বাচিত',
      tapToSelect: 'বেছে নিতে ট্যাপ করুন',
      oneTimePayment: 'এককালীন পেমেন্ট',
      copyLink: 'লিংক কপি করুন',
      copied: 'কপি হয়েছে',
      openFullScreen: 'ফুল-স্ক্রিন প্রিভিউ',
      shareWhatsapp: 'WhatsApp-এ শেয়ার করুন',
      allOccasions: 'সব অনুষ্ঠান',
      languageLabel: 'ভাষা',
      budgetLabel: 'বাজেট',
      anyPrice: 'যেকোনো মূল্য',
      resetFilters: 'ফিল্টার রিসেট করুন',
      daysLink: 'দিন লাইভ',
      gstInclusive: 'GST সহ',
    },
    home: {
      chooseCelebrationTitle: 'আপনার অনুষ্ঠান বেছে নিন',
      chooseCelebrationSubtitle: 'কয়েক মিনিটে তৈরি সুন্দর মোবাইল ওয়েবসাইট',
      hubs: {
        weddings: { tag: 'বিবাহ', title: 'রাজকীয় বিবাহ নিমন্ত্রণ', subtitle: 'খোলা প্রাসাদ দ্বার, সিল, শুভলগ্ন এবং RSVP।' },
        birthdays: { tag: 'জন্মদিন', title: 'জন্মদিন ও স্মৃতি', subtitle: 'বেলুন ট্যাপ, কনফেটি ও প্রিয় বার্তা।' },
        romance: { tag: 'ভালোবাসা', title: 'ভালোবাসা ও শুভেচ্ছা', subtitle: 'প্রপোজাল, সরি কার্ড ও মনের কথা।' },
        festivals: { tag: 'উৎসব ও পরিবার', title: 'পরিবার ও উৎসব', subtitle: 'দীপাবলি, নববর্ষ ও পারিবারিক শুভেচ্ছা।' },
      },
      studioStripTitle: 'ব্যবসার জন্য Webzy কাস্টম মেইড',
      studioStripBody: 'ডাক্তার, কোচিং, দোকান ও বড় বিবাহের জন্য কাস্টম ওয়েবসাইট — আমরাই তৈরি করে দেব।',
      studioStripCta: 'কাস্টম মেইড দেখুন →',
    },
    pricing: {
      headline: 'প্রতিটি ভারতীয় উৎসবের জন্য সহজ প্ল্যান',
      subtitle: 'এককালীন পেমেন্ট (GST সহ), কোনো মাসিক চার্জ নেই। মোট খরচ দেখতে যেকোনো প্ল্যানে ট্যাপ করুন।',
      addonsHeading: 'যোগ করতে ট্যাপ করুন',
      addons: {
        lifetime: {
          badge: 'স্থায়ী হোস্টিং',
          title: 'লাইফটাইম হোস্টিং (রেডি-মেড)',
          description: 'কোনো রিনিউয়াল ফি ছাড়াই আপনার রেডি-মেড উৎসব বা বিয়ের পেজটি চিরকাল অনলাইন রাখুন। শুধুমাত্র রেডি-মেড সাইটের জন্য।',
          highlight: 'স্থায়ী হোস্টিং · শুধুমাত্র রেডি-মেড',
        },
      },
      yourSelectedPlan: 'আপনার নির্বাচিত প্ল্যান',
      estimatedTotal: 'আনুমানিক মোট (GST সহ)',
      addedLabel: 'যুক্ত হয়েছে',
      addLabel: '+ যোগ করুন',
    },
    studio: {
      eyebrow: 'Webzy কাস্টম মেইড · সহজ কাস্টম ওয়েবসাইট',
      headline: 'আমরা আপনার ওয়েবসাইট তৈরি করে দেব',
      step1Heading: 'ধাপ ১: আপনি কী ধরনের ওয়েবসাইট চান?',
      step2Heading: 'ধাপ ২: আপনার স্লট বুক করুন',
      submitIdle: 'ফ্রি ১৫ মিনিটের কল ও কোটেশন নিন →',
      sendWhatsapp: 'WhatsApp-এ পাঠান',
    },
    weddings: {
      heroTitleLead: 'রাজকীয় বিবাহ আমন্ত্রণপত্র,',
      heroTitleAccent: 'প্রতিটি স্ক্রিনে জীবন্ত।',
      exploreCollectionCta: 'কালেকশন দেখুন',
      customizePrefix: 'তৈরি করুন:',
      collectionHeading: 'ভারতীয় উৎসবের ছয়টি রাজকীয় সংস্করণ',
      pricingHeading: 'সহজ এককালীন মূল্য',
    },
    account: {
      ordersTitle: 'আমার অর্ডার ও লাইভ লিংক',
      profileTitle: 'আমার প্রোফাইল',
      preferredLanguageTitle: 'ওয়েবসাইটের ভাষা',
      signInTitle: 'ইমেল দিয়ে সাইন ইন করুন',
    },
  }),

  ta: mergeSiteCopy({
    common: {
      myOrders: 'எனது ஆர்டர்கள்',
      myProfile: 'எனது சுயவிவரம்',
      signIn: 'உள்நுழைக',
      signOut: 'வெளியேறு',
      chooseLanguageTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
      chooseLanguageSubtitle: 'எந்த இந்திய மொழியையும் தேர்ந்தெடுக்கவும் — முழு தளமும் உடனே மாறும்',
      explore: 'பார்க்க',
      save: 'சேமிப்பு',
      browseAllThemes: 'அனைத்து தீம்களும்',
      back: 'பின்செல்',
      selected: 'தேர்ந்தெடுக்கப்பட்டது',
      tapToSelect: 'தேர்ந்தெடுக்க தட்டவும்',
      oneTimePayment: 'ஒரே முறை கட்டணம்',
      copyLink: 'இணைப்பை நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது',
      openFullScreen: 'முழுத்திரை முன்னோட்டம்',
      shareWhatsapp: 'WhatsApp-இல் பகிர்',
      allOccasions: 'அனைத்து நிகழ்வுகள்',
      languageLabel: 'மொழி',
      budgetLabel: 'பட்ஜெட்',
      anyPrice: 'எந்த விலையும்',
      resetFilters: 'வடிகட்டியை மீட்டமை',
      daysLink: 'நாட்கள் செயலில்',
      gstInclusive: 'GST உட்பட',
    },
    home: {
      chooseCelebrationTitle: 'உங்கள் கொண்டாட்டத்தைத் தேர்ந்தெடுக்கவும்',
      chooseCelebrationSubtitle: 'சில நிமிடங்களில் தயாராகும் அழகிய மொபைல் இணையதளங்கள்',
      hubs: {
        weddings: { tag: 'திருமணம்', title: 'திருமண அழைப்பிதழ்கள்', subtitle: 'அரண்மனை கதவுகள், முத்திரை, முகூர்த்தம் & RSVP.' },
        birthdays: { tag: 'பிறந்தநாள்', title: 'பிறந்தநாள் வாழ்த்துகள்', subtitle: 'பலூன் அனிமேஷன் மற்றும் இனிய நினைவுகள்.' },
        romance: { tag: 'அன்பு', title: 'அன்பு & வாழ்த்துகள்', subtitle: 'இனிய காதல் மற்றும் மகிழ்ச்சி அட்டைகள்.' },
        festivals: { tag: 'பண்டிகை & குடும்பம்', title: 'குடும்பம் & பண்டிகைகள்', subtitle: 'தீபாவளி, புத்தாண்டு மற்றும் குடும்ப வாழ்த்துகள்.' },
      },
      studioStripTitle: 'வணிகத்திற்கான Webzy கஸ்டம் மேட்',
      studioStripBody: 'மருத்துவர்கள், பயிற்சி மையங்கள், கடைகள் மற்றும் திருமணங்களுக்கு தனிப்பயன் இணையதளம்.',
      studioStripCta: 'கஸ்டம் மேட் பார்க்க →',
    },
    pricing: {
      headline: 'ஒவ்வொரு இந்திய கொண்டாட்டத்திற்கும் எளிய திட்டங்கள்',
      subtitle: 'ஒரே முறை கட்டணம் (GST உட்பட), மாதாந்திர கட்டணம் இல்லை. மொத்த மதிப்பீட்டைப் பார்க்க கீழே தட்டவும்.',
      addonsHeading: 'சேர்க்க தட்டவும்',
      addons: {
        lifetime: {
          badge: 'நிரந்தர ஹோஸ்டிங்',
          title: 'வாழ்நாள் ஹோஸ்டிங் (தயார் நிலை)',
          description: 'உங்கள் தயார் நிலை கொண்டாட்டம் அல்லது திருமணத் தளத்தை புதுப்பித்தல் கட்டணமின்றி நிரந்தரமாக ஆன்லைனில் வைத்திருங்கள்.',
          highlight: 'நிரந்தர ஹோஸ்டிங் · தயார் நிலை மட்டும்',
        },
      },
      yourSelectedPlan: 'நீங்கள் தேர்ந்தெடுத்த திட்டம்',
      estimatedTotal: 'மதிப்பிடப்பட்ட மொத்தம் (GST உட்பட)',
      addedLabel: 'சேர்க்கப்பட்டது',
      addLabel: '+ சேர்',
    },
    studio: {
      eyebrow: 'Webzy கஸ்டம் மேட் · எளிய தனிப்பயன் இணையதளம்',
      headline: 'உங்கள் இணையதளத்தை நாங்கள் உருவாக்கித் தருவோம்',
      step1Heading: 'படி 1: உங்களுக்கு என்ன இணையதளம் தேவை?',
      step2Heading: 'படி 2: உங்கள் முன்னுரிமை நேரத்தை முன்பதிவு செய்யுங்கள்',
      submitIdle: 'இலவச 15-நிமிட அழைப்பு & விலை பெறுக →',
      sendWhatsapp: 'WhatsApp-இல் அனுப்பு',
    },
    weddings: {
      heroTitleLead: 'பாரம்பரிய திருமண அழைப்பிதழ்,',
      heroTitleAccent: 'ஒவ்வொரு திரையிலும் உயிர்ப்புடன்.',
      exploreCollectionCta: 'தொகுப்பைப் பார்க்க',
      customizePrefix: 'உருவாக்கவும்:',
      collectionHeading: 'இந்திய கொண்டாட்டத்தின் ஆறு அரச பதிப்புகள்',
      pricingHeading: 'எளிய ஒரே முறை விலை',
    },
    account: {
      ordersTitle: 'எனது ஆர்டர்கள் & இணைப்புகள்',
      profileTitle: 'எனது சுயவிவரம்',
      preferredLanguageTitle: 'இணையதள மொழி',
      signInTitle: 'மின்னஞ்சல் மூலம் உள்நுழைக',
    },
  }),

  te: mergeSiteCopy({
    common: {
      myOrders: 'నా ఆర్డర్లు',
      myProfile: 'నా ప్రొఫైల్',
      signIn: 'సైన్ ఇన్',
      signOut: 'సైన్ అవుట్',
      chooseLanguageTitle: 'మీ భాషను ఎంచుకోండి',
      chooseLanguageSubtitle: 'ఏదైనా భారతీయ భాషను ఎంచుకోండి — మొత్తం వెబ్‌సైట్ వెంటనే మారుతుంది',
      explore: 'చూడండి',
      save: 'పొదుపు',
      browseAllThemes: 'అన్ని థీమ్స్ చూడండి',
      back: 'వెనుకకు',
      selected: 'ఎంచుకోబడింది',
      tapToSelect: 'ఎంచుకోవడానికి నొక్కండి',
      oneTimePayment: 'ఒకేసారి చెల్లింపు',
      copyLink: 'లింక్ కాపీ చేయండి',
      copied: 'కాపీ అయింది',
      openFullScreen: 'ఫుల్-స్క్రీన్ ప్రివ్యూ',
      shareWhatsapp: 'WhatsApp లో షేర్ చేయండి',
      allOccasions: 'అన్ని వేడుకలు',
      languageLabel: 'భాష',
      budgetLabel: 'బడ్జెట్',
      anyPrice: 'ఏ ధర అయినా',
      resetFilters: 'ఫిల్టర్లు రీసెట్ చేయండి',
      daysLink: 'రోజులు లైవ్',
      gstInclusive: 'GST సహితం',
    },
    home: {
      chooseCelebrationTitle: 'మీ వేడుకను ఎంచుకోండి',
      chooseCelebrationSubtitle: 'నిమిషాల్లో సిద్ధమయ్యే అందమైన మొబైల్ వెబ్‌సైట్లు',
      hubs: {
        weddings: { tag: 'వివాహం', title: 'హిందూ వివాహ పత్రికలు', subtitle: 'అందమైన రాజమహల్ తలుపులు, ముద్ర, ముహూర్తం & RSVP.' },
        birthdays: { tag: 'పుట్టినరోజు', title: 'పుట్టినరోజు వేడుకలు', subtitle: 'బెలూన్ ట్యాప్, కన్ఫెట్టి & తీపి జ్ఞాపకాలు.' },
        romance: { tag: 'ప్రేమ', title: 'ప్రేమ & శుభాకాంక్షలు', subtitle: 'ప్రపోజల్స్, సారీ కార్డులు & హృదయపూర్వక సందేశాలు.' },
        festivals: { tag: 'పండుగలు & కుటుంబం', title: 'కుటుంబం & పండుగలు', subtitle: 'దీపావళి, నూతన సంవత్సరం & కుటుంబ శుభాకాంక్షలు.' },
      },
      studioStripTitle: 'వ్యాపారాల కోసం Webzy కస్టమ్ మేడ్',
      studioStripBody: 'వైద్యులు, కోచింగ్, దుకాణాలు & పెద్ద వివాహాల కోసం కస్టమ్ వెబ్‌సైట్ — మేమే తయారు చేసి ఇస్తాము.',
      studioStripCta: 'కస్టమ్ మేడ్ చూడండి →',
    },
    pricing: {
      headline: 'ప్రతి భారతీయ వేడుకకు సులభమైన ప్లాన్లు',
      subtitle: 'ఒకేసారి చెల్లింపు (GST సహితం), నెలవారీ ఛార్జీలు లేవు. మొత్తం అంచనా చూడటానికి ప్లాన్ ఎంచుకోండి.',
      addonsHeading: 'జోడించడానికి నొక్కండి',
      addons: {
        lifetime: {
          badge: 'శాశ్వత హోస్టింగ్',
          title: 'లైఫ్‌టైమ్ హోస్టింగ్ (రెడీమేడ్)',
          description: 'ఎటువంటి పునరుద్ధరణ రుసుము లేకుండా మీ రెడీమేడ్ వేడుక లేదా వివాహ సైట్‌ను ఎల్లప్పుడూ ఆన్‌లైన్‌లో ఉంచండి.',
          highlight: 'శాశ్వత హోస్టింగ్ · రెడీమేడ్ మాత్రమే',
        },
      },
      yourSelectedPlan: 'మీరు ఎంచుకున్న ప్లాన్',
      estimatedTotal: 'అంచనా మొత్తం (GST సహితం)',
      addedLabel: 'జోడించబడింది',
      addLabel: '+ జోడించు',
    },
    studio: {
      eyebrow: 'Webzy కస్టమ్ మేడ్ · సులభమైన కస్టమ్ వెబ్‌సైట్',
      headline: 'మీ వెబ్‌సైట్‌ను మేమే తయారు చేసి ఇస్తాము',
      step1Heading: 'దశ 1: మీకు ఏ వెబ్‌సైట్ కావాలి?',
      step2Heading: 'దశ 2: మీ ప్రయారిటీ స్లాట్ బుక్ చేసుకోండి',
      submitIdle: 'ఉచిత 15-నిమిషాల కాల్ & కోట్ పొందండి →',
      sendWhatsapp: 'WhatsApp లో పంపండి',
    },
    weddings: {
      heroTitleLead: 'రాజసమైన వివాహ ఆహ్వాన పత్రిక,',
      heroTitleAccent: 'ప్రతి స్క్రీన్‌పై సజీవంగా.',
      exploreCollectionCta: 'కలెక్షన్ చూడండి',
      customizePrefix: 'రూపొందించండి:',
      collectionHeading: 'భారతీయ వేడుకల ఆరు రాజ శైలులు',
      pricingHeading: 'సరళమైన ఒకేసారి ధర',
    },
    account: {
      ordersTitle: 'నా ఆర్డర్లు & లైవ్ లింకులు',
      profileTitle: 'నా ప్రొఫైల్',
      preferredLanguageTitle: 'వెబ్‌సైట్ భాష',
      signInTitle: 'ఇమెయిల్ ద్వారా సైన్ ఇన్ చేయండి',
    },
  }),

  kn: mergeSiteCopy({
    common: {
      myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
      myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
      signIn: 'ಸೈನ್ ಇನ್',
      signOut: 'ಸೈನ್ ಔಟ್',
      chooseLanguageTitle: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      chooseLanguageSubtitle: 'ಯಾವುದೇ ಭಾರತೀಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ — ಇಡೀ ವೆಬ್‌ಸೈಟ್ ತಕ್ಷಣ ಬದಲಾಗುತ್ತದೆ',
      explore: 'ನೋಡಿ',
      save: 'ಉಳಿತಾಯ',
      browseAllThemes: 'ಎಲ್ಲಾ ಥೀಮ್‌ಗಳನ್ನು ನೋಡಿ',
      back: 'ಹಿಂದೆ',
      selected: 'ಆಯ್ಕೆಯಾಗಿದೆ',
      tapToSelect: 'ಆಯ್ಕೆಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
      oneTimePayment: 'ಒಂದೇ ಬಾರಿ ಪಾವತಿ',
      copyLink: 'ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ',
      copied: 'ಕಾಪಿ ಆಯಿತು',
      openFullScreen: 'ಫುಲ್-ಸ್ಕ್ರೀನ್ ಪ್ರಿವ್ಯೂ',
      shareWhatsapp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
      allOccasions: 'ಎಲ್ಲಾ ಸಂದರ್ಭಗಳು',
      languageLabel: 'ಭಾಷೆ',
      budgetLabel: 'ಬಜೆಟ್',
      anyPrice: 'ಯಾವುದೇ ಬೆಲೆ',
      resetFilters: 'ಫಿಲ್ಟರ್ ರಿಸೆಟ್ ಮಾಡಿ',
      daysLink: 'ದಿನಗಳು ಲೈವ್',
      gstInclusive: 'GST ಸಹಿತ',
    },
    home: {
      chooseCelebrationTitle: 'ನಿಮ್ಮ ಸಂಭ್ರಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      chooseCelebrationSubtitle: 'ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಸಿದ್ಧವಾಗುವ ಸುಂದರ ಮೊಬೈಲ್ ವೆಬ್‌ಸೈಟ್‌ಗಳು',
      hubs: {
        weddings: { tag: 'ಮದುವೆ', title: 'ಹಿಂದೂ ವಿವಾಹ ಪತ್ರಿಕೆಗಳು', subtitle: 'ಅರಮನೆ ಬಾಗಿಲುಗಳು, ಮುದ್ರೆ, ಮುಹೂರ್ತ & RSVP.' },
        birthdays: { tag: 'ಹುಟ್ಟುಹಬ್ಬ', title: 'ಹುಟ್ಟುಹಬ್ಬ & ನೆನಪುಗಳು', subtitle: 'ಬಲೂನ್ ಟ್ಯಾಪ್, ಕನ್ಫೆಟ್ಟಿ & ಸಿಹಿ ಸಂದೇಶಗಳು.' },
        romance: { tag: 'ಪ್ರೀತಿ', title: 'ಪ್ರೀತಿ & ಶುಭಾಶಯಗಳು', subtitle: 'ಪ್ರಪೋಸಲ್, ಕ್ಷಮೆ ಕಾರ್ಡ್ & ಹೃದಯದ ಮಾತು.' },
        festivals: { tag: 'ಹಬ್ಬ & ಕುಟುಂಬ', title: 'ಕುಟುಂಬ & ಹಬ್ಬಗಳು', subtitle: 'ದೀಪಾವಳಿ, ಹೊಸ ವರ್ಷ & ಕುಟುಂಬದ ಶುಭಾಶಯಗಳು.' },
      },
      studioStripTitle: 'ವ್ಯಾಪಾರಕ್ಕಾಗಿ Webzy ಕಸ್ಟಮ್ ಮೇಡ್',
      studioStripBody: 'ವೈದ್ಯರು, ಕೋಚಿಂಗ್, ಅಂಗಡಿಗಳು & ಭವ್ಯ ಮದುವೆಗಳಿಗೆ ಕಸ್ಟಮ್ ವೆಬ್‌ಸೈಟ್ — ನಾವೇ ನಿರ್ಮಿಸಿ ಕೊಡುತ್ತೇವೆ.',
      studioStripCta: 'ಕಸ್ಟಮ್ ಮೇಡ್ ನೋಡಿ →',
    },
    pricing: {
      headline: 'ಪ್ರತಿ ಭಾರತೀಯ ಸಂಭ್ರಮಕ್ಕೂ ಸರಳ ಪ್ಲಾನ್‌ಗಳು',
      subtitle: 'ಒಂದೇ ಬಾರಿ ಪಾವತಿ (GST ಸಹಿತ), ಮಾಸಿಕ ಶುಲ್ಕವಿಲ್ಲ. ಅಂದಾಜು ಮೊತ್ತ ನೋಡಲು ಕೆಳಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ.',
      addonsHeading: 'ಸೇರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
      addons: {
        lifetime: {
          badge: 'ಶಾಶ್ವತ ಹೋಸ್ಟಿಂಗ್',
          title: 'ಲೈಫ್‌ಟೈಮ್ ಹೋಸ್ಟಿಂಗ್ (ರೆಡಿಮೇಡ್)',
          description: 'ನವೀಕರಣ ಶುಲ್ಕವಿಲ್ಲದೆ ನಿಮ್ಮ ರೆಡಿಮೇಡ್ ಸಂಭ್ರಮ ಅಥವಾ ಮದುವೆಯ ಪುಟವನ್ನು ಶಾಶ್ವತವಾಗಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿಡಿ.',
          highlight: 'ಶಾಶ್ವತ ಹೋಸ್ಟಿಂಗ್ · ರೆಡಿಮೇಡ್ ಮಾತ್ರ',
        },
      },
      yourSelectedPlan: 'ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಪ್ಲಾನ್',
      estimatedTotal: 'ಅಂದಾಜು ಒಟ್ಟು ಮೊತ್ತ (GST ಸಹಿತ)',
      addedLabel: 'ಸೇರಿಸಲಾಗಿದೆ',
      addLabel: '+ ಸೇರಿಸಿ',
    },
    studio: {
      eyebrow: 'Webzy ಕಸ್ಟಮ್ ಮೇಡ್ · ಸುಲಭ ಕಸ್ಟಮ್ ವೆಬ್‌ಸೈಟ್',
      headline: 'ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನಾವೇ ನಿರ್ಮಿಸುತ್ತೇವೆ',
      step1Heading: 'ಹಂತ 1: ನಿಮಗೆ ಯಾವ ವೆಬ್‌ಸೈಟ್ ಬೇಕು?',
      step2Heading: 'ಹಂತ 2: ನಿಮ್ಮ ಆದ್ಯತೆಯ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ',
      submitIdle: 'ಉಚಿತ 15-ನಿಮಿಷದ ಕರೆ & ದರ ಪಡೆಯಿರಿ →',
      sendWhatsapp: 'WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ',
    },
    weddings: {
      heroTitleLead: 'ರಾಜಮನೆತನದ ವಿವಾಹ ಪತ್ರಿಕೆ,',
      heroTitleAccent: 'ಪ್ರತಿ ಪರದೆಯಲ್ಲೂ ಜೀವಂತ.',
      exploreCollectionCta: 'ಸಂಗ್ರಹ ನೋಡಿ',
      customizePrefix: 'ರಚಿಸಿ:',
      collectionHeading: 'ಭಾರತೀಯ ಸಂಭ್ರಮದ ಆರು ರಾಜ ಶೈಲಿಗಳು',
      pricingHeading: 'ಸರಳ ಒಂದೇ ಬಾರಿ ಬೆಲೆ',
    },
    account: {
      ordersTitle: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು & ಲೈವ್ ಲಿಂಕ್‌ಗಳು',
      profileTitle: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
      preferredLanguageTitle: 'ವೆಬ್‌ಸೈಟ್ ಭಾಷೆ',
      signInTitle: 'ಇಮೇಲ್ ಮೂಲಕ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    },
  }),
};

export function getSiteCopy(lang: LanguageCode): SiteCopy {
  return SITE_COPY[lang] ?? SITE_COPY.en;
}
