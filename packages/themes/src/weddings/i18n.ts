import type { WeddingLanguage } from './schema';

export interface WeddingUiCopy {
  languageName: string;
  gate: {
    tapToOpen: string;
    pressToOpen: string;
    weddingReveal: string;
    royalInvitation: string;
    openAriaLabel: string;
  };
  hero: {
    honouredGuestPrefix: string;
    dearGuestPrefix: string;
    togetherWithFamilies: string;
    underGraceAlmighty: string;
    cordiallyInvite: string;
    requestHonour: string;
    andWord: string;
    scrollToExplore: string;
  };
  nav: {
    events: string;
    venue: string;
    story: string;
    rsvp: string;
    soundOn: string;
    soundOff: string;
    replayGate: string;
  };
  message: {
    dearPrefix: string;
    withLoveBlessings: string;
    daughterOf: string;
    sonOf: string;
    bridesFamily: string;
    groomsFamily: string;
    celebrationHashtag: string;
  };
  countdown: {
    countingDown: string;
    celebrationBegun: string;
    days: string;
    hours: string;
    mins: string;
    secs: string;
    saveTheDate: string;
  };
  events: {
    eyebrow: string;
    heading: string;
    allDays: string;
    dayPrefix: string;
    dressCodeLabel: string;
    paletteLabel: string;
    openInMaps: string;
  };
  venue: {
    eyebrow: string;
    heading: string;
    openGoogleMaps: string;
  };
  story: {
    eyebrow: string;
    defaultTitle: string;
    milestonesHeading: string;
  };
  gallery: {
    eyebrow: string;
    heading: string;
    tapToEnlarge: string;
    closePhoto: string;
    prevPhoto: string;
    nextPhoto: string;
  };
  hospitality: {
    eyebrow: string;
    heading: string;
    subhead: string;
  };
  rsvp: {
    eyebrow: string;
    heading: string;
    subhead: string;
    deadlinePrefix: string;
    yourNameLabel: string;
    yourNamePlaceholder: string;
    attendingQuestion: string;
    joyfullyAttend: string;
    regretfullyDecline: string;
    guestCountLabel: string;
    maxPrefix: string;
    guestSingular: string;
    guestPlural: string;
    mealPrefLabel: string;
    pureVeg: string;
    jain: string;
    nonVeg: string;
    wishesLabel: string;
    wishesPlaceholder: string;
    confirmBtn: string;
    submittingBtn: string;
    whatsappBtn: string;
    thankYouPrefix: string;
    confirmedNote: string;
    declinedNote: string;
    sendWhatsAppFollowup: string;
    editResponse: string;
  };
  shagun: {
    eyebrow: string;
    heading: string;
    subhead: string;
    upiVpaLabel: string;
    copyUpi: string;
    copied: string;
    payViaUpi: string;
  };
  footer: {
    addToCalendar: string;
    shareWhatsApp: string;
    languageLabel: string;
    madeWithWebzy: string;
    privacyNote: string;
  };
}

