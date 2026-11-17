import type { LanguageCode } from './types';

export type AiDraftTone = 'cute' | 'emotional' | 'funny' | 'formal';
export type OccasionBucket = 'birthday' | 'love' | 'anniversary' | 'family' | 'festival' | 'business';

const FALLBACK_MATRIX: Record<
  OccasionBucket,
  Record<AiDraftTone, Record<LanguageCode, (name: string) => string>>
> = {
  birthday: {
    cute: {
      hinglish: (n) => `${n}, aaj sirf cake aur smile ka din hai — hamesha aise hi chamakte raho!`,
      hi: (n) => `${n}, आज सिर्फ़ केक और मुस्कान का दिन है — हमेशा ऐसे ही चमकते रहो!`,
      en: (n) => `Happy Birthday, ${n}! Wishing you extra cake, warm hugs, and zero stress today.`,
    },
    emotional: {
      hinglish: (n) => `${n}, aapki muskurahat ghar aur dil dono ko roshan rakhti hai. Janamdin mubarak!`,
      hi: (n) => `${n}, आपकी मुस्कान हमारे हर दिन को रोशन रखती है। जन्मदिन की दिल से शुभकामनाएँ!`,
      en: (n) => `Happy Birthday, ${n}. Thank you for bringing calm, warmth, and kindness into every year.`,
    },
    funny: {
      hinglish: (n) => `${n}, ek aur saal bada ho gaya — par party abhi bhi teri taraf se hi pakki hai!`,
      hi: (n) => `${n}, एक और साल बढ़ गया, पर आज की पार्टी तुम्हारी तरफ़ से ही पक्की है!`,
      en: (n) => `Happy Birthday, ${n}! Officially older today, still accepting free momos and cake.`,
    },
    formal: {
      hinglish: (n) => `${n}, aapko janamdin ki hardik shubhkamnayein. Aane wala saal swasth aur safal ho.`,
      hi: (n) => `${n}, आपको जन्मदिन की हार्दिक शुभकामनाएँ। आने वाला वर्ष सुख, स्वास्थ्य और सफलता लाए।`,
      en: (n) => `Warmest birthday wishes, ${n}. Wishing you good health, peace, and steady success ahead.`,
    },
  },
  love: {
    cute: {
      hinglish: (n) => `${n}, tumhare saath simple si chai bhi ek choti si date lagti hai.`,
      hi: (n) => `${n}, तुम्हारे साथ साधारण सी चाय भी एक प्यारी सी डेट लगती है।`,
      en: (n) => `${n}, even an ordinary Tuesday feels special when I share it with you.`,
    },
    emotional: {
      hinglish: (n) => `${n}, aaj ke din aur har din, tum meri pehli aur sabse sukoon wali pasand ho.`,
      hi: (n) => `${n}, आज के दिन और हर दिन, तुम मेरी पहली और सबसे सुकून भरी पसंद हो।`,
      en: (n) => `${n}, in every busy season, you remain my favorite calm place to come home to.`,
    },
    funny: {
      hinglish: (n) => `${n}, mera 80% screen time aur 100% food share sirf tumhare liye reserved hai!`,
      hi: (n) => `${n}, मेरी प्लेट का आखिरी टुकड़ा आज भी सिर्फ़ तुम्हारे नाम पर रिज़र्व है!`,
      en: (n) => `${n}, I promise to share my fries with you — mostly. Will you be my favorite person?`,
    },
    formal: {
      hinglish: (n) => `${n}, aapki maujoodgi har din ko behtar banati hai. Kya aap mere saath chalenge?`,
      hi: (n) => `${n}, आपकी उपस्थिति हर दिन को बेहतर बनाती है। क्या हम साथ एक सुंदर सफ़र शुरू करें?`,
      en: (n) => `${n}, I truly value the bond we share and would love to step into a new chapter together.`,
    },
  },
  anniversary: {
    cute: {
      hinglish: (n) => `${n}, hamari har choti fight ke baad bhi sabse pehle tum hi yaad aate ho.`,
      hi: (n) => `${n}, हर छोटी नोकझोंक के बाद भी सबसे पहले आपकी ही याद आती है।`,
      en: (n) => `Happy Anniversary, ${n}! Still my favorite person to share late-night chai with.`,
    },
    emotional: {
      hinglish: (n) => `${n}, tumhare saath har din ek chhoti si festival jaisa lagta hai. Happy Anniversary!`,
      hi: (n) => `${n}, आपके साथ हर दिन एक छोटे उत्सव जैसा लगता है। सालगिरह की शुभकामनाएँ!`,
      en: (n) => `Happy Anniversary, ${n}. Grateful for every quiet milestone and shared laugh together.`,
    },
    funny: {
      hinglish: (n) => `${n}, ek aur saal bina bore hue nikal gaya — agle saal bhi yahi team rahegi!`,
      hi: (n) => `${n}, एक और साल बिना बोर हुए निकल गया — अगले साल भी यही टीम रहेगी!`,
      en: (n) => `Happy Anniversary, ${n}! Another year of surviving each other's alarms and food choices.`,
    },
    formal: {
      hinglish: (n) => `${n}, aapko anniversary ki hardik badhai. Saath aur bharosa hamesha bana rahe.`,
      hi: (n) => `${n}, आपको शादी की सालगिरह की हार्दिक बधाई। आपका साथ और स्नेह हमेशा बना रहे।`,
      en: (n) => `Warm anniversary wishes, ${n}. Wishing you many more years of partnership and joy.`,
    },
  },
  family: {
    cute: {
      hinglish: (n) => `${n}, ghar ka sabse accha hissa aapki hasi aur garam chai hai.`,
      hi: (n) => `${n}, घर का सबसे प्यारा हिस्सा आपकी हँसी और गरमा-गरम चाय है।`,
      en: (n) => `${n}, thank you for making home feel cozy with every little smile and chai break.`,
    },
    emotional: {
      hinglish: (n) => `${n}, aapne jo saath aur pyaar diya hai, wo main kabhi nahi bhoolunga. Dil se shukriya.`,
      hi: (n) => `${n}, आपने जो साथ और स्नेह दिया है, वह हमेशा दिल में रहेगा। दिल से शुक्रिया।`,
      en: (n) => `${n}, thank you for standing quietly behind every step I took. Always grateful to you.`,
    },
    funny: {
      hinglish: (n) => `${n}, duniya mein sab kuch replace ho sakta hai, par aapke haath ka khana nahi!`,
      hi: (n) => `${n}, दुनिया में सब मिल सकता है, पर आपके हाथ के स्वाद का कोई मुकाबला नहीं!`,
      en: (n) => `${n}, reminder that your kitchen still beats every restaurant in town. Smile today!`,
    },
    formal: {
      hinglish: (n) => `${n}, aapke ashirwad aur sahyog ke liye dil se dhanyavaad.`,
      hi: (n) => `${n}, आपके आशीर्वाद और निरंतर सहयोग के लिए हृदय से धन्यवाद।`,
      en: (n) => `Dear ${n}, thank you sincerely for your steady guidance, warmth, and support.`,
    },
  },
  festival: {
    cute: {
      hinglish: (n) => `${n}, is tyohar par meethi khushiyan aur zero Monday stress mile!`,
      hi: (n) => `${n}, इस पावन पर्व पर घर में ढेर सारी मिठास और मुस्कुराहटें आएं!`,
      en: (n) => `Warm festive cheer to ${n}! May your home glow with sweets, lights, and laughter.`,
    },
    emotional: {
      hinglish: (n) => `${n}, aapke ghar mein meethi khushiyan aur patang jaisi unchai hamesha bani rahe.`,
      hi: (n) => `${n}, आपके परिवार में हमेशा स्नेह, शांति और नई उमंग बनी रहे। हार्दिक शुभकामनाएँ!`,
      en: (n) => `Wishing ${n} and family a season full of warmth, togetherness, and gentle new beginnings.`,
    },
    funny: {
      hinglish: (n) => `${n}, festival par diet break lena banta hai — khush raho aur mithai bhejo!`,
      hi: (n) => `${n}, त्योहार पर डाइट की छुट्टी पक्की है — खूब मुस्कुराओ और मिठाई बाँटो!`,
      en: (n) => `Happy Holidays, ${n}! Calories do not count during family celebrations — enjoy every bite.`,
    },
    formal: {
      hinglish: (n) => `${n}, aapko aur aapke parivaar ko shubh avsar ki hardik shubhkamnayein.`,
      hi: (n) => `${n}, आपको एवं आपके समस्त परिवार को इस शुभ अवसर की हार्दिक शुभकामनाएँ।`,
      en: (n) => `Warm festive greetings to ${n} and your family. Wishing you peace and prosperity.`,
    },
  },
  business: {
    cute: {
      hinglish: (n) => `${n} ki taraf se aapka dil se shukriya! Aapka pyaar hi hamari pehchan hai.`,
      hi: (n) => `${n} की ओर से आपका हृदय से धन्यवाद! आपका विश्वास ही हमारी पहचान है।`,
      en: (n) => `Warm thanks from ${n}! Neighbors and patrons like you make every opening joyful.`,
    },
    emotional: {
      hinglish: (n) => `${n} par aapka bharosa hamare liye sabse bada inaam hai. Naye offers ke liye judiye!`,
      hi: (n) => `${n} पर आपका विश्वास हमारे लिए सबसे बड़ा सम्मान है। खास ऑफ़र्स के लिए जुड़ें।`,
      en: (n) => `Thank you for trusting ${n} through the year. Visit us or tap below for festive specials.`,
    },
    funny: {
      hinglish: (n) => `${n} par aaj chai aur badhiya offers dono garma-garam taiyaar hain — zaroor aaiye!`,
      hi: (n) => `${n} पर आज खास ऑफ़र और स्वागत दोनों तैयार हैं — ज़रूर पधारें!`,
      en: (n) => `Fresh stock and warm smiles are ready at ${n} — tap WhatsApp below before deals sell out!`,
    },
    formal: {
      hinglish: (n) => `${n} ki taraf se aapko shubhkamnayein. Khaas festive offers ke liye humse sampark karein.`,
      hi: (n) => `${n} की ओर से हार्दिक शुभकामनाएँ। त्योहार विशेष सेवाओं के लिए नीचे संपर्क करें।`,
      en: (n) => `Greetings from ${n}. Thank you for your patronage — reach us on WhatsApp for bookings.`,
    },
  },
};

export function getFallbackAiDraft(params: {
  occasion: OccasionBucket;
  tone: AiDraftTone;
  language: LanguageCode;
  receiverName?: string;
  maxLength?: number;
}): string {
  const cleanName = (params.receiverName || '').trim().slice(0, 36) || 'Dost';
  const occasionSet = FALLBACK_MATRIX[params.occasion] ?? FALLBACK_MATRIX.birthday;
  const toneSet = occasionSet[params.tone] ?? occasionSet.cute;
  const builder = toneSet[params.language] ?? toneSet.hinglish;
  const raw = builder(cleanName);
  const limit = params.maxLength && params.maxLength > 40 ? params.maxLength : 280;
  return raw.slice(0, limit);
}
