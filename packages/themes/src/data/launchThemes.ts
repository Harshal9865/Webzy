import type { LanguageCode, LocalizedText } from '@webzy/core';
import { ThemeManifest, ThemeOccasion, validateThemeManifest } from '../schema';

export const OCCASION_LABELS: Record<ThemeOccasion, LocalizedText> = {
  wedding: { hinglish: 'Wedding Vivah', hi: 'विवाह', en: 'Weddings', gu: 'લગ્ન', mr: 'लग्नपत्रिका', pa: 'ਵਿਆਹ', bn: 'বিবাহ', ta: 'திருமணம்', te: 'వివాహం', kn: 'ಮದುವೆ' },
  travel: { hinglish: 'Travel & Voyages', hi: 'यात्रा और सफ़र', en: 'Travel', gu: 'પ્રવાસ', mr: 'प्रवास', pa: 'ਯਾਤਰਾ', bn: 'ভ্রমণ', ta: 'பயணம்', te: 'ప్రయాణం', kn: 'ಪ್ರಯಾಣ' },
  birthday: { hinglish: 'Birthday', hi: 'जन्मदिन', en: 'Birthday', gu: 'જન્મદિવસ', mr: 'वाढदिवस', pa: 'ਜਨਮਦਿਨ', bn: 'জন্মদিন', ta: 'பிறந்தநாள்', te: 'పుట్టినరోజు', kn: 'ಹುಟ್ಟುಹಬ್ಬ' },
  love: { hinglish: 'Love & Propose', hi: 'प्यार / प्रपोज़', en: 'Love & Invite', gu: 'પ્રેમ અને આમંત્રણ', mr: 'प्रेम व शुभेच्छा', pa: 'ਪਿਆਰ', bn: 'ভালোবাসা', ta: 'அன்பு', te: 'ప్రేమ', kn: 'ಪ್ರೀತಿ' },
  anniversary: { hinglish: 'Anniversary', hi: 'सालगिरह', en: 'Anniversary', gu: 'વર્ષગાંઠ', mr: 'लग्नाचा वाढदिवस', pa: 'ਵਰੇਗੰਢ', bn: 'বিবাহবার্ষিকী', ta: 'திருமண நாள்', te: 'వార్షికోత్సవం', kn: 'ವಾರ್ಷಿಕೋತ್ಸವ' },
  family: { hinglish: 'Family & Smile', hi: 'परिवार / मुस्कान', en: 'Family & Care', gu: 'પરિવાર', mr: 'कुटुंब', pa: 'ਪਰਿਵਾਰ', bn: 'পরিবার', ta: 'குடும்பம்', te: 'కుటుంబం', kn: 'ಕುಟುಂಬ' },
  festival: { hinglish: 'Festivals & New Year', hi: 'त्योहार / नया साल', en: 'Festivals & New Year', gu: 'તહેવાર', mr: 'सण आणि शुभेच्छा', pa: 'ਤਿਉਹਾਰ', bn: 'উৎসব', ta: 'பண்டிகைகள்', te: 'పండుగలు', kn: 'ಹಬ್ಬಗಳು' },
  portfolio: { hinglish: 'Portfolio & Resume', hi: 'पोर्टफोलियो', en: 'Portfolio', gu: 'પોર્ટફોલિયો', mr: 'पोर्टफोलिओ', pa: 'ਪੋਰਟਫੋਲੀਓ', bn: 'পোর্টফোলিও', ta: 'போர்ட்ஃபோலியோ', te: 'పోర్ట్‌ఫోలియో', kn: 'ಪೋರ್ಟ್‌ಫೋಲಿಯೋ' },
  business: { hinglish: 'Small Business', hi: 'बिज़नेस', en: 'Business', gu: 'વ્યવસાય', mr: 'व्यवसाय', pa: 'ਕਾਰੋਬਾਰ', bn: 'ব্যবসা', ta: 'வணிகம்', te: 'వ్యాపారం', kn: 'ವ್ಯಾಪಾರ' },
};

