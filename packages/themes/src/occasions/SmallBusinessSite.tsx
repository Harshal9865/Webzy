'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CoreLanguageCode,
  pickLocalizedText,
  toCoreLanguageCode,
} from '@webzy/core';
import type { OccasionSiteProps } from './shared/OccasionPrimitives';
import { getWebzyFooterLabel } from './shared/OccasionPrimitives';
import { SmallBusiness3DScrollTheme } from './small-business/SmallBusiness3DScrollTheme';
import { SmallBusinessBakeryTheme } from './small-business/SmallBusinessBakeryTheme';
import { SmallBusinessBoutiqueTheme } from './small-business/SmallBusinessBoutiqueTheme';
import {
  SmallBusinessDemoSwitcher,
  SmallBusinessPhotoLightbox,
} from './small-business/SmallBusinessDemoSwitcher';
import { SmallBusinessStreetwearTheme } from './small-business/SmallBusinessStreetwearTheme';
import {
  buildWhatsAppOrderHref,
  deriveHighlights,
  deriveStoreName,
  getValidPhotos,
  hiSafeStyle,
  resolveSmallBusinessTheme,
  sanitizeWhatsappPhone,
  type SmallBusinessThemeVariant,
} from './small-business/smallBusinessTypes';

export { resolveSmallBusinessTheme, type SmallBusinessThemeVariant };

type AccordionPanelKey = 'highlights' | 'hours' | 'delivery';

interface QuickMenuItem {
  id: string;
  name: Record<CoreLanguageCode, string>;
  meta: Record<CoreLanguageCode, string>;
  price: number;
}

interface HoursRow {
  day: Record<CoreLanguageCode, string>;
  time: Record<CoreLanguageCode, string>;
}

interface CompanionCopy {
  previewBanner: string;
  bagEyebrow: string;
  bagHeading: string;
  bagSubheading: string;
  offerPillLabel: string;
  offerApplyBtn: string;
  offerAppliedBtn: string;
  itemsCount: (count: number) => string;
  estimateLabel: string;
  clearBagBtn: string;
  noteLabel: string;
  notePlaceholder: string;
  sendWhatsappBtn: string;
  copyOrderBtn: string;
  copiedToast: string;
  emptySelectionHint: string;
  noPhoneHint: string;
  accordionEyebrow: string;
  accordionHeading: string;
  panels: Record<AccordionPanelKey, string>;
  storeNoteLabel: string;
  hostLabel: string;
  defaultHighlights: Record<SmallBusinessThemeVariant, Array<{ title: string; detail: string }>>;
  deliveryNotes: Record<SmallBusinessThemeVariant, string[]>;
}

const VARIANT_QUICK_MENU: Record<SmallBusinessThemeVariant, readonly QuickMenuItem[]> = {
  bakery: [
    {
      id: 'qb-truffle',
      name: { en: 'Belgian Dark Truffle (500g)', hinglish: 'Belgian Dark Truffle (500g)', hi: 'बेल्जियन डार्क ट्रफल (500g)' },
      meta: { en: '70% single-origin cocoa', hinglish: '70% rich cocoa ganache', hi: '70% रिच कोको गनाश' },
      price: 649,
    },
    {
      id: 'qb-praline',
      name: { en: 'Hazelnut Praline Gateau', hinglish: 'Hazelnut Praline Gateau', hi: 'हेज़लनट प्रालीन केक' },
      meta: { en: 'Roasted crunch · same-day fresh', hinglish: 'Roasted crunch · fresh batch', hi: 'ताज़ा बेक किया गया' },
      price: 789,
    },
    {
      id: 'qb-hamper',
      name: { en: 'Ribbon Pastry Box (6 pcs)', hinglish: 'Ribbon Pastry Box (6 pcs)', hi: 'रिबन पेस्ट्री बॉक्स (6 पीस)' },
      meta: { en: 'Assorted celebration gifting', hinglish: 'Gift-ready celebration box', hi: 'गिफ्ट पैक सेलिब्रेशन बॉक्स' },
      price: 899,
    },
    {
      id: 'qb-tart',
      name: { en: 'Raspberry Velvet Tart', hinglish: 'Raspberry Velvet Tart', hi: 'रास्पबेरी वेलवेट टार्ट' },
      meta: { en: 'Seasonal berry compote', hinglish: 'Fresh berry glaze', hi: 'ताज़ा बेरी ग्लेज़' },
      price: 399,
    },
  ],
  streetwear: [
    {
      id: 'qs-jacket',
      name: { en: 'Box Shell Jacket 04', hinglish: 'Box Shell Jacket 04', hi: 'बॉक्स शेल जैकेट 04' },
      meta: { en: '400 GSM heavy cotton · S-XL', hinglish: '400 GSM heavy cotton · S-XL', hi: '400 GSM हेवी कॉटन · S-XL' },
      price: 3499,
    },
    {
      id: 'qs-cargo',
      name: { en: 'Raw Seam Cargo', hinglish: 'Raw Seam Cargo', hi: 'रॉ सीम कार्गो' },
      meta: { en: 'Articulated ripstop twill', hinglish: 'Ripstop articulated fit', hi: 'रिपस्टॉप आर्टिकुलेटेड फिट' },
      price: 2699,
    },
    {
      id: 'qs-hoodie',
      name: { en: 'Boxy Drop Hoodie', hinglish: 'Boxy Drop Hoodie', hi: 'बॉक्सी ड्रॉप हुडी' },
      meta: { en: '440 GSM French terry', hinglish: '440 GSM French terry', hi: '440 GSM फ्रेंच टेरी' },
      price: 2299,
    },
    {
      id: 'qs-cap',
      name: { en: 'Atelier Twill Cap', hinglish: 'Atelier Twill Cap', hi: 'अटेलियर ट्विल कैप' },
      meta: { en: 'Monochrome metal clasp', hinglish: 'Monochrome metal clasp', hi: 'मोनोक्रोम मेटल क्लैस्प' },
      price: 999,
    },
  ],
  boutique: [
    {
      id: 'qbo-overshirt',
      name: { en: 'Linen Overshirt', hinglish: 'Linen Overshirt', hi: 'लिनन ओवरशर्ट' },
      meta: { en: 'Breathable everyday tailoring', hinglish: 'Breathable everyday tailoring', hi: 'आरामदायक आधुनिक फिट' },
      price: 2190,
    },
    {
      id: 'qbo-tote',
      name: { en: 'Canvas Atelier Tote', hinglish: 'Canvas Atelier Tote', hi: 'कैनवस अटेलियर टोट बैग' },
      meta: { en: 'Reinforced carry · 3 tones', hinglish: 'Structured carry · 3 shades', hi: 'मज़बूत बनावट · 3 रंग' },
      price: 1690,
    },
    {
      id: 'qbo-trench',
      name: { en: 'Wool Storm Trench', hinglish: 'Wool Storm Trench', hi: 'वूल स्टॉर्म ट्रेंच' },
      meta: { en: 'Seasonal signature outerwear', hinglish: 'Seasonal signature edit', hi: 'सीज़नल सिग्नेचर कोट' },
      price: 4490,
    },
    {
      id: 'qbo-scarf',
      name: { en: 'Cashmere Rib Scarf', hinglish: 'Cashmere Rib Scarf', hi: 'कश्मीरी रिब स्कार्फ़' },
      meta: { en: 'Gift-wrapped minimal essential', hinglish: 'Gift-wrapped soft essential', hi: 'गिफ्ट पैक आवश्यक परिधान' },
      price: 1290,
    },
  ],
  kinetic3d: [
    {
      id: 'q3d-chrono',
      name: { en: 'Prism Chrono F-01', hinglish: 'Prism Chrono F-01', hi: 'प्रिज़्म क्रोनो F-01' },
      meta: { en: 'Spatial milled timepiece', hinglish: 'Precision milled edition', hi: 'प्रिसिजन मिल्ड संस्करण' },
      price: 4299,
    },
    {
      id: 'q3d-lamp',
      name: { en: 'Orbital Halo Lamp F-02', hinglish: 'Orbital Halo Lamp F-02', hi: 'ऑर्बिटल हेलो लैंप F-02' },
      meta: { en: 'Ambient warm-to-cool ring', hinglish: 'Ambient desk lighting', hi: 'एम्बिएंट डेस्क लाइट' },
      price: 2899,
    },
    {
      id: 'q3d-dock',
      name: { en: 'Monolith Dock F-03', hinglish: 'Monolith Dock F-03', hi: 'मोनोलिथ डॉक F-03' },
      meta: { en: 'Weighted anodized desk hub', hinglish: 'Anodized studio desk hub', hi: 'एनोडाइज़्ड डेस्क हब' },
      price: 1999,
    },
    {
      id: 'q3d-folio',
      name: { en: 'Aramid Folio F-04', hinglish: 'Aramid Folio F-04', hi: 'अरामिड फ़ोलियो F-04' },
      meta: { en: 'Ultra-thin protective weave', hinglish: 'Ultra-thin woven sleeve', hi: 'अल्ट्रा-थिन प्रोटेक्टिव स्लीव' },
      price: 1499,
    },
  ],
};

