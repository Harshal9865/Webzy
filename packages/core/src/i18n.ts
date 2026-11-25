import type { CoreLanguageCode, LanguageCode, LocalizedText } from './types';

export interface LanguageOptionMeta {
  code: LanguageCode;
  nativeLabel: string;
  englishLabel: string;
  htmlLang: string;
  shortCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOptionMeta[] = [
  { code: 'en', nativeLabel: 'English', englishLabel: 'English', htmlLang: 'en', shortCode: 'EN' },
  { code: 'hi', nativeLabel: 'हिन्दी', englishLabel: 'Hindi', htmlLang: 'hi', shortCode: 'HI' },
  { code: 'hinglish', nativeLabel: 'Hinglish', englishLabel: 'Hindi (English letters)', htmlLang: 'en-IN', shortCode: 'HN' },
  { code: 'gu', nativeLabel: 'ગુજરાતી', englishLabel: 'Gujarati', htmlLang: 'gu', shortCode: 'GU' },
  { code: 'mr', nativeLabel: 'मराठी', englishLabel: 'Marathi', htmlLang: 'mr', shortCode: 'MR' },
  { code: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', englishLabel: 'Punjabi', htmlLang: 'pa', shortCode: 'PA' },
  { code: 'bn', nativeLabel: 'বাংলা', englishLabel: 'Bengali', htmlLang: 'bn', shortCode: 'BN' },
  { code: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil', htmlLang: 'ta', shortCode: 'TA' },
  { code: 'te', nativeLabel: 'తెలుగు', englishLabel: 'Telugu', htmlLang: 'te', shortCode: 'TE' },
  { code: 'kn', nativeLabel: 'ಕನ್ನಡ', englishLabel: 'Kannada', htmlLang: 'kn', shortCode: 'KN' },
];

const VALID_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES.map((l) => l.code));

export function getLanguageMeta(code: LanguageCode): LanguageOptionMeta {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}

export function pickLocalizedText(
  map: LocalizedText | Partial<Record<LanguageCode, string>> | undefined,
  lang: LanguageCode,
  fallback = '',
): string {
  if (!map) return fallback;
  return map[lang] ?? map.en ?? map.hi ?? map.hinglish ?? fallback;
}

export interface StorefrontCopy {
  brandTagline: string;
  nav: {
    weddings: string;
    occasions: string;
    themes: string;
    howItWorks: string;
    prices: string;
    studio: string;
    custom: string;
    faq: string;
    makeYours: string;
    language: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    sampleLabel: string;
  };
  categoriesTitle: string;
  categoriesSubtitle: string;
  stepsTitle: string;
  steps: Array<{ step: string; title: string; detail: string }>;
  featuredTitle: string;
  featuredSubtitle: string;
  tryDemo: string;
  pricingTitle: string;
  pricingSubtitle: string;
  customBanner: {
    title: string;
    body: string;
    cta: string;
  };
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
  footer: {
    terms: string;
    privacy: string;
    refund: string;
    contentPolicy: string;
    takedown: string;
    contact: string;
    draftNotice: string;
  };
  whatsappHelpLabel: string;
  testModeBadge: string;
}

const EN_COPY: StorefrontCopy = {
  brandTagline: 'Your feeling in one link.',
  nav: {
    weddings: 'Weddings',
    occasions: 'Occasions',
    themes: 'Themes',
    howItWorks: 'How it works',
    prices: 'Prices',
    studio: 'Studio',
    custom: 'Custom',
    faq: 'FAQ',
    makeYours: 'Create yours',
    language: 'Language',
  },
  hero: {
    badge: 'Ready in 5 minutes · No app download',
    headline: 'Easy as a WhatsApp message, special as a handmade gift.',
    subheadline:
      'Pick an occasion, fill 3 to 5 quick details, preview it live, and share one link. Your receiver opens it with zero login.',
    primaryCta: 'Create yours from ₹29',
    secondaryCta: 'Try live sample',
    sampleLabel: 'Tap to open — Live sample',
  },
  categoriesTitle: 'Who is it for & what is the occasion?',
  categoriesSubtitle: 'Find a thoughtful link in 2 taps.',
  stepsTitle: 'How Webzy works',
  steps: [
    {
      step: '1',
      title: 'Pick an occasion and theme',
      detail: 'Weddings, birthdays, anniversaries, family notes, or shop greetings.',
    },
    {
      step: '2',
      title: 'Add your words and photos',
      detail: 'Just 3 to 6 simple fields in English, Hindi, or your regional language.',
    },
    {
      step: '3',
      title: 'Preview and share instantly',
      detail: 'Get a WhatsApp-ready link and QR code as soon as checkout finishes.',
    },
  ],
  featuredTitle: 'Ready-made themes',
  featuredSubtitle: 'Interactive celebration links ready to personalize and share over WhatsApp.',
  tryDemo: 'Try demo',
  pricingTitle: 'Simple, honest pricing',
  pricingSubtitle: 'Zero hidden fees. One-time GST-inclusive pricing.',
  customBanner: {
    title: 'Need something custom for a wedding or business?',
    body: 'Send your brief and choose email or a 15-minute call. We reply within 24 hours.',
    cta: 'Send custom request',
  },
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'Does my receiver need to log in or install an app?',
      a: 'No. Your link opens straight inside WhatsApp, Instagram, or any phone browser.',
    },
    {
      q: 'How fast does a Webzy go live?',
      a: 'Ready-made themes take 3 to 5 minutes to customize and publish as soon as checkout confirms.',
    },
    {
      q: 'Can I fix a typo after publishing?',
      a: 'Yes, free edits are included within 24 hours of publishing.',
    },
    {
      q: 'How long does my page stay online?',
      a: 'All celebration and wedding pages stay online for 7 days by default, with optional extensions to 14 days (+₹9), 21 days (+₹14), or 3 months / 90 days (+₹19) at checkout.',
    },
  ],
  footer: {
    terms: 'Terms',
    privacy: 'Privacy',
    refund: 'Refunds',
    contentPolicy: 'Content policy',
    takedown: 'Takedown notice',
    contact: 'Contact',
    draftNotice: 'Policy pages are in DRAFT state pending legal review.',
  },
  whatsappHelpLabel: 'WhatsApp Help',
  testModeBadge: 'Test mode',
};

