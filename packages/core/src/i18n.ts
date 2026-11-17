import type { LanguageCode } from './types';

export interface StorefrontCopy {
  brandTagline: string;
  nav: {
    themes: string;
    howItWorks: string;
    prices: string;
    custom: string;
    faq: string;
    makeYours: string;
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

export const STOREFRONT_COPY: Record<LanguageCode, StorefrontCopy> = {
  hinglish: {
    brandTagline: 'Apni feeling ka link.',
    nav: {
      themes: 'Themes',
      howItWorks: 'Kaise kaam karta hai',
      prices: 'Prices',
      custom: 'Custom',
      faq: 'FAQ',
      makeYours: 'Apna banao',
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
        detail: 'Birthday, love, anniversary, family ya business — live demo tap karke check karo.',
      },
      {
        step: '2',
        title: 'Apna naam, photo aur message daalo',
        detail: 'Sirf 3 se 6 simple fields. Hindi, Hinglish ya English mein likho.',
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
    pricingSubtitle: 'Koi hidden charge nahi. Default validity 30 days.',
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
        a: 'Default validity 30 days hai, aur zaroorat ho toh aap extend bhi kar sakte hain.',
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
  },
  hi: {
    brandTagline: 'अपनी फीलिंग का लिंक।',
    nav: {
      themes: 'थीम्स',
      howItWorks: 'कैसे बनता है',
      prices: 'कीमत',
      custom: 'कस्टम',
      faq: 'सवाल-जवाब',
      makeYours: 'अपना बनाओ',
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
        detail: 'जन्मदिन, प्यार, सालगिरह, परिवार या बिज़नेस — लाइव डेमो चलाकर देखें।',
      },
      {
        step: '2',
        title: 'नाम, फोटो और संदेश डालें',
        detail: 'सिर्फ 3 से 6 आसान सवाल। हिंदी, हिंग्लिश या अंग्रेज़ी में लिखें।',
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
    pricingSubtitle: 'कोई छिपा शुल्क नहीं। डिफ़ॉल्ट वैधता 30 दिन।',
    customBanner: {
      title: 'कुछ बिल्कुल अलग या कस्टम बनवाना है?',
      body: 'शादी का निमंत्रण, पारिवारिक यादें या खास इवेंट के लिए अनुरोध भेजें। 24 घंटे में ईमेल या 15-मिनट कॉल पर जवाब मिलेगा।',
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
        a: 'डिफ़ॉल्ट रूप से 30 दिन तक लाइव रहेगा, और बाद में बढ़ाया भी जा सकता है।',
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
  },
  en: {
    brandTagline: 'Apni feeling ka link.',
    nav: {
      themes: 'Themes',
      howItWorks: 'How it works',
      prices: 'Prices',
      custom: 'Custom',
      faq: 'FAQ',
      makeYours: 'Create yours',
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
        detail: 'Birthdays, proposals, anniversaries, family notes, or shop greetings.',
      },
      {
        step: '2',
        title: 'Add your words and photos',
        detail: 'Just 3 to 6 simple fields in Hinglish, Hindi, or English.',
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
    pricingSubtitle: 'Zero hidden fees. Default 30-day link validity.',
    customBanner: {
      title: 'Need something custom for a wedding or special day?',
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
        a: 'Each page stays online for 30 days by default and can be extended anytime.',
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
  },
};

export function parseLanguageCode(raw: string | undefined | null): LanguageCode {
  if (raw === 'hi' || raw === 'en' || raw === 'hinglish') {
    return raw;
  }
  return 'en';
}

export function getStorefrontCopy(lang: LanguageCode): StorefrontCopy {
  return STOREFRONT_COPY[lang] ?? STOREFRONT_COPY.en;
}