const VARIANT_HOURS: Record<SmallBusinessThemeVariant, readonly HoursRow[]> = {
  bakery: [
    {
      day: { en: 'Mon – Sat', hinglish: 'Somvar – Shanivar', hi: 'सोमवार – शनिवार' },
      time: { en: '9:00 AM – 8:30 PM', hinglish: '9:00 AM – 8:30 PM', hi: 'सुबह 9:00 – रात 8:30' },
    },
    {
      day: { en: 'Sunday', hinglish: 'Ravivar', hi: 'रविवार' },
      time: { en: '10:00 AM – 6:30 PM', hinglish: '10:00 AM – 6:30 PM', hi: 'सुबह 10:00 – शाम 6:30' },
    },
    {
      day: { en: 'Same-Day Cake Cutoff', hinglish: 'Same-Day Order Cutoff', hi: 'उसी दिन ऑर्डर समय' },
      time: { en: 'Order before 4:00 PM', hinglish: '4:00 PM se pehle order karein', hi: 'शाम 4:00 बजे से पहले' },
    },
  ],
  streetwear: [
    {
      day: { en: 'Mon – Sat Dispatch', hinglish: 'Somvar – Shanivar Dispatch', hi: 'सोमवार – शनिवार डिस्पैच' },
      time: { en: '11:00 AM – 8:00 PM', hinglish: '11:00 AM – 8:00 PM', hi: 'सुबह 11:00 – रात 8:00' },
    },
    {
      day: { en: 'Studio Appointments', hinglish: 'Studio Visit', hi: 'स्टूडियो विज़िट' },
      time: { en: 'Sat & Sun · 12:00 PM – 6:00 PM', hinglish: 'Sat & Sun · 12:00 PM – 6:00 PM', hi: 'शनि व रवि · दोपहर 12 – शाम 6' },
    },
    {
      day: { en: 'Express Shipping', hinglish: 'Express Dispatch', hi: 'त्वरित शिपिंग' },
      time: { en: 'Ships within 24 hours', hinglish: '24 ghante mein dispatch', hi: '24 घंटे में डिस्पैच' },
    },
  ],
  boutique: [
    {
      day: { en: 'Tue – Sun Showroom', hinglish: 'Mangalvar – Ravivar', hi: 'मंगलवार – रविवार' },
      time: { en: '10:30 AM – 7:30 PM', hinglish: '10:30 AM – 7:30 PM', hi: 'सुबह 10:30 – शाम 7:30' },
    },
    {
      day: { en: 'Monday', hinglish: 'Somvar', hi: 'सोमवार' },
      time: { en: 'WhatsApp Desk Only', hinglish: 'Sirf WhatsApp Desk', hi: 'केवल WhatsApp सहायता' },
    },
    {
      day: { en: 'Custom Alterations', hinglish: 'Custom Fitting', hi: 'कस्टम फिटिंग' },
      time: { en: '48-hour turnaround', hinglish: '48 ghante mein taiyaar', hi: '48 घंटे में तैयार' },
    },
  ],
  kinetic3d: [
    {
      day: { en: 'Mon – Sat Support', hinglish: 'Somvar – Shanivar Support', hi: 'सोमवार – शनिवार सहायता' },
      time: { en: '10:00 AM – 8:00 PM', hinglish: '10:00 AM – 8:00 PM', hi: 'सुबह 10:00 – रात 8:00' },
    },
    {
      day: { en: 'Drop Reservations', hinglish: 'Drop Booking', hi: 'ड्रॉप बुकिंग' },
      time: { en: '24/7 via WhatsApp Bag', hinglish: '24/7 WhatsApp Bag dwara', hi: '24/7 WhatsApp बैग द्वारा' },
    },
    {
      day: { en: 'Insured Dispatch', hinglish: 'Insured Delivery', hi: 'सुरक्षित डिस्पैच' },
      time: { en: 'Pan-India tracked courier', hinglish: 'Pan-India tracked courier', hi: 'संपूर्ण भारत ट्रैक्ड कूरियर' },
    },
  ],
};