const HINGLISH_COPY: StorefrontCopy = {
  brandTagline: 'Apni feeling ka link.',
  nav: {
    weddings: 'Weddings',
    occasions: 'Occasions',
    themes: 'Themes',
    howItWorks: 'Kaise kaam karta hai',
    prices: 'Prices',
    studio: 'Studio',
    custom: 'Custom',
    faq: 'FAQ',
    makeYours: 'Apna banao',
    language: 'Bhasha',
  },
  hero: {
    badge: '5 minute mein taiyaar · No app download',
    headline: 'WhatsApp message jitna aasaan, handmade gift jitna khaas.',
    subheadline:
      'Occasion chuno, 3–5 baatein likho, live preview dekho aur ek pyaara link bhejo. Receiver bina login kholega.',
    primaryCta: 'Apna banao (₹29 se)',
    secondaryCta: 'Live sample dekho',
    sampleLabel: 'Tap karke kholo — Live sample',
  },
  categoriesTitle: 'Kiske liye aur kaun sa din?',
  categoriesSubtitle: '2 tap mein sahi theme chuno.',
  stepsTitle: 'Kaise banta hai aapka Webzy?',
  steps: [
    {
      step: '1',
      title: 'Occasion aur theme chuno',
      detail: 'Shaadi, birthday, love, anniversary, family ya business — live demo tap karke check karo.',
    },
    {
      step: '2',
      title: 'Apna naam, photo aur message daalo',
      detail: 'Sirf 3 se 6 simple fields. Hindi, Hinglish, English ya apni bhasha mein likho.',
    },
    {
      step: '3',
      title: 'Preview dekho aur link share karo',
      detail: 'Pay karte hi turant WhatsApp aur QR link ready. Koi app download nahi.',
    },
  ],
  featuredTitle: 'Ready-made themes',
  featuredSubtitle: 'Personalized celebration links jo WhatsApp par turant share ho jaate hain.',
  tryDemo: 'Try demo',
  pricingTitle: 'Seedha aur saaf pricing',
  pricingSubtitle: 'Koi hidden charge nahi. One-time GST-inclusive pricing.',
  customBanner: {
    title: 'Kuch bilkul alag ya khaas banwana hai?',
    body: 'Wedding invite, family timeline ya custom celebration ke liye brief bhejo. 24 ghante mein email ya 15-min call par reply milega.',
    cta: 'Custom request bhejo',
  },
  faqTitle: 'Aksar pooche jaane waale sawaal',
  faqs: [
    {
      q: 'Kya receiver ko koi app ya login chahiye?',
      a: 'Bilkul nahi. Aapka link WhatsApp, Instagram ya kisi bhi browser mein seedha khulta hai.',
    },
    {
      q: 'Kitni der mein website ban jaati hai?',
      a: 'Ready-made theme sirf 3 se 5 minute mein ban jaata hai. Payment confirm hote hi link turant milta hai.',
    },
    {
      q: 'Agar galti se naam ya photo mein typo ho jaaye?',
      a: 'Publish hone ke 24 ghante ke andar aap bina kisi extra charge ke edit kar sakte hain.',
    },
    {
      q: 'Mera link kitne din tak live rahega?',
      a: 'Normal sabhi celebration aur wedding pages 7 din tak live rehti hain. Checkout par aap 14 din (+₹9), 21 din (+₹14), ya 3 mahine / 90 din (+₹19) extend kar sakte hain.',
    },
  ],
  footer: {
    terms: 'Terms',
    privacy: 'Privacy',
    refund: 'Refunds',
    contentPolicy: 'Content policy',
    takedown: 'Takedown notice',
    contact: 'Contact',
    draftNotice: 'Policy pages lawyer review ke liye DRAFT stage mein hain.',
  },
  whatsappHelpLabel: 'WhatsApp Help',
  testModeBadge: 'Test mode',
};

