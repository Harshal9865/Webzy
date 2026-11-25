import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR =
  process.env.WEBZY_ART_SOURCE_DIR ||
  'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\476f492d-d08f-42aa-8d1a-3cd7be448fe3';

const ARTWORK_MAP: Array<{ src: string; dest: string[] }> = [
  {
    src: 'doors_embossed_1795323943948.jpg',
    dest: ['wedding-emerald-01', 'art', 'doors-embossed.jpg'],
  },
  {
    src: 'jharokha_scene_1795323899350.jpg',
    dest: ['wedding-emerald-01', 'art', 'jharokha-scene.jpg'],
  },
  {
    src: 'jharokha_scene_wide_1795323912351.jpg',
    dest: ['wedding-emerald-01', 'art', 'jharokha-scene-wide.jpg'],
  },
  {
    src: 'ceremony_emerald_wide_1795323894041.jpg',
    dest: ['weddings', 'art', 'ceremony-emerald-wide.jpg'],
  },
  {
    src: 'velvet_embossed_1795323939086.jpg',
    dest: ['wedding-royal-red-01', 'art', 'velvet-embossed.jpg'],
  },
  {
    src: 'mughal_scene_1795323950319.jpg',
    dest: ['wedding-royal-red-01', 'art', 'mughal-scene.jpg'],
  },
  {
    src: 'mughal_scene_wide_1795323915471.jpg',
    dest: ['wedding-royal-red-01', 'art', 'mughal-scene-wide.jpg'],
  },
  {
    src: 'ceremony_royal_wide_1795323906058.jpg',
    dest: ['weddings', 'art', 'ceremony-royal-wide.jpg'],
  },
  {
    src: 'chapel_cover_1795342263479.jpg',
    dest: ['wedding-christian-ivory-01', 'art', 'chapel-cover.jpg'],
  },
  {
    src: 'chapel_scene_1795342280332.jpg',
    dest: ['wedding-christian-ivory-01', 'art', 'chapel-scene.jpg'],
  },
  {
    src: 'ceremony_christian_wide_1795342310916.jpg',
    dest: ['wedding-christian-ivory-01', 'art', 'chapel-scene-wide.jpg'],
  },
  {
    src: 'ceremony_christian_wide_1795342310916.jpg',
    dest: ['weddings', 'art', 'ceremony-christian-wide.jpg'],
  },
  {
    src: 'indigo_doors_1795342283463.jpg',
    dest: ['wedding-royal-blue-01', 'art', 'indigo-doors.jpg'],
  },
  {
    src: 'jodhpur_scene_1795342306418.jpg',
    dest: ['wedding-royal-blue-01', 'art', 'jodhpur-scene.jpg'],
  },
  {
    src: 'ceremony_indigo_wide_1795342325668.jpg',
    dest: ['wedding-royal-blue-01', 'art', 'jodhpur-scene-wide.jpg'],
  },
  {
    src: 'ceremony_indigo_wide_1795342325668.jpg',
    dest: ['weddings', 'art', 'ceremony-indigo-wide.jpg'],
  },
  {
    src: 'kanjeevaram_cover_1795342291512.jpg',
    dest: ['wedding-temple-gold-01', 'art', 'kanjeevaram-cover.jpg'],
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: ['wedding-temple-gold-01', 'art', 'temple-gold-scene.jpg'],
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: ['wedding-temple-gold-01', 'art', 'temple-gold-scene-wide.jpg'],
  },
  {
    src: 'temple_gold_scene_1795342344916.jpg',
    dest: ['weddings', 'art', 'ceremony-temple-wide.jpg'],
  },
  {
    src: 'rose_folio_cover_1795342293191.jpg',
    dest: ['wedding-rose-ivory-01', 'art', 'rose-folio-cover.jpg'],
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: ['wedding-rose-ivory-01', 'art', 'rose-palace-scene.jpg'],
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: ['wedding-rose-ivory-01', 'art', 'rose-palace-scene-wide.jpg'],
  },
  {
    src: 'rose_palace_scene_1795342317309.jpg',
    dest: ['weddings', 'art', 'ceremony-rose-wide.jpg'],
  },
  {
    src: 'atelier_palace_hero_1795323929158.jpg',
    dest: ['weddings', 'art', 'atelier-palace-hero.jpg'],
  },
  {
    src: 'birthday_confetti_keepsake_flatlay_final_1795524093976.jpg',
    dest: ['occasions', 'birthday-confetti', 'cover.jpg'],
  },
  {
    src: 'birthday_ashirwad_cover_1795410161724.jpg',
    dest: ['occasions', 'birthday-ashirwad', 'cover.jpg'],
  },
  {
    src: 'twilight_stationery_flatlay_1795524071530.jpg',
    dest: ['occasions', 'will-you', 'cover.jpg'],
  },
  {
    src: 'timeline_heart_tree_1795523941584.jpg',
    dest: ['occasions', 'our-timeline', 'cover.jpg'],
  },
  {
    src: 'timeline_heart_tree_1795523941584.jpg',
    dest: ['occasions', 'our-timeline', 'scene.jpg'],
  },
  {
    src: 'maan_jao_cover_1795523994195.jpg',
    dest: ['occasions', 'maan-jao', 'cover.jpg'],
  },
  {
    src: 'scrapbook_flatlay_fullbleed_1795524049203.jpg',
    dest: ['occasions', 'make-them-smile', 'cover.jpg'],
  },
  {
    src: 'our_year_wrapped_cover_1795523997878.jpg',
    dest: ['occasions', 'our-year', 'cover.jpg'],
  },
  {
    src: 'harvest_festival_greeting_final_1795524085413.jpg',
    dest: ['occasions', 'harvest-greeting', 'cover.jpg'],
  },
  {
    src: 'business_greeting_luxury_artwork_1795523999390.jpg',
    dest: ['occasions', 'business-greeting', 'cover.jpg'],
  },
];

let syncedThisProcess = false;

function resolvePublicTemplatesDir(): string {
  const cwd = process.cwd();
  const direct = path.join(cwd, 'public', 'templates');
  if (fs.existsSync(path.join(cwd, 'public'))) {
    return direct;
  }
  return path.join(cwd, 'apps', 'web', 'public', 'templates');
}

export function ensureWeddingArtSynced(): void {
  if (syncedThisProcess) return;
  try {
    const publicTemplatesDir = resolvePublicTemplatesDir();
    for (const item of ARTWORK_MAP) {
      const targetPath = path.join(publicTemplatesDir, ...item.dest);
      const sourcePath = path.join(ARTIFACT_DIR, item.src);
      if (!fs.existsSync(sourcePath)) continue;
      const srcSize = fs.statSync(sourcePath).size;
      const destExists = fs.existsSync(targetPath);
      const destSize = destExists ? fs.statSync(targetPath).size : -1;
      if (!destExists || destSize !== srcSize) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
    syncedThisProcess = true;
  } catch {
    // Non-fatal in read-only or edge environments
  }
}