const COMPANION_COPY: Record<CoreLanguageCode, CompanionCopy> = {
  en: {
    previewBanner: 'WEBZY FREE PREVIEW',
    bagEyebrow: 'QUICK ORDER BAG & INQUIRY BUILDER',
    bagHeading: 'Build Your Multi-Item WhatsApp Order',
    bagSubheading: 'Adjust quantities below for an instant estimate and formatted WhatsApp message',
    offerPillLabel: 'Active Store Offer',
    offerApplyBtn: 'Attach Offer',
    offerAppliedBtn: 'Offer Attached',
    itemsCount: (count) => `${count} ${count === 1 ? 'Item' : 'Items'}`,
    estimateLabel: 'Estimated Total',
    clearBagBtn: 'Clear',
    noteLabel: 'Delivery / Custom Request Note (Optional)',
    notePlaceholder: 'Size, flavor message, gift note, or preferred delivery time...',
    sendWhatsappBtn: 'Send Order on WhatsApp',
    copyOrderBtn: 'Copy Order Summary',
    copiedToast: 'Formatted multi-item order copied to clipboard',
    emptySelectionHint: 'Tap + on one or more items above to build a multi-item order, or send a general inquiry below.',
    noPhoneHint: 'WhatsApp number not added yet — tap Copy Order Summary above to share directly.',
    accordionEyebrow: 'STORE INFO & HIGHLIGHTS',
    accordionHeading: 'Store Highlights & Hours',
    panels: {
      highlights: 'Store Highlights & Offers',
      hours: 'Opening Hours & Dispatch',
      delivery: 'Ordering & Packaging Guide',
    },
    storeNoteLabel: 'From the Store',
    hostLabel: 'Store Host',
    defaultHighlights: {
      bakery: [
        { title: 'Fresh Small-Batch Baking', detail: 'Every cake and tart is hand-piped fresh daily with couverture chocolate.' },
        { title: 'Custom Celebration Notes', detail: 'Complimentary ribbon gift wrapping and personalized plaque inscriptions.' },
      ],
      streetwear: [
        { title: '400+ GSM Heavyweight Craft', detail: 'Pre-shrunk combed cotton with reinforced double-needle seams.' },
        { title: 'Limited Archive Releases', detail: 'Small-batch numbered drops with 24-hour tracked studio dispatch.' },
      ],
      boutique: [
        { title: 'Curated Natural Fabrics', detail: 'Breathable linen, wool blends, and organic cotton checked piece by piece.' },
        { title: 'Personal Styling Desk', detail: 'Direct WhatsApp guidance on sizing, colour matching, and gift wrapping.' },
      ],
      kinetic3d: [
        { title: 'Precision Industrial Finish', detail: 'Anodized metals, acoustic dampening, and tactile hardware tolerances.' },
        { title: 'Direct Studio Warranty', detail: '1-year replacement assurance and direct support via WhatsApp.' },
      ],
    },
    deliveryNotes: {
      bakery: [
        'Same-day local courier available for orders confirmed before 4:00 PM.',
        'All gift hampers include ribbon-tied boxes and chilled delivery care.',
      ],
      streetwear: [
        'Size exchanges supported within 7 days for unworn pieces with tags.',
        'Orders are packed in reusable matte archive garment bags.',
      ],
      boutique: [
        'Complimentary neutral gift wrap available upon request in the note box.',
        'Direct confirmation and payment link shared over WhatsApp.',
      ],
      kinetic3d: [
        'Shock-proof foam-molded studio packaging with tracked pan-India shipping.',
        'Bulk or corporate edition custom engraving available on inquiry.',
      ],
    },
  },
  hinglish: {
    previewBanner: 'WEBZY FREE PREVIEW',
    bagEyebrow: 'QUICK ORDER BAG & INQUIRY BUILDER',
    bagHeading: 'Multi-Item WhatsApp Order Banayein',
    bagSubheading: 'Items ki quantity + / - se chunein aur live estimate ke saath seedha WhatsApp bhejein',
    offerPillLabel: 'Live Store Offer',
    offerApplyBtn: 'Offer Lagayein',
    offerAppliedBtn: 'Offer Shamil Hai',
    itemsCount: (count) => `${count} ${count === 1 ? 'Item' : 'Items'}`,
    estimateLabel: 'Anumanit Total',
    clearBagBtn: 'Clear',
    noteLabel: 'Delivery ya Custom Request Note (Optional)',
    notePlaceholder: 'Size, flavour, gift note ya delivery timing likhein...',
    sendWhatsappBtn: 'WhatsApp Par Order Bhejein',
    copyOrderBtn: 'Order Summary Copy Karein',
    copiedToast: 'Multi-item order summary copy ho gaya',
    emptySelectionHint: 'Order banane ke liye upar kisi bhi item par + dabayein, ya seedha inquiry bhejein.',
    noPhoneHint: 'WhatsApp number abhi set nahi hai — upar se Order Summary copy karke bhejein.',
    accordionEyebrow: 'STORE JANKARI',
    accordionHeading: 'Store Highlights aur Timings',
    panels: {
      highlights: 'Store Highlights aur Offers',
      hours: 'Store Timings aur Dispatch',
      delivery: 'Order aur Packaging Guide',
    },
    storeNoteLabel: 'Store Sandesh',
    hostLabel: 'Store Host',
    defaultHighlights: {
      bakery: [
        { title: 'Rozana Fresh Baking', detail: 'Pure chocolate aur fresh ingredients ke saath small-batch baking.' },
        { title: 'Custom Gift Packaging', detail: 'Har celebration order ke saath ribbon box aur personal note.' },
      ],
      streetwear: [
        { title: '400+ GSM Heavy Cotton', detail: 'Durable double-needle stitching aur structured boxy silhouette.' },
        { title: 'Limited Batch Drops', detail: '24 ghante mein studio dispatch aur tracked courier.' },
      ],
      boutique: [
        { title: 'Natural Breathable Fabrics', detail: 'Chuninda linen, wool blend aur organic cotton silhouettes.' },
        { title: 'Direct Styling Help', detail: 'Size aur shade selection ke liye seedhi WhatsApp sahayata.' },
      ],
      kinetic3d: [
        { title: 'Precision Studio Craft', detail: 'Anodized finish aur har piece ki quality inspection.' },
        { title: 'Direct Warranty Support', detail: '1 saal ki studio warranty aur seedhi WhatsApp service.' },
      ],
    },
    deliveryNotes: {
      bakery: [
        '4:00 PM se pehle confirm hue orders par same-day local delivery uplabdh hai.',
        'Sabhi hampers ribbon-tied gift boxes mein safely pack hote hain.',
      ],
      streetwear: [
        'Unworn items par 7 din ke andar aasan size exchange uplabdh hai.',
        'Har drop reusable matte archive garment bag mein aata hai.',
      ],
      boutique: [
        'Order note mein likhne par free minimal gift wrap milta hai.',
        'WhatsApp par order confirm hote hi payment aur dispatch link milta hai.',
      ],
      kinetic3d: [
        'Foam-protected studio packaging ke saath tracked pan-India delivery.',
        'Corporate ya bulk custom engraving ke liye WhatsApp par poochhein.',
      ],
    },
  },
  hi: {
    previewBanner: 'WEBZY निःशुल्क पूर्वावलोकन',
    bagEyebrow: 'त्वरित ऑर्डर बैग एवं पूछताछ',
    bagHeading: 'अपना मल्टी-आइटम WhatsApp ऑर्डर बनाएँ',
    bagSubheading: '+ और - से मात्रा चुनें, लाइव अनुमानित राशि देखें और सीधे WhatsApp पर भेजें',
    offerPillLabel: 'सक्रिय स्टोर ऑफ़र',
    offerApplyBtn: 'ऑफ़र जोड़ें',
    offerAppliedBtn: 'ऑफ़र जुड़ा है',
    itemsCount: (count) => `${count} आइटम`,
    estimateLabel: 'अनुमानित कुल राशि',
    clearBagBtn: 'साफ़ करें',
    noteLabel: 'डिलीवरी या विशेष अनुरोध (वैकल्पिक)',
    notePlaceholder: 'साइज़, फ़्लेवर, उपहार संदेश या डिलीवरी समय लिखें...',
    sendWhatsappBtn: 'WhatsApp पर ऑर्डर भेजें',
    copyOrderBtn: 'ऑर्डर सारांश कॉपी करें',
    copiedToast: 'मल्टी-आइटम ऑर्डर सारांश कॉपी हो गया',
    emptySelectionHint: 'ऑर्डर बनाने के लिए ऊपर किसी भी आइटम पर + दबाएँ, या सामान्य पूछताछ भेजें।',
    noPhoneHint: 'WhatsApp नंबर अभी जुड़ा नहीं है — ऊपर से ऑर्डर सारांश कॉपी कर साझा करें।',
    accordionEyebrow: 'स्टोर विवरण एवं विशेषताएँ',
    accordionHeading: 'स्टोर विशेषताएँ और समय',
    panels: {
      highlights: 'स्टोर विशेषताएँ एवं ऑफ़र',
      hours: 'खुलने का समय और डिस्पैच',
      delivery: 'ऑर्डर और पैकेजिंग मार्गदर्शन',
    },
    storeNoteLabel: 'स्टोर की ओर से',
    hostLabel: 'स्टोर संचालक',
    defaultHighlights: {
      bakery: [
        { title: 'प्रतिदिन ताज़ा बेकिंग', detail: 'शुद्ध चॉकलेट और ताज़ी सामग्री के साथ सीमित बैच में तैयार।' },
        { title: 'सुरुचिपूर्ण गिफ्ट पैकेजिंग', detail: 'हर उत्सव ऑर्डर के साथ रिबन बॉक्स और कस्टम शुभकामना नोट।' },
      ],
      streetwear: [
        { title: '400+ GSM हेवीवेट कॉटन', detail: 'मज़बूत डबल-नीडल सिलाई और आधुनिक बॉक्सी फिट।' },
        { title: 'सीमित संस्करण ड्रॉप्स', detail: '24 घंटे में स्टूडियो डिस्पैच और ट्रैक्ड कूरियर सेवा।' },
      ],
      boutique: [
        { title: 'चुनिंदा प्राकृतिक फ़ैब्रिक', detail: 'आरामदायक लिनन, ऊन और शुद्ध कॉटन की बारीक कारीगरी।' },
        { title: 'व्यक्तिगत स्टाइलिंग सहायता', detail: 'साइज़ व रंग चयन के लिए सीधा WhatsApp परामर्श।' },
      ],
      kinetic3d: [
        { title: 'सटीक स्टूडियो निर्माण', detail: 'एनोडाइज़्ड फ़िनिश और प्रत्येक उत्पाद की गुणवत्ता जाँच।' },
        { title: 'सीधी स्टूडियो वारंटी', detail: '1 वर्ष की वारंटी और त्वरित WhatsApp सहायता।' },
      ],
    },
    deliveryNotes: {
      bakery: [
        'शाम 4:00 बजे से पहले पुष्टि किए गए ऑर्डर पर उसी दिन स्थानीय डिलीवरी उपलब्ध है।',
        'सभी उपहार हैम्पर्स रिबन-युक्त सुरक्षित बॉक्स में पैक किए जाते हैं।',
      ],
      streetwear: [
        'अप्रयुक्त परिधानों पर टैग सहित 7 दिनों के भीतर साइज़ एक्सचेंज उपलब्ध है।',
        'प्रत्येक पीस पुन: प्रयोज्य मैट आर्काइव बैग में भेजा जाता है।',
      ],
      boutique: [
        'नोट बॉक्स में अनुरोध करने पर निःशुल्क मिनिमल गिफ्ट रैप उपलब्ध है।',
        'WhatsApp पर पुष्टि होते ही भुगतान व ट्रैकिंग विवरण साझा किया जाता है।',
      ],
      kinetic3d: [
        'सुरक्षित फ़ोम पैकेजिंग के साथ संपूर्ण भारत में ट्रैक्ड कूरियर सुविधा।',
        'कॉर्पोरेट या कस्टम ऑर्डर के लिए सीधे WhatsApp पर संपर्क करें।',
      ],
    },
  },
};