const HI_COPY: StorefrontCopy = {
  brandTagline: 'अपनी फीलिंग का लिंक।',
  nav: {
    weddings: 'विवाह',
    occasions: 'अवसर',
    themes: 'थीम्स',
    howItWorks: 'कैसे बनता है',
    prices: 'कीमत',
    studio: 'स्टूडियो',
    custom: 'कस्टम',
    faq: 'सवाल-जवाब',
    makeYours: 'अपना बनाओ',
    language: 'भाषा',
  },
  hero: {
    badge: '5 मिनट में तैयार · बिना ऐप डाउनलोड',
    headline: 'व्हाट्सऐप मैसेज जितना आसान, हाथ से बने तोहफे जितना खास।',
    subheadline:
      'मौका चुनें, 3–5 बातें लिखें, लाइव प्रीव्यू देखें और प्यारा सा लिंक भेजें। सामने वाला बिना लॉगिन के खोलेगा।',
    primaryCta: 'अपना बनाओ (₹29 से)',
    secondaryCta: 'लाइव सैंपल देखें',
    sampleLabel: 'टैप करके खोलें — लाइव सैंपल',
  },
  categoriesTitle: 'किसके लिए और कौन सा मौका?',
  categoriesSubtitle: 'दो टैप में सही थीम चुनें।',
  stepsTitle: 'आपका Webzy कैसे बनता है?',
  steps: [
    {
      step: '1',
      title: 'मौका और थीम चुनें',
      detail: 'विवाह, जन्मदिन, प्यार, सालगिरह, परिवार या बिज़नेस — लाइव डेमो चलाकर देखें।',
    },
    {
      step: '2',
      title: 'नाम, फोटो और संदेश डालें',
      detail: 'सिर्फ 3 से 6 आसान सवाल। हिंदी, अंग्रेज़ी या अपनी भाषा में लिखें।',
    },
    {
      step: '3',
      title: 'प्रीव्यू देखें और लिंक शेयर करें',
      detail: 'पेमेंट के तुरंत बाद व्हाट्सऐप और QR लिंक तैयार। कोई ऐप नहीं चाहिए।',
    },
  ],
  featuredTitle: 'रेडी-मेड थीम्स',
  featuredSubtitle: 'व्हाट्सऐप पर तुरंत शेयर करने के लिए खूबसूरत और इंटरैक्टिव सेलिब्रेशन लिंक्स।',
  tryDemo: 'डेमो देखें',
  pricingTitle: 'साफ़ और सीधी कीमतें',
  pricingSubtitle: 'कोई छिपा शुल्क नहीं। एक बार भुगतान, GST शामिल।',
  customBanner: {
    title: 'कुछ बिल्कुल अलग या कस्टम बनवाना है?',
    body: 'शादी का निमंत्रण, पारिवारिक यादें या बिज़नेस वेबसाइट के लिए अनुरोध भेजें। 24 घंटे में जवाब मिलेगा।',
    cta: 'कस्टम रिक्वेस्ट भेजें',
  },
  faqTitle: 'अक्सर पूछे जाने वाले सवाल',
  faqs: [
    {
      q: 'क्या सामने वाले को ऐप या लॉगिन चाहिए?',
      a: 'बिल्कुल नहीं। लिंक सीधे व्हाट्सऐप, इंस्टाग्राम या ब्राउज़र में खुलता है।',
    },
    {
      q: 'वेबसाइट बनने में कितना समय लगता है?',
      a: 'रेडी-मेड थीम 3 से 5 मिनट में तैयार हो जाती है। पेमेंट के तुरंत बाद लिंक मिल जाता है।',
    },
    {
      q: 'अगर नाम या फोटो में कोई गलती रह जाए तो?',
      a: 'लिंक पब्लिश होने के 24 घंटे के भीतर आप बिना अतिरिक्त शुल्क के सुधार कर सकते हैं।',
    },
    {
      q: 'लिंक कितने दिनों तक सक्रिय रहेगा?',
      a: 'सामान्य रूप से सभी सेलिब्रेशन और विवाह पेज 7 दिन तक लाइव रहते हैं। चेकआउट पर आप इसे 14 दिन (+₹9), 21 दिन (+₹14), या 3 महीने / 90 दिन (+₹19) तक बढ़ा सकते हैं।',
    },
  ],
  footer: {
    terms: 'नियम व शर्तें',
    privacy: 'गोपनीयता',
    refund: 'रिफंड नीति',
    contentPolicy: 'कंटेंट नीति',
    takedown: 'टेकडाउन नोटिस',
    contact: 'संपर्क',
    draftNotice: 'नीति पृष्ठ कानूनी समीक्षा से पहले DRAFT स्थिति में हैं।',
  },
  whatsappHelpLabel: 'WhatsApp मदद',
  testModeBadge: 'टेस्ट मोड',
};

