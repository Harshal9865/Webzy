import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicTemplatesDir = path.resolve(__dirname, '..', 'public', 'templates');

const ARTIFACT_DIR =
  process.env.WEBZY_ART_SOURCE_DIR ||
  'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\476f492d-d08f-42aa-8d1a-3cd7be448fe3';

const ARTWORK_MAP = [
  // Edition I: Swarna Vatika (Emerald)
  {
    src: 'doors_embossed_1795323943948.jpg',
    dest: path.join('wedding-emerald-01', 'art', 'doors-embossed.jpg'),
  },
  {
    src: 'jharokha_scene_1795323899350.jpg',
    dest: path.join('wedding-emerald-01', 'art', 'jharokha-scene.jpg'),
  },
  {
    src: 'jharokha_scene_wide_1795323912351.jpg',
    dest: path.join('wedding-emerald-01', 'art', 'jharokha-scene-wide.jpg'),
  },
  {
    src: 'ceremony_emerald_wide_1795323894041.jpg',
    dest: path.join('weddings', 'art', 'ceremony-emerald-wide.jpg'),
  },

  // Edition II: Sindoora Mahal (Royal Red)
  {
    src: 'velvet_embossed_1795323939086.jpg',
    dest: path.join('wedding-royal-red-01', 'art', 'velvet-embossed.jpg'),
  },
  {
    src: 'mughal_scene_1795323950319.jpg',
    dest: path.join('wedding-royal-red-01', 'art', 'mughal-scene.jpg'),
  },
  {
    src: 'mughal_scene_wide_1795323915471.jpg',
    dest: path.join('wedding-royal-red-01', 'art', 'mughal-scene-wide.jpg'),
  },
  {
    src: 'ceremony_royal_wide_1795323906058.jpg',
    dest: path.join('weddings', 'art', 'ceremony-royal-wide.jpg'),
  },

  // Edition III: Grace Cathedral (Christian Ivory)
  {
    src: 'chapel_cover_1795342263479.jpg',
    dest: path.join('wedding-christian-ivory-01', 'art', 'chapel-cover.jpg'),
  },
  {
    src: 'chapel_scene_1795342280332.jpg',
    dest: path.join('wedding-christian-ivory-01', 'art', 'chapel-scene.jpg'),
  },
  {
    src: 'ceremony_christian_wide_1795342310916.jpg',
    dest: path.join('wedding-christian-ivory-01', 'art', 'chapel-scene-wide.jpg'),
  },
  {
    src: 'ceremony_christian_wide_1795342310916.jpg',
    dest: path.join('weddings', 'art', 'ceremony-christian-wide.jpg'),
  },

  // Edition IV: Neela Rajwada (Royal Blue)
  {
    src: 'indigo_doors_1795342283463.jpg',
    dest: path.join('wedding-royal-blue-01', 'art', 'indigo-doors.jpg'),
  },
  {
    src: 'jodhpur_scene_1795342306418.jpg',
    dest: path.join('wedding-royal-blue-01', 'art', 'jodhpur-scene.jpg'),
  },
  {
    src: 'ceremony_indigo_wide_1795342325668.jpg',
    dest: path.join('wedding-royal-blue-01', 'art', 'jodhpur-scene-wide.jpg'),
  },
  {
    src: 'ceremony_indigo_wide_1795342325668.jpg',
    dest: path.join('weddings', 'art', 'ceremony-indigo-wide.jpg'),
  },

  // Edition V: Kashi Swarna (Temple Gold)
  {
    src: 'kanjeevaram_cover_1795342291512.jpg',
    dest: path.join('wedding-temple-gold-01', 'art', 'kanjeevaram-cover.jpg'),
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: path.join('wedding-temple-gold-01', 'art', 'temple-gold-scene.jpg'),
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: path.join('wedding-temple-gold-01', 'art', 'temple-gold-scene-wide.jpg'),
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: path.join('weddings', 'art', 'ceremony-temple-wide.jpg'),
  },

  // Edition VI: Gulab Bagh (Rose Ivory)
  {
    src: 'rose_folio_cover_1795342293191.jpg',
    dest: path.join('wedding-rose-ivory-01', 'art', 'rose-folio-cover.jpg'),
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: path.join('wedding-rose-ivory-01', 'art', 'rose-palace-scene.jpg'),
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: path.join('wedding-rose-ivory-01', 'art', 'rose-palace-scene-wide.jpg'),
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: path.join('weddings', 'art', 'ceremony-rose-wide.jpg'),
  },

  // Storefront Atelier Hero
  {
    src: 'atelier_palace_hero_1795323929158.jpg',
    dest: path.join('weddings', 'art', 'atelier-palace-hero.jpg'),
  },

  // Occasion Product Bespoke Covers & Scenes
  {
    src: 'birthday_redesign_cover_v2_1795683876488.jpg',
    dest: path.join('occasions', 'birthday-confetti', 'cover.jpg'),
  },
  {
    src: 'birthday_ashirwad_01_v2_1795707997123.jpg',
    dest: path.join('occasions', 'birthday-ashirwad', 'cover.jpg'),
  },
  {
    src: 'will_you_01_cover_1795707706427.jpg',
    dest: path.join('occasions', 'will-you', 'cover.jpg'),
  },
  {
    src: 'our_timeline_01_1795707713007.jpg',
    dest: path.join('occasions', 'our-timeline', 'cover.jpg'),
  },
  {
    src: 'our_timeline_01_1795707713007.jpg',
    dest: path.join('occasions', 'our-timeline', 'scene.jpg'),
  },
  {
    src: 'maan_jao_01_1795707734325.jpg',
    dest: path.join('occasions', 'maan-jao', 'cover.jpg'),
  },
  {
    src: 'make_them_smile_01_cover_1795707681935.jpg',
    dest: path.join('occasions', 'make-them-smile', 'cover.jpg'),
  },
  {
    src: 'our_year_wrapped_cover_1795523997878.jpg',
    dest: path.join('occasions', 'our-year', 'cover.jpg'),
  },
  {
    src: 'portfolio_editorial_cover_v1_1795684448710.jpg',
    dest: path.join('occasions', 'portfolio', 'cover.jpg'),
  },
  {
    src: 'harvest_festival_greeting_final_1795524085413.jpg',
    dest: path.join('occasions', 'harvest-greeting', 'cover.jpg'),
  },
  {
    src: 'small_business_boutique_cover_v1_1795684460411.jpg',
    dest: path.join('occasions', 'small-business', 'cover.jpg'),
  },
  {
    src: 'business_greeting_luxury_artwork_1795523999390.jpg',
    dest: path.join('occasions', 'business-greeting', 'cover.jpg'),
  },

  // Pricing Page Editorial Art Plates
  {
    src: 'pricing_occasions_art_v1_1795693712913.jpg',
    dest: path.join('pricing', 'occasions-art.jpg'),
  },
  {
    src: 'pricing_weddings_art_v1_1795693759014.jpg',
    dest: path.join('pricing', 'weddings-art.jpg'),
  },
  {
    src: 'portfolio_editorial_cover_v1_1795684448710.jpg',
    dest: path.join('pricing', 'custom-made-art.jpg'),
  },
];

let copied = 0;
let alreadyPresent = 0;

for (const item of ARTWORK_MAP) {
  const targetPath = path.join(publicTemplatesDir, item.dest);
  const sourcePath = path.join(ARTIFACT_DIR, item.src);

  if (fs.existsSync(sourcePath)) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    copied += 1;
  } else if (fs.existsSync(targetPath)) {
    alreadyPresent += 1;
  }
}

if (copied > 0) {
  console.log(`[webzy] Synced ${copied} wedding artworks into apps/web/public/templates.`);
} else if (alreadyPresent === ARTWORK_MAP.length) {
  // All artworks already exist in public/templates (CI or already synced)
}