const RAW_LAUNCH_THEMES: ThemeManifest[] = [
  {
    id: 'birthday-confetti-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'birthday',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 49, compareAt: 149, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Birthday Confetti',
      hi: 'बर्थडे कन्फेटी',
      en: 'Birthday Confetti',
    },
    audience: {
      hinglish: 'Dost, bhai-behen ya partner ke liye',
      hi: 'दोस्त, भाई-बहन या पार्टनर के लिए',
      en: 'For friends, siblings, or partners',
    },
    signatureMoment: {
      hinglish: '3 handcrafted themes: Dost Scrapbook, Crimson Velvet Binder, aur Blooming Heart Tree',
      hi: 'तीन हस्तनिर्मित थीम: दोस्त स्क्रैपबुक, क्रिमसन डायरी और खिलता हार्ट ट्री',
      en: 'Three bespoke handmade themes: Scrapbook, Crimson Love Binder & Living Floral Heart Tree',
    },
    palette: {
      primary: '#E11D63',
      secondary: '#F59E0B',
      surface: '#FFF5F8',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Kiska birthday hai?', hi: 'किसका जन्मदिन है?', en: 'Who is it for?' },
      },
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Style / Rishta chunein', hi: 'थीम / रिश्ता चुनें', en: 'Pick theme style' },
        options: [
          { value: 'friend', label: { hinglish: 'Normal · Dost Scrapbook', hi: 'नॉर्मल · दोस्त स्क्रैपबुक', en: 'Normal · Friends Scrapbook' } },
          { value: 'partner', label: { hinglish: 'Couple · Red Velvet & Binder', hi: 'कपल · क्रिमसन लिफ़ाफ़ा व डायरी', en: 'Couple · Crimson Envelope & Binder' } },
          { value: 'family', label: { hinglish: 'Family · Flowers & Heart Tree', hi: 'परिवार · फूल व हार्ट ट्री', en: 'Family · Floral Bloom & Heart Tree' } },
        ],
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 3,
        label: { hinglish: '3 photos (optional)', hi: '3 फोटो (वैकल्पिक)', en: 'Up to 3 photos' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Dil ki baat', hi: 'दिल की बात', en: 'Your message' },
      },
    ],
    music: [{ id: 'track-01', label: 'Warm Confetti Chime', mood: 'cheerful', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Priya',
      senderName: 'Aarav',
      relation: 'friend',
      photos: [
        '/templates/occasions/birthday-confetti/cover.jpg',
        '/templates/cafe/rose-cottage.jpg',
        '/templates/travel/paris-balcony.jpg',
      ],
      headline: {
        hinglish: 'Happy Birthday, Priya!',
        hi: 'जन्मदिन मुबारक हो, प्रिया!',
        en: 'Happy Birthday, Priya!',
      },
      message: {
        hinglish: 'Yaar, tu meri life ka best part hai. Aaj ka din tera, party meri taraf se!',
        hi: 'यार, तुम मेरी ज़िंदगी का सबसे अच्छा हिस्सा हो। आज का दिन तुम्हारा, पार्टी मेरी तरफ से!',
        en: 'You make every ordinary day brighter. Wishing you a year full of laughter!',
      },
      highlights: [
        {
          title: { hinglish: 'Chai trips', hi: 'चाय की टपरी', en: 'Late night chai' },
          detail: {
            hinglish: 'Har boring din ko adventure bana deti ho.',
            hi: 'हर बोरिंग दिन को यादगार बना देती हो।',
            en: 'Turning boring evenings into stories.',
          },
        },
        {
          title: { hinglish: 'No filter', hi: 'सच्ची दोस्ती', en: 'Real support' },
          detail: {
            hinglish: 'Hamesha sach aur pyaar dono saath rakha.',
            hi: 'हमेशा सच और प्यार दोनों साथ रखा।',
            en: 'Always honest and always cheering.',
          },
        },
        {
          title: { hinglish: 'New year ahead', hi: 'आने वाला साल', en: 'Year ahead' },
          detail: {
            hinglish: 'Badi khushiyan aur kam stress — yahi dua hai!',
            hi: 'बड़ी खुशियाँ और कम चिंता — यही दुआ है!',
            en: 'Big wins and calm mornings ahead.',
          },
        },
      ],
    },
  },
  {
    id: 'birthday-ashirwad-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'birthday',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 79, compareAt: 199, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Birthday Ashirwad',
      hi: 'बर्थडे आशीर्वाद',
      en: 'Birthday Ashirwad',
    },
    audience: {
      hinglish: 'Mummy, Papa, Dada-Dadi ke liye',
      hi: 'मम्मी, पापा, दादा-दादी के लिए',
      en: 'For Mummy, Papa, and elders',
    },
    signatureMoment: {
      hinglish: 'Maa-Papa ke aashirwad aur parivaar ki pyaari yaadon ka ek sunehra panna',
      hi: 'बड़ों के आशीर्वाद और परिवार की प्यारी यादों से सजा एक सुनहरा एहसास',
      en: 'A gentle tribute filled with family blessings and cherished memories',
    },
    palette: {
      primary: '#B45309',
      secondary: '#E11D63',
      surface: '#FFFBEB',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Unka naam (e.g. Mummy)', hi: 'उनका नाम (जैसे मम्मी)', en: 'Recipient name' },
      },
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Rishta chuno', hi: 'रिश्ता चुनें', en: 'Family relation' },
        options: [
          { value: 'mummy', label: { hinglish: 'Mummy / Maa', hi: 'मम्मी / माँ', en: 'Mother' } },
          { value: 'papa', label: { hinglish: 'Papa / Pitaji', hi: 'पापा / पिताजी', en: 'Father' } },
          { value: 'grandparent', label: { hinglish: 'Dadi / Nana', hi: 'दादी / नाना', en: 'Grandparent' } },
        ],
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 3,
        label: { hinglish: 'Parivaar ki 3 photos', hi: 'परिवार की 3 फोटो', en: 'Family photos (max 3)' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Aapka sandesh', hi: 'आपका संदेश', en: 'Respectful message' },
      },
    ],
    music: [{ id: 'track-02', label: 'Santoor Warmth', mood: 'respectful', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Mummy',
      senderName: 'Ananya',
      relation: 'mummy',
      photos: [
        '/templates/occasions/birthday-ashirwad/cover.jpg',
        '/templates/travel/jaipur-slices.jpg',
        '/templates/occasions/upgrades/stained-glass-gate.jpg',
      ],
      headline: {
        hinglish: 'Janamdin Mubarak, Mummy',
        hi: 'जन्मदिन मुबारक हो, मम्मी',
        en: 'Happy Birthday, Mummy',
      },
      message: {
        hinglish: 'Mummy, aapki muskurahat mere ghar ki roshni hai. Janamdin mubarak ho!',
        hi: 'मम्मी, आपकी मुस्कान हमारे घर की रोशनी है। आपको जन्मदिन की हार्दिक शुभकामनाएँ!',
        en: 'Mummy, your smile is the warmth of our entire home. Wishing you peace and good health.',
      },
      highlights: [
        {
          title: { hinglish: 'Ghar ka swad', hi: 'घर का स्वाद', en: 'Warmth of home' },
          detail: {
            hinglish: 'Aapke bina koi tyohar poora nahi lagta.',
            hi: 'आपके बिना कोई त्योहार पूरा नहीं लगता।',
            en: 'No celebration feels complete without you.',
          },
        },
        {
          title: { hinglish: 'Hamesha saath', hi: 'हमेशा साथ', en: 'Quiet strength' },
          detail: {
            hinglish: 'Har mushkil mein aapne humein himmat di.',
            hi: 'हर मुश्किल में आपने हमें हिम्मत दी।',
            en: 'Your patience carried us through everything.',
          },
        },
        {
          title: { hinglish: 'Dil se dua', hi: 'दिल से दुआ', en: 'Heartfelt prayer' },
          detail: {
            hinglish: 'Aapki achhi sehat aur hamesha khilti muskaan ki kaamna hai.',
            hi: 'आपकी अच्छी सेहत और मुस्कुराते हुए कल की कामना है।',
            en: 'Wishing you gentle mornings, good health, and endless joy.',
          },
        },
      ],
    },
  },
  {
    id: 'will-you-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'love',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 49, compareAt: 149, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Will You',
      hi: 'क्या तुम हाँ कहोगे?',
      en: 'Will You',
    },
    audience: {
      hinglish: 'Proposal ya coffee date invite ke liye',
      hi: 'प्रपोज़ या डेट इनवाइट के लिए',
      en: 'For a proposal or special date invite',
    },
    signatureMoment: {
      hinglish: 'Dil ki baat kehne ka ek meetha aur halka-phulka andaaz',
      hi: 'दिल की बात कहने का एक मीठा, सच्चा और मुस्कुराता हुआ अंदाज़',
      en: 'A tender, lighthearted way to ask the question on your heart',
    },
    palette: {
      primary: '#E11D63',
      secondary: '#FB7185',
      surface: '#FFF1F2',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Unka naam', hi: 'उनका नाम', en: 'Their name' },
      },
      {
        key: 'senderName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Aapka naam', hi: 'आपका नाम', en: 'Your name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Kaise mile + sawaal', hi: 'कैसे मिले + सवाल', en: 'How you met & ask' },
      },
    ],
    music: [{ id: 'track-03', label: 'Soft Piano Blush', mood: 'romantic', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Meera',
      senderName: 'Kabir',
      photos: [
        '/templates/occasions/upgrades/paris-moonlit-balcony.jpg',
        '/templates/occasions/upgrades/stained-glass-gate.jpg',
        '/templates/cafe/rose-cottage.jpg',
      ],
      headline: {
        hinglish: 'Ek chota sa sawaal, Meera…',
        hi: 'एक छोटा सा सवाल, मीरा…',
        en: 'One honest question, Meera…',
      },
      message: {
        hinglish: 'Us pehli baarish wali coffee ke baad se har din tumhare saath behtar lagta hai.',
        hi: 'उस पहली बारिश वाली कॉफी के बाद से हर दिन तुम्हारे साथ बेहतर लगता है।',
        en: 'Ever since that rainy coffee evening, every day feels brighter with you.',
      },
      highlights: [
        {
          title: { hinglish: 'Baarish aur coffee', hi: 'बारिश और कॉफ़ी', en: 'That rainy coffee' },
          detail: {
            hinglish: 'Us shaam ki baatein abhi bhi dil ke sabse kareeb hain.',
            hi: 'उस शाम की बातें आज भी दिल के सबसे करीब हैं।',
            en: 'Two cups, endless rain, and the easiest conversation ever.',
          },
        },
        {
          title: { hinglish: 'Chhoti si aadat', hi: 'छोटी सी आदत', en: 'Favorite habit' },
          detail: {
            hinglish: 'Har achhi khabar sabse pehle tumhe sunane ka mann karta hai.',
            hi: 'हर अच्छी खबर सबसे पहले तुम्हें सुनाने का मन करता है।',
            en: 'You are still the first person I want to share every good news with.',
          },
        },
        {
          title: { hinglish: 'Aaj ka sawaal', hi: 'आज का सवाल', en: 'One simple hope' },
          detail: {
            hinglish: 'Kya aane wali har shaam saath chai peene chalogi?',
            hi: 'क्या आने वाली हर शाम साथ चाय पीने चलोगी?',
            en: 'Would you let me keep planning these little evenings with you?',
          },
        },
      ],
    },
  },
  {
    id: 'our-timeline-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'anniversary',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 99, compareAt: 249, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Our Timeline',
      hi: 'हमारी यादें (टाइमलाइन)',
      en: 'Our Timeline',
    },
    audience: {
      hinglish: 'Anniversary aur monthsary couples ke liye',
      hi: 'सालगिरह और खास तारीखों के लिए',
      en: 'For anniversaries and monthsaries',
    },
    signatureMoment: {
      hinglish: 'Pehli mulaqat se lekar aaj tak ke har haseen pal ka safar',
      hi: 'पहली मुलाक़ात से लेकर आज तक के हर हसीन पल का सफ़र',
      en: 'A quiet walk through every milestone from your first hello to today',
    },
    palette: {
      primary: '#9D174D',
      secondary: '#F59E0B',
      surface: '#FDF2F8',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Dono ke naam', hi: 'दोनों के नाम', en: 'Couple names' },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 3,
        label: { hinglish: '3 yaadgaar photos', hi: '3 यादगार फोटो', en: 'Up to 3 photos' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Safar ke baare mein likho', hi: 'सफ़र के बारे में लिखें', en: 'Anniversary note' },
      },
    ],
    music: [{ id: 'track-04', label: 'Acoustic Sunset', mood: 'warm', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Naina & Dev',
      senderName: 'Dev',
      photos: [
        '/templates/creative/creatie-hills.jpg',
        '/templates/travel/train-window.jpg',
        '/templates/occasions/upgrades/city-window-dusk.jpg',
      ],
      headline: {
        hinglish: 'Happy Anniversary, Naina',
        hi: 'सालगिरह मुबारक, नैना',
        en: 'Happy Anniversary, Naina',
      },
      message: {
        hinglish: 'Tumhare saath har din ek chhoti si festival jaisi lagti hai.',
        hi: 'तुम्हारे साथ हर दिन एक छोटे से उत्सव जैसा लगता है।',
        en: 'With you, even quiet Tuesdays feel like a celebration.',
      },
      highlights: [
        {
          title: { hinglish: 'Oct 2023 · Pehli baat', hi: 'अक्टूबर 2023 · पहली बात', en: 'Oct 2023 · First hello' },
          detail: {
            hinglish: '5 minute ki baat 2 ghante chali.',
            hi: '5 मिनट की बात 2 घंटे चली।',
            en: 'A quick hello turned into a two-hour walk.',
          },
        },
        {
          title: { hinglish: 'Jun 2024 · Pehli trip', hi: 'जून 2024 · पहला सफ़र', en: 'Jun 2024 · First trip' },
          detail: {
            hinglish: 'Train late hui par hasi rukhi nahi.',
            hi: 'ट्रेन लेट हुई पर हँसी रुकी नहीं।',
            en: 'Missed our bus and found our favorite chai spot.',
          },
        },
        {
          title: { hinglish: 'Aaj · Aage ka safar', hi: 'आज · आगे का सफ़र', en: 'Today · Still growing' },
          detail: {
            hinglish: 'Har saal aur kareeb, aur behtar.',
            hi: 'हर साल और करीब, और बेहतर।',
            en: 'Grateful for every chapter yet to come.',
          },
        },
      ],
    },
  },
  {
    id: 'maan-jao-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'love',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 29, compareAt: 99, addons: ['pin', 'extend'] },
    isActive: true,
    featureFlag: 'maanJaoTheme',
    name: {
      hinglish: 'Maan Jao (Playful)',
      hi: 'मान जाओ (मज़ेदार)',
      en: 'Pretty Please (Playful)',
    },
    audience: {
      hinglish: 'Bestie ya partner ko hasane ke liye',
      hi: 'दोस्त या पार्टनर को हँसाने के लिए',
      en: 'Lighthearted make-up note for friends or partners',
    },
    signatureMoment: {
      hinglish: 'Narazgi pighlane aur ek pyaari si muskaan wapas laane ka bahana',
      hi: 'नाराज़गी पिघलाने और चेहरे पर प्यारी सी मुस्कान वापस लाने का बहाना',
      en: 'A playful peace offering made to melt away any frown',
    },
    palette: {
      primary: '#E11D63',
      secondary: '#F59E0B',
      surface: '#FFF5F8',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Kisko manana hai?', hi: 'किसे मनाना है?', en: 'Who is smiling soon?' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 240,
        label: { hinglish: 'Pyara sa reason', hi: 'प्यारा सा संदेश', en: 'Sweet peace-offering note' },
      },
    ],
    music: [{ id: 'track-05', label: 'Ukulele Wink', mood: 'playful', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Tara',
      senderName: 'Rohan',
      photos: [
        '/templates/occasions/maan-jao/cover.jpg',
        '/templates/cafe/rose-cottage.jpg',
        '/templates/occasions/upgrades/paris-moonlit-balcony.jpg',
      ],
      headline: {
        hinglish: 'Ab gussa thoda kam karo na, Tara',
        hi: 'अब थोड़ा मुस्कुरा भी दो, तारा',
        en: 'Okay okay, truce time, Tara?',
      },
      message: {
        hinglish: 'Aaj ki momos aur cold coffee meri taraf se — bas ek choti smile de do!',
        hi: 'आज की कॉफ़ी मेरी तरफ से — बस एक छोटी सी मुस्कान दे दो!',
        en: 'Ice cream and momos on me tonight — deal?',
      },
      highlights: [
        {
          title: { hinglish: 'Galti qubool hai', hi: 'गलती क़बूल है', en: 'Full apology' },
          detail: {
            hinglish: 'Bina kisi bahane ke, main poori tarah maanta hoon meri galti thi.',
            hi: 'बिना किसी बहाने के, मैं मानता हूँ कि गलती मेरी ही थी।',
            en: 'No excuses this time — I messed up and I truly miss your laugh.',
          },
        },
        {
          title: { hinglish: 'Momos & cold coffee', hi: 'मोमोज़ और कोल्ड कॉफ़ी', en: 'Momos on me' },
          detail: {
            hinglish: 'Tumhari favorite jagah par aaj sham ki treat meri taraf se pakki.',
            hi: 'तुम्हारी पसंदीदा जगह पर आज शाम की ट्रीट मेरी तरफ से पक्की।',
            en: 'Your favorite corner table and extra chutney are waiting tonight.',
          },
        },
        {
          title: { hinglish: 'Best team hamesha', hi: 'सबसे अच्छी जोड़ी', en: 'Same team always' },
          detail: {
            hinglish: 'Chahe jitna bhi jhagda ho, din ke end mein hum saath hi achhe lagte hain.',
            hi: 'चाहे जितनी भी नोक-झोंक हो, दिन के अंत में हम साथ ही अच्छे लगते हैं।',
            en: 'Even on grumpy days, life is way better when we are on the same side.',
          },
        },
      ],
    },
  },
  {
    id: 'make-them-smile-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'family',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 49, compareAt: 149, addons: ['pin', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Make Them Smile',
      hi: 'चेहरे पर मुस्कान',
      en: 'Make Them Smile',
    },
    audience: {
      hinglish: 'Appreciation, thank you ya cheer-up ke liye',
      hi: 'शुक्रिया या हौसला बढ़ाने के लिए',
      en: 'For gratitude, cheer-up, and thank you notes',
    },
    signatureMoment: {
      hinglish: 'Dil se nikle shukriya ke pal jo har thakan bhula dein',
      hi: 'दिल से निकले शुक्रिया के पल जो हर थकान भुला दें',
      en: 'Thoughtful notes of gratitude to brighten someone’s entire week',
    },
    palette: {
      primary: '#0F766E',
      secondary: '#F59E0B',
      surface: '#F0FDFA',
      ink: '#1E293B',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Unka naam', hi: 'उनका नाम', en: 'Recipient name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Shukriya note', hi: 'शुक्रिया संदेश', en: 'Appreciation note' },
      },
    ],
    music: [{ id: 'track-06', label: 'Morning Guitar', mood: 'uplifting', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Didi',
      senderName: 'Kunal',
      photos: [
        '/templates/cafe/rose-cottage.jpg',
        '/templates/travel/paris-balcony.jpg',
        '/templates/creative/creatie-hills.jpg',
      ],
      headline: {
        hinglish: 'Sirf aapko thank you kehna tha, Didi',
        hi: 'बस आपको शुक्रिया कहना था, दीदी',
        en: 'Just wanted to make you smile, Didi',
      },
      message: {
        hinglish: 'Aapne jo kiya, wo main kabhi nahi bhoolunga. Dil se shukriya.',
        hi: 'आपने जो किया, वह मैं कभी नहीं भूलूँगा। दिल से शुक्रिया।',
        en: 'Thank you for always having my back without making a fuss about it.',
      },
      highlights: [
        {
          title: { hinglish: 'Open when tired', hi: 'जब थकान लगे', en: 'Open when tired' },
          detail: {
            hinglish: 'Yaad rakhna aap bahut strong ho.',
            hi: 'याद रखना आप बहुत मज़बूत हैं।',
            en: 'Remember how far you have already come.',
          },
        },
        {
          title: { hinglish: 'Open for a laugh', hi: 'हँसने के लिए खोलें', en: 'Open for a laugh' },
          detail: {
            hinglish: 'Abhi bhi aapki chai aur Maggie sabse best hoti hai!',
            hi: 'आपकी चाय आज भी दुनिया की सबसे बेस्ट है!',
            en: 'Your weekend chai still beats every cafe in town.',
          },
        },
        {
          title: { hinglish: 'Open when quiet', hi: 'जब मन शांत हो', en: 'Open when quiet' },
          detail: {
            hinglish: 'Chahe jitni baar kahun kam hai — aap meri life ka sabse bada sahara ho.',
            hi: 'चाहे जितनी बार कहूँ कम है — आप मेरे जीवन का सबसे बड़ा सहारा हैं।',
            en: 'Even on ordinary days, your kindness makes everything lighter.',
          },
        },
      ],
    },
  },
  {
    id: 'portfolio-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'portfolio',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 79, compareAt: 199, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Creator & Designer Portfolio',
      hi: 'क्रिएटर और डिज़ाइनर पोर्टफोलियो',
      en: 'Creator & Designer Portfolio',
    },
    audience: {
      hinglish: 'Designers, developers, photographers aur freelancers ke liye',
      hi: 'डिज़ाइनर्स, डेवलपर्स, फ़ोटोग्राफ़र्स और फ्रीलांसर्स के लिए',
      en: 'For designers, developers, photographers, and independent creatives',
    },
    signatureMoment: {
      hinglish: '3 signature styles: Editorial Print, Couture Ivory, aur Obsidian Kinetic',
      hi: 'तीन विशिष्ट शैलियाँ: एडिटोरियल प्रिंट, कूट्योर आइवरी और ऑब्सिडियन काइनेटिक',
      en: 'Three curated portfolio styles: Editorial Print, Couture Ivory & Obsidian Kinetic',
    },
    palette: {
      primary: '#C85A3F',
      secondary: '#1A1715',
      surface: '#F6F2EA',
      ink: '#1A1715',
    },
    fields: [
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Portfolio Style', hi: 'पोर्टफोलियो स्टाइल', en: 'Portfolio Style' },
        options: [
          {
            value: 'editorial',
            label: {
              hinglish: 'Editorial Print — Terracotta & Paper',
              hi: 'एडिटोरियल प्रिंट — टेराकोटा और पेपर',
              en: 'Editorial Print — Terracotta & Paper',
            },
          },
          {
            value: 'luxury',
            label: {
              hinglish: 'Couture Ivory — Champagne & Obsidian',
              hi: 'कूट्योर आइवरी — शैम्पेन और ऑब्सिडियन',
              en: 'Couture Ivory — Champagne & Obsidian',
            },
          },
          {
            value: 'kinetic',
            label: {
              hinglish: 'Obsidian Kinetic — Studio Dark & Lime',
              hi: 'ऑब्सिडियन काइनेटिक — स्टूडियो डार्क और लाइम',
              en: 'Obsidian Kinetic — Studio Dark & Lime',
            },
          },
        ],
      },
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 60,
        label: {
          hinglish: 'Your Name & Title (e.g. Rohan Verma | UI Designer)',
          hi: 'आपका नाम और पद (जैसे रोहन वर्मा | UI डिज़ाइनर)',
          en: 'Your Name & Title (e.g. Rohan Verma | UI Designer)',
        },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 50,
        label: {
          hinglish: 'City & Availability (e.g. Bengaluru · Available)',
          hi: 'शहर और उपलब्धता (जैसे बेंगलुरु · उपलब्ध)',
          en: 'City & Availability (e.g. Bengaluru · Available)',
        },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 320,
        label: {
          hinglish: 'Short Bio & What You Build',
          hi: 'संक्षिप्त परिचय और आपका कार्य',
          en: 'Short Bio & What You Build',
        },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 5,
        label: {
          hinglish: 'Portrait & Project Showcase (Up to 5)',
          hi: 'पोर्ट्रेट और प्रोजेक्ट फ़ोटो (अधिकतम 5)',
          en: 'Portrait & Project Showcase (Up to 5)',
        },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        optional: true,
        max: 15,
        label: {
          hinglish: 'WhatsApp / Contact Number for Inquiries',
          hi: 'संपर्क / WhatsApp नंबर',
          en: 'WhatsApp / Contact Number for Inquiries',
        },
      },
    ],
    music: [{ id: 'track-07', label: 'Warm Studio Lo-Fi', mood: 'focused', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Rohan Verma | UI Designer',
      senderName: 'Bengaluru · Available',
      relation: 'editorial',
      whatsappPhone: '919800000000',
      photos: [
        '/templates/creative/creatie-hills.jpg',
        '/templates/studio/atelier-hero.jpg',
        '/templates/studio/craft-fluted.jpg',
        '/templates/occasions/portfolio/cover.jpg',
        '/templates/occasions/our-year/cover.jpg',
      ],
      headline: {
        hinglish: 'Digital products aur expressive web experiences jo yaad rahein.',
        hi: 'सहज और प्रभावशाली डिजिटल उत्पाद जो हर अनुभव को ख़ास बनाएं।',
        en: 'Digital products shaped with archival clarity and tactile precision.',
      },
      message: {
        hinglish:
          'Independent designer aur frontend builder. Startups aur creative studios ke liye clean websites aur brand systems craft karta hoon.',
        hi: 'स्वतंत्र प्रोडक्ट डिज़ाइनर और फ्रंटएंड इंजीनियर, जो स्टार्टअप्स और क्रिएटिव स्टूडियो के लिए सहज वेबसाइट और ब्रांड सिस्टम तैयार करता है।',
        en: 'Independent designer and frontend engineer crafting editorial websites, brand systems, and expressive interfaces for thoughtful studios.',
      },
      highlights: [
        {
          title: { hinglish: 'Studio Atelier', hi: 'स्टूडियो अटेलियर', en: 'Studio Atelier' },
          detail: {
            hinglish: 'Bespoke digital flagship aur linen-textured lookbook storefront.',
            hi: 'टेक्सटाइल और ऑब्जेक्ट स्टूडियो के लिए बेस्पोक डिजिटल फ्लैगशिप।',
            en: 'Bespoke digital flagship pairing archival grids with tactile lookbook navigation.',
          },
        },
        {
          title: { hinglish: 'Monograph System', hi: 'मोनोग्राफ सिस्टम', en: 'Monograph System' },
          detail: {
            hinglish: 'Minimal editorial typography aur +64% client inquiry lift.',
            hi: 'संपादकीय टाइपोग्राफी और क्लाइंट पूछताछ में 64% की बढ़ोतरी।',
            en: 'Print-inspired typography system driving +64% studio inquiry lift.',
          },
        },
        {
          title: { hinglish: 'Kinetic Lab', hi: 'काइनेटिक लैब', en: 'Kinetic Lab' },
          detail: {
            hinglish: '0.7s first paint ke saath interactive showcase aur smooth motion.',
            hi: '0.7 सेकंड फ़र्स्ट पेंट के साथ इंटरैक्टिव शोकेस और स्मूथ मोशन।',
            en: 'Interactive product showcase engineered with 0.7s first paint and crisp motion.',
          },
        },
      ],
    },
  },
  {
    id: 'small-business-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'business',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 79, compareAt: 249, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Small Business & Storefront',
      hi: 'स्मॉल बिज़नेस और स्टोरफ्रंट',
      en: 'Small Business & Storefront',
    },
    audience: {
      hinglish: 'Bakeries, cafes, clothing drops, boutiques aur local brands ke liye',
      hi: 'बेकरी, कैफ़े, क्लोदिंग ड्रॉप्स, बुटीक और लोकल ब्रांड्स के लिए',
      en: 'For bakeries, cafes, streetwear drops, boutiques, and local brands',
    },
    signatureMoment: {
      hinglish: '4 storefront styles: Artisan Bakery, Streetwear Drop, Minimal Store, aur 3D Kinetic Space',
      hi: 'चार स्टोरफ्रंट शैलियाँ: आर्टिज़न बेकरी, स्ट्रीटवेयर ड्रॉप, मिनिमल स्टोर और 3D काइनेटिक स्पेस',
      en: 'Four interactive storefronts: Artisan Bakery, Streetwear Drop, Minimal Store & 3D Kinetic Space',
    },
    palette: {
      primary: '#8E2027',
      secondary: '#22D3EE',
      surface: '#FDF9F3',
      ink: '#1A1715',
    },
    fields: [
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Storefront Style', hi: 'स्टोरफ्रंट स्टाइल', en: 'Storefront Style' },
        options: [
          {
            value: 'bakery',
            label: {
              hinglish: 'Artisan Bakery & Cafe — Crimson Menu',
              hi: 'आर्टिज़न बेकरी और कैफ़े — क्रिमसन मेनू',
              en: 'Artisan Bakery & Cafe — Crimson Menu',
            },
          },
          {
            value: 'streetwear',
            label: {
              hinglish: 'Streetwear Drop — Stark Editorial Lookbook',
              hi: 'स्ट्रीटवेयर ड्रॉप — एडिटोरियल लुकबुक',
              en: 'Streetwear Drop — Stark Editorial Lookbook',
            },
          },
          {
            value: 'boutique',
            label: {
              hinglish: 'Minimal Store — Clothing & Lifestyle Grid',
              hi: 'मिनिमल स्टोर — क्लोदिंग और लाइफस्टाइल ग्रिड',
              en: 'Minimal Store — Clothing & Lifestyle Grid',
            },
          },
          {
            value: 'kinetic3d',
            label: {
              hinglish: '3D Kinetic Space — Scroll Cube & Parallax',
              hi: '3D काइनेटिक स्पेस — स्क्रॉल क्यूब और पैरालैक्स',
              en: '3D Kinetic Space — Scroll Cube & Parallax',
            },
          },
        ],
      },
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 50,
        label: {
          hinglish: 'Shop or Brand Name',
          hi: 'दुकान या ब्रांड का नाम',
          en: 'Shop or Brand Name',
        },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 50,
        label: {
          hinglish: 'Tagline or City (e.g. Fresh Daily · Jaipur)',
          hi: 'टैगलाइन या शहर (जैसे ताज़ा बेक · जयपुर)',
          en: 'Tagline or City (e.g. Fresh Daily · Jaipur)',
        },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 320,
        label: {
          hinglish: 'Store Story, Menu Highlights or Offer',
          hi: 'स्टोर की कहानी, मेनू या ख़ास ऑफ़र',
          en: 'Store Story, Menu Highlights or Offer',
        },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 5,
        label: {
          hinglish: 'Product & Store Photos (Up to 5)',
          hi: 'उत्पाद और स्टोर की फ़ोटो (अधिकतम 5)',
          en: 'Product & Store Photos (Up to 5)',
        },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        required: true,
        max: 15,
        label: {
          hinglish: 'WhatsApp Order Number',
          hi: 'WhatsApp ऑर्डर नंबर',
          en: 'WhatsApp Order Number',
        },
      },
    ],
    music: [{ id: 'track-08', label: 'Warm Cafe Acoustic', mood: 'upbeat', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Velvet Crumb',
      senderName: 'Artisan Studio · Jaipur',
      relation: 'bakery',
      whatsappPhone: '919800000000',
      photos: [],
      offerTag: {
        hinglish: 'SAVE 20% · FIRST ORDER',
        hi: '20% छूट · पहला ऑर्डर',
        en: 'SAVE 20% · FIRST ORDER',
      },
      headline: {
        hinglish: 'Small-Batch Patisserie',
        hi: 'आर्टिज़न पेस्ट्री स्टूडियो',
        en: 'Small-Batch Patisserie',
      },
      message: {
        hinglish: 'Handcrafted daily · Direct WhatsApp order.',
        hi: 'हर दिन ताज़ा · सीधा WhatsApp ऑर्डर।',
        en: 'Handcrafted daily · Direct WhatsApp order.',
      },
      highlights: [],
    },
  },
  {
    id: 'travel-voyage-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'travel',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 99, compareAt: 299, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Serendipity & World Voyage',
      hi: 'सेरेंडिपिटी और वर्ल्ड वॉयेज',
      en: 'Serendipity & World Voyage',
    },
    audience: {
      hinglish: 'Travel agencies, trip journals, resorts aur destination curated guides ke liye',
      hi: 'ट्रैवल एजेंसियों, ट्रिप जर्नल, रिज़ॉर्ट और डेस्टिनेशन गाइड्स के लिए',
      en: 'For boutique travel agencies, trip journals, retreats, and destination curators',
    },
    signatureMoment: {
      hinglish: 'Blank white canvas par mouse hover se hidden heritage painting + udte pakshi reveal hote hain',
      hi: 'सफ़ेद कैनवास पर माउस घुमाते ही छिपा हुआ हेरिटेज दृश्य और उड़ते पक्षी जीवंत हो जाते हैं',
      en: 'Interactive blank-canvas ink-wash hover reveal with soaring birds, 6-slice accordion & boarding pass',
    },
    palette: {
      primary: '#1E3454',
      secondary: '#D99B38',
      surface: '#FAF9F6',
      ink: '#152033',
    },
    fields: [
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Travel Style', hi: 'ट्रैवल स्टाइल', en: 'Travel Style' },
        options: [
          {
            value: 'serendipity',
            label: {
              hinglish: 'Serendipity Ink & Heritage Reveal',
              hi: 'सेरेंडिपिटी इंक और हेरिटेज रिवील',
              en: 'Serendipity Ink & Heritage Reveal',
            },
          },
          {
            value: 'atlas',
            label: {
              hinglish: 'Editorial World Atlas — 6-Slice Hero',
              hi: 'एडिटोरियल वर्ल्ड एटलस — 6-स्लाइस हीरो',
              en: 'Editorial World Atlas — 6-Slice Hero',
            },
          },
          {
            value: 'capsule',
            label: {
              hinglish: 'Voyage Capsule — Boarding Pass & Magnets',
              hi: 'वॉयेज कैप्सूल — बोर्डिंग पास और मैग्नेट्स',
              en: 'Voyage Capsule — Boarding Pass & Magnets',
            },
          },
        ],
      },
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 50,
        label: {
          hinglish: 'Travel Brand or Trip Title',
          hi: 'ट्रैवल ब्रांड या यात्रा का नाम',
          en: 'Travel Brand or Trip Title',
        },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 50,
        label: {
          hinglish: 'Route or Base City (e.g. Jaipur · Tokyo · Amalfi)',
          hi: 'रूट या शहर (जैसे जयपुर · टोक्यो · इटली)',
          en: 'Route or Base City (e.g. Jaipur · Tokyo · Amalfi)',
        },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 320,
        label: {
          hinglish: 'Travel Philosophy or Itinerary Summary',
          hi: 'यात्रा की कहानी या पैकेज विवरण',
          en: 'Travel Philosophy or Itinerary Summary',
        },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 5,
        label: {
          hinglish: 'Destination Photos (Up to 5)',
          hi: 'यात्रा की फ़ोटो (अधिकतम 5)',
          en: 'Destination Photos (Up to 5)',
        },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        optional: true,
        max: 15,
        label: {
          hinglish: 'WhatsApp Concierge / Booking Number',
          hi: 'WhatsApp बुकिंग नंबर',
          en: 'WhatsApp Concierge / Booking Number',
        },
      },
    ],
    music: [{ id: 'track-travel-01', label: 'Dawn Horizon Acoustic', mood: 'cinematic', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'SERENDIPITY VOYAGES',
      senderName: 'Jaipur · Tokyo · Amalfi · Paris',
      relation: 'serendipity',
      whatsappPhone: '919800000000',
      photos: [
        '/templates/travel/jaipur-slices.jpg',
        '/templates/travel/tokyo-fuji.jpg',
        '/templates/cafe/rose-cottage.jpg',
        '/templates/travel/spain-coast.jpg',
        '/templates/travel/paris-balcony.jpg',
      ],
      headline: {
        hinglish: 'Duniya ke sabse yaadgaar safar — curated slow-travel experiences.',
        hi: 'दुनिया के सबसे यादगार सफ़र — कलात्मक और सुकूनभरी यात्राएं।',
        en: 'Slow-travel expeditions shaped for wonder, heritage, and quiet horizons.',
      },
      message: {
        hinglish:
          'Bespoke multi-city itineraries, boutique stays, aur hidden local gems — Jaipur se Tokyo aur Amalfi coast tak.',
        hi: 'जयपुर से टोक्यो और अमाल्फ़ी तट तक — व्यक्तिगत यात्रा योजनाएं, बुटीक स्टे और अनदेखे नज़ारे।',
        en: 'Handcrafted multi-city journeys from Jaipur courtyards and Kyoto lantern alleys to sunlit Amalfi harbors.',
      },
      highlights: [],
    },
  },
  {
    id: 'cafe-artisan-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'business',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 99, compareAt: 299, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Maison & Roast · Café & Floral',
      hi: 'मैसन और रोस्ट · कैफ़े और फ्लोरल',
      en: 'Maison & Roast · Café & Floral',
    },
    audience: {
      hinglish: 'Specialty cafes, matcha bars, luxury florists, patisseries aur catering studios ke liye',
      hi: 'स्पेशलिटी कैफ़े, माचा बार, लग्ज़री फ्लोरिस्ट और केटरिंग स्टूडियो के लिए',
      en: 'For specialty coffee bars, matcha cafes, luxury florists, and boutique caterers',
    },
    signatureMoment: {
      hinglish: 'Kinetic coffee carousel, fluted-glass floral photography, aur live WhatsApp order basket',
      hi: 'काइनेटिक कॉफ़ी कैरोसेल, फ्लूटेड-ग्लास फ्लोरल शोकेस और लाइव WhatsApp ऑर्डर बास्केट',
      en: 'Kinetic drink carousel with color morphing, fluted-glass floral gallery & live WhatsApp basket',
    },
    palette: {
      primary: '#590C15',
      secondary: '#9DB038',
      surface: '#FAF6F0',
      ink: '#221614',
    },
    fields: [
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Flagship Mode', hi: 'फ्लैगशिप मोड', en: 'Flagship Mode' },
        options: [
          {
            value: 'roast',
            label: {
              hinglish: 'Roast & Matcha Bar — Kinetic Coffee Menu',
              hi: 'रोस्ट और माचा बार — काइनेटिक कॉफ़ी मेनू',
              en: 'Roast & Matcha Bar — Kinetic Coffee Menu',
            },
          },
          {
            value: 'maison',
            label: {
              hinglish: 'Maison Rouge — Oxblood Floral & Patisserie',
              hi: 'मैसन रूज — ऑक्सब्लड फ्लोरल और पेस्ट्री',
              en: 'Maison Rouge — Oxblood Floral & Patisserie',
            },
          },
        ],
      },
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 50,
        label: {
          hinglish: 'Café, Florist or Brand Name',
          hi: 'कैफ़े, फ्लोरिस्ट या ब्रांड का नाम',
          en: 'Café, Florist or Brand Name',
        },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 50,
        label: {
          hinglish: 'City & Hours (e.g. Bandra, Mumbai · 8 AM – 11 PM)',
          hi: 'शहर और समय (जैसे बांद्रा, मुंबई · सुबह 8 – रात 11)',
          en: 'City & Hours (e.g. Bandra, Mumbai · 8 AM – 11 PM)',
        },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 320,
        label: {
          hinglish: 'Brand Story & Signature Craft',
          hi: 'ब्रांड की कहानी और ख़ासियत',
          en: 'Brand Story & Signature Craft',
        },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 5,
        label: {
          hinglish: 'Menu & Atelier Photos (Up to 5)',
          hi: 'मेनू और स्टूडियो की फ़ोटो (अधिकतम 5)',
          en: 'Menu & Atelier Photos (Up to 5)',
        },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        required: true,
        max: 15,
        label: {
          hinglish: 'WhatsApp Order Number',
          hi: 'WhatsApp ऑर्डर नंबर',
          en: 'WhatsApp Order Number',
        },
      },
    ],
    music: [{ id: 'track-cafe-01', label: 'Velvet Bossa Acoustic', mood: 'warm', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'ROAST & MAISON',
      senderName: 'Small-Batch Roastery & Floral Atelier · Mumbai',
      relation: 'roast',
      whatsappPhone: '919800000000',
      photos: [
        '/templates/cafe/maison-rouge.jpg',
        '/templates/cafe/rose-cottage.jpg',
        '/templates/studio/craft-fluted.jpg',
        '/templates/occasions/small-business/cover.jpg',
      ],
      headline: {
        hinglish: 'Small-batch specialty coffee, ceremonial matcha & sculptural florals.',
        hi: 'स्मॉल-बैच स्पेशलिटी कॉफ़ी, सेरेमोनियल माचा और कलात्मक पुष्प शिल्प।',
        en: 'Ceremonial matcha, slow-poured espresso, and sculptural blooms crafted daily.',
      },
      message: {
        hinglish:
          'Har cup aur har bouquet haath se chune gaye ingredients se — direct menu se order karein ya private tasting book karein.',
        hi: 'हर कप और हर गुलदस्ता चुनिंदा सामग्री से तैयार — सीधे मेनू से ऑर्डर करें या प्राइवेट टेस्टिंग बुक करें।',
        en: 'Every pour and floral arrangement is crafted to linger long after the moment passes. Order directly from our live menu.',
      },
      highlights: [],
    },
  },
  {
    id: 'creative-voxel-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'portfolio',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 99, compareAt: 299, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Blockfolio & 3D Kinetic Studio',
      hi: 'ब्लॉकफोलियो और 3D काइनेटिक स्टूडियो',
      en: 'Blockfolio & 3D Kinetic Studio',
    },
    audience: {
      hinglish: '3D artists, game devs, creative studios, UGC creators aur standout portfolios ke liye',
      hi: '3D आर्टिस्ट्स, गेम डेवलपर्स, क्रिएटिव स्टूडियो और UGC क्रिएटर्स के लिए',
      en: 'For 3D studios, game builders, UGC creators, and interactive flagship portfolios',
    },
    signatureMoment: {
      hinglish: 'Live 3D particle rocket canvas, chromatic Art Mode switch, voxel XP HUD & picnic scrapbook',
      hi: 'लाइव 3D पार्टिकल रॉकेट कैनवास, क्रोमैटिक आर्ट मोड स्विच, वॉक्सेल XP HUD और स्क्रैपबुक',
      en: 'Interactive 3D Canvas particle rocket, chromatic Art Mode toggle, Voxel XP HUD & Creator Scrapbook',
    },
    palette: {
      primary: '#4F46E5',
      secondary: '#F59E0B',
      surface: '#0B0D14',
      ink: '#F8FAFC',
    },
    fields: [
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Interactive World', hi: 'इंटरैक्टिव वर्ल्ड', en: 'Interactive World' },
        options: [
          {
            value: 'particle3d',
            label: {
              hinglish: '3D Particle Studio — Rocket Canvas & Liquid UI',
              hi: '3D पार्टिकल स्टूडियो — रॉकेट कैनवास और लिक्विड UI',
              en: '3D Particle Studio — Rocket Canvas & Liquid UI',
            },
          },
          {
            value: 'voxel',
            label: {
              hinglish: 'Blockfolio & 8-Bit Quest — XP HUD & Biomes',
              hi: 'ब्लॉकफोलियो और 8-बिट क्वेस्ट — XP HUD और बायोम्स',
              en: 'Blockfolio & 8-Bit Quest — XP HUD & Biomes',
            },
          },
          {
            value: 'scrapbook',
            label: {
              hinglish: 'Creator Sky & Picnic Scrapbook — Floating Dock',
              hi: 'क्रिएटर स्काई और पिकनिक स्क्रैपबुक — फ्लोटिंग डॉक',
              en: 'Creator Sky & Picnic Scrapbook — Floating Dock',
            },
          },
        ],
      },
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 50,
        label: {
          hinglish: 'Studio or Creator Name',
          hi: 'स्टूडियो या क्रिएटर का नाम',
          en: 'Studio or Creator Name',
        },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 50,
        label: {
          hinglish: 'Role & Location (e.g. Creative Technologist · Pune)',
          hi: 'भूमिका और शहर (जैसे क्रिएटिव डेवलपर · पुणे)',
          en: 'Role & Location (e.g. Creative Technologist · Pune)',
        },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 320,
        label: {
          hinglish: 'What You Build & Studio Pitch',
          hi: 'आप क्या बनाते हैं और स्टूडियो परिचय',
          en: 'What You Build & Studio Pitch',
        },
      },
      {
        key: 'photos',
        type: 'images',
        optional: true,
        max: 5,
        label: {
          hinglish: 'Project Visuals (Up to 5)',
          hi: 'प्रोजेक्ट विज़ुअल्स (अधिकतम 5)',
          en: 'Project Visuals (Up to 5)',
        },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        optional: true,
        max: 15,
        label: {
          hinglish: 'WhatsApp / Booking Contact',
          hi: 'WhatsApp / संपर्क नंबर',
          en: 'WhatsApp / Booking Contact',
        },
      },
    ],
    music: [{ id: 'track-creative-01', label: 'Chromatic Synth Pulse', mood: 'kinetic', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'NOVA CRAFT LAB',
      senderName: 'Interactive 3D & Web Studio · Bengaluru',
      relation: 'particle3d',
      whatsappPhone: '919800000000',
      photos: [
        '/templates/occasions/our-year/cover.jpg',
        '/templates/creative/creatie-hills.jpg',
        '/templates/studio/craft-fluted.jpg',
        '/templates/occasions/our-timeline/cover.jpg',
      ],
      headline: {
        hinglish: 'Interactive 3D experiences, voxel worlds & scroll-stopping creator flagships.',
        hi: 'इंटरैक्टिव 3D अनुभव, वॉक्सेल वर्ल्ड्स और आधुनिक क्रिएटर वेबसाइट्स।',
        en: 'We build interactive digital flagships at the intersection of 3D art, motion, and engineering.',
      },
      message: {
        hinglish:
          '3D particle heroes se lekar playable voxel portfolios aur picnic creator decks tak — har website ek yaadgaar experience hai.',
        hi: '3D पार्टिकल हीरो से लेकर वॉक्सेल पोर्टफोलियो और स्क्रैपबुक डेक तक — हर वेबसाइट एक जीवंत अनुभव है।',
        en: 'From real-time 3D particle constellations and playable retro worlds to tactile creator scrapbooks built to convert.',
      },
      highlights: [],
    },
  },
  {
    id: 'wedding-emerald-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Swarna Vatika · Hindu Vivah',
      hi: 'स्वर्ण वाटिका · हिन्दू विवाह',
      en: 'Swarna Vatika · Emerald Vivah',
    },
    audience: {
      hinglish: 'Shaadi, Haldi, Mehendi, Sangeet aur Pheras ke liye royal invite',
      hi: 'शादी, हल्दी, मेहंदी, संगीत और फेरों का शाही डिजिटल निमंत्रण',
      en: 'Embossed sage palace doors, jharokha garden & multi-day Vivah itinerary',
    },
    signatureMoment: {
      hinglish: 'Sage royal doors tap par khulte hain aur Udaipur jharokha garden dikhta hai',
      hi: 'शाही हरे द्वार टैप पर खुलते हैं और झरोखा प्रांगण सामने आता है',
      en: '3D hinged sage doors part on tap to reveal a sunlit Rajasthani jharokha',
    },
    palette: {
      primary: '#2D4F35',
      secondary: '#C9A243',
      surface: '#F4F7F4',
      ink: '#1E3323',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'वर और वधू का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Vivah aamantran sandesh', hi: 'विवाह आमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [{ id: 'track-wedding-shehnai', label: 'Soft Temple Shehnai & Tanpura', mood: 'auspicious', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Aanya & Kabir',
      senderName: 'Sharma & Verma Families',
      headline: {
        hinglish: '|| Shri Ganeshay Namah || · Aanya & Kabir',
        hi: '|| श्री गणेशाय नमः || · आन्या संग कबीर',
        en: '|| Shri Ganeshay Namah || · Aanya & Kabir',
      },
      message: {
        hinglish: 'Udaipur mein hamare shubh vivah utsav mein parivaar sahit saadar aamantran.',
        hi: 'उदयपुर में हमारे शुभ विवाह उत्सव में सपरिवार पधारने का स्नेहभरा आमंत्रण।',
        en: 'Join us in Udaipur to celebrate our sacred seven vows with family and blessings.',
      },
    },
  },
  {
    id: 'wedding-royal-red-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Sindoora Mahal · Rajwada Vivah',
      hi: 'सिंदूरा महल · राजवाड़ा विवाह',
      en: 'Sindoora Mahal · Royal Red Vivah',
    },
    audience: {
      hinglish: 'Grand evening shaadi, Sangeet, Baraat aur Varmala ke liye',
      hi: 'भव्य राजवाड़ा शादी, संगीत, बारात और वरमाला के लिए',
      en: 'Sindoor velvet wax-seal envelope opening into a Jaipur chhatri & peacock arch',
    },
    signatureMoment: {
      hinglish: 'Wax seal tap par khulta hai aur 4 velvet flaps se Rajwada mahal dikhta hai',
      hi: 'मोम की मुहर खुलते ही शाही मखमली लिफ़ाफ़ा राजवाड़ा महल दिखाता है',
      en: 'Blush wax seal cracks and 4 velvet flaps unfold into a diya-lit Jaipur palace',
    },
    palette: {
      primary: '#6B0F1E',
      secondary: '#D4AF37',
      surface: '#FDF6F7',
      ink: '#3A0710',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'वर और वधू का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Vivah aamantran sandesh', hi: 'विवाह आमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [{ id: 'track-wedding-flute', label: 'Evening Raag Bhupali Chimes', mood: 'royal', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Riya & Siddharth',
      senderName: 'Singhania & Kapoor Families',
      headline: {
        hinglish: '|| Vakratunda Mahakaya || · Riya & Siddharth',
        hi: '|| वक्रतुण्ड महाकाय || · रिया संग सिद्धार्थ',
        en: '|| Vakratunda Mahakaya || · Riya & Siddharth',
      },
      message: {
        hinglish: 'Jaipur Rambagh Palace mein hamare shubh vivah mein aapka hardik swagat hai.',
        hi: 'जयपुर रामबाग पैलेस में हमारे शुभ परिणय उत्सव में आपका हार्दिक स्वागत है।',
        en: 'We joyfully invite you to Rambagh Palace, Jaipur to bless Riya & Siddharth.',
      },
    },
  },
  {
    id: 'wedding-royal-blue-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Neela Rajwada · Jodhpur Vivah',
      hi: 'नीला राजवाड़ा · जोधपुर विवाह',
      en: 'Neela Rajwada · Moonlit Indigo',
    },
    audience: {
      hinglish: 'Starlit evening shaadi, Sufi Sangeet aur Jodhpur palace celebrations ke liye',
      hi: 'तारों भरी संध्या, सूफी संगीत और जोधपुर पैलेस विवाह के लिए',
      en: 'Moonlit Jodhpur indigo jali shutters, Umaid Bhawan domes & starlit Baradari',
    },
    signatureMoment: {
      hinglish: 'Indigo jali shutters tap par khulte hain aur moonlit Jodhpur mahal dikhta hai',
      hi: 'नीले जाली द्वार टैप पर खुलते हैं और चाँदनी जोधपुर महल सामने आता है',
      en: 'Moonlit indigo jali shutters part in 3D to reveal a lantern-lit Jodhpur palace',
    },
    palette: {
      primary: '#132447',
      secondary: '#DFBE6B',
      surface: '#F4F5FA',
      ink: '#0F1C36',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'वर और वधू का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Vivah aamantran sandesh', hi: 'विवाह आमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [],
    demoData: {
      receiverName: 'Meera & Dev',
      senderName: 'Rathore & Malhotra Families',
      headline: {
        hinglish: '|| Om Shri Ganeshay Namah || · Meera & Dev',
        hi: '|| ॐ श्री गणेशाय नमः || · मीरा संग देव',
        en: '|| Om Shri Ganeshay Namah || · Meera & Dev',
      },
      message: {
        hinglish: 'Jodhpur mein chaandni raat ke shubh vivah utsav mein parivaar sahit swagat hai.',
        hi: 'जोधपुर में चाँदनी रात के शुभ विवाह उत्सव में सपरिवार हार्दिक स्वागत है।',
        en: 'Beneath the Marwar stars in Jodhpur, join us to celebrate Meera & Dev.',
      },
    },
  },
  {
    id: 'wedding-temple-gold-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Kashi Swarna · Temple Gold Vivah',
      hi: 'काशी स्वर्ण · मंदिर विवाह',
      en: 'Kashi Swarna · Kanjeevaram Gold',
    },
    audience: {
      hinglish: 'South Indian Muhurtham, Kanjeevaram silk aur temple wedding ke liye',
      hi: 'दक्षिण भारतीय मुहूर्तम, कांजीवरम सिल्क और मंदिर विवाह के लिए',
      en: 'Kanjeevaram silk cover, Dravidian temple gopuram, jasmine garlands & brass lamps',
    },
    signatureMoment: {
      hinglish: 'Kanjeevaram silk zari doors khulkar swarna temple gopuram dikhate hain',
      hi: 'कांजीवरम सिल्क ज़री द्वार खुलकर स्वर्ण मंदिर गोपुरम दिखाते हैं',
      en: 'Zari-bordered Kanjeevaram silk doors part into a golden sunrise temple courtyard',
    },
    palette: {
      primary: '#5A1812',
      secondary: '#E8BA55',
      surface: '#FCF6EA',
      ink: '#3B1710',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'वर और वधू का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Vivah aamantran sandesh', hi: 'विवाह आमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [],
    demoData: {
      receiverName: 'Ananya & Karthik',
      senderName: 'Iyer & Subramanian Families',
      headline: {
        hinglish: '|| Shubhamastu || · Ananya & Karthik',
        hi: '|| शुभमस्तु || · अनन्या संग कार्तिक',
        en: '|| Shubhamastu || · Ananya & Karthik',
      },
      message: {
        hinglish: 'Ananya aur Karthik ke shubh Muhurtham aur bhoj mein parivaar sahit saadar aamantran.',
        hi: 'अनन्या और कार्तिक के शुभ मुहूर्तम और प्रीतिभोज में सपरिवार सादर आमंत्रण।',
        en: 'We cordially invite you to bless Ananya & Karthik at their traditional Muhurtham.',
      },
    },
  },
  {
    id: 'wedding-rose-ivory-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Gulab Bagh · Pastel Rose Vivah',
      hi: 'गुलाब बाग़ · पेस्टल रोज़ विवाह',
      en: 'Gulab Bagh · Pastel Rose Marble',
    },
    audience: {
      hinglish: 'Daylight garden wedding, pastel pheras aur modern ivory aesthetic ke liye',
      hi: 'डेलाइट गार्डन शादी, पेस्टल फेरे और मॉडर्न आइवरी थीम के लिए',
      en: 'Blush-ivory silk ribbon folio, white marble lotus pavilion & sunlit rose garden',
    },
    signatureMoment: {
      hinglish: 'Blush silk folio khulkar safed marble lotus pavilion dikhata hai',
      hi: 'गुलाबी सिल्क फोलियो खुलकर संगमरमर कमल मंडप दिखाता है',
      en: 'Pastel rose letterpress cover unfolds into a sunlit marble lotus garden',
    },
    palette: {
      primary: '#5E2839',
      secondary: '#C7985A',
      surface: '#FDF6F6',
      ink: '#4A2530',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'वर और वधू का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Vivah aamantran sandesh', hi: 'विवाह आमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [],
    demoData: {
      receiverName: 'Tara & Vihaan',
      senderName: 'Mehra & Khanna Families',
      headline: {
        hinglish: '|| Shri Ganeshay Namah || · Tara & Vihaan',
        hi: '|| श्री गणेशाय नमः || · तारा संग विहान',
        en: '|| Shri Ganeshay Namah || · Tara & Vihaan',
      },
      message: {
        hinglish: 'Samode ke gulab bagh mein sunset pheras aur celebrations mein aapka swagat hai.',
        hi: 'समोद के गुलाब बाग़ में हमारे विवाह उत्सव में सपरिवार पधारने का स्नेहभरा आमंत्रण।',
        en: 'Join us for golden-hour vows in the marble rose gardens of Samode.',
      },
    },
  },
  {
    id: 'wedding-christian-ivory-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'wedding',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 499, compareAt: 1499, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Grace Cathedral · Christian Wedding',
      hi: 'ग्रेस कैथेड्रल · क्रिश्चियन वेडिंग',
      en: 'Grace Cathedral · Christian Nuptials',
    },
    audience: {
      hinglish: 'Church Holy Matrimony, Roce, Choir Toast aur Reception ke liye',
      hi: 'चर्च विवाह (Holy Matrimony), रोस, टोस्ट और रिसेप्शन के लिए',
      en: 'Ivory cathedral doors, olive-gold cross seal, heritage chapel & coastal reception',
    },
    signatureMoment: {
      hinglish: 'Ivory cathedral doors khulkar Goan white heritage chapel aur white lilies dikhate hain',
      hi: 'आइवरी कैथेड्रल द्वार खुलकर सुंदर हेरिटेज चर्च और सफेद फूल दिखाते हैं',
      en: 'Embossed ivory cathedral doors part on tap to reveal a sunlit white heritage chapel',
    },
    palette: {
      primary: '#2F3F33',
      secondary: '#C49A55',
      surface: '#FAF8F4',
      ink: '#28332B',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Bride & Groom ka naam', hi: 'दुल्हन और दूल्हे का नाम', en: 'Bride & Groom names' },
      },
      {
        key: 'senderName',
        type: 'text',
        optional: true,
        max: 40,
        label: { hinglish: 'Parivaar ka naam', hi: 'परिवार का नाम', en: 'Host family name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        max: 300,
        label: { hinglish: 'Wedding invitation message', hi: 'विवाह निमंत्रण संदेश', en: 'Wedding invitation note' },
      },
    ],
    music: [],
    demoData: {
      receiverName: 'Claire & Aaron',
      senderName: 'D’Souza & Fernandes Families',
      headline: {
        hinglish: 'With God’s Grace · Claire & Aaron',
        hi: 'ईश्वर की कृपा से · क्लेयर और एरोन',
        en: '1 Corinthians 13:4 · Claire & Aaron',
      },
      message: {
        hinglish: 'With God’s blessings, we joyfully invite you to witness the Holy Matrimony of Claire & Aaron in South Goa.',
        hi: 'ईश्वर के आशीर्वाद से, हम क्लेयर और एरोन के पवित्र विवाह समारोह में आपका हार्दिक स्वागत करते हैं।',
        en: 'With grateful hearts, we joyfully invite you to witness and bless the Holy Matrimony of Claire & Aaron.',
      },
    },
  },
];