export const WEDDING_UI_COPY: Record<WeddingLanguage, WeddingUiCopy> = {
  en: {
    languageName: 'English',
    gate: {
      tapToOpen: 'Tap to Open',
      pressToOpen: 'Press to Open',
      weddingReveal: 'Wedding Invitation',
      royalInvitation: 'Royal Invitation',
      openAriaLabel: 'Open wedding invitation',
    },
    hero: {
      honouredGuestPrefix: 'Honoured Guest',
      dearGuestPrefix: 'Dear',
      togetherWithFamilies: 'Together with our families',
      underGraceAlmighty: 'Under the grace of the Almighty',
      cordiallyInvite: 'we cordially invite you to celebrate the union of',
      requestHonour: 'we request the honour of your presence at the wedding of',
      andWord: 'and',
      scrollToExplore: 'Scroll to explore',
    },
    nav: {
      events: 'Events',
      venue: 'Venue',
      story: 'Story',
      rsvp: 'RSVP',
      soundOn: 'Play ambient chimes',
      soundOff: 'Mute ambient chimes',
      replayGate: 'Replay reveal',
    },
    message: {
      dearPrefix: 'Warmest Welcome,',
      withLoveBlessings: 'With Love & Blessings From',
      daughterOf: 'Daughter of',
      sonOf: 'Son of',
      bridesFamily: "Bride's Family",
      groomsFamily: "Groom's Family",
      celebrationHashtag: 'Share Your Memories',
    },
    countdown: {
      countingDown: 'Counting Down To The Muhurat',
      celebrationBegun: 'The Celebration Has Begun',
      days: 'Days',
      hours: 'Hours',
      mins: 'Mins',
      secs: 'Secs',
      saveTheDate: 'Auspicious Date',
    },
    events: {
      eyebrow: 'Wedding Itinerary',
      heading: 'Ceremonies & Celebrations',
      allDays: 'All Days',
      dayPrefix: 'Day',
      dressCodeLabel: 'Attire',
      paletteLabel: 'Palette',
      openInMaps: 'Open in Maps',
    },
    venue: {
      eyebrow: 'The Destination',
      heading: 'Where We Celebrate',
      openGoogleMaps: 'Open in Google Maps',
    },
    story: {
      eyebrow: 'Our Love Story',
      defaultTitle: 'Our Journey',
      milestonesHeading: 'Chapters Along The Way',
    },
    gallery: {
      eyebrow: 'Captured Moments',
      heading: 'Moments of Joy',
      tapToEnlarge: 'View Portrait',
      closePhoto: 'Close photo',
      prevPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
    },
    hospitality: {
      eyebrow: 'Guest Concierge',
      heading: 'Things to Know',
      subhead: 'Thoughtful details to make your stay effortless and joyful.',
    },
    rsvp: {
      eyebrow: 'Be Our Guest',
      heading: 'RSVP & Blessings',
      subhead: 'Kindly respond so we may prepare your welcome with warmth and care.',
      deadlinePrefix: 'Kindly reply by',
      yourNameLabel: 'Your Full Name / Family Name',
      yourNamePlaceholder: 'e.g. Sharma Family / Rajesh Sharma',
      attendingQuestion: 'Will you be joining the celebrations?',
      joyfullyAttend: 'Joyfully Attend',
      regretfullyDecline: 'Regretfully Decline',
      guestCountLabel: 'Number of Guests Attending',
      maxPrefix: 'Max',
      guestSingular: 'Guest',
      guestPlural: 'Guests',
      mealPrefLabel: 'Dietary / Meal Preference',
      pureVeg: 'Pure Veg',
      jain: 'Jain',
      nonVeg: 'Non-Veg',
      wishesLabel: 'Warm Wishes or Arrival Details (Optional)',
      wishesPlaceholder: 'Share your blessings or arrival timing...',
      confirmBtn: 'Confirm RSVP',
      submittingBtn: 'Saving your response...',
      whatsappBtn: 'Send via WhatsApp',
      thankYouPrefix: 'Thank You,',
      confirmedNote: 'Your RSVP is confirmed. We eagerly look forward to celebrating together.',
      declinedNote: 'We will miss your presence and deeply cherish your heartfelt blessings.',
      sendWhatsAppFollowup: 'Also Notify on WhatsApp',
      editResponse: 'Update response',
    },
    shagun: {
      eyebrow: 'Traditional Blessings',
      heading: 'Digital Shagun',
      subhead: 'Your presence and blessings are our greatest treasure. For loved ones wishing to send traditional shagun:',
      upiVpaLabel: 'UPI VPA',
      copyUpi: 'Copy UPI',
      copied: 'Copied',
      payViaUpi: 'Open UPI App',
    },
    footer: {
      addToCalendar: 'Add to Calendar (.ics)',
      shareWhatsApp: 'Share on WhatsApp',
      languageLabel: 'Invitation Language',
      madeWithWebzy: 'Crafted by Webzy Weddings',
      privacyNote: 'Private interactive invitation · Protected by Indian privacy standards',
    },
  },
  hi: {
    languageName: 'हिन्दी',
    gate: {
      tapToOpen: 'खोलने के लिए स्पर्श करें',
      pressToOpen: 'मुहर खोलें',
      weddingReveal: 'शुभ विवाह निमंत्रण',
      royalInvitation: 'शाही निमंत्रण',
      openAriaLabel: 'विवाह निमंत्रण खोलें',
    },
    hero: {
      honouredGuestPrefix: 'सम्माननीय अतिथि',
      dearGuestPrefix: 'स्नेही',
      togetherWithFamilies: 'परिवार सहित सादर आमंत्रण',
      underGraceAlmighty: 'ईश्वर की असीम कृपा से',
      cordiallyInvite: 'शुभ विवाह के पावन अवसर पर आपका हार्दिक स्वागत है',
      requestHonour: 'शुभ परिणय उत्सव में पधारने का स्नेहभरा आमंत्रण',
      andWord: 'संग',
      scrollToExplore: 'आगे देखने के लिए स्क्रॉल करें',
    },
    nav: {
      events: 'कार्यक्रम',
      venue: 'स्थान',
      story: 'कहानी',
      rsvp: 'स्वीकृति',
      soundOn: 'मंगल ध्वनि चलाएँ',
      soundOff: 'ध्वनि बंद करें',
      replayGate: 'पुनः खोलें',
    },
    message: {
      dearPrefix: 'सस्नेह स्वागत,',
      withLoveBlessings: 'स्नेहाकांक्षी एवं विनीत',
      daughterOf: 'सुपुत्री',
      sonOf: 'सुपुत्र',
      bridesFamily: 'वधू पक्ष',
      groomsFamily: 'वर पक्ष',
      celebrationHashtag: 'उत्सव की यादें साझा करें',
    },
    countdown: {
      countingDown: 'शुभ मुहूर्त की प्रतीक्षा',
      celebrationBegun: 'शुभ उत्सव आरंभ हो चुका है',
      days: 'दिन',
      hours: 'घंटे',
      mins: 'मिनट',
      secs: 'सेकंड',
      saveTheDate: 'शुभ तिथि',
    },
    events: {
      eyebrow: 'मांगलिक कार्यक्रम',
      heading: 'उत्सव एवं रस्में',
      allDays: 'सभी दिन',
      dayPrefix: 'दिन',
      dressCodeLabel: 'परिधान',
      paletteLabel: 'रंग संयोजन',
      openInMaps: 'मैप में देखें',
    },
    venue: {
      eyebrow: 'विवाह स्थल',
      heading: 'उत्सव का पावन प्रांगण',
      openGoogleMaps: 'गूगल मैप्स में खोलें',
    },
    story: {
      eyebrow: 'हमारी प्रेम कहानी',
      defaultTitle: 'हमारा सफ़र',
      milestonesHeading: 'यादगार पड़ाव',
    },
    gallery: {
      eyebrow: 'सुंदर स्मृतियाँ',
      heading: 'खुशियों के पल',
      tapToEnlarge: 'बड़ा देखें',
      closePhoto: 'फ़ोटो बंद करें',
      prevPhoto: 'पिछली फ़ोटो',
      nextPhoto: 'अगली फ़ोटो',
    },
    hospitality: {
      eyebrow: 'अतिथि मार्गदर्शिका',
      heading: 'महत्वपूर्ण जानकारियाँ',
      subhead: 'आपकी यात्रा और ठहरने को सुखद बनाने हेतु आवश्यक विवरण।',
    },
    rsvp: {
      eyebrow: 'सादर प्रतीक्षा',
      heading: 'उपस्थिति एवं आशीर्वाद',
      subhead: 'कृपया अपनी उपस्थिति की पुष्टि करें ताकि हम आपका सत्कार भली-भाँति कर सकें।',
      deadlinePrefix: 'कृपया इस तिथि तक सूचित करें:',
      yourNameLabel: 'आपका पूरा नाम / परिवार का नाम',
      yourNamePlaceholder: 'जैसे: शर्मा परिवार / राजेश शर्मा',
      attendingQuestion: 'क्या आप उत्सव में पधार रहे हैं?',
      joyfullyAttend: 'सपरिवार पधारेंगे',
      regretfullyDecline: 'असमर्थ हैं, शुभकामनाएँ',
      guestCountLabel: 'आगंतुकों की संख्या',
      maxPrefix: 'अधिकतम',
      guestSingular: 'अतिथि',
      guestPlural: 'अतिथि',
      mealPrefLabel: 'भोजन प्राथमिकता',
      pureVeg: 'शुद्ध शाकाहारी',
      jain: 'जैन भोजन',
      nonVeg: 'मांसाहारी',
      wishesLabel: 'शुभकामनाएँ या आगमन विवरण (वैकल्पिक)',
      wishesPlaceholder: 'अपना आशीर्वाद या पहुँचने का समय लिखें...',
      confirmBtn: 'उपस्थिति दर्ज करें',
      submittingBtn: 'सहेजा जा रहा है...',
      whatsappBtn: 'व्हाट्सएप पर भेजें',
      thankYouPrefix: 'हार्दिक धन्यवाद,',
      confirmedNote: 'आपकी स्वीकृति प्राप्त हो गई है। आपके स्वागत की हमें प्रतीक्षा रहेगी।',
      declinedNote: 'आपकी उपस्थिति की कमी खलेगी, आपके आशीर्वाद के लिए हृदय से आभार।',
      sendWhatsAppFollowup: 'व्हाट्सएप पर भी सूचित करें',
      editResponse: 'विवरण बदलें',
    },
    shagun: {
      eyebrow: 'पारंपरिक आशीर्वाद',
      heading: 'डिजिटल शगुन',
      subhead: 'आपका स्नेह और आशीर्वाद ही हमारा सबसे बड़ा उपहार है। जो स्नेहीजन शगुन भेजना चाहते हैं:',
      upiVpaLabel: 'UPI आईडी',
      copyUpi: 'UPI कॉपी करें',
      copied: 'कॉपी हो गया',
      payViaUpi: 'UPI ऐप खोलें',
    },
    footer: {
      addToCalendar: 'कैलेंडर में जोड़ें (.ics)',
      shareWhatsApp: 'व्हाट्सएप पर साझा करें',
      languageLabel: 'निमंत्रण भाषा',
      madeWithWebzy: 'वेबज़ी वेडिंग्स द्वारा निर्मित',
      privacyNote: 'निजी डिजिटल निमंत्रण · सुरक्षित भारतीय डेटा नीति द्वारा संरक्षित',
    },
  },
  gu: {
    languageName: 'ગુજરાતી',
    gate: {
      tapToOpen: 'ખોલવા માટે ટચ કરો',
      pressToOpen: 'મુદ્રા ખોલો',
      weddingReveal: 'શુભ લગ્ન કંકોત્રી',
      royalInvitation: 'શાહી આમંત્રણ',
      openAriaLabel: 'લગ્ન કંકોત્રી ખોલો',
    },
    hero: {
      honouredGuestPrefix: 'માનનીય અતિથિ',
      dearGuestPrefix: 'સ્નેહી',
      togetherWithFamilies: 'સહપરિવાર હાર્દિક આમંત્રણ',
      underGraceAlmighty: 'પરમાત્માની અસીમ કૃપાથી',
      cordiallyInvite: 'શુભ લગ્ન પ્રસંગે આપની પ્રેરક ઉપસ્થિતિ માટે ભાવભીનું આમંત્રણ',
      requestHonour: 'શુભ પરિણય ઉત્સવમાં પધારવા માટે હાર્દિક નિમંત્રણ',
      andWord: 'સંગ',
      scrollToExplore: 'આગળ જોવા માટે સ્ક્રોલ કરો',
    },
    nav: {
      events: 'પ્રસંગો',
      venue: 'સ્થળ',
      story: 'વાર્તા',
      rsvp: 'હાજરી',
      soundOn: 'મંગળ ધ્વનિ ચલાવો',
      soundOff: 'ધ્વનિ બંધ કરો',
      replayGate: 'ફરી ખોલો',
    },
    message: {
      dearPrefix: 'હાર્દિક સ્વાગત,',
      withLoveBlessings: 'સ્નેહાધીન અને નિમંત્રક',
      daughterOf: 'સુપુત્રી',
      sonOf: 'સુપુત્ર',
      bridesFamily: 'કન્યા પક્ષ',
      groomsFamily: 'વર પક્ષ',
      celebrationHashtag: 'પ્રસંગની યાદો શેર કરો',
    },
    countdown: {
      countingDown: 'શુભ મુહૂર્તની પ્રતીક્ષા',
      celebrationBegun: 'શુભ ઉત્સવનો આરંભ થઈ ગયો છે',
      days: 'દિવસ',
      hours: 'કલાક',
      mins: 'મિનિટ',
      secs: 'સેકન્ડ',
      saveTheDate: 'શુભ તિથિ',
    },
    events: {
      eyebrow: 'માંગલિક પ્રસંગો',
      heading: 'ઉત્સવ અને વિધિઓ',
      allDays: 'બધા દિવસો',
      dayPrefix: 'દિવસ',
      dressCodeLabel: 'પહેરવેશ',
      paletteLabel: 'રંગ પસંદગી',
      openInMaps: 'મેપમાં જુઓ',
    },
    venue: {
      eyebrow: 'લગ્ન સ્થળ',
      heading: 'ઉત્સવનું પાવન પ્રાંગણ',
      openGoogleMaps: 'ગૂગલ મેપ્સમાં ખોલો',
    },
    story: {
      eyebrow: 'અમારી પ્રેમકથા',
      defaultTitle: 'અમારી સફર',
      milestonesHeading: 'યાદગાર પડાવો',
    },
    gallery: {
      eyebrow: 'સુંદર સ્મૃતિઓ',
      heading: 'આનંદની પળો',
      tapToEnlarge: 'મોટું જુઓ',
      closePhoto: 'ફોટો બંધ કરો',
      prevPhoto: 'પાછલો ફોટો',
      nextPhoto: 'આગલો ફોટો',
    },
    hospitality: {
      eyebrow: 'અતિથિ માર્ગદર્શિકા',
      heading: 'જાણવા જેવી વાતો',
      subhead: 'આપની મુસાફરી અને રોકાણને સુખદ બનાવવા માટે જરૂરી માહિતી.',
    },
    rsvp: {
      eyebrow: 'ભાવભીની પ્રતીક્ષા',
      heading: 'હાજરી અને આશીર્વાદ',
      subhead: 'કૃપા કરીને આપની ઉપસ્થિતિ જણાવશો જેથી અમે આપનું સ્વાગત સારી રીતે કરી શકીએ.',
      deadlinePrefix: 'કૃપા કરીને આ તારીખ સુધીમાં જણાવશો:',
      yourNameLabel: 'આપનું પૂરું નામ / પરિવારનું નામ',
      yourNamePlaceholder: 'જેમ કે: શર્મા પરિવાર / રાજેશ શર્મા',
      attendingQuestion: 'શું આપ ઉત્સવમાં પધારી રહ્યા છો?',
      joyfullyAttend: 'સહપરિવાર પધારીશું',
      regretfullyDecline: 'અસમર્થ છીએ, શુભેચ્છાઓ',
      guestCountLabel: 'મહેમાનોની સંખ્યા',
      maxPrefix: 'મહત્તમ',
      guestSingular: 'મહેમાન',
      guestPlural: 'મહેમાનો',
      mealPrefLabel: 'ભોજન પસંદગી',
      pureVeg: 'શુદ્ધ શાકાહારી',
      jain: 'જૈન ભોજન',
      nonVeg: 'નોન-વેજ',
      wishesLabel: 'શુભેચ્છાઓ અથવા આગમન વિગતો (વૈકલ્પિક)',
      wishesPlaceholder: 'આપના આશીર્વાદ અથવા આવવાનો સમય લખો...',
      confirmBtn: 'હાજરી નોંધાવો',
      submittingBtn: 'સાચવવામાં આવી રહ્યું છે...',
      whatsappBtn: 'વોટ્સએપ પર મોકલો',
      thankYouPrefix: 'હાર્દિક આભાર,',
      confirmedNote: 'આપની હાજરી નોંધાઈ ગઈ છે. આપના સ્વાગત માટે અમે આતુર છીએ.',
      declinedNote: 'આપની ખોટ સાલશે, આપના શુભ આશીર્વાદ માટે હૃદયપૂર્વક આભાર.',
      sendWhatsAppFollowup: 'વોટ્સએપ પર પણ જાણ કરો',
      editResponse: 'વિગતો બદલો',
    },
    shagun: {
      eyebrow: 'પરંપરાગત આશીર્વાદ',
      heading: 'ડિજિટલ શગુન',
      subhead: 'આપની ઉપસ્થિતિ અને આશીર્વાદ જ અમારી સૌથી મોટી ભેટ છે. જે સ્નેહીજનો શગુન મોકલવા ઈચ્છે છે:',
      upiVpaLabel: 'UPI આઈડી',
      copyUpi: 'UPI કોપી કરો',
      copied: 'કોપી થયું',
      payViaUpi: 'UPI એપ ખોલો',
    },
    footer: {
      addToCalendar: 'કેલેન્ડરમાં ઉમેરો (.ics)',
      shareWhatsApp: 'વોટ્સએપ પર શેર કરો',
      languageLabel: 'કંકોત્રીની ભાષા',
      madeWithWebzy: 'વેબઝી વેડિંગ્સ દ્વારા નિર્મિત',
      privacyNote: 'ખાનગી ડિજિટલ કંકોત્રી · સુરક્ષિત અને ગોપનીય',
    },
  },
  mr: {} as WeddingUiCopy,
  pa: {} as WeddingUiCopy,
  bn: {} as WeddingUiCopy,
  ta: {} as WeddingUiCopy,
  te: {} as WeddingUiCopy,
  kn: {} as WeddingUiCopy,
};