function createRegionalCopy(
  overrides: Omit<Partial<StorefrontCopy>, 'nav' | 'hero' | 'customBanner' | 'footer'> & {
    nav: Partial<StorefrontCopy['nav']>;
    hero: Partial<StorefrontCopy['hero']>;
    customBanner?: Partial<StorefrontCopy['customBanner']>;
    footer?: Partial<StorefrontCopy['footer']>;
  },
): StorefrontCopy {
  return {
    ...EN_COPY,
    ...overrides,
    nav: { ...EN_COPY.nav, ...overrides.nav },
    hero: { ...EN_COPY.hero, ...overrides.hero },
    customBanner: { ...EN_COPY.customBanner, ...(overrides.customBanner ?? {}) },
    footer: { ...EN_COPY.footer, ...(overrides.footer ?? {}) },
  };
}

export const STOREFRONT_COPY: Record<LanguageCode, StorefrontCopy> = {
  en: EN_COPY,
  hinglish: HINGLISH_COPY,
  hi: HI_COPY,
  gu: createRegionalCopy({
    brandTagline: 'તમારી લાગણીની એક ખાસ લિંક.',
    nav: {
      weddings: 'લગ્ન',
      occasions: 'પ્રસંગો',
      themes: 'થીમ્સ',
      howItWorks: 'કેવી રીતે બને છે',
      prices: 'કિંમત',
      studio: 'સ્ટુડિયો',
      custom: 'કસ્ટમ',
      faq: 'પ્રશ્નો',
      makeYours: 'તમારું બનાવો',
      language: 'ભાષા',
    },
    hero: {
      headline: 'વોટ્સએપ મેસેજ જેટલું સરળ, હાથથી બનાવેલી ભેટ જેટલું ખાસ.',
      subheadline:
        'પ્રસંગ પસંદ કરો, 3–5 વિગતો ભરો, લાઈવ પ્રીવ્યુ જુઓ અને એક લિંક મોકલો. લોગિન વગર તરત ખુલશે.',
      primaryCta: '₹29 થી શરૂ કરો',
      secondaryCta: 'લાઈવ સેમ્પલ જુઓ',
      sampleLabel: 'ખોલવા માટે ટૅપ કરો — લાઈવ સેમ્પલ',
    },
    stepsTitle: 'Webzy કેવી રીતે કામ કરે છે?',
    featuredTitle: 'રેડી-મેડ થીમ્સ',
    featuredSubtitle: 'વોટ્સએપ પર તરત શેર કરી શકાય તેવા સુંદર પ્રસંગ પેજ.',
    tryDemo: 'ડેમો જુઓ',
    pricingTitle: 'સરળ અને સ્પષ્ટ કિંમતો',
    pricingSubtitle: 'કોઈ છુપો ચાર્જ નહીં. એક જ વાર ચુકવણી.',
    faqTitle: 'વારંવાર પૂછાતા પ્રશ્નો',
    whatsappHelpLabel: 'WhatsApp મદદ',
  }),
  mr: createRegionalCopy({
    brandTagline: 'तुमच्या भावनांची एक खास लिंक.',
    nav: {
      weddings: 'लग्नपत्रिका',
      occasions: 'प्रसंग',
      themes: 'थीम्स',
      howItWorks: 'कसे काम करते',
      prices: 'किंमत',
      studio: 'स्टुडिओ',
      custom: 'कस्टम',
      faq: 'प्रश्न',
      makeYours: 'तुमचे तयार करा',
      language: 'भाषा',
    },
    hero: {
      headline: 'व्हॉट्सॲप मेसेजइतके सोपे, हाताने बनवलेल्या भेटीइतके खास.',
      subheadline:
        'प्रसंग निवडा, 3–5 माहिती भरा, थेट प्रिव्ह्यू पहा आणि एक लिंक पाठवा. लॉगिनशिवाय लगेच उघडते.',
      primaryCta: '₹29 पासून तयार करा',
      secondaryCta: 'थेट नमुना पहा',
      sampleLabel: 'उघडण्यासाठी टॅप करा — थेट नमुना',
    },
    stepsTitle: 'Webzy कसे काम करते?',
    featuredTitle: 'रेडी-मेड थीम्स',
    featuredSubtitle: 'व्हॉट्सॲपवर लगेच शेअर करण्यासाठी सुंदर डिजिटल शुभेच्छा व निमंत्रणे.',
    tryDemo: 'डेमो पहा',
    pricingTitle: 'सोप्या आणि स्पष्ट किमती',
    pricingSubtitle: 'कोणतेही छुपी शुल्क नाही. एकदाच पेमेंट.',
    faqTitle: 'नेहमी विचारले जाणारे प्रश्न',
    whatsappHelpLabel: 'WhatsApp मदत',
  }),
  pa: createRegionalCopy({
    brandTagline: 'ਤੁਹਾਡੀਆਂ ਭਾਵਨਾਵਾਂ ਦਾ ਇੱਕ ਖਾਸ ਲਿੰਕ।',
    nav: {
      weddings: 'ਵਿਆਹ',
      occasions: 'ਮੌਕੇ',
      themes: 'ਥੀਮਜ਼',
      howItWorks: 'ਕਿਵੇਂ ਬਣਦਾ ਹੈ',
      prices: 'ਕੀਮਤਾਂ',
      studio: 'ਸਟੂਡੀਓ',
      custom: 'ਕਸਟਮ',
      faq: 'ਸਵਾਲ',
      makeYours: 'ਆਪਣਾ ਬਣਾਓ',
      language: 'ਭਾਸ਼ਾ',
    },
    hero: {
      headline: 'ਵਟਸਐਪ ਸੁਨੇਹੇ ਜਿੰਨਾ ਆਸਾਨ, ਹੱਥੀਂ ਬਣੇ ਤੋਹਫ਼ੇ ਜਿੰਨਾ ਖਾਸ।',
      subheadline:
        'ਮੌਕਾ ਚੁਣੋ, 3–5 ਜਾਣਕਾਰੀਆਂ ਭਰੋ, ਲਾਈਵ ਪ੍ਰੀਵਿਊ ਵੇਖੋ ਅਤੇ ਇੱਕ ਲਿੰਕ ਭੇਜੋ। ਬਿਨਾਂ ਲਾਗਇਨ ਦੇ ਖੁੱਲ੍ਹੇਗਾ।',
      primaryCta: '₹29 ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ',
      secondaryCta: 'ਲਾਈਵ ਸੈਂਪਲ ਵੇਖੋ',
      sampleLabel: 'ਖੋਲ੍ਹਣ ਲਈ ਟੈਪ ਕਰੋ — ਲਾਈਵ ਸੈਂਪਲ',
    },
    stepsTitle: 'Webzy ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?',
    featuredTitle: 'ਤਿਆਰ ਥੀਮਜ਼',
    featuredSubtitle: 'ਵਟਸਐਪ ਉੱਤੇ ਤੁਰੰਤ ਸਾਂਝੇ ਕਰਨ ਲਈ ਖੂਬਸੂਰਤ ਸੱਦੇ ਅਤੇ ਸ਼ੁਭਕਾਮਨਾਵਾਂ।',
    tryDemo: 'ਡੈਮੋ ਵੇਖੋ',
    pricingTitle: 'ਸਿੱਧੀਆਂ ਅਤੇ ਸਾਫ਼ ਕੀਮਤਾਂ',
    pricingSubtitle: 'ਕੋਈ ਲੁਕਿਆ ਚਾਰਜ ਨਹੀਂ। ਇੱਕ ਵਾਰ ਭੁਗਤਾਨ।',
    faqTitle: 'ਆਮ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ',
    whatsappHelpLabel: 'WhatsApp ਮਦਦ',
  }),
  bn: createRegionalCopy({
    brandTagline: 'আপনার অনুভূতির একটি বিশেষ লিংক।',
    nav: {
      weddings: 'বিবাহ',
      occasions: 'অনুষ্ঠান',
      themes: 'থিমস',
      howItWorks: 'কিভাবে কাজ করে',
      prices: 'মূল্য',
      studio: 'স্টুডিও',
      custom: 'কাস্টম',
      faq: 'প্রশ্নোত্তর',
      makeYours: 'নিজের তৈরি করুন',
      language: 'ভাষা',
    },
    hero: {
      headline: 'হোয়াটসঅ্যাপ মেসেজের মতো সহজ, হাতে তৈরি উপহারের মতো বিশেষ।',
      subheadline:
        'অনুষ্ঠান বেছে নিন, ৩–৫টি তথ্য দিন, লাইভ প্রিভিউ দেখুন এবং একটি লিংক পাঠান। লগইন ছাড়াই খুলবে।',
      primaryCta: '₹29 থেকে তৈরি করুন',
      secondaryCta: 'লাইভ ডেমো দেখুন',
      sampleLabel: 'খোলার জন্য ট্যাপ করুন — লাইভ নমুনা',
    },
    stepsTitle: 'Webzy কিভাবে কাজ করে?',
    featuredTitle: 'রেডি-মেড থিমস',
    featuredSubtitle: 'হোয়াটসঅ্যাপে সঙ্গে সঙ্গে শেয়ার করার জন্য সুন্দর ইন্টারেক্টিভ শুভেচ্ছা লিংক।',
    tryDemo: 'ডেমো দেখুন',
    pricingTitle: 'সহজ এবং স্বচ্ছ মূল্য',
    pricingSubtitle: 'কোনো লুকানো চার্জ নেই। এককালীন পেমেন্ট।',
    faqTitle: 'সাধারণ জিজ্ঞাসা',
    whatsappHelpLabel: 'WhatsApp সাহায্য',
  }),
  ta: createRegionalCopy({
    brandTagline: 'உங்கள் அன்பின் ஒரே இணைப்பு.',
    nav: {
      weddings: 'திருமணம்',
      occasions: 'நிகழ்வுகள்',
      themes: 'தீம்கள்',
      howItWorks: 'எப்படி செயல்படுகிறது',
      prices: 'விலை',
      studio: 'ஸ்டுடியோ',
      custom: 'தனிப்பயன்',
      faq: 'கேள்விகள்',
      makeYours: 'உருவாக்கவும்',
      language: 'மொழி',
    },
    hero: {
      headline: 'வாட்ஸ்அப் செய்தி போல எளிமையானது, கைவினைப் பரிசு போல சிறப்பானது.',
      subheadline:
        'நிகழ்வைத் தேர்ந்தெடுத்து, 3–5 விவரங்களை உள்ளிட்டு, நேரடி முன்னோட்டத்தைப் பார்த்து ஒரே இணைப்பைப் பகிருங்கள்.',
      primaryCta: '₹29 முதல் உருவாக்கவும்',
      secondaryCta: 'நேரடி மாதிரி பார்க்க',
      sampleLabel: 'திறக்க தட்டவும் — நேரடி மாதிரி',
    },
    stepsTitle: 'Webzy எப்படி செயல்படுகிறது?',
    featuredTitle: 'தயார் நிலை தீம்கள்',
    featuredSubtitle: 'வாட்ஸ்அப்பில் உடனே பகிரக்கூடிய அழகிய அழைப்பிதழ்கள் மற்றும் வாழ்த்துகள்.',
    tryDemo: 'மாதிரி பார்க்க',
    pricingTitle: 'எளிய, வெளிப்படையான விலை',
    pricingSubtitle: 'மறைமுக கட்டணங்கள் இல்லை. ஒரே முறை கட்டணம்.',
    faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    whatsappHelpLabel: 'WhatsApp உதவி',
  }),
  te: createRegionalCopy({
    brandTagline: 'మీ ప్రేమను పంచే ఒక ప్రత్యేక లింక్.',
    nav: {
      weddings: 'వివాహం',
      occasions: 'వేడుకలు',
      themes: 'థీమ్స్',
      howItWorks: 'ఎలా పనిచేస్తుంది',
      prices: 'ధరలు',
      studio: 'స్టూడియో',
      custom: 'కస్టమ్',
      faq: 'ప్రశ్నలు',
      makeYours: 'మీది రూపొందించండి',
      language: 'భాష',
    },
    hero: {
      headline: 'వాట్సాప్ సందేశంలా సులభం, చేతితో చేసిన బహుమతిలా ప్రత్యేకం.',
      subheadline:
        'వేడుకను ఎంచుకోండి, 3–5 వివరాలు నమోదు చేయండి, లైవ్ ప్రివ్యూ చూసి ఒకే లింక్‌ను పంపండి. లాగిన్ అవసరం లేదు.',
      primaryCta: '₹29 నుండి ప్రారంభించండి',
      secondaryCta: 'లైవ్ నమూనా చూడండి',
      sampleLabel: 'తెరవడానికి నొక్కండి — లైవ్ నమూనా',
    },
    stepsTitle: 'Webzy ఎలా పనిచేస్తుంది?',
    featuredTitle: 'రెడీమేడ్ థీమ్స్',
    featuredSubtitle: 'వాట్సాప్‌లో వెంటనే షేర్ చేయగల అందమైన వేడుకల లింకులు.',
    tryDemo: 'డెమో చూడండి',
    pricingTitle: 'సరళమైన, స్పష్టమైన ధరలు',
    pricingSubtitle: 'దాచిన ఛార్జీలు లేవు. ఒకేసారి చెల్లింపు.',
    faqTitle: 'తరచుగా అడిగే ప్రశ్నలు',
    whatsappHelpLabel: 'WhatsApp సహాయం',
  }),
  kn: createRegionalCopy({
    brandTagline: 'ನಿಮ್ಮ ಭಾವನೆಗಳ ವಿಶೇಷ ಲಿಂಕ್.',
    nav: {
      weddings: 'ಮದುವೆ',
      occasions: 'ಸಂದರ್ಭಗಳು',
      themes: 'ಥೀಮ್‌ಗಳು',
      howItWorks: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
      prices: 'ಬೆಲೆಗಳು',
      studio: 'ಸ್ಟುಡಿಯೋ',
      custom: 'ಕಸ್ಟಮ್',
      faq: 'ಪ್ರಶ್ನೆಗಳು',
      makeYours: 'ನಿಮ್ಮದು ರಚಿಸಿ',
      language: 'ಭಾಷೆ',
    },
    hero: {
      headline: 'ವಾಟ್ಸಾಪ್ ಸಂದೇಶದಷ್ಟೇ ಸುಲಭ, ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಯಷ್ಟೇ ವಿಶೇಷ.',
      subheadline:
        'ಸಂದರ್ಭವನ್ನು ಆರಿಸಿ, 3–5 ವಿವರಗಳನ್ನು ತುಂಬಿ, ಲೈವ್ ಪ್ರಿವ್ಯೂ ನೋಡಿ ಒಂದೇ ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ. ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ.',
      primaryCta: '₹29 ರಿಂದ ಪ್ರಾರಂಭಿಸಿ',
      secondaryCta: 'ಲೈವ್ ಮಾದರಿ ನೋಡಿ',
      sampleLabel: 'ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ — ಲೈವ್ ಮಾದರಿ',
    },
    stepsTitle: 'Webzy ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
    featuredTitle: 'ರೆಡಿಮೇಡ್ ಥೀಮ್‌ಗಳು',
    featuredSubtitle: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಹಂಚಿಕೊಳ್ಳಬಹುದಾದ ಸುಂದರ ಆಮಂತ್ರಣ ಮತ್ತು ಶುಭಾಶಯ ಪುಟಗಳು.',
    tryDemo: 'ಡೆಮೋ ನೋಡಿ',
    pricingTitle: 'ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟ ಬೆಲೆಗಳು',
    pricingSubtitle: 'ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕವಿಲ್ಲ. ಒಂದೇ ಬಾರಿ ಪಾವತಿ.',
    faqTitle: 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',
    whatsappHelpLabel: 'WhatsApp ಸಹಾಯ',
  }),
};

export function parseLanguageCode(raw: string | undefined | null): LanguageCode {
  if (raw && VALID_LANGUAGE_SET.has(raw)) {
    return raw as LanguageCode;
  }
  return 'en';
}

export function getStorefrontCopy(lang: LanguageCode): StorefrontCopy {
  return STOREFRONT_COPY[lang] ?? STOREFRONT_COPY.en;
}

export function toCoreLanguageCode(lang: LanguageCode): CoreLanguageCode {
  if (lang === 'hi' || lang === 'hinglish' || lang === 'en') {
    return lang;
  }
  return 'en';
}