export const LAUNCH_THEMES: ThemeManifest[] = RAW_LAUNCH_THEMES.map(validateThemeManifest);

export function getActiveThemes(options?: { includeMaanJao?: boolean }): ThemeManifest[] {
  const includeMaanJao = options?.includeMaanJao ?? false;
  return LAUNCH_THEMES.filter((theme) => {
    if (!theme.isActive) return false;
    if (theme.featureFlag === 'maanJaoTheme' && !includeMaanJao) return false;
    return true;
  });
}

export function getThemeById(
  id: string,
  options?: { includeMaanJao?: boolean },
): ThemeManifest | undefined {
  return getActiveThemes(options).find((theme) => theme.id === id);
}

export function filterThemes(params: {
  occasion?: string;
  language?: string;
  maxPrice?: number;
  includeMaanJao?: boolean;
}): ThemeManifest[] {
  return getActiveThemes({ includeMaanJao: params.includeMaanJao }).filter((theme) => {
    if (params.occasion && params.occasion !== 'all' && theme.occasion !== params.occasion) {
      return false;
    }
    if (
      params.language &&
      params.language !== 'all' &&
      !theme.languages.includes(params.language as LanguageCode)
    ) {
      return false;
    }
    if (typeof params.maxPrice === 'number' && params.maxPrice > 0 && theme.price.base > params.maxPrice) {
      return false;
    }
    return true;
  });
}