function mergeWeddingCopy(
  base: WeddingUiCopy,
  overrides: {
    languageName: string;
    gate?: Partial<WeddingUiCopy['gate']>;
    hero?: Partial<WeddingUiCopy['hero']>;
    nav?: Partial<WeddingUiCopy['nav']>;
    message?: Partial<WeddingUiCopy['message']>;
    countdown?: Partial<WeddingUiCopy['countdown']>;
    events?: Partial<WeddingUiCopy['events']>;
    venue?: Partial<WeddingUiCopy['venue']>;
    story?: Partial<WeddingUiCopy['story']>;
    gallery?: Partial<WeddingUiCopy['gallery']>;
    hospitality?: Partial<WeddingUiCopy['hospitality']>;
    rsvp?: Partial<WeddingUiCopy['rsvp']>;
    shagun?: Partial<WeddingUiCopy['shagun']>;
    footer?: Partial<WeddingUiCopy['footer']>;
  },
): WeddingUiCopy {
  return {
    ...base,
    languageName: overrides.languageName,
    gate: { ...base.gate, ...(overrides.gate ?? {}) },
    hero: { ...base.hero, ...(overrides.hero ?? {}) },
    nav: { ...base.nav, ...(overrides.nav ?? {}) },
    message: { ...base.message, ...(overrides.message ?? {}) },
    countdown: { ...base.countdown, ...(overrides.countdown ?? {}) },
    events: { ...base.events, ...(overrides.events ?? {}) },
    venue: { ...base.venue, ...(overrides.venue ?? {}) },
    story: { ...base.story, ...(overrides.story ?? {}) },
    gallery: { ...base.gallery, ...(overrides.gallery ?? {}) },
    hospitality: { ...base.hospitality, ...(overrides.hospitality ?? {}) },
    rsvp: { ...base.rsvp, ...(overrides.rsvp ?? {}) },
    shagun: { ...base.shagun, ...(overrides.shagun ?? {}) },
    footer: { ...base.footer, ...(overrides.footer ?? {}) },
  };
}

WEDDING_UI_COPY.mr = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'मराठी',
  gate: {
    tapToOpen: 'उघडण्यासाठी स्पर्श करा',
    pressToOpen: 'मुद्रा उघडा',
    weddingReveal: 'शुभ विवाह निमंत्रण',
    royalInvitation: 'शाही निमंत्रण',
    openAriaLabel: 'लग्नपत्रिका उघडा',
  },
  hero: {
    honouredGuestPrefix: 'सन्माननीय अतिथी',
    dearGuestPrefix: 'सस्नेह नमस्कार',
    togetherWithFamilies: 'सपरिवार सादर निमंत्रण',
    underGraceAlmighty: 'ईश्वराच्या कृपेने',
    cordiallyInvite: 'शुभमंगल विवाह सोहळ्यास आपली स्नेहपूर्ण उपस्थिती प्रार्थनीय आहे',
    requestHonour: 'या शुभ विवाह सोहळ्यास आपली उपस्थिती प्रार्थनीय आहे',
    andWord: 'आणि',
    scrollToExplore: 'पुढे पाहण्यासाठी खाली स्क्रोल करा',
  },
  nav: { events: 'कार्यक्रम', venue: 'ठिकाण', story: 'कथा', rsvp: 'उपस्थिती', replayGate: 'पुन्हा उघडा' },
  message: {
    dearPrefix: 'सस्नेह निमंत्रण,',
    withLoveBlessings: 'स्नेहांकित व विनीत',
    daughterOf: 'सुपुत्री',
    sonOf: 'सुपुत्र',
    bridesFamily: 'वधू पक्ष',
    groomsFamily: 'वर पक्ष',
    celebrationHashtag: 'सोहळ्याच्या आठवणी शेअर करा',
  },
  countdown: {
    countingDown: 'शुभ मुहूर्ताची प्रतीक्षा',
    celebrationBegun: 'मंगल सोहळा सुरू झाला आहे',
    days: 'दिवस',
    hours: 'तास',
    mins: 'मिनिटे',
    secs: 'सेकंद',
    saveTheDate: 'शुभ दिनांक',
  },
  events: {
    eyebrow: 'विवाह सोहळा',
    heading: 'मांगलिक कार्यक्रम',
    allDays: 'सर्व दिवस',
    dayPrefix: 'दिवस',
    dressCodeLabel: 'पोशाख',
    paletteLabel: 'रंगसंगती',
    openInMaps: 'नकाशावर पहा',
  },
  venue: { eyebrow: 'विवाह स्थळ', heading: 'कार्यक्रमाचे ठिकाण', openGoogleMaps: 'Google Maps मध्ये पहा' },
  story: { eyebrow: 'आमची प्रेमकथा', defaultTitle: 'आमचा प्रवास', milestonesHeading: 'अविस्मरणीय क्षण' },
  gallery: {
    eyebrow: 'आठवणींचे क्षण',
    heading: 'आनंदाचे क्षण',
    tapToEnlarge: 'मोठे करून पहा',
    closePhoto: 'बंद करा',
    prevPhoto: 'मागील छायाचित्र',
    nextPhoto: 'पुढील छायाचित्र',
  },
  hospitality: {
    eyebrow: 'पाहुण्यांचे स्वागत',
    heading: 'महत्त्वाची माहिती',
    subhead: 'आपला प्रवास आणि निवास सुखकर होण्यासाठी उपयुक्त माहिती.',
  },
  rsvp: {
    eyebrow: 'आपली उपस्थिती',
    heading: 'उपस्थिती व शुभाशीर्वाद',
    subhead: 'आपल्या स्वागताच्या नियोजनासाठी कृपया आपली उपस्थिती कळवावी.',
    deadlinePrefix: 'कृपया या तारखेपर्यंत कळवा:',
    yourNameLabel: 'आपले पूर्ण नाव / कुटुंबाचे नाव',
    yourNamePlaceholder: 'उदा. कुलकर्णी परिवार / राजेश कुलकर्णी',
    attendingQuestion: 'आपण या मंगल सोहळ्यास उपस्थित राहणार का?',
    joyfullyAttend: 'होय, आनंदाने उपस्थित राहू',
    regretfullyDecline: 'उपस्थित राहणे शक्य नाही',
    guestCountLabel: 'उपस्थित पाहुण्यांची संख्या',
    maxPrefix: 'कमाल',
    guestSingular: 'पाहुणे',
    guestPlural: 'पाहुणे',
    mealPrefLabel: 'भोजन पसंती',
    pureVeg: 'शुद्ध शाकाहारी',
    jain: 'जैन भोजन',
    nonVeg: 'मांसाहारी',
    wishesLabel: 'शुभेच्छा किंवा आगमनाची वेळ (ऐच्छिक)',
    wishesPlaceholder: 'आपले शुभाशीर्वाद किंवा आगमनाचा तपशील लिहा...',
    confirmBtn: 'उपस्थिती कळवा',
    submittingBtn: 'नोंदणी होत आहे...',
    whatsappBtn: 'WhatsApp वर पाठवा',
    thankYouPrefix: 'मनःपूर्वक धन्यवाद,',
    confirmedNote: 'आपल्या उपस्थितीची नोंद झाली आहे. आपल्या स्वागतासाठी आम्ही उत्सुक आहोत.',
    declinedNote: 'आपली उणीव भासेल, आपल्या शुभाशीर्वादांबद्दल मनःपूर्वक आभार.',
    sendWhatsAppFollowup: 'WhatsApp वरही कळवा',
    editResponse: 'माहिती बदला',
  },
  shagun: {
    eyebrow: 'प्रेम व शुभाशीर्वाद',
    heading: 'डिजिटल आहेर (शगुन)',
    subhead: 'आपली उपस्थिती आणि आशीर्वाद हीच आमची खरी भेट. डिजिटल स्वरूपात आहेर पाठवू इच्छिणाऱ्यांसाठी:',
    upiVpaLabel: 'UPI आयडी',
    copyUpi: 'UPI कॉपी करा',
    copied: 'कॉपी झाले',
    payViaUpi: 'UPI ॲप उघडा',
  },
  footer: {
    addToCalendar: 'कॅलेंडरमध्ये जोडा (.ics)',
    shareWhatsApp: 'WhatsApp वर शेअर करा',
    languageLabel: 'लग्नपत्रिकेची भाषा',
    madeWithWebzy: 'Webzy Weddings द्वारे निर्मित',
    privacyNote: 'खाजगी डिजिटल निमंत्रण · भारतीय गोपनीयता मानकांद्वारे सुरक्षित',
  },
});