const ACCORDION_ORDER: readonly AccordionPanelKey[] = ['highlights', 'hours', 'delivery'];

/**
 * Small Business Multi-Theme Storefront Orchestrator:
 * - bakery: Warm vanilla & berry-cocoa Artisan Bakehouse
 * - streetwear: Monochrome Atelier brutalist lookbook
 * - boutique: Alabaster & denim-slate Everyday Minimalist lookbook
 * - kinetic3d: Obsidian space Prism 3D Scroll Universe
 * Includes a unified theme-adaptive Quick Order Bag / Inquiry Builder & Store Highlights & Hours Accordion.
 */
export function SmallBusinessSite({
  manifest,
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolveSmallBusinessTheme(data.relation);
  const [manualVariant, setManualVariant] =
    useState<SmallBusinessThemeVariant | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Quick Order Bag & Store Highlights Accordion states
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [attachOffer, setAttachOffer] = useState(true);
  const [orderNote, setOrderNote] = useState('');
  const [openAccordion, setOpenAccordion] = useState<AccordionPanelKey | null>('highlights');
  const [copiedOrder, setCopiedOrder] = useState(false);

  const noteInputId = useId();
  const accordionUid = useId().replace(/:/g, '');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setManualVariant(null);
    setSceneKey((prev) => prev + 1);
  }, [data.relation]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const activeVariant: SmallBusinessThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;

  useEffect(() => {
    setQuantities({});
    setAttachOffer(true);
  }, [activeVariant]);

  const coreLang = toCoreLanguageCode(language);
  const copy = COMPANION_COPY[coreLang] ?? COMPANION_COPY.en;
  const photos = getValidPhotos(data.photos);

  // When previewing other styles in demo mode, give each edition its own art-directed identity instead of bleeding bakery copy across Streetwear/Boutique/3D.
  const effectiveData = useMemo(
    () =>
      watermarked && manualVariant && manualVariant !== autoVariant
        ? {
            ...data,
            receiverName:
              manualVariant === 'streetwear'
                ? 'MONOCHROME ATELIER'
                : manualVariant === 'boutique'
                  ? 'FORMA STUDIO'
                  : manualVariant === 'kinetic3d'
                    ? 'PRISM 3D'
                    : data.receiverName,
            headline:
              manualVariant === 'streetwear'
                ? { en: 'BOX SHELL JACKET 04', hi: 'BOX SHELL JACKET 04', hinglish: 'BOX SHELL JACKET 04' }
                : manualVariant === 'boutique'
                  ? { en: 'Refined Everyday Silhouettes', hi: 'एवरीडे मिनिमल कलेक्शन', hinglish: 'Refined Everyday Silhouettes' }
                  : manualVariant === 'kinetic3d'
                    ? { en: 'PRISM STUDIO 3D', hi: 'PRISM STUDIO 3D', hinglish: 'PRISM STUDIO 3D' }
                    : data.headline,
            offerTag:
              manualVariant === 'streetwear'
                ? { en: 'ARCHIVE DROP 04', hi: 'ARCHIVE DROP 04', hinglish: 'ARCHIVE DROP 04' }
                : manualVariant === 'boutique'
                  ? { en: 'AUTUMN / WINTER EDIT', hi: 'नया कलेक्शन', hinglish: 'AUTUMN / WINTER EDIT' }
                  : manualVariant === 'kinetic3d'
                    ? { en: 'SPATIAL EDITION', hi: 'स्पेशियल एडिशन', hinglish: 'SPATIAL EDITION' }
                    : data.offerTag,
            highlights: undefined,
          }
        : data,
    [watermarked, manualVariant, autoVariant, data],
  );

  const fallbackStoreName =
    activeVariant === 'bakery'
      ? 'Velvet Crumb Bakehouse'
      : activeVariant === 'streetwear'
        ? 'MONOCHROME ATELIER'
        : activeVariant === 'boutique'
          ? 'FORMA STUDIO'
          : 'PRISM STUDIO 3D';

  const storeName = deriveStoreName(effectiveData, fallbackStoreName);
  const senderDisplay = effectiveData.senderName?.trim() || '';
  const liveOfferTag = effectiveData.offerTag
    ? pickLocalizedText(effectiveData.offerTag, language).trim()
    : '';
  const storeMessage = effectiveData.message
    ? pickLocalizedText(effectiveData.message, language).trim()
    : '';
  const liveHighlights = useMemo(
    () => deriveHighlights(effectiveData, language),
    [effectiveData, language],
  );

  // Merge buyer highlights cleanly into the quick menu so live edits appear immediately in the order builder too.
  const menuItems = useMemo(() => {
    const base = VARIANT_QUICK_MENU[activeVariant];
    return base.map((item, idx) => {
      const buyerHighlight = liveHighlights[idx];
      if (buyerHighlight && buyerHighlight.title) {
        return {
          id: item.id,
          name: buyerHighlight.title,
          meta: buyerHighlight.detail || item.meta[coreLang],
          price: item.price,
        };
      }
      return {
        id: item.id,
        name: item.name[coreLang],
        meta: item.meta[coreLang],
        price: item.price,
      };
    });
  }, [activeVariant, liveHighlights, coreLang]);

  const selectedLines = useMemo(
    () =>
      menuItems
        .map((item) => ({
          ...item,
          qty: quantities[item.id] ?? 0,
        }))
        .filter((item) => item.qty > 0),
    [menuItems, quantities],
  );

  const totalItems = selectedLines.reduce((acc, line) => acc + line.qty, 0);
  const estimatedTotal = selectedLines.reduce(
    (acc, line) => acc + line.qty * line.price,
    0,
  );

  const validWaPhone = sanitizeWhatsappPhone(effectiveData.whatsappPhone);

  const formattedOrderMessage = useMemo(() => {
    const lines: string[] = [];
    if (coreLang === 'hi') {
      lines.push(`नमस्कार ${storeName},`);
      if (selectedLines.length > 0) {
        lines.push('मैं निम्नलिखित ऑर्डर बुक करना चाहता/चाहती हूँ:');
        selectedLines.forEach((item, idx) => {
          lines.push(`${idx + 1}. ${item.name} × ${item.qty} = ₹${item.price * item.qty}`);
        });
        lines.push(`अनुमानित कुल राशि: ₹${estimatedTotal} (${totalItems} आइटम)`);
      } else {
        lines.push('मैं आपके कलेक्शन और उपलब्धता के बारे में जानकारी चाहता/चाहती हूँ।');
      }
      if (liveOfferTag && attachOffer) {
        lines.push(`संलग्न ऑफ़र: ${liveOfferTag}`);
      }
      if (orderNote.trim()) {
        lines.push(`विशेष नोट: ${orderNote.trim()}`);
      }
      return lines.join('\n');
    }

    if (coreLang === 'hinglish') {
      lines.push(`Namaste ${storeName},`);
      if (selectedLines.length > 0) {
        lines.push('Mera multi-item order request:');
        selectedLines.forEach((item, idx) => {
          lines.push(`${idx + 1}. ${item.name} × ${item.qty} = ₹${item.price * item.qty}`);
        });
        lines.push(`Estimated Total: ₹${estimatedTotal} (${totalItems} items)`);
      } else {
        lines.push('Mujhe aapke products aur latest availability ke baare mein jaanna hai.');
      }
      if (liveOfferTag && attachOffer) {
        lines.push(`Applied Offer: ${liveOfferTag}`);
      }
      if (orderNote.trim()) {
        lines.push(`Note: ${orderNote.trim()}`);
      }
      return lines.join('\n');
    }

    lines.push(`Hello ${storeName},`);
    if (selectedLines.length > 0) {
      lines.push('I would like to place the following order:');
      selectedLines.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.name} × ${item.qty} = ₹${item.price * item.qty}`);
      });
      lines.push(`Estimated Total: ₹${estimatedTotal} (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`);
    } else {
      lines.push('I would like to inquire about your latest catalog and availability.');
    }
    if (liveOfferTag && attachOffer) {
      lines.push(`Applied Offer: ${liveOfferTag}`);
    }
    if (orderNote.trim()) {
      lines.push(`Note: ${orderNote.trim()}`);
    }
    return lines.join('\n');
  }, [
    coreLang,
    storeName,
    selectedLines,
    estimatedTotal,
    totalItems,
    liveOfferTag,
    attachOffer,
    orderNote,
  ]);

  const waOrderHref = buildWhatsAppOrderHref(validWaPhone, formattedOrderMessage);

  function handleSelectDemoVariant(nextVariant: SmallBusinessThemeVariant) {
    setManualVariant(nextVariant);
    setLightboxIdx(null);
    setSceneKey((prev) => prev + 1);
  }

  function handleAdjustQty(id: string, delta: number) {
    setQuantities((prev) => {
      const nextQty = Math.max(0, Math.min(20, (prev[id] ?? 0) + delta));
      if (nextQty === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: nextQty };
    });
  }

  async function handleCopyOrderSummary() {
    try {
      await navigator.clipboard?.writeText(formattedOrderMessage);
    } catch {
      // Clipboard may be restricted in embedded preview contexts; status toast still renders.
    }
    onOpened?.();
    setCopiedOrder(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedOrder(false), 2300);
  }

  const accentForLightbox =
    activeVariant === 'bakery'
      ? '#8E2027'
      : activeVariant === 'streetwear'
        ? '#111111'
        : activeVariant === 'boutique'
          ? '#34516A'
          : '#818CF8';

  const outerBgColor =
    activeVariant === 'bakery'
      ? '#FDF9F3'
      : activeVariant === 'streetwear'
        ? '#FFFFFF'
        : activeVariant === 'boutique'
          ? '#F8F7F4'
          : '#06070B';

  const footerTextColor =
    activeVariant === 'kinetic3d' ? 'text-[#F4F4F5]/65' : 'text-[#18181B]/60';

  const bannerChrome =
    activeVariant === 'kinetic3d'
      ? 'border-white/15 bg-[#0B0E17]/90 text-[#22D3EE]'
      : activeVariant === 'streetwear'
        ? 'border-[#111111] bg-[#111111] text-white'
        : activeVariant === 'bakery'
          ? 'border-[#8E2027]/20 bg-[#8E2027] text-[#FDF9F3]'
          : 'border-[#E6E2DA] bg-[#34516A] text-[#F8F7F4]';

  // Theme-adaptive surface classes so the Quick Order Bag & Accordion blend naturally with all 4 styles.
  const isDark = activeVariant === 'kinetic3d';
  const isBrutalist = activeVariant === 'streetwear';

  const cardShellClass = isDark
    ? 'rounded-2xl border border-white/15 bg-[#0C0F1C] text-[#F4F4F5]'
    : isBrutalist
      ? 'rounded-none border-2 border-[#111111] bg-[#FAFAFA] text-[#111111]'
      : activeVariant === 'bakery'
        ? 'rounded-2xl border border-[#D97706]/30 bg-white text-[#2C1618] shadow-xs'
        : 'rounded-2xl border border-[#E6E2DA] bg-white text-[#18181B] shadow-2xs';

  const innerRowClass = isDark
    ? 'rounded-xl border border-white/12 bg-[#12172B]'
    : isBrutalist
      ? 'rounded-none border border-[#111111]/30 bg-white'
      : activeVariant === 'bakery'
        ? 'rounded-xl border border-[#D97706]/20 bg-[#FDF9F3]'
        : 'rounded-xl border border-[#E6E2DA] bg-[#F8F7F4]';

  const eyebrowClass = isDark
    ? 'text-[#22D3EE]'
    : isBrutalist
      ? 'text-[#111111]/70'
      : activeVariant === 'bakery'
        ? 'text-[#8E2027]'
        : 'text-[#34516A]';

  const mutedTextClass = isDark
    ? 'text-[#F4F4F5]/70'
    : isBrutalist
      ? 'text-[#111111]/70'
      : activeVariant === 'bakery'
        ? 'text-[#2C1618]/70'
        : 'text-[#18181B]/65';

  const primaryCtaClass = isDark
    ? 'rounded-full bg-gradient-to-r from-[#818CF8] to-[#22D3EE] text-[#06070B]'
    : isBrutalist
      ? 'rounded-none bg-[#111111] text-white'
      : activeVariant === 'bakery'
        ? 'rounded-full bg-[#8E2027] text-[#FDF9F3]'
        : 'rounded-full bg-[#34516A] text-[#F8F7F4]';

  const secondaryCtaClass = isDark
    ? 'rounded-full border border-white/20 bg-white/5 text-[#F4F4F5] hover:bg-white/10'
    : isBrutalist
      ? 'rounded-none border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#111111]/5'
      : activeVariant === 'bakery'
        ? 'rounded-full border border-[#8E2027]/30 bg-white text-[#8E2027] hover:bg-[#FDF5EA]'
        : 'rounded-full border border-[#34516A]/30 bg-white text-[#34516A] hover:bg-[#F3F1EC]';

  const qtyBtnClass = isDark
    ? 'rounded-lg border border-white/20 bg-[#06070B] text-white hover:border-[#22D3EE]'
    : isBrutalist
      ? 'rounded-none border border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white'
      : activeVariant === 'bakery'
        ? 'rounded-lg border border-[#8E2027]/30 bg-white text-[#8E2027] hover:bg-[#8E2027] hover:text-white'
        : 'rounded-lg border border-[#34516A]/30 bg-white text-[#34516A] hover:bg-[#34516A] hover:text-white';

  const displayedHighlights =
    liveHighlights.length > 0
      ? liveHighlights
      : copy.defaultHighlights[activeVariant];

  return (
    <div
      className="relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{ backgroundColor: outerBgColor }}
    >
      {watermarked ? (
        <div
          aria-hidden="true"
          style={hiSafeStyle(language)}
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] ${bannerChrome}`}
        >
          {copy.previewBanner}
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col">
        {activeVariant === 'bakery' ? (
          <SmallBusinessBakeryTheme
            key={`bakery-${sceneKey}`}
            manifest={manifest}
            data={effectiveData}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'streetwear' ? (
          <SmallBusinessStreetwearTheme
            key={`streetwear-${sceneKey}`}
            manifest={manifest}
            data={effectiveData}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : activeVariant === 'boutique' ? (
          <SmallBusinessBoutiqueTheme
            key={`boutique-${sceneKey}`}
            manifest={manifest}
            data={effectiveData}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        ) : (
          <SmallBusiness3DScrollTheme
            key={`kinetic3d-${sceneKey}`}
            manifest={manifest}
            data={effectiveData}
            language={language}
            watermarked={watermarked}
            onOpened={onOpened}
            onOpenPhoto={setLightboxIdx}
          />
        )}

        {/* Unified Storefront Companion Suite: Quick Order Bag + Store Highlights & Hours Accordion */}
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-3.5 pb-4 pt-2 sm:px-5">
          {/* 1. Quick Order Bag / Multi-Item Inquiry Builder */}
          <section
            aria-labelledby={`quick-bag-heading-${accordionUid}`}
            className={`space-y-3.5 p-4 ${cardShellClass}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p
                  style={hiSafeStyle(language)}
                  className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] ${eyebrowClass}`}
                >
                  {copy.bagEyebrow}
                </p>
                <h2
                  id={`quick-bag-heading-${accordionUid}`}
                  style={hiSafeStyle(language)}
                  className="mt-1 font-heading text-base font-bold leading-snug"
                >
                  {copy.bagHeading}
                </h2>
                <p className={`mt-0.5 text-xs leading-relaxed ${mutedTextClass}`}>
                  {copy.bagSubheading}
                </p>
              </div>

              {totalItems > 0 ? (
                <button
                  type="button"
                  onClick={() => setQuantities({})}
                  className={`inline-flex min-h-[44px] shrink-0 items-center px-3 text-xs font-bold transition active:scale-95 ${secondaryCtaClass}`}
                >
                  {copy.clearBagBtn}
                </button>
              ) : null}
            </div>

            {/* Live Buyer Offer Tag Strip */}
            {liveOfferTag ? (
              <div
                className={`flex flex-wrap items-center justify-between gap-2 p-2.5 ${innerRowClass}`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    style={hiSafeStyle(language)}
                    className={`font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${eyebrowClass}`}
                  >
                    {copy.offerPillLabel}
                  </p>
                  <p className="mt-0.5 break-words text-xs font-bold">
                    {liveOfferTag}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachOffer((prev) => !prev)}
                  aria-pressed={attachOffer}
                  className={`inline-flex min-h-[44px] shrink-0 items-center px-3.5 text-[11px] font-bold transition active:scale-95 ${
                    attachOffer ? primaryCtaClass : secondaryCtaClass
                  }`}
                >
                  {attachOffer ? copy.offerAppliedBtn : copy.offerApplyBtn}
                </button>
              </div>
            ) : null}

            {/* Quantity Selector Rows */}
            <div className="space-y-2">
              {menuItems.map((item) => {
                const qty = quantities[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-2.5 p-2.5 ${innerRowClass}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold leading-snug">
                        {item.name}
                      </p>
                      <p className={`mt-0.5 truncate text-[11px] ${mutedTextClass}`}>
                        {item.meta}
                      </p>
                      <p className={`mt-1 font-mono text-[11px] font-extrabold ${eyebrowClass}`}>
                        ₹{item.price}
                        {qty > 0 ? ` × ${qty} = ₹${item.price * qty}` : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustQty(item.id, -1)}
                        disabled={qty === 0}
                        aria-label={`Decrease quantity for ${item.name}`}
                        className={`flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-extrabold transition active:scale-95 disabled:opacity-35 ${qtyBtnClass}`}
                      >
                        -
                      </button>
                      <span
                        aria-live="polite"
                        className="min-w-[24px] text-center font-mono text-xs font-extrabold"
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustQty(item.id, 1)}
                        aria-label={`Increase quantity for ${item.name}`}
                        className={`flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-extrabold transition active:scale-95 ${qtyBtnClass}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Note Input */}
            <div className="space-y-1">
              <label
                htmlFor={noteInputId}
                style={hiSafeStyle(language)}
                className={`block text-[11px] font-bold ${mutedTextClass}`}
              >
                {copy.noteLabel}
              </label>
              <input
                id={noteInputId}
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                maxLength={140}
                placeholder={copy.notePlaceholder}
                className={`min-h-[44px] w-full px-3 py-2 text-xs focus:outline-none ${innerRowClass}`}
              />
            </div>

            {/* Live Count & Estimate Bar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 ${innerRowClass}`}
            >
              <div>
                <p
                  style={hiSafeStyle(language)}
                  className={`font-mono text-[9.5px] font-bold uppercase tracking-wider ${mutedTextClass}`}
                >
                  {copy.itemsCount(totalItems)}
                </p>
                <p className="text-xs font-semibold">{copy.estimateLabel}</p>
              </div>
              <p className={`font-mono text-base font-extrabold ${eyebrowClass}`}>
                ₹{estimatedTotal}
              </p>
            </div>

            {totalItems === 0 ? (
              <p className={`text-[11px] leading-relaxed ${mutedTextClass}`}>
                {copy.emptySelectionHint}
              </p>
            ) : null}

            {/* Action Buttons: WhatsApp Multi-Item Order + 1-Tap Copy */}
            <div className="flex flex-col gap-2 sm:flex-row">
              {waOrderHref ? (
                <a
                  href={waOrderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOpened?.()}
                  className={`inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold shadow-xs transition hover:brightness-105 active:scale-[0.98] ${primaryCtaClass}`}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.91-1.26-4.81-4.19-4.96-4.38-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.59.17.29.75 1.24 1.61 2 1.11.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
                  </svg>
                  <span>
                    {copy.sendWhatsappBtn}
                    {totalItems > 0 ? ` (${totalItems})` : ''}
                  </span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={handleCopyOrderSummary}
                className={`inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${
                  waOrderHref ? secondaryCtaClass : primaryCtaClass
                }`}
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                <span>{copy.copyOrderBtn}</span>
              </button>
            </div>

            {!waOrderHref ? (
              <p className={`text-center text-[11px] leading-relaxed ${mutedTextClass}`}>
                {copy.noPhoneHint}
              </p>
            ) : null}

            <div aria-live="polite" className="min-h-[1px]">
              {copiedOrder ? (
                <p
                  role="status"
                  className={`px-3 py-1.5 text-center text-[11px] font-bold ${primaryCtaClass}`}
                >
                  {copy.copiedToast}
                </p>
              ) : null}
            </div>
          </section>

          {/* 2. Store Highlights & Hours Accordion */}
          <section
            aria-labelledby={`store-accordion-heading-${accordionUid}`}
            className={`space-y-3 p-4 ${cardShellClass}`}
          >
            <div>
              <p
                style={hiSafeStyle(language)}
                className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] ${eyebrowClass}`}
              >
                {copy.accordionEyebrow}
              </p>
              <h2
                id={`store-accordion-heading-${accordionUid}`}
                style={hiSafeStyle(language)}
                className="mt-1 font-heading text-base font-bold leading-snug"
              >
                {storeName} · {copy.accordionHeading}
              </h2>
            </div>

            <div className="space-y-2">
              {ACCORDION_ORDER.map((panelKey) => {
                const isExpanded = openAccordion === panelKey;
                const panelId = `panel-${panelKey}-${accordionUid}`;
                return (
                  <div key={panelKey} className={`overflow-hidden ${innerRowClass}`}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenAccordion((prev) => (prev === panelKey ? null : panelKey))
                      }
                      className="flex min-h-[46px] w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-bold transition active:scale-[0.99]"
                    >
                      <span>{copy.panels[panelKey]}</span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5L10 12.5L15 7.5" />
                      </svg>
                    </button>

                    {isExpanded ? (
                      <div
                        id={panelId}
                        className={`space-y-2.5 border-t px-3.5 pb-3.5 pt-2.5 text-xs ${
                          isDark ? 'border-white/10' : 'border-black/10'
                        }`}
                      >
                        {panelKey === 'highlights' ? (
                          <>
                            {liveOfferTag ? (
                              <div className={`inline-flex max-w-full items-center px-3 py-1 text-[11px] font-bold ${primaryCtaClass}`}>
                                {liveOfferTag}
                              </div>
                            ) : null}
                            <div className="space-y-2">
                              {displayedHighlights.map((item, idx) => (
                                <div key={`${item.title}-${idx}`} className="space-y-0.5">
                                  <p className={`text-xs font-bold ${eyebrowClass}`}>
                                    {item.title}
                                  </p>
                                  {item.detail ? (
                                    <p className={`text-[11.5px] leading-relaxed ${mutedTextClass}`}>
                                      {item.detail}
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                            {storeMessage ? (
                              <div className={`border-t pt-2 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedTextClass}`} style={hiSafeStyle(language)}>
                                  {copy.storeNoteLabel}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed">
                                  {storeMessage}
                                </p>
                              </div>
                            ) : null}
                          </>
                        ) : panelKey === 'hours' ? (
                          <div className="space-y-1.5">
                            {VARIANT_HOURS[activeVariant].map((row, idx) => (
                              <div
                                key={idx}
                                className="flex flex-wrap items-center justify-between gap-2 text-xs"
                              >
                                <span className="font-semibold">{row.day[coreLang]}</span>
                                <span className={`font-mono text-[11px] font-bold ${eyebrowClass}`}>
                                  {row.time[coreLang]}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {copy.deliveryNotes[activeVariant].map((line, idx) => (
                              <p
                                key={idx}
                                className={`text-[11.5px] leading-relaxed ${mutedTextClass}`}
                              >
                                {line}
                              </p>
                            ))}
                            {senderDisplay ? (
                              <p className="pt-1 text-[11px] font-bold">
                                {copy.hostLabel}: {senderDisplay}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <footer
        className={`relative z-20 px-4 pb-4 pt-3 text-center text-[11px] font-medium ${footerTextColor}`}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {watermarked ? (
        <SmallBusinessDemoSwitcher
          activeVariant={activeVariant}
          language={coreLang}
          onSelect={handleSelectDemoVariant}
        />
      ) : null}

      <SmallBusinessPhotoLightbox
        photos={photos}
        activeIdx={lightboxIdx}
        accentColor={accentForLightbox}
        onChangeIdx={setLightboxIdx}
      />
    </div>
  );
}
