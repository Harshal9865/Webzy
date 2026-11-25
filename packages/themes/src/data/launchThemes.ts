import type { LanguageCode, LocalizedText } from '@webzy/core';
import { ThemeManifest, ThemeOccasion, validateThemeManifest } from '../schema';

export const OCCASION_LABELS: Record<ThemeOccasion, LocalizedText> = {
  wedding: { hinglish: 'Wedding Vivah', hi: 'विवाह', en: 'Weddings', gu: 'લગ્ન', mr: 'लग्नपत्रिका', pa: 'ਵਿਆਹ', bn: 'বিবাহ', ta: 'திருமணம்', te: 'వివాహం', kn: 'ಮದುವೆ' },
  birthday: { hinglish: 'Birthday', hi: 'जन्मदिन', en: 'Birthday', gu: 'જન્મદિવસ', mr: 'वाढदिवस', pa: 'ਜਨਮਦਿਨ', bn: 'জন্মদিন', ta: 'பிறந்தநாள்', te: 'పుట్టినరోజు', kn: 'ಹುಟ್ಟುಹಬ್ಬ' },
  love: { hinglish: 'Love & Propose', hi: 'प्यार / प्रपोज़', en: 'Love & Invite', gu: 'પ્રેમ અને આમંત્રણ', mr: 'प्रेम व शुभेच्छा', pa: 'ਪਿਆਰ', bn: 'ভালোবাসা', ta: 'அன்பு', te: 'ప్రేమ', kn: 'ಪ್ರೀತಿ' },
  anniversary: { hinglish: 'Anniversary', hi: 'सालगिरह', en: 'Anniversary', gu: 'વર્ષગાંઠ', mr: 'लग्नाचा वाढदिवस', pa: 'ਵਰੇਗੰਢ', bn: 'বিবাহবার্ষিকী', ta: 'திருமண நாள்', te: 'వార్షికోత్సవం', kn: 'ವಾರ್ಷಿಕೋತ್ಸವ' },
  family: { hinglish: 'Family & Smile', hi: 'परिवार / मुस्कान', en: 'Family & Care', gu: 'પરિવાર', mr: 'कुटुंब', pa: 'ਪਰਿਵਾਰ', bn: 'পরিবার', ta: 'குடும்பம்', te: 'కుటుంబం', kn: 'ಕುಟುಂಬ' },
  festival: { hinglish: 'Festivals & New Year', hi: 'त्योहार / नया साल', en: 'Festivals & New Year', gu: 'તહેવાર', mr: 'सण आणि शुभेच्छा', pa: 'ਤਿਉਹਾਰ', bn: 'উৎসব', ta: 'பண்டிகைகள்', te: 'పండుగలు', kn: 'ಹಬ್ಬಗಳು' },
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
      hinglish: 'Har gubbare ke peeche ek pyari si dua aur muskaan chhupi hai',
      hi: 'हर रंगीन गुब्बारे के पीछे एक प्यारी सी दुआ और मुस्कान छुपी है',
      en: 'Every floating balloon carries a warm wish waiting to be opened',
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
        label: { hinglish: 'Aapka rishta', hi: 'आपका रिश्ता', en: 'Relationship' },
        options: [
          { value: 'friend', label: { hinglish: 'Yaar / Dost', hi: 'दोस्त', en: 'Friend' } },
          { value: 'partner', label: { hinglish: 'Partner', hi: 'पार्टनर', en: 'Partner' } },
          { value: 'sibling', label: { hinglish: 'Bhaiya / Didi', hi: 'भाई / बहन', en: 'Sibling' } },
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
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80',
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
        'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1605207086986-3eab0256c331?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
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
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=900&q=80',
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
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
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
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c?auto=format&fit=crop&w=900&q=80',
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
        'https://images.unsplash.com/photo-1494719019271-7bfff81660d2?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1510255877864-16a7f9202a39?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1529634002551-f0d0d940c0e5?auto=format&fit=crop&w=900&q=80',
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
    id: 'our-year-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'festival',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 79, compareAt: 199, addons: ['pin', 'video', 'extend'] },
    isActive: true,
    name: {
      hinglish: 'Our Year (Wrapped)',
      hi: 'हमारा साल (रीवाइंड)',
      en: 'Our Year (Wrapped)',
    },
    audience: {
      hinglish: 'New Year recap dost ya partner ke liye',
      hi: 'नए साल की यादें दोस्तों या पार्टनर के लिए',
      en: 'New Year highlights story for friends or couples',
    },
    signatureMoment: {
      hinglish: 'Beete saal ki sabse pyari yaadein aur naye saal ki umeedein',
      hi: 'बीते साल की सबसे प्यारी यादें और नए साल की नई उम्मीदें',
      en: 'A heartfelt look back at your favorite memories before the year begins',
    },
    palette: {
      primary: '#7C3AED',
      secondary: '#F59E0B',
      surface: '#F5F3FF',
      ink: '#2B1B2E',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Kiske saath year wrap?', hi: 'किसके साथ साल की यादें?', en: 'Who is this wrap for?' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 300,
        label: { hinglish: 'Naye saal ki wish', hi: 'नए साल की शुभकामना', en: 'New Year wish' },
      },
    ],
    music: [{ id: 'track-07', label: 'Sparkle Lo-Fi', mood: 'festive', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Squad 2026',
      senderName: 'Neha',
      photos: [
        'https://images.unsplash.com/photo-1524334228333-0f6db392f8a1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1541849546-216151f72a25?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1597362925519-b01b65ac3445?auto=format&fit=crop&w=900&q=80',
      ],
      headline: {
        hinglish: 'Naya Saal Mubarak!',
        hi: 'नया साल मुबारक हो!',
        en: 'Happy New Year!',
      },
      message: {
        hinglish: 'Naya saal, naye sapne. Tumhare saath sab kuch aur khoobsurat lagta hai.',
        hi: 'नया साल, नए सपने। आपके साथ हर पल और भी सुंदर लगता है।',
        en: 'Another year of crazy memories down — cheering for the next one together.',
      },
      highlights: [
        {
          title: { hinglish: '365 days', hi: '365 दिन', en: '365 days' },
          detail: { hinglish: '42 chai breaks aur 3 trips.', hi: 'अनगिनत चाय और हँसी के पल।', en: '42 chai breaks and 3 road trips.' },
        },
        {
          title: { hinglish: 'Sabse pyari yaad', hi: 'सबसे प्यारी याद', en: 'Favorite memory' },
          detail: {
            hinglish: 'Wo unplanned late-night drive aur non-stop gaane hamesha yaad rahenge.',
            hi: 'वह अचानक बना सफ़र और देर रात के गाने हमेशा याद रहेंगे।',
            en: 'That unplanned road trip and singing off-key at midnight.',
          },
        },
        {
          title: { hinglish: '2027 Goal', hi: 'नया लक्ष्य', en: 'Next chapter' },
          detail: { hinglish: 'Zyada hasi, zero drama.', hi: 'ज़्यादा खुशियाँ और शांत दिन।', en: 'More laughter, zero stress.' },
        },
      ],
    },
  },
  {
    id: 'harvest-greeting-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'festival',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 29, compareAt: 99, addons: ['extend'] },
    isActive: true,
    name: {
      hinglish: 'Harvest Festival Greeting',
      hi: 'लोहड़ी / संक्रांति / पोंगल शुभकामना',
      en: 'Harvest Festival Greeting',
    },
    audience: {
      hinglish: 'Lohri, Makar Sankranti aur Pongal ke liye',
      hi: 'लोहड़ी, मकर संक्रांति और पोंगल के लिए',
      en: 'For Lohri, Makar Sankranti, and Pongal wishes',
    },
    signatureMoment: {
      hinglish: 'Til-gud ki mithaas aur tyohar ki khushiyan apne parivaar ke naam',
      hi: 'तिल-गुड़ की मिठास और त्योहार की खुशियों से भरा अपनापन',
      en: 'Warmth of harvest bonfires, festive sweets, and skies full of joy',
    },
    palette: {
      primary: '#D97706',
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
        label: { hinglish: 'Parivaar ya dost ka naam', hi: 'परिवार या दोस्त का नाम', en: 'Family or friend name' },
      },
      {
        key: 'relation',
        type: 'choice',
        required: true,
        label: { hinglish: 'Festival chuno', hi: 'त्योहार चुनें', en: 'Choose festival' },
        options: [
          { value: 'sankranti', label: { hinglish: 'Makar Sankranti', hi: 'मकर संक्रांति', en: 'Makar Sankranti' } },
          { value: 'lohri', label: { hinglish: 'Lohri', hi: 'लोहड़ी', en: 'Lohri' } },
          { value: 'pongal', label: { hinglish: 'Pongal', hi: 'पोंगल', en: 'Pongal' } },
        ],
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 240,
        label: { hinglish: 'Shubhkamnayein', hi: 'शुभकामना संदेश', en: 'Festive greeting' },
      },
    ],
    music: [{ id: 'track-08', label: 'Folk Dholki Soft', mood: 'festive', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Sharma Parivaar',
      senderName: 'Patel Family',
      relation: 'sankranti',
      photos: [
        'https://images.unsplash.com/photo-1605299905846-56b4e32f5f3a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1573129725017-e8a4c1c839b1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?auto=format&fit=crop&w=900&q=80',
      ],
      headline: {
        hinglish: 'Makar Sankranti ki Hardik Shubhkamnayein',
        hi: 'मकर संक्रांति की हार्दिक शुभकामनाएँ',
        en: 'Happy Harvest Season!',
      },
      message: {
        hinglish:
          'Aapke ghar mein meethi khushiyan, tilgul jaisi mithaas aur patang jaisi unchai ho.',
        hi: 'आपके घर में तिल-गुड़ जैसी मिठास और पतंग जैसी ऊँचाइयाँ हमेशा बनी रहें।',
        en: 'Wishing your home warmth, sweet beginnings, and skies full of joy.',
      },
      highlights: [
        {
          title: { hinglish: 'Til-gud ki mithaas', hi: 'तिल-गुड़ की मिठास', en: 'Sweet beginnings' },
          detail: {
            hinglish: 'Purani saari kadwahat bhool kar meethi baaton se nayi shuruwat karein.',
            hi: 'पुरानी बातें भुलाकर मीठी बोली और अपनेपन से नई शुरुआत करें।',
            en: 'May every home share warmth, sweet treats, and gentle words.',
          },
        },
        {
          title: { hinglish: 'Oonchi udaan', hi: 'ऊँची उड़ान', en: 'Bright horizons' },
          detail: {
            hinglish: 'Aasmaan mein udti patangon ki tarah aapke sapne bhi bulandi chhooyein.',
            hi: 'आसमान में उड़ती पतंगों की तरह आपके सपने भी नई ऊँचाइयाँ छूएँ।',
            en: 'Wishing your family soaring dreams and sunlit skies all year.',
          },
        },
        {
          title: { hinglish: 'Parivaar ka sang', hi: 'परिवार का संग', en: 'Together at home' },
          detail: {
            hinglish: 'Lohri ki aag aur Sankranti ki dhoop sabke jeevan mein sukh laaye.',
            hi: 'त्योहार की गरमाहट और अपनों का साथ हर आँगन में खुशहाली लाए।',
            en: 'Harvest joy, warm bonfires, and grateful hearts gathered together.',
          },
        },
      ],
    },
  },
  {
    id: 'business-greeting-01',
    version: '1.0.0',
    mode: 'ready-made',
    occasion: 'business',
    languages: ['hinglish', 'hi', 'en'],
    price: { base: 99, compareAt: 249, addons: ['extend'] },
    isActive: true,
    name: {
      hinglish: 'Business Greeting & Grand Opening',
      hi: 'बिज़नेस शुभकामना और ग्रैंड ओपनिंग',
      en: 'Business Festive & Launch Card',
    },
    audience: {
      hinglish: 'Shops, coaching centers aur local brands ke liye',
      hi: 'दुकान, कोचिंग और स्थानीय व्यवसाय के लिए',
      en: 'For shops, salons, coaching classes, and local brands',
    },
    signatureMoment: {
      hinglish: 'Grahakon ka dil se shukriya aur tyohar ke khaas tohfe ek jagah',
      hi: 'ग्राहकों का दिल से शुक्रिया और त्योहार की खास पेशकश एक साथ',
      en: 'A warm thank-you to loyal patrons paired with a festive celebration',
    },
    palette: {
      primary: '#1D4ED8',
      secondary: '#F59E0B',
      surface: '#EFF6FF',
      ink: '#1E293B',
    },
    fields: [
      {
        key: 'receiverName',
        type: 'text',
        required: true,
        max: 40,
        label: { hinglish: 'Business ka naam', hi: 'व्यवसाय का नाम', en: 'Business name' },
      },
      {
        key: 'message',
        type: 'longtext',
        required: true,
        aiDraft: true,
        max: 240,
        label: { hinglish: 'Offer ya greeting message', hi: 'ऑफ़र या संदेश', en: 'Offer or greeting note' },
      },
      {
        key: 'whatsappPhone',
        type: 'text',
        optional: true,
        max: 15,
        label: { hinglish: 'WhatsApp number (business)', hi: 'बिज़नेस व्हाट्सऐप नंबर', en: 'Business WhatsApp number' },
      },
    ],
    music: [{ id: 'track-09', label: 'Clean Corporate Bell', mood: 'crisp', licenseStatus: 'verified' }],
    demoData: {
      receiverName: 'Kesar Sweets & Bakery',
      senderName: 'Owner',
      whatsappPhone: '919800000000',
      photos: [
        'https://images.unsplash.com/photo-1615351897596-d3a9fffb5797?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600647993560-11a92e039466?auto=format&fit=crop&w=900&q=80',
      ],
      offerTag: {
        hinglish: 'Festive Gift Boxes · 10% Off on Pre-Orders',
        hi: 'त्योहार स्पेशल बॉक्स · प्री-ऑर्डर पर 10% छूट',
        en: 'Festive Gift Boxes · 10% Off Pre-Orders',
      },
      headline: {
        hinglish: 'Kesar Sweets ki taraf se Hardik Shubhkamnayein',
        hi: 'केसर स्वीट्स की ओर से हार्दिक शुभकामनाएँ',
        en: 'Warm Festive Wishes from Kesar Sweets',
      },
      message: {
        hinglish: 'Naye saal par aapka bahut bahut dhanyavaad. Khaas offers ke liye humse judiye.',
        hi: 'आपके विश्वास के लिए धन्यवाद। खास त्योहार ऑफ़र्स के लिए हमसे जुड़ें।',
        en: 'Thank you for trusting our kitchen this year. Tap below to book your festive box.',
      },
      highlights: [
        {
          title: { hinglish: 'Shuddh aur taaza', hi: 'शुद्ध और ताज़ा स्वाद', en: 'Crafted fresh daily' },
          detail: {
            hinglish: 'Har mithai aur gift box pure desi ghee aur pyaar se taiyaar kiya gaya hai.',
            hi: 'हर मिठाई और गिफ्ट बॉक्स शुद्ध देसी घी और प्यार से तैयार किया गया है।',
            en: 'Every festive box is prepared fresh in small batches with pure ingredients.',
          },
        },
        {
          title: { hinglish: 'Khaas tyohar offer', hi: 'खास त्योहार ऑफ़र', en: 'Festive pre-order perk' },
          detail: {
            hinglish: 'Corporate aur family hampers par 10% vishesh chhoot is hafte ke liye.',
            hi: 'फैमिली और कॉर्पोरेट हैंपर्स पर इस सप्ताह 10% विशेष छूट उपलब्ध है।',
            en: 'Enjoy 10% off on curated family and corporate gift hampers this week.',
          },
        },
        {
          title: { hinglish: 'Ek tap mein booking', hi: 'आसान व्हाट्सऐप ऑर्डर', en: 'Easy WhatsApp booking' },
          detail: {
            hinglish: 'Apna pasandida box chunein aur same-day delivery ke liye seedha message karein.',
            hi: 'अपना पसंदीदा बॉक्स चुनें और समय पर डिलीवरी के लिए सीधा संदेश भेजें।',
            en: 'Message us directly on WhatsApp to reserve your box for doorstep delivery.',
          },
        },
      ],
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