WEDDING_UI_COPY.pa = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'ਪੰਜਾਬੀ',
  gate: {
    tapToOpen: 'ਖੋਲ੍ਹਣ ਲਈ ਟੈਪ ਕਰੋ',
    pressToOpen: 'ਮੋਹਰ ਖੋਲ੍ਹੋ',
    weddingReveal: 'ਸ਼ੁਭ ਵਿਆਹ ਸੱਦਾ',
    royalInvitation: 'ਸ਼ਾਹੀ ਸੱਦਾ ਪੱਤਰ',
    openAriaLabel: 'ਵਿਆਹ ਦਾ ਸੱਦਾ ਖੋਲ੍ਹੋ',
  },
  hero: {
    honouredGuestPrefix: 'ਸਤਿਕਾਰਯੋਗ ਮਹਿਮਾਨ',
    dearGuestPrefix: 'ਸਨੇਹੀ',
    togetherWithFamilies: 'ਪਰਿਵਾਰ ਸਮੇਤ ਨਿੱਘਾ ਸੱਦਾ',
    underGraceAlmighty: 'ਵਾਹਿਗੁਰੂ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ',
    cordiallyInvite: 'ਸ਼ੁਭ ਵਿਆਹ ਦੇ ਪਾਵਨ ਮੌਕੇ ਤੇ ਤੁਹਾਡਾ ਨਿੱਘਾ ਸਵਾਗਤ ਹੈ',
    requestHonour: 'ਇਸ ਸ਼ੁਭ ਵਿਆਹ ਸਮਾਗਮ ਵਿੱਚ ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਦੀ ਬੇਨਤੀ ਹੈ',
    andWord: 'ਅਤੇ',
    scrollToExplore: 'ਅੱਗੇ ਵੇਖਣ ਲਈ ਹੇਠਾਂ ਸਕ੍ਰੋਲ ਕਰੋ',
  },
  nav: { events: 'ਪ੍ਰੋਗਰਾਮ', venue: 'ਸਥਾਨ', story: 'ਕਹਾਣੀ', rsvp: 'ਹਾਜ਼ਰੀ', replayGate: 'ਦੁਬਾਰਾ ਖੋਲ੍ਹੋ' },
  message: {
    dearPrefix: 'ਨਿੱਘਾ ਸਵਾਗਤ,',
    withLoveBlessings: 'ਪਿਆਰ ਅਤੇ ਅਸੀਸਾਂ ਸਹਿਤ',
    daughterOf: 'ਸਪੁੱਤਰੀ',
    sonOf: 'ਸਪੁੱਤਰ',
    bridesFamily: 'ਕੰਨਿਆ ਪਰਿਵਾਰ',
    groomsFamily: 'ਵਰ ਪਰਿਵਾਰ',
    celebrationHashtag: 'ਆਪਣੀਆਂ ਯਾਦਾਂ ਸਾਂਝੀਆਂ ਕਰੋ',
  },
  countdown: {
    countingDown: 'ਸ਼ੁਭ ਮੁਹੂਰਤ ਦੀ ਉਡੀਕ',
    celebrationBegun: 'ਖੁਸ਼ੀਆਂ ਦਾ ਜਸ਼ਨ ਸ਼ੁਰੂ ਹੋ ਚੁੱਕਾ ਹੈ',
    days: 'ਦਿਨ',
    hours: 'ਘੰਟੇ',
    mins: 'ਮਿੰਟ',
    secs: 'ਸਕਿੰਟ',
    saveTheDate: 'ਸ਼ੁਭ ਤਾਰੀਖ',
  },
  events: {
    eyebrow: 'ਵਿਆਹ ਪ੍ਰੋਗਰਾਮ',
    heading: 'ਰਸਮਾਂ ਅਤੇ ਜਸ਼ਨ',
    allDays: 'ਸਾਰੇ ਦਿਨ',
    dayPrefix: 'ਦਿਨ',
    dressCodeLabel: 'ਪਹਿਰਾਵਾ',
    paletteLabel: 'ਰੰਗ',
    openInMaps: 'ਨਕਸ਼ੇ ਤੇ ਵੇਖੋ',
  },
  venue: { eyebrow: 'ਵਿਆਹ ਸਥਾਨ', heading: 'ਸਮਾਗਮ ਦਾ ਸਥਾਨ', openGoogleMaps: 'Google Maps ਵਿੱਚ ਖੋਲ੍ਹੋ' },
  story: { eyebrow: 'ਸਾਡੀ ਪਿਆਰ ਕਹਾਣੀ', defaultTitle: 'ਸਾਡਾ ਸਫ਼ਰ', milestonesHeading: 'ਯਾਦਗਾਰ ਪਲ' },
  gallery: {
    eyebrow: 'ਯਾਦਗਾਰ ਤਸਵੀਰਾਂ',
    heading: 'ਖੁਸ਼ੀ ਦੇ ਪਲ',
    tapToEnlarge: 'ਵੱਡਾ ਕਰਕੇ ਵੇਖੋ',
    closePhoto: 'ਬੰਦ ਕਰੋ',
    prevPhoto: 'ਪਿਛਲੀ ਤਸਵੀਰ',
    nextPhoto: 'ਅਗਲੀ ਤਸਵੀਰ',
  },
  hospitality: {
    eyebrow: 'ਮਹਿਮਾਨ ਨਿਵਾਜ਼ੀ',
    heading: 'ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ',
    subhead: 'ਤੁਹਾਡੀ ਯਾਤਰਾ ਅਤੇ ਠਹਿਰਨ ਨੂੰ ਆਰਾਮਦਾਇਕ ਬਣਾਉਣ ਲਈ ਵੇਰਵੇ।',
  },
  rsvp: {
    eyebrow: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    heading: 'ਹਾਜ਼ਰੀ ਅਤੇ ਅਸੀਸਾਂ',
    subhead: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਹਾਜ਼ਰੀ ਬਾਰੇ ਦੱਸੋ ਤਾਂ ਜੋ ਅਸੀਂ ਤੁਹਾਡੇ ਸਵਾਗਤ ਦੀ ਤਿਆਰੀ ਕਰ ਸਕੀਏ।',
    deadlinePrefix: 'ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਤਾਰੀਖ ਤੱਕ ਦੱਸੋ:',
    yourNameLabel: 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ / ਪਰਿਵਾਰ ਦਾ ਨਾਮ',
    yourNamePlaceholder: 'ਜਿਵੇਂ: ਗਿੱਲ ਪਰਿਵਾਰ / ਹਰਪ੍ਰੀਤ ਸਿੰਘ',
    attendingQuestion: 'ਕੀ ਤੁਸੀਂ ਵਿਆਹ ਦੇ ਜਸ਼ਨਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋ ਰਹੇ ਹੋ?',
    joyfullyAttend: 'ਹਾਂ ਜੀ, ਖੁਸ਼ੀ ਨਾਲ ਆਵਾਂਗੇ',
    regretfullyDecline: 'ਮਾਫ਼ ਕਰਨਾ, ਆਉਣਾ ਸੰਭਵ ਨਹੀਂ',
    guestCountLabel: 'ਮਹਿਮਾਨਾਂ ਦੀ ਗਿਣਤੀ',
    maxPrefix: 'ਵੱਧ ਤੋਂ ਵੱਧ',
    guestSingular: 'ਮਹਿਮਾਨ',
    guestPlural: 'ਮਹਿਮਾਨ',
    mealPrefLabel: 'ਖਾਣੇ ਦੀ ਪਸੰਦ',
    pureVeg: 'ਸ਼ੁੱਧ ਸ਼ਾਕਾਹਾਰੀ',
    jain: 'ਜੈਨ ਭੋਜਨ',
    nonVeg: 'ਮਾਸਾਹਾਰੀ',
    wishesLabel: 'ਸ਼ੁਭਕਾਮਨਾਵਾਂ ਜਾਂ ਆਉਣ ਦਾ ਸਮਾਂ (ਵਿਕਲਪਿਕ)',
    wishesPlaceholder: 'ਆਪਣੀਆਂ ਅਸੀਸਾਂ ਜਾਂ ਆਉਣ ਦਾ ਵੇਰਵਾ ਲਿਖੋ...',
    confirmBtn: 'ਹਾਜ਼ਰੀ ਪੱਕੀ ਕਰੋ',
    submittingBtn: 'ਦਰਜ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    whatsappBtn: 'WhatsApp ਤੇ ਭੇਜੋ',
    thankYouPrefix: 'ਬਹੁਤ ਧੰਨਵਾਦ,',
    confirmedNote: 'ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਦਰਜ ਹੋ ਗਈ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੇ ਸਵਾਗਤ ਲਈ ਉਤਸੁਕ ਹਾਂ।',
    declinedNote: 'ਸਾਨੂੰ ਤੁਹਾਡੀ ਕਮੀ ਮਹਿਸੂਸ ਹੋਵੇਗੀ, ਤੁਹਾਡੀਆਂ ਅਸੀਸਾਂ ਲਈ ਧੰਨਵਾਦ।',
    sendWhatsAppFollowup: 'WhatsApp ਤੇ ਵੀ ਦੱਸੋ',
    editResponse: 'ਜਵਾਬ ਬਦਲੋ',
  },
  shagun: {
    eyebrow: 'ਪਿਆਰ ਅਤੇ ਅਸੀਸਾਂ',
    heading: 'ਡਿਜੀਟਲ ਸ਼ਗਨ',
    subhead: 'ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਅਤੇ ਅਸੀਸਾਂ ਸਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵੱਡਾ ਤੋਹਫ਼ਾ ਹਨ। ਡਿਜੀਟਲ ਸ਼ਗਨ ਭੇਜਣ ਲਈ:',
    upiVpaLabel: 'UPI ਆਈਡੀ',
    copyUpi: 'UPI ਕਾਪੀ ਕਰੋ',
    copied: 'ਕਾਪੀ ਹੋ ਗਿਆ',
    payViaUpi: 'UPI ਐਪ ਖੋਲ੍ਹੋ',
  },
  footer: {
    addToCalendar: 'ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ (.ics)',
    shareWhatsApp: 'WhatsApp ਤੇ ਸਾਂਝਾ ਕਰੋ',
    languageLabel: 'ਸੱਦੇ ਦੀ ਭਾਸ਼ਾ',
    madeWithWebzy: 'Webzy Weddings ਵੱਲੋਂ ਤਿਆਰ ਕੀਤਾ ਗਿਆ',
    privacyNote: 'ਨਿੱਜੀ ਡਿਜੀਟਲ ਸੱਦਾ · ਭਾਰਤੀ ਪਰਦੇਦਾਰੀ ਮਿਆਰਾਂ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ',
  },
});

WEDDING_UI_COPY.bn = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'বাংলা',
  gate: {
    tapToOpen: 'খোলার জন্য ট্যাপ করুন',
    pressToOpen: 'সীল খুলুন',
    weddingReveal: 'শুভ বিবাহ নিমন্ত্রণ',
    royalInvitation: 'রাজকীয় আমন্ত্রণপত্র',
    openAriaLabel: 'বিবাহের আমন্ত্রণপত্র খুলুন',
  },
  hero: {
    honouredGuestPrefix: 'সম্মানীয় অতিথি',
    dearGuestPrefix: 'প্রিয়',
    togetherWithFamilies: 'সপরিবারে সাদর আমন্ত্রণ',
    underGraceAlmighty: 'পরম করুণাময়ের আশীর্বাদে',
    cordiallyInvite: 'শুভ পরিণয় উৎসবে আপনার সাদর উপস্থিতি একান্ত কাম্য',
    requestHonour: 'এই শুভ বিবাহ অনুষ্ঠানে আপনার উপস্থিতি কামনা করি',
    andWord: 'ও',
    scrollToExplore: 'আরও দেখতে নিচে স্ক্রল করুন',
  },
  nav: { events: 'অনুষ্ঠান', venue: 'স্থান', story: 'গল্প', rsvp: 'উপস্থিতি', replayGate: 'আবার খুলুন' },
  message: {
    dearPrefix: 'সাদর অভ্যর্থনা,',
    withLoveBlessings: 'প্রীতি ও শুভেচ্ছান্তে',
    daughterOf: 'সুকন্যা',
    sonOf: 'সুপুত্র',
    bridesFamily: 'কন্যাপক্ষ',
    groomsFamily: 'বরপক্ষ',
    celebrationHashtag: 'আপনার মুহূর্তগুলি শেয়ার করুন',
  },
  countdown: {
    countingDown: 'শুভ লগ্নের অপেক্ষা',
    celebrationBegun: 'শুভ অনুষ্ঠান শুরু হয়েছে',
    days: 'দিন',
    hours: 'ঘণ্টা',
    mins: 'মিনিট',
    secs: 'সেকেন্ড',
    saveTheDate: 'শুভ তারিখ',
  },
  events: {
    eyebrow: 'অনুষ্ঠান সূচি',
    heading: 'বিবাহ ও উৎসব',
    allDays: 'সব দিন',
    dayPrefix: 'দিন',
    dressCodeLabel: 'পোশাক',
    paletteLabel: 'রঙ',
    openInMaps: 'মানচিত্রে দেখুন',
  },
  venue: { eyebrow: 'অনুষ্ঠান স্থল', heading: 'কোথায় উদযাপন হবে', openGoogleMaps: 'Google Maps-এ খুলুন' },
  story: { eyebrow: 'আমাদের প্রেমের গল্প', defaultTitle: 'আমাদের পথচলা', milestonesHeading: 'স্মরণীয় অধ্যায়' },
  gallery: {
    eyebrow: 'স্মৃতির পাতা',
    heading: 'আনন্দের মুহূর্ত',
    tapToEnlarge: 'বড় করে দেখুন',
    closePhoto: 'বন্ধ করুন',
    prevPhoto: 'আগের ছবি',
    nextPhoto: 'পরের ছবি',
  },
  hospitality: {
    eyebrow: 'অতিথি অভ্যর্থনা',
    heading: 'প্রয়োজনীয় তথ্য',
    subhead: 'আপনার যাত্রা ও অবস্থান আনন্দময় করার জন্য কিছু তথ্য।',
  },
  rsvp: {
    eyebrow: 'আপনার উপস্থিতি',
    heading: 'উপস্থিতি ও আশীর্বাদ',
    subhead: 'আপনার অভ্যর্থনার সুব্যবস্থার জন্য অনুগ্রহ করে আপনার উপস্থিতি নিশ্চিত করুন।',
    deadlinePrefix: 'অনুগ্রহ করে জানানোর শেষ তারিখ:',
    yourNameLabel: 'আপনার পুরো নাম / পরিবারের নাম',
    yourNamePlaceholder: 'যেমন: মুখার্জি পরিবার / অরিন্দম মুখার্জি',
    attendingQuestion: 'আপনি কি এই শুভ অনুষ্ঠানে যোগ দিচ্ছেন?',
    joyfullyAttend: 'হ্যাঁ, আনন্দের সাথে উপস্থিত থাকব',
    regretfullyDecline: 'দুঃখিত, উপস্থিত থাকা সম্ভব নয়',
    guestCountLabel: 'অতিথির সংখ্যা',
    maxPrefix: 'সর্বোচ্চ',
    guestSingular: 'অতিথি',
    guestPlural: 'অতিথি',
    mealPrefLabel: 'আহারের পছন্দ',
    pureVeg: 'নিরামিষ',
    jain: 'জৈন আহার',
    nonVeg: 'আমিষ',
    wishesLabel: 'শুভেচ্ছা বা আগমনের সময় (ঐচ্ছিক)',
    wishesPlaceholder: 'আপনার আশীর্বাদ বা পৌঁছানোর সময় লিখুন...',
    confirmBtn: 'উপস্থিতি নিশ্চিত করুন',
    submittingBtn: 'সংরক্ষণ করা হচ্ছে...',
    whatsappBtn: 'WhatsApp-এ পাঠান',
    thankYouPrefix: 'আন্তরিক ধন্যবাদ,',
    confirmedNote: 'আপনার উপস্থিতি নিশ্চিত হয়েছে। আপনাকে স্বাগত জানাতে আমরা অধীর আগ্রহে অপেক্ষা করছি।',
    declinedNote: 'আপনার অনুপস্থিতি আমরা অনুভব করব, আপনার আশীর্বাদের জন্য ধন্যবাদ।',
    sendWhatsAppFollowup: 'WhatsApp-এও জানিয়ে দিন',
    editResponse: 'উত্তর পরিবর্তন করুন',
  },
  shagun: {
    eyebrow: 'ভালোবাসা ও আশীর্বাদ',
    heading: 'ডিজিটাল উপহার (শগুন)',
    subhead: 'আপনার উপস্থিতি ও আশীর্বাদই আমাদের শ্রেষ্ঠ উপহার। ডিজিটাল আশীর্বাদ পাঠাতে চাইলে:',
    upiVpaLabel: 'UPI আইডি',
    copyUpi: 'UPI কপি করুন',
    copied: 'কপি হয়েছে',
    payViaUpi: 'UPI অ্যাপ খুলুন',
  },
  footer: {
    addToCalendar: 'ক্যালেন্ডারে যোগ করুন (.ics)',
    shareWhatsApp: 'WhatsApp-এ শেয়ার করুন',
    languageLabel: 'আমন্ত্রণের ভাষা',
    madeWithWebzy: 'Webzy Weddings দ্বারা নির্মিত',
    privacyNote: 'ব্যক্তিগত ডিজিটাল আমন্ত্রণ · ভারতীয় গোপনীয়তা মান দ্বারা সুরক্ষিত',
  },
});

WEDDING_UI_COPY.ta = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'தமிழ்',
  gate: {
    tapToOpen: 'திறக்க தட்டவும்',
    pressToOpen: 'முத்திரையைத் திறக்கவும்',
    weddingReveal: 'சுப திருமண அழைப்பிதழ்',
    royalInvitation: 'மங்கல அழைப்பிதழ்',
    openAriaLabel: 'திருமண அழைப்பிதழைத் திறக்கவும்',
  },
  hero: {
    honouredGuestPrefix: 'மதிப்பிற்குரிய விருந்தினர்',
    dearGuestPrefix: 'அன்புள்ள',
    togetherWithFamilies: 'குடும்பத்தினர் அனைவரும் அன்புடன் அழைக்கிறோம்',
    underGraceAlmighty: 'இறைவன் திருவருளால்',
    cordiallyInvite: 'திருமண சுப முகூர்த்த விழாவிற்கு தங்களை அன்புடன் வரவேற்கிறோம்',
    requestHonour: 'இத்திருமண நன்னாளில் தங்கள் வருகையை அன்புடன் வேண்டுகிறோம்',
    andWord: 'மற்றும்',
    scrollToExplore: 'மேலும் பார்க்க கீழே நகர்த்தவும்',
  },
  nav: { events: 'நிகழ்வுகள்', venue: 'இடம்', story: 'கதை', rsvp: 'வருகை', replayGate: 'மீண்டும் திற' },
  message: {
    dearPrefix: 'அன்பான வரவேற்பு,',
    withLoveBlessings: 'அன்பும் ஆசிகளுடன்',
    daughterOf: 'புதல்வி',
    sonOf: 'புதல்வன்',
    bridesFamily: 'மணமகள் குடும்பத்தினர்',
    groomsFamily: 'மணமகன் குடும்பத்தினர்',
    celebrationHashtag: 'உங்கள் நினைவுகளைப் பகிருங்கள்',
  },
  countdown: {
    countingDown: 'சுப முகூர்த்தத்திற்கான நேரம்',
    celebrationBegun: 'திருமண விழா தொடங்கிவிட்டது',
    days: 'நாட்கள்',
    hours: 'மணி',
    mins: 'நிமிடம்',
    secs: 'வினாடி',
    saveTheDate: 'சுப நாள்',
  },
  events: {
    eyebrow: 'திருமண நிகழ்ச்சிகள்',
    heading: 'விழாக்கள் & கொண்டாட்டங்கள்',
    allDays: 'அனைத்து நாட்களும்',
    dayPrefix: 'நாள்',
    dressCodeLabel: 'ஆடை',
    paletteLabel: 'நிறம்',
    openInMaps: 'வரைபடத்தில் பார்க்க',
  },
  venue: { eyebrow: 'திருமண மண்டபம்', heading: 'விழா நடைபெறும் இடம்', openGoogleMaps: 'Google Maps-இல் திறக்கவும்' },
  story: { eyebrow: 'எங்கள் காதல் கதை', defaultTitle: 'எங்கள் பயணம்', milestonesHeading: 'மறக்க முடியாத தருணங்கள்' },
  gallery: {
    eyebrow: 'புகைப்படத் தொகுப்பு',
    heading: 'மகிழ்ச்சியான தருணங்கள்',
    tapToEnlarge: 'பெரிதாக்கிப் பார்க்க',
    closePhoto: 'மூடு',
    prevPhoto: 'முந்தைய படம்',
    nextPhoto: 'அடுத்த படம்',
  },
  hospitality: {
    eyebrow: 'விருந்தினர் உபசரிப்பு',
    heading: 'முக்கிய விவரங்கள்',
    subhead: 'உங்கள் பயணம் மற்றும் தங்குமிடம் இனிமையாக அமைய சில தகவல்கள்.',
  },
  rsvp: {
    eyebrow: 'தங்கள் வருகை',
    heading: 'வருகை & வாழ்த்துக்கள்',
    subhead: 'தங்களை சிறப்பாக வரவேற்க உங்கள் வருகையை உறுதிப்படுத்த வேண்டுகிறோம்.',
    deadlinePrefix: 'தயவுசெய்து பதிலளிக்க வேண்டிய தேதி:',
    yourNameLabel: 'உங்கள் முழுப் பெயர் / குடும்பப் பெயர்',
    yourNamePlaceholder: 'எ.கா: சுப்பிரமணியன் குடும்பம் / கார்த்திக்',
    attendingQuestion: 'திருமண விழாவில் கலந்து கொள்கிறீர்களா?',
    joyfullyAttend: 'ஆம், மகிழ்ச்சியுடன் கலந்து கொள்கிறோம்',
    regretfullyDecline: 'மன்னிக்கவும், கலந்து கொள்ள இயலவில்லை',
    guestCountLabel: 'வருகை தரும் விருந்தினர்கள் எண்ணிக்கை',
    maxPrefix: 'அதிகபட்சம்',
    guestSingular: 'விருந்தினர்',
    guestPlural: 'விருந்தினர்கள்',
    mealPrefLabel: 'உணவு விருப்பம்',
    pureVeg: 'சைவம்',
    jain: 'ஜெயின் உணவு',
    nonVeg: 'அசைவம்',
    wishesLabel: 'வாழ்த்துக்கள் அல்லது வருகை நேரம் (விருப்பத்தேர்வு)',
    wishesPlaceholder: 'உங்கள் ஆசிகள் அல்லது வருகை விவரங்களை எழுதவும்...',
    confirmBtn: 'வருகையை உறுதி செய்',
    submittingBtn: 'பதிவு செய்யப்படுகிறது...',
    whatsappBtn: 'WhatsApp-இல் அனுப்பவும்',
    thankYouPrefix: 'மனமார்ந்த நன்றி,',
    confirmedNote: 'உங்கள் வருகை உறுதி செய்யப்பட்டது. தங்களை வரவேற்க ஆவலுடன் காத்திருக்கிறோம்.',
    declinedNote: 'உங்கள் வருகையின்மையை உணர்வோம், தங்கள் வாழ்த்துக்களுக்கு மிக்க நன்றி.',
    sendWhatsAppFollowup: 'WhatsApp மூலமும் தெரிவிக்கவும்',
    editResponse: 'பதிலை மாற்றவும்',
  },
  shagun: {
    eyebrow: 'அன்பும் ஆசிகளும்',
    heading: 'டிஜிட்டல் மொய் / அன்பளிப்பு',
    subhead: 'தங்கள் வருகையும் ஆசிகளுமே எங்களுக்குப் பெரிய பரிசு. டிஜிட்டல் அன்பளிப்பு அனுப்ப விரும்புவோருக்கு:',
    upiVpaLabel: 'UPI முகவரி',
    copyUpi: 'UPI நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது',
    payViaUpi: 'UPI செயலியைத் திற',
  },
  footer: {
    addToCalendar: 'நாட்காட்டியில் சேர் (.ics)',
    shareWhatsApp: 'WhatsApp-இல் பகிர்',
    languageLabel: 'அழைப்பிதழ் மொழி',
    madeWithWebzy: 'Webzy Weddings உருவாக்கம்',
    privacyNote: 'தனிப்பட்ட டிஜிட்டல் அழைப்பிதழ் · இந்திய தனியுரிமைத் தரங்களால் பாதுகாக்கப்பட்டது',
  },
});

WEDDING_UI_COPY.te = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'తెలుగు',
  gate: {
    tapToOpen: 'తెరవడానికి నొక్కండి',
    pressToOpen: 'ముద్ర తెరవండి',
    weddingReveal: 'శుభ వివాహ ఆహ్వాన పత్రిక',
    royalInvitation: 'మంగళ ఆహ్వానం',
    openAriaLabel: 'వివాహ ఆహ్వానాన్ని తెరవండి',
  },
  hero: {
    honouredGuestPrefix: 'గౌరవనీయ అతిథి',
    dearGuestPrefix: 'ప్రియమైన',
    togetherWithFamilies: 'కుటుంబ సమేతంగా హృదయపూర్వక ఆహ్వానం',
    underGraceAlmighty: 'భగవంతుని ఆశీస్సులతో',
    cordiallyInvite: 'శుభ వివాహ మహోత్సవానికి మీ ఆగమనం కోరుతున్నాము',
    requestHonour: 'ఈ శుభ వివాహ వేడుకకు విచ్చేసి ఆశీర్వదించగలరు',
    andWord: 'మరియు',
    scrollToExplore: 'మరిన్ని వివరాలకు క్రిందికి స్క్రోల్ చేయండి',
  },
  nav: { events: 'వేడుకలు', venue: 'వేదిక', story: 'కథ', rsvp: 'హాజరు', replayGate: 'మళ్ళీ తెరవండి' },
  message: {
    dearPrefix: 'సాదర ఆహ్వానం,',
    withLoveBlessings: 'ప్రేమ మరియు ఆశీస్సులతో',
    daughterOf: 'సుపుత్రిక',
    sonOf: 'సుపుత్రుడు',
    bridesFamily: 'వధువు కుటుంబం',
    groomsFamily: 'వరుడి కుటుంబం',
    celebrationHashtag: 'మీ జ్ఞాపకాలను పంచుకోండి',
  },
  countdown: {
    countingDown: 'శుభ ముహూర్తానికి మిగిలిన సమయం',
    celebrationBegun: 'శుభ వేడుక ప్రారంభమైనది',
    days: 'రోజులు',
    hours: 'గంటలు',
    mins: 'నిమిషాలు',
    secs: 'సెకన్లు',
    saveTheDate: 'శుభ తేదీ',
  },
  events: {
    eyebrow: 'వివాహ కార్యక్రమాలు',
    heading: 'వేడుకలు & సంబరాలు',
    allDays: 'అన్ని రోజులు',
    dayPrefix: 'రోజు',
    dressCodeLabel: 'వస్త్రధారణ',
    paletteLabel: 'రంగులు',
    openInMaps: 'మ్యాప్‌లో చూడండి',
  },
  venue: { eyebrow: 'వివాహ వేదిక', heading: 'వేడుక జరిగే స్థలం', openGoogleMaps: 'Google Maps లో తెరవండి' },
  story: { eyebrow: 'మా ప్రేమ కథ', defaultTitle: 'మా ప్రయాణం', milestonesHeading: 'మధుర జ్ఞాపకాలు' },
  gallery: {
    eyebrow: 'చిత్ర మాలిక',
    heading: 'ఆనంద క్షణాలు',
    tapToEnlarge: 'పెద్దదిగా చూడండి',
    closePhoto: 'మూసివేయండి',
    prevPhoto: 'మునుపటి ఫోటో',
    nextPhoto: 'తదుపరి ఫోటో',
  },
  hospitality: {
    eyebrow: 'అతిథి మర్యాద',
    heading: 'ముఖ్య వివరములు',
    subhead: 'మీ ప్రయాణం మరియు విడిది సౌకర్యవంతంగా ఉండటానికి వివరాలు.',
  },
  rsvp: {
    eyebrow: 'మీ ఆగమనం',
    heading: 'హాజరు & ఆశీస్సులు',
    subhead: 'మీకు ఘనంగా స్వాగతం పలికేందుకు దయచేసి మీ రాకను తెలియజేయండి.',
    deadlinePrefix: 'దయచేసి ఈ తేదీలోపు తెలియజేయండి:',
    yourNameLabel: 'మీ పూర్తి పేరు / కుటుంబ పేరు',
    yourNamePlaceholder: 'ఉదా: రావు గారి కుటుంబం / శ్రీనివాస రావు',
    attendingQuestion: 'మీరు ఈ శుభ వేడుకకు విచ్చేస్తున్నారా?',
    joyfullyAttend: 'అవును, సంతోషంగా హాజరవుతాము',
    regretfullyDecline: 'క్షమించండి, హాజరు కాలేకపోతున్నాము',
    guestCountLabel: 'హాజరయ్యే అతిథుల సంఖ్య',
    maxPrefix: 'గరిష్టం',
    guestSingular: 'అతిథి',
    guestPlural: 'అతిథులు',
    mealPrefLabel: 'భోజన ప్రాధాన్యత',
    pureVeg: 'శుద్ధ శాఖాహారం',
    jain: 'జైన్ భోజనం',
    nonVeg: 'మాంసాహారం',
    wishesLabel: 'శుభాకాంక్షలు లేదా రాక సమయం (ఐచ్ఛికం)',
    wishesPlaceholder: 'మీ ఆశీస్సులు లేదా రాక వివరాలను వ్రాయండి...',
    confirmBtn: 'హాజరు నిర్ధారించండి',
    submittingBtn: 'నమోదు అవుతోంది...',
    whatsappBtn: 'WhatsApp లో పంపండి',
    thankYouPrefix: 'హృదయపూర్వక ధన్యవాదాలు,',
    confirmedNote: 'మీ రాక నమోదు చేయబడింది. మిమ్మల్ని ఆహ్వానించడానికి మేము ఎదురుచూస్తున్నాము.',
    declinedNote: 'మీ లోటు తెలుస్తుంది, మీ ఆశీస్సులకు హృదయపూర్వక కృతజ్ఞతలు.',
    sendWhatsAppFollowup: 'WhatsApp లో కూడా తెలియజేయండి',
    editResponse: 'సమాధానం మార్చండి',
  },
  shagun: {
    eyebrow: 'ప్రేమ & ఆశీస్సులు',
    heading: 'డిజిటల్ కానుక (శగున్)',
    subhead: 'మీ రాక మరియు ఆశీస్సులే మాకు అతిపెద్ద కానుక. డిజిటల్ కానుక పంపాలనుకునే వారి కోసం:',
    upiVpaLabel: 'UPI ఐడి',
    copyUpi: 'UPI కాపీ చేయండి',
    copied: 'కాపీ చేయబడింది',
    payViaUpi: 'UPI యాప్ తెరవండి',
  },
  footer: {
    addToCalendar: 'క్యాలెండర్‌లో చేర్చండి (.ics)',
    shareWhatsApp: 'WhatsApp లో షేర్ చేయండి',
    languageLabel: 'ఆహ్వాన భాష',
    madeWithWebzy: 'Webzy Weddings ద్వారా రూపొందించబడింది',
    privacyNote: 'ప్రైవేట్ డిజిటల్ ఆహ్వానం · భారతీయ గోప్యతా ప్రమాణాలచే రక్షించబడింది',
  },
});

WEDDING_UI_COPY.kn = mergeWeddingCopy(WEDDING_UI_COPY.en, {
  languageName: 'ಕನ್ನಡ',
  gate: {
    tapToOpen: 'ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    pressToOpen: 'ಮುದ್ರೆ ತೆರೆಯಿರಿ',
    weddingReveal: 'ಶುಭ ವಿವಾಹ ಆಮಂತ್ರಣ ಪತ್ರಿಕೆ',
    royalInvitation: 'ಮಂಗಳ ಆಮಂತ್ರಣ',
    openAriaLabel: 'ವಿವಾಹ ಆಮಂತ್ರಣವನ್ನು ತೆರೆಯಿರಿ',
  },
  hero: {
    honouredGuestPrefix: 'ಗೌರವಾನ್ವಿತ ಅತಿಥಿ',
    dearGuestPrefix: 'ಪ್ರೀತಿಯ',
    togetherWithFamilies: 'ಕುಟುಂಬ ಸಮೇತ ಹೃತ್ಪೂರ್ವಕ ಆಮಂತ್ರಣ',
    underGraceAlmighty: 'ದೇವರ ಅನುಗ್ರಹದಿಂದ',
    cordiallyInvite: 'ಶುಭ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಮ್ಮ ಸಕುಟುಂಬ ಆಗಮನವನ್ನು ಕೋರುತ್ತೇವೆ',
    requestHonour: 'ಈ ಶುಭ ವಿವಾಹ ಸಮಾರಂಭಕ್ಕೆ ಆಗಮಿಸಿ ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ವಿನಂತಿ',
    andWord: 'ಮತ್ತು',
    scrollToExplore: 'ಮುಂದೆ ನೋಡಲು ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ',
  },
  nav: { events: 'ಕಾರ್ಯಕ್ರಮಗಳು', venue: 'ಸ್ಥಳ', story: 'ಕಥೆ', rsvp: 'ಹಾಜರಾತಿ', replayGate: 'ಮತ್ತೆ ತೆರೆಯಿರಿ' },
  message: {
    dearPrefix: 'ಆತ್ಮೀಯ ಸ್ವಾಗತ,',
    withLoveBlessings: 'ಪ್ರೀತಿ ಮತ್ತು ಆಶೀರ್ವಾದಗಳೊಂದಿಗೆ',
    daughterOf: 'ಸುಪುತ್ರಿ',
    sonOf: 'ಸುಪುತ್ರ',
    bridesFamily: 'ವಧುವಿನ ಕುಟುಂಬ',
    groomsFamily: 'ವರನ ಕುಟುಂಬ',
    celebrationHashtag: 'ನಿಮ್ಮ ನೆನಪುಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
  },
  countdown: {
    countingDown: 'ಶುಭ ಮುಹೂರ್ತಕ್ಕೆ ಉಳಿದ ಸಮಯ',
    celebrationBegun: 'ಮಂಗಳ ಸಮಾರಂಭ ಪ್ರಾರಂಭವಾಗಿದೆ',
    days: 'ದಿನಗಳು',
    hours: 'ಗಂಟೆಗಳು',
    mins: 'ನಿಮಿಷಗಳು',
    secs: 'ಸೆಕೆಂಡುಗಳು',
    saveTheDate: 'ಶುಭ ದಿನಾಂಕ',
  },
  events: {
    eyebrow: 'ವಿವಾಹ ಕಾರ್ಯಕ್ರಮಗಳು',
    heading: 'ಸಮಾರಂಭಗಳು ಮತ್ತು ಸಂಭ್ರಮ',
    allDays: 'ಎಲ್ಲಾ ದಿನಗಳು',
    dayPrefix: 'ದಿನ',
    dressCodeLabel: 'ಉಡುಗೆ',
    paletteLabel: 'ಬಣ್ಣ',
    openInMaps: 'ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ',
  },
  venue: { eyebrow: 'ವಿವಾಹ ಸ್ಥಳ', heading: 'ಸಮಾರಂಭದ ಸ್ಥಳ', openGoogleMaps: 'Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ' },
  story: { eyebrow: 'ನಮ್ಮ ಪ್ರೇಮಕಥೆ', defaultTitle: 'ನಮ್ಮ ಪಯಣ', milestonesHeading: 'ಮರೆಯಲಾಗದ ಕ್ಷಣಗಳು' },
  gallery: {
    eyebrow: 'ನೆನಪಿನ ಚಿತ್ರಗಳು',
    heading: 'ಸಂಭ್ರಮದ ಕ್ಷಣಗಳು',
    tapToEnlarge: 'ದೊಡ್ಡದಾಗಿ ನೋಡಿ',
    closePhoto: 'ಮುಚ್ಚಿ',
    prevPhoto: 'ಹಿಂದಿನ ಫೋಟೋ',
    nextPhoto: 'ಮುಂದಿನ ಫೋಟೋ',
  },
  hospitality: {
    eyebrow: 'ಅತಿಥಿ ಸತ್ಕಾರ',
    heading: 'ಪ್ರಮುಖ ಮಾಹಿತಿ',
    subhead: 'ನಿಮ್ಮ ಪ್ರಯಾಣ ಮತ್ತು ವಾಸ್ತವ್ಯ ಸುಖಕರವಾಗಿರಲು ಉಪಯುಕ್ತ ಮಾಹಿತಿ.',
  },
  rsvp: {
    eyebrow: 'ತಮ್ಮ ಆಗಮನ',
    heading: 'ಹಾಜರಾತಿ ಮತ್ತು ಆಶೀರ್ವಾದ',
    subhead: 'ತಮ್ಮನ್ನು ಆದರದಿಂದ ಸ್ವಾಗತಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಗಮನವನ್ನು ತಿಳಿಸಿ.',
    deadlinePrefix: 'ದಯವಿಟ್ಟು ಈ ದಿನಾಂಕದೊಳಗೆ ತಿಳಿಸಿ:',
    yourNameLabel: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು / ಕುಟುಂಬದ ಹೆಸರು',
    yourNamePlaceholder: 'ಉದಾ: ರಾವ್ ಕುಟುಂಬ / ರಾಘವೇಂದ್ರ ರಾವ್',
    attendingQuestion: 'ನೀವು ಈ ಶುಭ ಸಮಾರಂಭದಲ್ಲಿ ಭಾಗವಹಿಸುತ್ತಿದ್ದೀರಾ?',
    joyfullyAttend: 'ಹೌದು, ಸಂತೋಷದಿಂದ ಭಾಗವಹಿಸುತ್ತೇವೆ',
    regretfullyDecline: 'ಕ್ಷಮಿಸಿ, ಭಾಗವಹಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ',
    guestCountLabel: 'ಭಾಗವಹಿಸುವ ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ',
    maxPrefix: 'ಗರಿಷ್ಠ',
    guestSingular: 'ಅತಿಥಿ',
    guestPlural: 'ಅತಿಥಿಗಳು',
    mealPrefLabel: 'ಊಟದ ಆದ್ಯತೆ',
    pureVeg: 'ಶುದ್ಧ ಸಸ್ಯಹಾರಿ',
    jain: 'ಜೈನ ಭೋಜನ',
    nonVeg: 'ಮಾಂಸಾಹಾರಿ',
    wishesLabel: 'ಶುಭಾಶಯಗಳು ಅಥವಾ ಆಗಮನದ ಸಮಯ (ಐಚ್ಛಿಕ)',
    wishesPlaceholder: 'ನಿಮ್ಮ ಆಶೀರ್ವಾದ ಅಥವಾ ಆಗಮನದ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ...',
    confirmBtn: 'ಹಾಜರಾತಿ ದೃಢೀಕರಿಸಿ',
    submittingBtn: 'ದಾಖಲಾಗುತ್ತಿದೆ...',
    whatsappBtn: 'WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ',
    thankYouPrefix: 'ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳು,',
    confirmedNote: 'ನಿಮ್ಮ ಹಾಜರಾತಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ. ನಿಮ್ಮನ್ನು ಸ್ವಾಗತಿಸಲು ನಾವು ಕಾತರರಾಗಿದ್ದೇವೆ.',
    declinedNote: 'ನಿಮ್ಮ ಅನುಪಸ್ಥಿತಿಯನ್ನು ನಾವು ನೆನೆಯುತ್ತೇವೆ, ನಿಮ್ಮ ಆಶೀರ್ವಾದಗಳಿಗೆ ಧನ್ಯವಾದಗಳು.',
    sendWhatsAppFollowup: 'WhatsApp ನಲ್ಲಿಯೂ ತಿಳಿಸಿ',
    editResponse: 'ಪ್ರತಿಕ್ರಿಯೆ ಬದಲಿಸಿ',
  },
  shagun: {
    eyebrow: 'ಪ್ರೀತಿ ಮತ್ತು ಆಶೀರ್ವಾದ',
    heading: 'ಡಿಜಿಟಲ್ ಉಡುಗೊರೆ (ಶಗುನ್)',
    subhead: 'ನಿಮ್ಮ ಉಪಸ್ಥಿತಿ ಮತ್ತು ಆಶೀರ್ವಾದವೇ ನಮಗೆ ದೊಡ್ಡ ಉಡುಗೊರೆ. ಡಿಜಿಟಲ್ ಉಡುಗೊರೆ ಕಳುಹಿಸಲು ಇಚ್ಛಿಸುವವರಿಗೆ:',
    upiVpaLabel: 'UPI ಐಡಿ',
    copyUpi: 'UPI ಕಾಪಿ ಮಾಡಿ',
    copied: 'ಕಾಪಿ ಆಗಿದೆ',
    payViaUpi: 'UPI ಆಪ್ ತೆರೆಯಿರಿ',
  },
  footer: { addToCalendar: 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ', shareWhatsApp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ', languageLabel: 'ಆಮಂತ್ರಣದ ಭಾಷೆ' },
});

export function getWeddingUiCopy(lang?: WeddingLanguage): WeddingUiCopy {
  if (lang && lang in WEDDING_UI_COPY) {
    return WEDDING_UI_COPY[lang];
  }
  return WEDDING_UI_COPY.en;
}

export function getLocaleCode(lang?: WeddingLanguage): string {
  switch (lang) {
    case 'hi':
      return 'hi-IN';
    case 'gu':
      return 'gu-IN';
    case 'mr':
      return 'mr-IN';
    case 'pa':
      return 'pa-IN';
    case 'bn':
      return 'bn-IN';
    case 'ta':
      return 'ta-IN';
    case 'te':
      return 'te-IN';
    case 'kn':
      return 'kn-IN';
    default:
      return 'en-IN';
  }
}
