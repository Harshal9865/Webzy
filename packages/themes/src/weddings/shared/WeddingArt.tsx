'use client';

import React, { useId } from 'react';
import type { WeddingThemeKey } from '../schema';

interface WeddingArtProps {
  theme?: WeddingThemeKey;
  className?: string;
}

interface WideWeddingArtProps extends WeddingArtProps {
  wide?: boolean;
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Illustrated Golden Temple (Swarna Mandir) Foreground Scene
 * Renders a layered, sunlit/diya-lit temple with tiered shikhara tower,
 * fluted lotus dome, flanking chhatri pavilions, marble ghat steps,
 * cypress trees, marigold flower beds, and softly flickering brass diyas.
 * Pass `wide` on tablet/desktop screens for a panoramic courtyard horizon
 * with outer garden chhatri pavilions, lotus parterres, and cypress groves.
 */
export function GoldenTempleScene({
  theme = 'emerald',
  className = '',
  wide = false,
}: WideWeddingArtProps) {
  const uid = sanitizeId(useId());
  const isEmerald = theme === 'emerald';

  const palette = isEmerald
    ? {
        haloInner: '#FFF4C4',
        haloMid: '#E8C568',
        rayColor: '#D8B04A',
        goldLight: '#FFF0B8',
        goldMid: '#E0B44B',
        goldDeep: '#A67B22',
        goldShadow: '#7A5612',
        sanctumGlow: '#FFF2BD',
        sanctumDark: '#4D3612',
        marbleTop: '#FFFDF7',
        marbleMid: '#F5EFE2',
        marbleEdge: '#DECFA8',
        cypressDark: '#26422E',
        cypressMid: '#395C43',
        cypressRim: '#6B8B6C',
        marigoldBright: '#F4A933',
        marigoldDeep: '#DC7D1E',
        marigoldLeaf: '#4D7352',
        diyaBrass: '#D49F34',
        diyaShadow: '#8B5F14',
        flameOuter: '#FF9E2C',
        flameInner: '#FFF7C2',
        strokeTone: '#8C6419',
      }
    : {
        haloInner: '#FFE8A3',
        haloMid: '#D49A2A',
        rayColor: '#F3CB6B',
        goldLight: '#FFF2BE',
        goldMid: '#E5B94E',
        goldDeep: '#9E6E19',
        goldShadow: '#613D09',
        sanctumGlow: '#FFE699',
        sanctumDark: '#2A050B',
        marbleTop: '#6A1422',
        marbleMid: '#480A15',
        marbleEdge: '#C79B3B',
        cypressDark: '#1F0409',
        cypressMid: '#370912',
        cypressRim: '#9C7329',
        marigoldBright: '#F6B138',
        marigoldDeep: '#D6781C',
        marigoldLeaf: '#2E4C34',
        diyaBrass: '#E8BC52',
        diyaShadow: '#8F5F11',
        flameOuter: '#FFA22B',
        flameInner: '#FFF8C7',
        strokeTone: '#522F07',
      };

  const haloGradId = `temple-halo-${uid}`;
  const goldGradId = `temple-gold-${uid}`;
  const goldVertId = `temple-gold-v-${uid}`;
  const sanctumGradId = `temple-sanctum-${uid}`;
  const plinthGradId = `temple-plinth-${uid}`;
  const flameGlowId = `temple-flame-${uid}`;

  const centralTempleLayers = (
    <>
      {/* Layer 1: Radiant Sunlit / Moonlit Sacred Halo & Subtle Rays Behind Central Dome */}
      <circle cx="240" cy="96" r="112" fill={`url(#${haloGradId})`} />
      <g opacity={isEmerald ? 0.34 : 0.24} stroke={palette.rayColor} strokeWidth="0.9" strokeLinecap="round">
        <line x1="240" y1="6" x2="240" y2="22" />
        <line x1="196" y1="18" x2="205" y2="36" />
        <line x1="284" y1="18" x2="275" y2="36" />
        <line x1="158" y1="42" x2="174" y2="56" />
        <line x1="322" y1="42" x2="306" y2="56" />
        <line x1="134" y1="76" x2="154" y2="83" />
        <line x1="346" y1="76" x2="326" y2="83" />
      </g>

      {/* Layer 2: Flanking Slender Cypress Trees (Left & Right) */}
      <g opacity="0.92">
        {/* Far Left Cypress Pair */}
        <path
          d="M28 190 C19 162, 18 122, 29 90 C39 122, 39 162, 32 190 Z"
          fill={palette.cypressDark}
        />
        <path
          d="M29 90 C34 120, 34 160, 30 190"
          stroke={palette.cypressRim}
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <path
          d="M52 190 C44 168, 44 136, 53 110 C61 136, 61 168, 55 190 Z"
          fill={palette.cypressMid}
        />
        {/* Far Right Cypress Pair */}
        <path
          d="M452 190 C443 162, 442 122, 451 90 C462 122, 461 162, 454 190 Z"
          fill={palette.cypressDark}
        />
        <path
          d="M451 90 C446 120, 446 160, 450 190"
          stroke={palette.cypressRim}
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <path
          d="M428 190 C420 168, 420 136, 427 110 C436 136, 436 168, 430 190 Z"
          fill={palette.cypressMid}
        />
      </g>

      {/* Layer 3: Connecting Courtyard Walls & Recessed Temple Arches */}
      <g>
        <rect
          x="74"
          y="142"
          width="332"
          height="46"
          fill={`url(#${plinthGradId})`}
          stroke={palette.goldDeep}
          strokeWidth="1"
        />
        {/* Courtyard Balustrade Gold Rail */}
        <rect x="70" y="138" width="340" height="4.5" rx="1.5" fill={`url(#${goldGradId})`} />
        <line x1="74" y1="147" x2="406" y2="147" stroke={palette.goldMid} strokeWidth="0.7" strokeOpacity="0.6" />

        {/* Courtyard Left & Right Recessed Cusped Arches */}
        {[128, 154, 326, 352].map((cx) => (
          <g key={cx}>
            <path
              d={`M${cx - 9} 188 L${cx - 9} 162 C${cx - 9} 156, ${cx - 4} 154, ${cx} 151 C${cx + 4} 154, ${cx + 9} 156, ${cx + 9} 162 L${cx + 9} 188 Z`}
              fill={palette.sanctumDark}
              fillOpacity={isEmerald ? 0.16 : 0.55}
              stroke={palette.goldDeep}
              strokeWidth="0.85"
            />
          </g>
        ))}
      </g>

      {/* Layer 4: Flanking Side Chhatri Pavilions (Left x=94, Right x=386) */}
      {[94, 386].map((cx) => (
        <g key={cx}>
          {/* Chhatri Kalash Finial */}
          <line x1={cx} y1="78" x2={cx} y2="88" stroke={palette.goldLight} strokeWidth="1.2" />
          <circle cx={cx} cy="81" r="2.2" fill={palette.goldLight} stroke={palette.goldDeep} strokeWidth="0.6" />
          <ellipse cx={cx} cy="86" rx="3.4" ry="2.2" fill={`url(#${goldGradId})`} />
          {/* Inverted Lotus Petal Collar */}
          <path
            d={`M${cx - 10} 92 Q${cx} 87 ${cx + 10} 92 Z`}
            fill={palette.goldLight}
            stroke={palette.goldDeep}
            strokeWidth="0.6"
          />
          {/* Fluted Side Onion Dome */}
          <path
            d={`M${cx - 22} 112 C${cx - 23} 98, ${cx - 11} 92, ${cx} 89 C${cx + 11} 92, ${cx + 23} 98, ${cx + 22} 112 Z`}
            fill={`url(#${goldGradId})`}
            stroke={palette.strokeTone}
            strokeWidth="0.8"
          />
          {/* Dome Rib Lines */}
          <path
            d={`M${cx - 10} 112 C${cx - 10} 100, ${cx - 5} 94, ${cx} 90 M${cx + 10} 112 C${cx + 10} 100, ${cx + 5} 94, ${cx} 90 M${cx} 90 L${cx} 112`}
            stroke={palette.goldShadow}
            strokeWidth="0.55"
            strokeOpacity="0.45"
          />
          {/* Curved Chhatri Chhajja (Eaves) */}
          <path
            d={`M${cx - 29} 117 L${cx - 22} 112 L${cx + 22} 112 L${cx + 29} 117 Z`}
            fill={`url(#${goldVertId})`}
            stroke={palette.strokeTone}
            strokeWidth="0.7"
          />
          {/* Pavilion Interior & Arch */}
          <rect
            x={cx - 21}
            y="117"
            width="42"
            height="71"
            fill={`url(#${plinthGradId})`}
            stroke={palette.goldDeep}
            strokeWidth="0.9"
          />
          <path
            d={`M${cx - 12} 188 L${cx - 12} 135 C${cx - 12} 128, ${cx - 5} 125, ${cx} 122 C${cx + 5} 125, ${cx + 12} 128, ${cx + 12} 135 L${cx + 12} 188 Z`}
            fill={`url(#${sanctumGradId})`}
            fillOpacity={isEmerald ? 0.52 : 0.72}
            stroke={palette.goldMid}
            strokeWidth="0.9"
          />
          {/* Slender Chhatri Columns */}
          <rect x={cx - 19} y="117" width="4" height="71" fill={`url(#${goldGradId})`} opacity="0.85" />
          <rect x={cx + 15} y="117" width="4" height="71" fill={`url(#${goldGradId})`} opacity="0.85" />
        </g>
      ))}

      {/* Layer 5: Central Majestic Swarna Mandir (Golden Temple Sanctum & Shikhara) */}
      <g>
        {/* Spire Kalash & Sacred Dhwaja (Temple Flag) */}
        <line x1="240" y1="18" x2="240" y2="38" stroke={palette.goldLight} strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M240 20 L256 24.5 L240 29 Z"
          fill={palette.marigoldBright}
          stroke={palette.goldLight}
          strokeWidth="0.6"
        />
        <circle cx="240" cy="30" r="2.6" fill={palette.goldLight} stroke={palette.goldDeep} strokeWidth="0.7" />
        <ellipse cx="240" cy="36" rx="5" ry="3.2" fill={`url(#${goldGradId})`} stroke={palette.strokeTone} strokeWidth="0.6" />
        {/* Amalaka Fluted Crown Disk */}
        <ellipse cx="240" cy="41.5" rx="9" ry="3" fill={`url(#${goldGradId})`} stroke={palette.strokeTone} strokeWidth="0.65" />

        {/* Upper Fluted Lotus Dome */}
        <path
          d="M206 76 C204 56, 222 47, 240 42 C258 47, 276 56, 274 76 Z"
          fill={`url(#${goldGradId})`}
          stroke={palette.strokeTone}
          strokeWidth="0.95"
        />
        {/* Fluted Lotus Dome Ribs */}
        <path
          d="M218 76 C218 59, 228 49, 240 43 M229 76 C229 59, 234 49, 240 43 M240 43 L240 76 M251 76 C251 59, 246 49, 240 43 M262 76 C262 59, 252 49, 240 43"
          stroke={palette.goldShadow}
          strokeWidth="0.65"
          strokeOpacity="0.48"
        />
        {/* Lotus Petal Crown Band around Dome Base */}
        <path
          d="M204 76 Q210 70 216 76 Q222 70 228 76 Q234 70 240 76 Q246 70 252 76 Q258 70 264 76 Q270 70 276 76"
          fill={palette.goldLight}
          fillOpacity="0.55"
          stroke={palette.goldDeep}
          strokeWidth="0.7"
        />

        {/* Tiered Shikhara Cornice & Miniature Side Turrets */}
        <rect
          x="196"
          y="76"
          width="88"
          height="10"
          rx="1.5"
          fill={`url(#${goldVertId})`}
          stroke={palette.strokeTone}
          strokeWidth="0.8"
        />
        {/* Flanking Mini Golden Kalash Turrets on Temple Roof */}
        {[184, 296].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1="74" x2={tx} y2="81" stroke={palette.goldLight} strokeWidth="1" />
            <circle cx={tx} cy="76.5" r="1.6" fill={palette.goldLight} />
            <path
              d={`M${tx - 10} 96 C${tx - 10} 86, ${tx - 4} 82, ${tx} 80 C${tx + 4} 82, ${tx + 10} 86, ${tx + 10} 96 Z`}
              fill={`url(#${goldGradId})`}
              stroke={palette.strokeTone}
              strokeWidth="0.7"
            />
          </g>
        ))}

        {/* Second Tier Carved Golden Facade */}
        <rect
          x="182"
          y="86"
          width="116"
          height="20"
          fill={`url(#${goldGradId})`}
          stroke={palette.strokeTone}
          strokeWidth="0.85"
        />
        {/* Decorative Mini Arches Across Upper Tier */}
        {[196, 214, 240, 266, 284].map((ax) => (
          <path
            key={ax}
            d={`M${ax - 5.5} 106 L${ax - 5.5} 95 C${ax - 5.5} 92, ${ax - 2} 91, ${ax} 89.5 C${ax + 2} 91, ${ax + 5.5} 92, ${ax + 5.5} 95 L${ax + 5.5} 106 Z`}
            fill={palette.sanctumDark}
            fillOpacity={isEmerald ? 0.25 : 0.5}
            stroke={palette.goldLight}
            strokeWidth="0.65"
          />
        ))}

        {/* Grand Overhanging Temple Chhajja (Cornice Eaves) */}
        <path
          d="M166 113 L178 106 L302 106 L314 113 Z"
          fill={`url(#${goldVertId})`}
          stroke={palette.strokeTone}
          strokeWidth="0.85"
        />

        {/* Main Sanctum Facade Structure */}
        <rect
          x="174"
          y="113"
          width="132"
          height="75"
          fill={`url(#${plinthGradId})`}
          stroke={palette.goldDeep}
          strokeWidth="1"
        />
        {/* Gold Facade Pilasters */}
        <rect x="176" y="113" width="8" height="75" fill={`url(#${goldGradId})`} />
        <rect x="296" y="113" width="8" height="75" fill={`url(#${goldGradId})`} />
        <rect x="200" y="113" width="5" height="75" fill={`url(#${goldGradId})`} opacity="0.88" />
        <rect x="275" y="113" width="5" height="75" fill={`url(#${goldGradId})`} opacity="0.88" />

        {/* Central Grand Cusped Rajputana Temple Arch & Glowing Sanctum */}
        <path
          d="M210 188 L210 140 C210 130, 219 125, 227 122 C233 120, 237 118, 240 115 C243 118, 247 120, 253 122 C261 125, 270 130, 270 140 L270 188 Z"
          fill={`url(#${sanctumGradId})`}
          stroke={palette.goldMid}
          strokeWidth="1.4"
        />
        {/* Inner Delicate Arch Border */}
        <path
          d="M215 188 L215 142 C215 134, 222 129, 229 126.5 C234 125, 237.5 123, 240 120.5 C242.5 123, 246 125, 251 126.5 C258 129, 265 134, 265 142 L265 188"
          stroke={palette.goldLight}
          strokeWidth="0.8"
          strokeOpacity="0.85"
          fill="none"
        />
        {/* Hanging Sacred Temple Bell inside Sanctum Arch */}
        <line x1="240" y1="120.5" x2="240" y2="134" stroke={palette.goldLight} strokeWidth="0.9" />
        <path
          d="M235.5 141 C235.5 136, 238 134, 240 134 C242 134, 244.5 136, 244.5 141 Z"
          fill={palette.goldLight}
          stroke={palette.goldDeep}
          strokeWidth="0.6"
        />
        <circle cx="240" cy="142.5" r="1.2" fill={palette.goldLight} />

        {/* Side Niche Arches inside Main Facade */}
        {[192, 288].map((nx) => (
          <path
            key={nx}
            d={`M${nx - 5.5} 188 L${nx - 5.5} 148 C${nx - 5.5} 144, ${nx - 2} 142, ${nx} 140 C${nx + 2} 142, ${nx + 5.5} 144, ${nx + 5.5} 148 L${nx + 5.5} 188 Z`}
            fill={palette.sanctumDark}
            fillOpacity={isEmerald ? 0.18 : 0.58}
            stroke={palette.goldMid}
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* Layer 6: Marble Temple Steps & Terrace Plinth */}
      <g>
        <rect x="40" y="188" width="400" height="8" fill={`url(#${plinthGradId})`} stroke={palette.marbleEdge} strokeWidth="0.8" />
        <rect x="24" y="196" width="432" height="9" fill={palette.marbleMid} stroke={palette.marbleEdge} strokeWidth="0.8" />
        <rect x="8" y="205" width="464" height="12" fill={palette.marbleTop} stroke={palette.marbleEdge} strokeWidth="0.7" />
        {/* Central Marble Stair Runner */}
        <path d="M208 188 L272 188 L280 217 L200 217 Z" fill={palette.marbleTop} fillOpacity={isEmerald ? 0.85 : 0.28} />
        <line x1="206" y1="196" x2="274" y2="196" stroke={palette.goldMid} strokeWidth="0.9" strokeOpacity="0.65" />
        <line x1="203" y1="205" x2="277" y2="205" stroke={palette.goldMid} strokeWidth="0.9" strokeOpacity="0.55" />
        <line x1="200" y1="214" x2="280" y2="214" stroke={palette.goldMid} strokeWidth="0.8" strokeOpacity="0.45" />
      </g>

      {/* Layer 7: Marigold Flower Beds Along Terrace Plinth */}
      <g>
        {[
          { x: 64, y: 187 },
          { x: 76, y: 185 },
          { x: 88, y: 187 },
          { x: 112, y: 187 },
          { x: 124, y: 186 },
          { x: 146, y: 187 },
          { x: 334, y: 187 },
          { x: 356, y: 186 },
          { x: 368, y: 187 },
          { x: 392, y: 187 },
          { x: 404, y: 185 },
          { x: 416, y: 187 },
        ].map((flower, idx) => (
          <g key={idx}>
            <ellipse
              cx={flower.x}
              cy={flower.y + 1.5}
              rx="6.5"
              ry="2.6"
              fill={palette.marigoldLeaf}
              opacity="0.85"
            />
            <circle cx={flower.x - 2.2} cy={flower.y - 0.5} r="2.7" fill={palette.marigoldDeep} />
            <circle cx={flower.x + 2.2} cy={flower.y - 0.5} r="2.5" fill={palette.marigoldBright} />
            <circle cx={flower.x} cy={flower.y - 2} r="2.6" fill={palette.marigoldBright} />
            <circle cx={flower.x} cy={flower.y - 2} r="1" fill="#FFF3B8" />
          </g>
        ))}
      </g>

      {/* Layer 8: Two Softly Flickering Foreground Brass Diyas (Left & Right of Central Steps) */}
      {[178, 302].map((dx) => (
        <g key={dx}>
          {/* Ambient Diya Glow Halo */}
          <circle
            cx={dx}
            cy="184"
            r="16"
            fill={`url(#${flameGlowId})`}
            style={{
              transformOrigin: `${dx}px 186px`,
              animation: 'weddingDiyaFlicker 2.8s ease-in-out infinite',
            }}
          />
          {/* Flickering Layered Flame */}
          <g
            style={{
              transformOrigin: `${dx}px 190px`,
              animation: 'weddingDiyaFlicker 2.4s ease-in-out infinite',
            }}
          >
            <path
              d={`M${dx} 175 C${dx + 3.6} 180.5, ${dx + 4} 185, ${dx} 189.5 C${dx - 4} 185, ${dx - 3.6} 180.5, ${dx} 175 Z`}
              fill={palette.flameOuter}
            />
            <path
              d={`M${dx} 179.5 C${dx + 1.9} 182.8, ${dx + 2.1} 185.5, ${dx} 188.5 C${dx - 2.1} 185.5, ${dx - 1.9} 182.8, ${dx} 179.5 Z`}
              fill={palette.flameInner}
            />
          </g>
          {/* Ornate Brass Diya Lamp Bowl & Pedestal */}
          <path
            d={`M${dx - 11} 190 Q${dx} 192.5 ${dx + 11} 190 C${dx + 9} 196, ${dx + 5} 198.5, ${dx} 198.5 C${dx - 5} 198.5, ${dx - 9} 196, ${dx - 11} 190 Z`}
            fill={palette.diyaBrass}
            stroke={palette.diyaShadow}
            strokeWidth="0.7"
          />
          <rect x={dx - 4} y="198.5" width="8" height="2.4" rx="1" fill={palette.diyaShadow} />
          <ellipse cx={dx} cy="202" rx="7.5" ry="1.8" fill={palette.diyaBrass} />
        </g>
      ))}
    </>
  );

  const svgDefs = (
    <defs>
      <radialGradient id={haloGradId} cx="50%" cy="48%" r="48%">
        <stop offset="0%" stopColor={palette.haloInner} stopOpacity={isEmerald ? 0.85 : 0.42} />
        <stop offset="48%" stopColor={palette.haloMid} stopOpacity={isEmerald ? 0.28 : 0.16} />
        <stop offset="100%" stopColor={palette.haloMid} stopOpacity="0" />
      </radialGradient>

      <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={palette.goldDeep} />
        <stop offset="28%" stopColor={palette.goldMid} />
        <stop offset="52%" stopColor={palette.goldLight} />
        <stop offset="78%" stopColor={palette.goldMid} />
        <stop offset="100%" stopColor={palette.goldShadow} />
      </linearGradient>

      <linearGradient id={goldVertId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.goldLight} />
        <stop offset="45%" stopColor={palette.goldMid} />
        <stop offset="100%" stopColor={palette.goldDeep} />
      </linearGradient>

      <radialGradient id={sanctumGradId} cx="50%" cy="62%" r="60%">
        <stop offset="0%" stopColor={palette.sanctumGlow} stopOpacity="0.95" />
        <stop offset="55%" stopColor={palette.goldMid} stopOpacity="0.45" />
        <stop offset="100%" stopColor={palette.sanctumDark} stopOpacity="0.92" />
      </radialGradient>

      <linearGradient id={plinthGradId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.marbleTop} />
        <stop offset="100%" stopColor={palette.marbleMid} />
      </linearGradient>

      <radialGradient id={flameGlowId} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={palette.flameInner} stopOpacity="0.95" />
        <stop offset="45%" stopColor={palette.flameOuter} stopOpacity="0.45" />
        <stop offset="100%" stopColor={palette.flameOuter} stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  if (!wide) {
    return (
      <svg
        viewBox="0 0 480 226"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto block select-none ${className}`}
        aria-hidden="true"
      >
        {svgDefs}
        {centralTempleLayers}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto block select-none ${className}`}
      aria-hidden="true"
    >
      {svgDefs}

      {/* Panoramic Radiant Horizon Halo Behind Entire Palace Complex */}
      <ellipse cx="600" cy="126" rx="340" ry="132" fill={`url(#${haloGradId})`} opacity="0.88" />
      <g opacity={isEmerald ? 0.22 : 0.16} stroke={palette.rayColor} strokeWidth="0.9" strokeLinecap="round">
        <line x1="418" y1="54" x2="452" y2="78" />
        <line x1="782" y1="54" x2="748" y2="78" />
        <line x1="348" y1="106" x2="394" y2="118" />
        <line x1="852" y1="106" x2="806" y2="118" />
        <line x1="290" y1="158" x2="342" y2="162" />
        <line x1="910" y1="158" x2="858" y2="162" />
      </g>

      {/* Outer Flanking Tall Cypress Groves (Left & Right Palace Gardens) */}
      <g opacity="0.88">
        {[
          { x: 38, top: 108, w: 12 },
          { x: 66, top: 126, w: 10 },
          { x: 96, top: 142, w: 9 },
          { x: 274, top: 118, w: 11 },
          { x: 304, top: 136, w: 9.5 },
          { x: 896, top: 136, w: 9.5 },
          { x: 926, top: 118, w: 11 },
          { x: 1104, top: 142, w: 9 },
          { x: 1134, top: 126, w: 10 },
          { x: 1162, top: 108, w: 12 },
        ].map((tree, idx) => (
          <g key={idx}>
            <path
              d={`M${tree.x - tree.w * 0.15} 214 C${tree.x - tree.w} 184, ${tree.x - tree.w * 0.9} ${tree.top + 32}, ${tree.x} ${tree.top} C${tree.x + tree.w * 0.9} ${tree.top + 32}, ${tree.x + tree.w} 184, ${tree.x + tree.w * 0.15} 214 Z`}
              fill={idx % 2 === 0 ? palette.cypressDark : palette.cypressMid}
            />
            <path
              d={`M${tree.x} ${tree.top} C${tree.x + (tree.x < 600 ? 3.5 : -3.5)} ${tree.top + 36}, ${tree.x + (tree.x < 600 ? 3 : -3)} 180, ${tree.x} 214`}
              stroke={palette.cypressRim}
              strokeWidth="0.85"
              strokeOpacity="0.4"
            />
          </g>
        ))}
      </g>

      {/* Extended Left & Right Sandstone/Marble Palace Courtyard Colonnade Wings */}
      <g>
        {/* Left Arcade Wing */}
        <rect
          x="104"
          y="174"
          width="334"
          height="40"
          fill={`url(#${plinthGradId})`}
          stroke={palette.goldDeep}
          strokeWidth="0.95"
        />
        <rect x="98" y="170" width="340" height="4" rx="1.5" fill={`url(#${goldGradId})`} />
        <line x1="104" y1="179" x2="434" y2="179" stroke={palette.goldMid} strokeWidth="0.65" strokeOpacity="0.55" />

        {/* Right Arcade Wing */}
        <rect
          x="762"
          y="174"
          width="334"
          height="40"
          fill={`url(#${plinthGradId})`}
          stroke={palette.goldDeep}
          strokeWidth="0.95"
        />
        <rect x="762" y="170" width="340" height="4" rx="1.5" fill={`url(#${goldGradId})`} />
        <line x1="766" y1="179" x2="1096" y2="179" stroke={palette.goldMid} strokeWidth="0.65" strokeOpacity="0.55" />

        {/* Recessed Cusped Rajputana Courtyard Arches Across Both Wings */}
        {[128, 152, 232, 260, 326, 354, 382, 818, 846, 874, 940, 968, 1048, 1072].map((cx) => (
          <path
            key={cx}
            d={`M${cx - 8} 214 L${cx - 8} 192 C${cx - 8} 187, ${cx - 3.5} 185, ${cx} 182.5 C${cx + 3.5} 185, ${cx + 8} 187, ${cx + 8} 192 L${cx + 8} 214 Z`}
            fill={palette.sanctumDark}
            fillOpacity={isEmerald ? 0.14 : 0.52}
            stroke={palette.goldDeep}
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* Outer Flanking Garden Chhatri Pavilions (Left x=192, Right x=1008) */}
      {[192, 1008].map((cx) => (
        <g key={cx}>
          {/* Kalash Finial */}
          <line x1={cx} y1="112" x2={cx} y2="122" stroke={palette.goldLight} strokeWidth="1.15" />
          <circle cx={cx} cy="115" r="2" fill={palette.goldLight} stroke={palette.goldDeep} strokeWidth="0.55" />
          <ellipse cx={cx} cy="120" rx="3" ry="2" fill={`url(#${goldGradId})`} />
          {/* Inverted Lotus Collar */}
          <path
            d={`M${cx - 9} 126 Q${cx} 121.5 ${cx + 9} 126 Z`}
            fill={palette.goldLight}
            stroke={palette.goldDeep}
            strokeWidth="0.55"
          />
          {/* Fluted Garden Onion Dome */}
          <path
            d={`M${cx - 20} 145 C${cx - 21} 132, ${cx - 10} 126, ${cx} 123 C${cx + 10} 126, ${cx + 21} 132, ${cx + 20} 145 Z`}
            fill={`url(#${goldGradId})`}
            stroke={palette.strokeTone}
            strokeWidth="0.75"
          />
          <path
            d={`M${cx - 9} 145 C${cx - 9} 134, ${cx - 4.5} 128, ${cx} 124 M${cx + 9} 145 C${cx + 9} 134, ${cx + 4.5} 128, ${cx} 124 M${cx} 124 L${cx} 145`}
            stroke={palette.goldShadow}
            strokeWidth="0.5"
            strokeOpacity="0.45"
          />
          {/* Curved Chhajja Eaves */}
          <path
            d={`M${cx - 26} 150 L${cx - 20} 145 L${cx + 20} 145 L${cx + 26} 150 Z`}
            fill={`url(#${goldVertId})`}
            stroke={palette.strokeTone}
            strokeWidth="0.65"
          />
          {/* Garden Pavilion Body & Warm Glowing Arch */}
          <rect
            x={cx - 19}
            y="150"
            width="38"
            height="64"
            fill={`url(#${plinthGradId})`}
            stroke={palette.goldDeep}
            strokeWidth="0.85"
          />
          <path
            d={`M${cx - 10.5} 214 L${cx - 10.5} 166 C${cx - 10.5} 160, ${cx - 4.5} 157, ${cx} 154.5 C${cx + 4.5} 157, ${cx + 10.5} 160, ${cx + 10.5} 166 L${cx + 10.5} 214 Z`}
            fill={`url(#${sanctumGradId})`}
            fillOpacity={isEmerald ? 0.48 : 0.68}
            stroke={palette.goldMid}
            strokeWidth="0.85"
          />
          {/* Slender Pavilion Columns */}
          <rect x={cx - 17} y="150" width="3.5" height="64" fill={`url(#${goldGradId})`} opacity="0.82" />
          <rect x={cx + 13.5} y="150" width="3.5" height="64" fill={`url(#${goldGradId})`} opacity="0.82" />
        </g>
      ))}

      {/* Extended Full-Width Panoramic Marble Ghat Steps & Lotus Reflection Terrace */}
      <g>
        <rect x="24" y="214" width="1152" height="8" fill={`url(#${plinthGradId})`} stroke={palette.marbleEdge} strokeWidth="0.75" />
        <rect x="0" y="222" width="1200" height="9" fill={palette.marbleMid} stroke={palette.marbleEdge} strokeWidth="0.75" />
        <rect x="0" y="231" width="1200" height="12" fill={palette.marbleTop} stroke={palette.marbleEdge} strokeWidth="0.7" />
        <rect x="0" y="243" width="1200" height="17" fill={palette.marbleMid} fillOpacity="0.6" />
        <line x1="0" y1="243" x2="1200" y2="243" stroke={palette.goldMid} strokeWidth="0.7" strokeOpacity="0.35" />
      </g>

      {/* Panoramic Lotus & Marigold Garden Parterre Beds Along Outer Terrace Wings */}
      <g>
        {[
          { x: 64, y: 213 },
          { x: 82, y: 212 },
          { x: 118, y: 213 },
          { x: 140, y: 212 },
          { x: 222, y: 213 },
          { x: 282, y: 213 },
          { x: 304, y: 212 },
          { x: 332, y: 213 },
          { x: 868, y: 213 },
          { x: 896, y: 212 },
          { x: 918, y: 213 },
          { x: 978, y: 213 },
          { x: 1060, y: 212 },
          { x: 1082, y: 213 },
          { x: 1118, y: 212 },
          { x: 1136, y: 213 },
        ].map((flower, idx) => (
          <g key={idx}>
            <ellipse
              cx={flower.x}
              cy={flower.y + 1.5}
              rx="7.5"
              ry="2.6"
              fill={palette.marigoldLeaf}
              opacity="0.82"
            />
            <circle cx={flower.x - 2.4} cy={flower.y - 0.5} r="2.7" fill={palette.marigoldDeep} />
            <circle cx={flower.x + 2.4} cy={flower.y - 0.5} r="2.5" fill={palette.marigoldBright} />
            <circle cx={flower.x} cy={flower.y - 2} r="2.6" fill={palette.marigoldBright} />
            <circle cx={flower.x} cy={flower.y - 2} r="1" fill="#FFF3B8" />
          </g>
        ))}

        {/* Stylized Blooming Lotus Accents Along Lower Forecourt */}
        {[156, 316, 884, 1044].map((lx) => (
          <g key={lx} opacity={isEmerald ? 0.78 : 0.72}>
            <ellipse cx={lx} cy="237" rx="11" ry="2.6" fill={palette.marigoldLeaf} opacity="0.65" />
            <path
              d={`M${lx - 7} 236 C${lx - 5} 231, ${lx - 2} 230, ${lx} 232 C${lx + 2} 230, ${lx + 5} 231, ${lx + 7} 236 Z`}
              fill={isEmerald ? '#F5C4CE' : '#F4C97E'}
              stroke={palette.goldDeep}
              strokeWidth="0.5"
            />
            <path
              d={`M${lx - 3} 236 C${lx - 2} 229, ${lx} 227.5, ${lx} 227.5 C${lx} 227.5, ${lx + 2} 229, ${lx + 3} 236 Z`}
              fill={isEmerald ? '#FFE7EC' : '#FFF1C2'}
            />
          </g>
        ))}
      </g>

      {/* Two Outer Softly Flickering Brass Courtyard Diyas (x=250, x=950) */}
      {[250, 950].map((dx) => (
        <g key={dx}>
          <circle
            cx={dx}
            cy="210"
            r="14"
            fill={`url(#${flameGlowId})`}
            style={{
              transformOrigin: `${dx}px 212px`,
              animation: 'weddingDiyaFlicker 3.1s ease-in-out infinite',
            }}
          />
          <g
            style={{
              transformOrigin: `${dx}px 216px`,
              animation: 'weddingDiyaFlicker 2.7s ease-in-out infinite',
            }}
          >
            <path
              d={`M${dx} 202 C${dx + 3.2} 207, ${dx + 3.6} 211, ${dx} 215.5 C${dx - 3.6} 211, ${dx - 3.2} 207, ${dx} 202 Z`}
              fill={palette.flameOuter}
            />
            <path
              d={`M${dx} 206 C${dx + 1.6} 209, ${dx + 1.8} 211.5, ${dx} 214.5 C${dx - 1.8} 211.5, ${dx - 1.6} 209, ${dx} 206 Z`}
              fill={palette.flameInner}
            />
          </g>
          <path
            d={`M${dx - 9.5} 216 Q${dx} 218.2 ${dx + 9.5} 216 C${dx + 8} 221, ${dx + 4.5} 223.5, ${dx} 223.5 C${dx - 4.5} 223.5, ${dx - 8} 221, ${dx - 9.5} 216 Z`}
            fill={palette.diyaBrass}
            stroke={palette.diyaShadow}
            strokeWidth="0.65"
          />
          <rect x={dx - 3.5} y="223.5" width="7" height="2" rx="1" fill={palette.diyaShadow} />
          <ellipse cx={dx} cy="226.5" rx="6.5" ry="1.5" fill={palette.diyaBrass} />
        </g>
      ))}

      {/* Central Majestic Swarna Mandir Core Seated Seamlessly on Panoramic Plinth */}
      <g transform="translate(360, 26)">{centralTempleLayers}</g>
    </svg>
  );
}

/**
 * Traditional Hindu Bandanwar Toran (Mango Leaves & Marigold Garlands)
 * Drapes gently across the upper corners without crowding center text.
 * Pass `wide` on tablet/desktop screens for a graceful panoramic 5-arch drape.
 */
export function MarigoldToran({
  theme = 'emerald',
  className = '',
  wide = false,
}: WideWeddingArtProps) {
  if (theme === 'christian-ivory') {
    if (wide) {
      const leftLilies = [
        { x: 32, y: 12 },
        { x: 68, y: 21 },
        { x: 108, y: 26 },
        { x: 148, y: 24 },
        { x: 188, y: 16 },
        { x: 224, y: 8 },
        { x: 274, y: 17 },
        { x: 324, y: 22 },
        { x: 374, y: 17 },
        { x: 424, y: 9 },
      ];
      const rightLilies = leftLilies.map((p) => ({ x: 1200 - p.x, y: p.y }));
      return (
        <svg
          viewBox="0 0 1200 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-auto block pointer-events-none select-none ${className}`}
          aria-hidden="true"
        >
          <path
            d="M-6 4 Q116 42 224 4 Q326 36 436 4 Q600 24 764 4 Q874 36 976 4 Q1084 42 1206 4"
            stroke="#C49A55"
            strokeWidth="1.25"
            strokeOpacity="0.72"
          />
          {/* Whisper-Light Center Olive & Pearl Crest */}
          <g>
            <ellipse cx="576" cy="14" rx="10" ry="3.5" transform="rotate(-12 576 14)" fill="#7A8F74" fillOpacity="0.82" />
            <ellipse cx="624" cy="14" rx="10" ry="3.5" transform="rotate(12 624 14)" fill="#7A8F74" fillOpacity="0.82" />
            <circle cx="600" cy="14" r="4" fill="#FFFFFF" stroke="#C49A55" strokeWidth="1" />
            <path d="M600 6V22M594 12H606" stroke="#C49A55" strokeWidth="1.1" strokeLinecap="round" />
          </g>
          {/* Flanking Olive Leaf & White Lily Scallops */}
          {[...leftLilies, ...rightLilies].map((pt, idx) => (
            <g key={idx}>
              <ellipse
                cx={pt.x - 5}
                cy={pt.y + 7}
                rx="7.5"
                ry="2.8"
                transform={`rotate(-28 ${pt.x - 5} ${pt.y + 7})`}
                fill="#6F8469"
              />
              <ellipse
                cx={pt.x + 5}
                cy={pt.y + 7}
                rx="7.5"
                ry="2.8"
                transform={`rotate(28 ${pt.x + 5} ${pt.y + 7})`}
                fill="#889E82"
              />
              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FFFFFF" stroke="#D8BE8A" strokeWidth="0.7" />
              <circle cx={pt.x} cy={pt.y} r="1.6" fill="#E6C37A" />
            </g>
          ))}
          {/* Corner Pearl & White Lily Tassels */}
          {[
            { x: 20, len: 52 },
            { x: 224, len: 40 },
            { x: 976, len: 40 },
            { x: 1180, len: 52 },
          ].map((t) => (
            <g key={t.x}>
              <line x1={t.x} y1="6" x2={t.x} y2={t.len} stroke="#C49A55" strokeWidth="1" strokeOpacity="0.78" />
              <circle cx={t.x} cy={t.len * 0.44} r="3.2" fill="#FFFFFF" stroke="#C49A55" strokeWidth="0.7" />
              <circle cx={t.x} cy={t.len * 0.68} r="2.3" fill="#F5E6C4" />
              <path
                d={`M${t.x} ${t.len * 0.82} C${t.x - 5} ${t.len + 2}, ${t.x - 3} ${t.len + 10}, ${t.x} ${t.len + 13} C${t.x + 3} ${t.len + 10}, ${t.x + 5} ${t.len + 2}, ${t.x} ${t.len * 0.82} Z`}
                fill="#FFFFFF"
                stroke="#C49A55"
                strokeWidth="0.7"
              />
            </g>
          ))}
        </svg>
      );
    }

    const leftLilies = [
      { x: 20, y: 10 },
      { x: 44, y: 18 },
      { x: 70, y: 22 },
      { x: 96, y: 20 },
      { x: 122, y: 14 },
      { x: 146, y: 7 },
    ];
    const rightLilies = leftLilies.map((p) => ({ x: 480 - p.x, y: p.y }));
    return (
      <svg
        viewBox="0 0 480 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto block pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        <path
          d="M-4 4 Q74 34 152 3 Q240 20 328 3 Q406 34 484 4"
          stroke="#C49A55"
          strokeWidth="1.2"
          strokeOpacity="0.72"
        />
        <ellipse cx="220" cy="12" rx="9" ry="3.2" transform="rotate(-12 220 12)" fill="#7A8F74" fillOpacity="0.82" />
        <ellipse cx="260" cy="12" rx="9" ry="3.2" transform="rotate(12 260 12)" fill="#7A8F74" fillOpacity="0.82" />
        <circle cx="240" cy="12" r="3.5" fill="#FFFFFF" stroke="#C49A55" strokeWidth="0.9" />
        {[...leftLilies, ...rightLilies].map((pt, idx) => (
          <g key={idx}>
            <ellipse
              cx={pt.x - 4}
              cy={pt.y + 6}
              rx="6.5"
              ry="2.5"
              transform={`rotate(-26 ${pt.x - 4} ${pt.y + 6})`}
              fill="#6F8469"
            />
            <ellipse
              cx={pt.x + 4}
              cy={pt.y + 6}
              rx="6.5"
              ry="2.5"
              transform={`rotate(26 ${pt.x + 4} ${pt.y + 6})`}
              fill="#889E82"
            />
            <circle cx={pt.x} cy={pt.y} r="4.1" fill="#FFFFFF" stroke="#D8BE8A" strokeWidth="0.65" />
            <circle cx={pt.x} cy={pt.y} r="1.4" fill="#E6C37A" />
          </g>
        ))}
        {[14, 466].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1="10" x2={tx} y2="46" stroke="#C49A55" strokeWidth="1" strokeOpacity="0.8" />
            <circle cx={tx} cy="24" r="3.2" fill="#FFFFFF" stroke="#C49A55" strokeWidth="0.65" />
            <circle cx={tx} cy="34" r="2.2" fill="#F5E6C4" />
            <path d={`M${tx} 40 L${tx - 3} 52 L${tx + 3} 52 Z`} fill="#C49A55" opacity="0.85" />
          </g>
        ))}
      </svg>
    );
  }

  const isEmerald = theme === 'emerald';
  const isRose = theme === 'rose-ivory';
  const isRoyalBlue = theme === 'royal-blue';
  const isTempleGold = theme === 'temple-gold';

  const leafFill = isRose
    ? '#5C7A5A'
    : isRoyalBlue
      ? '#263F54'
      : isTempleGold
        ? '#2B5830'
        : isEmerald
          ? '#3F6445'
          : '#2D5236';
  const leafHighlight = isRose
    ? '#84A281'
    : isRoyalBlue
      ? '#466985'
      : isTempleGold
        ? '#528255'
        : isEmerald
          ? '#648C66'
          : '#58825C';
  const marigoldLight = isRose
    ? '#F3BAC4'
    : isRoyalBlue
      ? '#F4C35E'
      : isTempleGold
        ? '#F8BC3B'
        : '#F6B640';
  const marigoldDeep = isRose
    ? '#D97F91'
    : isRoyalBlue
      ? '#C88928'
      : isTempleGold
        ? '#E06D19'
        : '#DF8120';
  const centerCore = isRose ? '#FFF2F5' : '#FFE28A';
  const jasmine = isRose
    ? '#FFF8FA'
    : isRoyalBlue
      ? '#FFFDF8'
      : isTempleGold
        ? '#FFFDF2'
        : isEmerald
          ? '#FFFDF5'
          : '#FFF4D4';
  const thread = isRose
    ? '#C7985A'
    : isRoyalBlue
      ? '#D6B467'
      : isTempleGold
        ? '#C88D2E'
        : isEmerald
          ? '#C5A059'
          : '#E8C568';

  if (wide) {
    const leftOuter = [
      { x: 28, y: 12 },
      { x: 56, y: 20 },
      { x: 86, y: 25 },
      { x: 116, y: 27 },
      { x: 146, y: 25 },
      { x: 176, y: 20 },
      { x: 206, y: 12 },
      { x: 254, y: 16 },
      { x: 294, y: 22 },
      { x: 334, y: 22 },
      { x: 374, y: 16 },
      { x: 414, y: 9 },
    ];
    const rightOuter = leftOuter.map((p) => ({ x: 1200 - p.x, y: p.y }));

    return (
      <svg
        viewBox="0 0 1200 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto block pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        {/* 5-Scallop Panoramic Silk Garland Thread */}
        <path
          d="M-6 4 Q116 42 224 4 Q326 36 436 4 Q600 26 764 4 Q874 36 976 4 Q1084 42 1206 4"
          stroke={thread}
          strokeWidth="1.25"
          strokeOpacity="0.72"
        />

        {/* Whisper-Light Center Jasmine & Leaf Buds (Keeps Center Blessing Completely Open) */}
        {[486, 524, 562, 600, 638, 676, 714].map((cx, idx) => {
          const distFromCenter = Math.abs(idx - 3);
          const y = distFromCenter === 0 ? 15 : distFromCenter === 1 ? 14 : distFromCenter === 2 ? 12 : 9;
          return (
            <g key={cx}>
              <path
                d={`M${cx} ${y + 1} C${cx - 3.2} ${y + 6.5}, ${cx - 2.2} ${y + 12}, ${cx} ${y + 14.5} C${cx + 2.2} ${y + 12}, ${cx + 3.2} ${y + 6.5}, ${cx} ${y + 1} Z`}
                fill={leafFill}
                opacity="0.78"
              />
              <circle
                cx={cx}
                cy={y}
                r={distFromCenter === 0 ? 3.2 : 2.6}
                fill={distFromCenter === 0 ? marigoldLight : jasmine}
                stroke={thread}
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Flanking Mango-Leaf & Marigold/Rose/Mallipoo Scallops */}
        {[...leftOuter, ...rightOuter].map((pt, idx) => (
          <g key={idx}>
            <path
              d={`M${pt.x - 1} ${pt.y + 1} C${pt.x - 6} ${pt.y + 8}, ${pt.x - 5} ${pt.y + 16}, ${pt.x - 2} ${pt.y + 21} C${pt.x + 1} ${pt.y + 16}, ${pt.x + 2} ${pt.y + 8}, ${pt.x - 1} ${pt.y + 1} Z`}
              fill={leafFill}
            />
            <path
              d={`M${pt.x + 2} ${pt.y + 1} C${pt.x + 7} ${pt.y + 8}, ${pt.x + 6} ${pt.y + 15}, ${pt.x + 3} ${pt.y + 19} C${pt.x} ${pt.y + 15}, ${pt.x - 1} ${pt.y + 8}, ${pt.x + 2} ${pt.y + 1} Z`}
              fill={leafHighlight}
              opacity="0.85"
            />
            <circle cx={pt.x} cy={pt.y} r="4.6" fill={idx % 2 === 0 ? marigoldLight : marigoldDeep} />
            <circle cx={pt.x} cy={pt.y} r="2.3" fill={idx % 2 === 0 ? centerCore : marigoldLight} />
            <circle cx={pt.x} cy={pt.y} r="0.95" fill={jasmine} />
          </g>
        ))}

        {/* Graceful Corner & Inner Arch Hanging Tassels */}
        {[
          { x: 20, len: 54 },
          { x: 224, len: 42 },
          { x: 976, len: 42 },
          { x: 1180, len: 54 },
        ].map((t) => (
          <g key={t.x}>
            <line x1={t.x} y1="6" x2={t.x} y2={t.len} stroke={thread} strokeWidth="1" strokeOpacity="0.8" />
            <circle cx={t.x} cy={t.len * 0.42} r="3.4" fill={marigoldLight} />
            <circle cx={t.x} cy={t.len * 0.62} r="2.4" fill={jasmine} />
            <circle cx={t.x} cy={t.len * 0.82} r="3.6" fill={marigoldDeep} />
            <path
              d={`M${t.x} ${t.len * 0.88} L${t.x - 3.2} ${t.len + 10} L${t.x + 3.2} ${t.len + 10} Z`}
              fill={thread}
              opacity="0.85"
            />
          </g>
        ))}
      </svg>
    );
  }

  const leftFlowers = [
    { x: 18, y: 10 },
    { x: 38, y: 17 },
    { x: 58, y: 21 },
    { x: 78, y: 22 },
    { x: 98, y: 19 },
    { x: 118, y: 14 },
    { x: 138, y: 8 },
  ];

  const rightFlowers = leftFlowers.map((p) => ({ x: 480 - p.x, y: p.y }));

  return (
    <svg
      viewBox="0 0 480 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto block pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Left Garland Drape String */}
      <path
        d="M-4 4 Q74 34 152 3 Q240 22 328 3 Q406 34 484 4"
        stroke={thread}
        strokeWidth="1.2"
        strokeOpacity="0.72"
      />

      {/* Center Delicate Minimal Scallop Buds (Keeps Center Open & Calm) */}
      {[180, 210, 240, 270, 300].map((cx, idx) => {
        const y = idx === 2 ? 13 : idx === 1 || idx === 3 ? 11.5 : 8.5;
        return (
          <g key={cx}>
            <path
              d={`M${cx} ${y + 1} C${cx - 3} ${y + 6}, ${cx - 2} ${y + 11}, ${cx} ${y + 13} C${cx + 2} ${y + 11}, ${cx + 3} ${y + 6}, ${cx} ${y + 1} Z`}
              fill={leafFill}
              opacity="0.82"
            />
            <circle cx={cx} cy={y} r="2.7" fill={idx === 2 ? marigoldLight : jasmine} stroke={thread} strokeWidth="0.5" />
          </g>
        );
      })}

      {/* Left & Right Corner Mango Leaf + Blossom Scallops */}
      {[...leftFlowers, ...rightFlowers].map((pt, idx) => (
        <g key={idx}>
          {/* Hanging Mango Leaf Pair */}
          <path
            d={`M${pt.x - 1} ${pt.y + 1} C${pt.x - 6} ${pt.y + 8}, ${pt.x - 5} ${pt.y + 15}, ${pt.x - 2} ${pt.y + 19} C${pt.x + 1} ${pt.y + 15}, ${pt.x + 2} ${pt.y + 8}, ${pt.x - 1} ${pt.y + 1} Z`}
            fill={leafFill}
          />
          <path
            d={`M${pt.x + 2} ${pt.y + 1} C${pt.x + 7} ${pt.y + 8}, ${pt.x + 6} ${pt.y + 14}, ${pt.x + 3} ${pt.y + 17} C${pt.x} ${pt.y + 14}, ${pt.x - 1} ${pt.y + 8}, ${pt.x + 2} ${pt.y + 1} Z`}
            fill={leafHighlight}
            opacity="0.85"
          />
          {/* Blossom */}
          <circle cx={pt.x} cy={pt.y} r="4.4" fill={idx % 2 === 0 ? marigoldLight : marigoldDeep} />
          <circle cx={pt.x} cy={pt.y} r="2.2" fill={idx % 2 === 0 ? centerCore : marigoldLight} />
          <circle cx={pt.x} cy={pt.y} r="0.9" fill={jasmine} />
        </g>
      ))}

      {/* Graceful Corner Hanging Tassels */}
      {[14, 466].map((tx) => (
        <g key={tx}>
          <line x1={tx} y1="10" x2={tx} y2="48" stroke={thread} strokeWidth="1" strokeOpacity="0.8" />
          <circle cx={tx} cy="24" r="3.4" fill={marigoldLight} />
          <circle cx={tx} cy="33" r="2.4" fill={jasmine} />
          <circle cx={tx} cy="41" r="3.6" fill={marigoldDeep} />
          <path d={`M${tx} 44.5 L${tx - 3} 55 L${tx + 3} 55 Z`} fill={thread} opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Sacred Mangal Kalash Crest
 * Ornate gilded brass pot with mango leaves, coconut (Nariyal),
 * and subtle engraved lotus/auspicious motif tailored per edition.
 */
export function MangalKalashCrest({ theme = 'emerald', className = 'h-14 w-14' }: WeddingArtProps) {
  const uid = sanitizeId(useId());
  if (theme === 'christian-ivory') {
    const crossGradId = `chapel-crest-gold-${uid}`;
    const haloGradId = `chapel-crest-halo-${uid}`;
    return (
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 select-none ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={haloGradId} cx="50%" cy="50%" r="48%">
            <stop offset="0%" stopColor="#F6E2B7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F6E2B7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={crossGradId} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FAF0D7" />
            <stop offset="50%" stopColor="#C49A55" />
            <stop offset="100%" stopColor="#86602A" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="42" fill={`url(#${haloGradId})`} />
        <circle cx="48" cy="48" r="39" stroke={`url(#${crossGradId})`} strokeWidth="1.4" strokeOpacity="0.82" />
        <circle cx="48" cy="48" r="33" stroke="#C49A55" strokeWidth="0.9" strokeDasharray="2.5 3.5" strokeOpacity="0.65" />
        {/* Botanical Olive Branches Left & Right */}
        <path d="M36 74 C18 64 14 40 28 22" stroke="#6E8368" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M60 74 C78 64 82 40 68 22" stroke="#6E8368" strokeWidth="1.6" strokeLinecap="round" />
        {[
          { cx: 19, cy: 56, rot: -32 },
          { cx: 17, cy: 42, rot: -10 },
          { cx: 22, cy: 29, rot: 22 },
          { cx: 77, cy: 56, rot: 32 },
          { cx: 79, cy: 42, rot: 10 },
          { cx: 74, cy: 29, rot: -22 },
        ].map((lf, idx) => (
          <ellipse
            key={idx}
            cx={lf.cx}
            cy={lf.cy}
            rx="5.5"
            ry="2.2"
            transform={`rotate(${lf.rot} ${lf.cx} ${lf.cy})`}
            fill={idx % 2 === 0 ? '#798F73' : '#8FA489'}
          />
        ))}
        {/* Twin White Lily Blossoms at Base of Wreath */}
        <path d="M48 76 C43 70 38 72 36 77 C41 79 45 78 48 76 Z" fill="#FFFFFF" stroke="#C49A55" strokeWidth="0.7" />
        <path d="M48 76 C53 70 58 72 60 77 C55 79 51 78 48 76 Z" fill="#FFFFFF" stroke="#C49A55" strokeWidth="0.7" />
        {/* Sacred Flared Cathedral Cross & Pearl Center */}
        <path d="M48 19V71M32 38H64" stroke={`url(#${crossGradId})`} strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="48" cy="19" r="2" fill="#C49A55" />
        <circle cx="32" cy="38" r="2" fill="#C49A55" />
        <circle cx="64" cy="38" r="2" fill="#C49A55" />
        <circle cx="48" cy="38" r="5.5" fill="#FFFEFB" stroke={`url(#${crossGradId})`} strokeWidth="1.6" />
        <circle cx="48" cy="38" r="2" fill="#C49A55" />
      </svg>
    );
  }

  const isEmerald = theme === 'emerald';
  const isRose = theme === 'rose-ivory';
  const isRoyalBlue = theme === 'royal-blue';
  const isTempleGold = theme === 'temple-gold';

  const potGradId = `kalash-pot-${uid}`;
  const auraGradId = `kalash-aura-${uid}`;

  const leafMain = isRose
    ? '#5C7B5A'
    : isRoyalBlue
      ? '#2A475E'
      : isTempleGold
        ? '#2B5830'
        : isEmerald
          ? '#355A3E'
          : '#2E5639';
  const leafLight = isRose
    ? '#82A07F'
    : isRoyalBlue
      ? '#4E738F'
      : isTempleGold
        ? '#538356'
        : isEmerald
          ? '#5A8461'
          : '#5B8864';
  const potLight = isRose ? '#FFF2E2' : isRoyalBlue ? '#FAF0D4' : '#FFF0B8';
  const potMid = isRose ? '#D9A76C' : isRoyalBlue ? '#D4AF5A' : isTempleGold ? '#E5A93B' : '#DFB14B';
  const potDeep = isRose ? '#996836' : isRoyalBlue ? '#8C671E' : isTempleGold ? '#9A5F12' : '#9B6F1B';
  const coconutFill = '#9C6639';
  const coconutLight = '#C58A55';
  const mauliRed = isRose
    ? '#C85A70'
    : isRoyalBlue
      ? '#1E3F73'
      : isTempleGold
        ? '#C83228'
        : isEmerald
          ? '#B63A32'
          : '#D9433B';
  const strokeTone = isRose ? '#7D5127' : isRoyalBlue ? '#684B14' : isEmerald ? '#7A5614' : '#643E0C';

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={auraGradId} cx="50%" cy="52%" r="48%">
          <stop offset="0%" stopColor={isRose ? '#F7D2D8' : '#F8DC88'} stopOpacity={isEmerald || isRose ? 0.38 : 0.3} />
          <stop offset="100%" stopColor={isRose ? '#F7D2D8' : '#F8DC88'} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={potGradId} x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor={potLight} />
          <stop offset="45%" stopColor={potMid} />
          <stop offset="100%" stopColor={potDeep} />
        </linearGradient>
      </defs>

      {/* Soft Auspicious Golden Aura */}
      <circle cx="48" cy="50" r="42" fill={`url(#${auraGradId})`} />

      {/* 5 Symmetrical Mango Leaves Fanning from Kalash Mouth */}
      <path d="M46 42 C32 34, 20 28, 16 20 C26 20, 38 28, 47 39 Z" fill={leafMain} />
      <path d="M50 42 C64 34, 76 28, 80 20 C70 20, 58 28, 49 39 Z" fill={leafMain} />
      <path d="M45 41 C34 29, 28 18, 29 10 C37 15, 43 26, 47 38 Z" fill={leafLight} />
      <path d="M51 41 C62 29, 68 18, 67 10 C59 15, 53 26, 49 38 Z" fill={leafLight} />
      <path d="M48 39 C44 26, 44 15, 48 8 C52 15, 52 26, 48 39 Z" fill={leafMain} />

      {/* Sacred Husked Coconut (Nariyal) */}
      <ellipse cx="48" cy="30" rx="10.5" ry="12" fill={coconutFill} stroke={strokeTone} strokeWidth="0.9" />
      <path d="M43 21 C45 25, 45 34, 43 39" stroke={coconutLight} strokeWidth="0.9" strokeOpacity="0.65" />
      <path d="M51 20 C53 25, 53 34, 51 39" stroke={coconutLight} strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Sacred Tilak Dot */}
      <ellipse cx="48" cy="27.5" rx="1.6" ry="3" fill={mauliRed} />
      <circle cx="48" cy="24.2" r="1" fill="#FFF1B5" />

      {/* Kalash Rim & Sacred Mauli / Jasmine Neck Tie */}
      <ellipse cx="48" cy="43.5" rx="14" ry="3.2" fill={`url(#${potGradId})`} stroke={strokeTone} strokeWidth="0.9" />
      <path d="M36.5 46 Q48 49.5 59.5 46" stroke={mauliRed} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M37 46 Q48 49.5 59 46"
        stroke={isTempleGold ? '#FFFDF5' : '#FFE48F'}
        strokeWidth={isTempleGold ? '1.6' : '0.7'}
        strokeDasharray={isTempleGold ? '1 3.2' : '2 2.5'}
        strokeLinecap="round"
      />

      {/* Rounded Gilded Brass Kalash Vessel Body */}
      <path
        d="M36 47 C27 52, 24 62, 28 71 C31.5 78.5, 39 82, 48 82 C57 82, 64.5 78.5, 68 71 C72 62, 69 52, 60 47 Z"
        fill={`url(#${potGradId})`}
        stroke={strokeTone}
        strokeWidth="1.1"
      />
      {/* Highlight Sheen on Brass Belly */}
      <path
        d="M34 54 C31 60, 32 68, 36 73"
        stroke="#FFF8DC"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />

      {/* Subtle Engraved Lotus & Auspicious Center Emblem */}
      <path
        d="M48 56 C50.5 60, 54 62, 54 65.5 C54 68.5, 51.3 70.5, 48 70.5 C44.7 70.5, 42 68.5, 42 65.5 C42 62, 45.5 60, 48 56 Z"
        fill={mauliRed}
        fillOpacity="0.2"
        stroke={mauliRed}
        strokeWidth="1.05"
      />
      <path
        d="M42 65.5 C38 64.5, 36.5 62, 37.5 59.5 C40 60, 42 62, 42.8 64.5 M54 65.5 C58 64.5, 59.5 62, 58.5 59.5 C56 60, 54 62, 53.2 64.5"
        stroke={strokeTone}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx="48" cy="64.8" r="1.8" fill={mauliRed} />

      {/* Ornate Pedestal Base (with lotus petal skirt for rose-ivory / temple-gold) */}
      {(isRose || isTempleGold) && (
        <path
          d="M32 82 Q40 77 48 82 Q56 77 64 82"
          fill={isRose ? '#E8A5B2' : '#F2A83B'}
          fillOpacity="0.55"
          stroke={strokeTone}
          strokeWidth="0.7"
        />
      )}
      <path
        d="M37 82 L60 82 L62 86.5 L34 86.5 Z"
        fill={`url(#${potGradId})`}
        stroke={strokeTone}
        strokeWidth="0.9"
      />
    </svg>
  );
}

/**
 * Clean Architectural Floral Wedding Mandap Illustration
 * Tailored per edition: Goan Basilica Sanctuary for Christian Ivory,
 * Dravidian Gopuram Mandapam with Kuthuvilakku lamps for Temple Gold,
 * Mughal Lotus Baradari for Rose Ivory, Starlit Marwar Chhatri for Royal Blue,
 * and Royal Rajputana Mandap for Emerald & Royal Red.
 */
export function WeddingMandapArt({ theme = 'emerald', className = 'w-56 h-auto' }: WeddingArtProps) {
  const uid = sanitizeId(useId());
  if (theme === 'christian-ivory') {
    return (
      <svg
        viewBox="0 0 260 156"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`block select-none ${className}`}
        aria-hidden="true"
      >
        {/* Soft Candlelight Halo Behind Sanctuary */}
        <circle cx="130" cy="92" r="56" fill="rgba(255, 245, 214, 0.18)" />
        {/* Heritage Chapel Bell Spire & Cross */}
        <path d="M130 10V30M121 18H139" stroke="#F6E2B7" strokeWidth="2.4" strokeLinecap="round" />
        <path
          d="M74 68 L74 52 Q108 46 130 30 Q152 46 186 52 L186 68 Z"
          fill="rgba(255,250,238,0.14)"
          stroke="#E3C17A"
          strokeWidth="1.4"
        />
        {/* Twin Bell Towers with Hanging Bells */}
        {[
          { x: 44, cx: 59 },
          { x: 186, cx: 201 },
        ].map((t) => (
          <g key={t.x}>
            <line x1={t.cx} y1="22" x2={t.cx} y2="32" stroke="#F6E2B7" strokeWidth="1.2" />
            <rect x={t.x} y="48" width="30" height="86" fill="rgba(255,250,238,0.1)" stroke="#E3C17A" strokeWidth="1.2" />
            <path d={`M${t.x - 3} 48 L${t.cx} 30 L${t.x + 33} 48 Z`} fill="rgba(246,226,183,0.24)" stroke="#E3C17A" strokeWidth="1.2" />
            <path d={`M${t.cx - 6} 76 V62 Q${t.cx} 55 ${t.cx + 6} 62 V76 Z`} fill="rgba(255,244,210,0.18)" stroke="#F6E2B7" strokeWidth="1" />
            <circle cx={t.cx} cy="66" r="2.2" fill="#F6E2B7" />
          </g>
        ))}
        {/* Nave, Rose Window Tracery & Pointed Gothic Archway */}
        <rect x="74" y="68" width="112" height="66" fill="rgba(255,250,238,0.08)" stroke="#E3C17A" strokeWidth="1.3" />
        <circle cx="130" cy="84" r="11" fill="rgba(255,244,210,0.22)" stroke="#F6E2B7" strokeWidth="1.3" />
        <circle cx="130" cy="84" r="5" stroke="#F6E2B7" strokeWidth="0.8" strokeDasharray="2 2" />
        <path d="M110 134 V108 Q130 94 150 108 V134 Z" fill="rgba(255,242,202,0.24)" stroke="#F6E2B7" strokeWidth="1.3" />
        {/* Altar Cross & Twin Candle Flames Inside Arch */}
        <path d="M130 106V122M125 112H135" stroke="#FFF8E2" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="119" cy="118" r="1.8" fill="#FFF6C4" />
        <circle cx="141" cy="118" r="1.8" fill="#FFF6C4" />
        {/* White Lily Floral Urns Flanking Entrance */}
        {[92, 168].map((ux) => (
          <g key={ux}>
            <circle cx={ux} cy="124" r="4" fill="#FFFFFF" fillOpacity="0.9" />
            <circle cx={ux - 3} cy="126" r="2.5" fill="#DCE5D8" fillOpacity="0.85" />
            <circle cx={ux + 3} cy="126" r="2.5" fill="#FFFFFF" fillOpacity="0.85" />
          </g>
        ))}
        {/* Stone Steps */}
        <rect x="34" y="134" width="192" height="6" rx="1.5" fill="#E3C17A" fillOpacity="0.82" />
        <rect x="22" y="140" width="216" height="5" rx="1.5" fill="#E3C17A" fillOpacity="0.45" />
      </svg>
    );
  }

  const isEmerald = theme === 'emerald';
  const isRose = theme === 'rose-ivory';
  const isRoyalBlue = theme === 'royal-blue';
  const isTempleGold = theme === 'temple-gold';

  const goldGradId = `mandap-gold-${uid}`;
  const glowGradId = `mandap-glow-${uid}`;

  const goldLight = isRose ? '#FFF2E2' : isRoyalBlue ? '#FAF0D4' : '#FFF0B8';
  const goldMid = isRose
    ? '#DEB27C'
    : isRoyalBlue
      ? '#DFBF72'
      : isTempleGold
        ? '#E8B249'
        : isEmerald
          ? '#E2BC62'
          : '#ECC669';
  const goldDeep = isRose ? '#9E6E3B' : isRoyalBlue ? '#987328' : '#B3842B';
  const drapeFill = isRose
    ? 'rgba(255, 232, 236, 0.2)'
    : isRoyalBlue
      ? 'rgba(218, 230, 255, 0.14)'
      : isEmerald
        ? 'rgba(255, 248, 228, 0.14)'
        : 'rgba(255, 242, 210, 0.16)';
  const marigold = isRose
    ? '#EE9FB0'
    : isRoyalBlue
      ? '#F4C562'
      : isTempleGold
        ? '#FFFDF2'
        : '#F5B33E';
  const flameOuter = '#FF9C2A';
  const flameInner = '#FFF6BE';

  return (
    <svg
      viewBox="0 0 260 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={goldDeep} />
          <stop offset="50%" stopColor={goldLight} />
          <stop offset="100%" stopColor={goldDeep} />
        </linearGradient>
        <radialGradient id={glowGradId} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={flameInner} stopOpacity="0.65" />
          <stop offset="50%" stopColor={flameOuter} stopOpacity="0.22" />
          <stop offset="100%" stopColor={flameOuter} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle Golden Halo Behind Mandap Crown */}
      <circle cx="130" cy="96" r="52" fill={`url(#${glowGradId})`} />

      {/* Crown Finial: 5 Gopuram Kalashams for Temple Gold, or Lotus/Crescent Kalash for others */}
      {isTempleGold ? (
        <g>
          {[110, 120, 130, 140, 150].map((kx) => (
            <g key={kx}>
              <line x1={kx} y1="10" x2={kx} y2="18" stroke={goldLight} strokeWidth="1.1" />
              <circle cx={kx} cy="13" r="1.8" fill={goldLight} />
            </g>
          ))}
          <path d="M84 30 L96 18 L164 18 L176 30 Z" fill={drapeFill} stroke={goldMid} strokeWidth="1.2" />
        </g>
      ) : (
        <g>
          <line x1="130" y1="8" x2="130" y2="18" stroke={goldLight} strokeWidth="1.2" />
          <circle cx="130" cy="11" r="2.2" fill={goldLight} />
          <ellipse cx="130" cy="17" rx="4.5" ry="2.6" fill={`url(#${goldGradId})`} />
        </g>
      )}

      {/* Tiered Curved Mandap Canopy Roof */}
      <path
        d="M52 44 C78 36, 108 25, 130 18 C152 25, 182 36, 208 44 Z"
        fill={drapeFill}
        stroke={goldMid}
        strokeWidth="1.35"
      />
      <path
        d="M68 44 C90 36, 112 29, 130 23 C148 29, 170 36, 192 44"
        stroke={goldLight}
        strokeWidth="0.75"
        strokeOpacity="0.6"
      />
      {/* Canopy Eaves Beam */}
      <rect x="44" y="44" width="172" height="5" rx="2" fill={`url(#${goldGradId})`} />

      {/* Scalloped Silk & Floral Swags Under Canopy */}
      <path
        d="M52 49 Q91 66 130 51 Q169 66 208 49"
        fill={drapeFill}
        stroke={goldLight}
        strokeWidth="1.05"
      />
      {/* Hanging Floral Bell / Lantern Strings */}
      {[78, 104, 156, 182].map((bx, idx) => {
        const len = idx === 1 || idx === 2 ? 22 : 17;
        return (
          <g key={bx}>
            <line x1={bx} y1="53" x2={bx} y2={53 + len} stroke={goldMid} strokeWidth="0.85" strokeOpacity="0.85" />
            <circle cx={bx} cy={53 + len * 0.45} r="2.1" fill={marigold} />
            {isRoyalBlue || isRose ? (
              <path
                d={`M${bx} ${50 + len} L${bx + 3} ${53 + len} L${bx} ${57 + len} L${bx - 3} ${53 + len} Z`}
                fill={goldLight}
              />
            ) : (
              <circle cx={bx} cy={53 + len} r="2.6" fill={goldLight} />
            )}
          </g>
        );
      })}

      {/* Four Slender Draped Wedding Pillars (Outer Left/Right & Inner Rear) */}
      <rect x="86" y="49" width="4" height="83" fill={goldMid} opacity="0.45" />
      <rect x="170" y="49" width="4" height="83" fill={goldMid} opacity="0.45" />
      {[56, 200].map((px) => (
        <g key={px}>
          <rect x={px} y="49" width="6" height="83" fill={`url(#${goldGradId})`} />
          <rect x={px - 2.5} y="49" width="11" height="4" rx="1" fill={goldLight} />
          <rect x={px - 2.5} y="128" width="11" height="4" rx="1" fill={goldLight} />
          <path
            d={`M${px - 1} 62 L${px + 7} 70 M${px - 1} 82 L${px + 7} 90 M${px - 1} 102 L${px + 7} 110`}
            stroke={marigold}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Twin Standing Kuthuvilakku Brass Lamps for Temple Gold */}
      {isTempleGold &&
        [98, 162].map((lx) => (
          <g key={lx}>
            <line x1={lx} y1="106" x2={lx} y2="130" stroke={goldLight} strokeWidth="1.6" />
            <ellipse cx={lx} cy="108" rx="4.5" ry="1.5" fill={goldLight} />
            <ellipse cx={lx} cy="130" rx="5.5" ry="1.8" fill={goldMid} />
            <circle cx={lx} cy="103" r="2.2" fill={flameInner} />
          </g>
        ))}

      {/* Draped Side Silk Curtains */}
      <path
        d="M62 51 Q76 76 62 104 Q72 118 62 132"
        stroke={goldLight}
        strokeWidth="0.9"
        strokeOpacity="0.55"
        fill={drapeFill}
      />
      <path
        d="M200 51 Q186 76 200 104 Q190 118 200 132"
        stroke={goldLight}
        strokeWidth="0.9"
        strokeOpacity="0.55"
        fill={drapeFill}
      />

      {/* Sacred Agni Kund (Center Stepped Fire Altar) & Softly Flickering Sacred Flame */}
      <g>
        <g
          style={{
            transformOrigin: '130px 116px',
            animation: 'weddingDiyaFlicker 2.6s ease-in-out infinite',
          }}
        >
          <path
            d="M130 88 C136 96, 138 104, 130 112 C122 104, 124 96, 130 88 Z"
            fill={flameOuter}
          />
          <path
            d="M130 95 C133.5 100, 134 105, 130 110.5 C126 105, 126.5 100, 130 95 Z"
            fill={flameInner}
          />
        </g>
        {/* Stepped Copper-Gold Havan Kund */}
        <path
          d="M113 113 L147 113 L143 121 L117 121 Z"
          fill={`url(#${goldGradId})`}
          stroke={goldLight}
          strokeWidth="0.8"
        />
        <rect x="115" y="121" width="30" height="5" rx="1" fill={goldMid} />
        <rect x="110" y="126" width="40" height="6" rx="1" fill={goldDeep} stroke={goldMid} strokeWidth="0.7" />
      </g>

      {/* Raised Stepped Mandap Vedi Platform */}
      <rect x="34" y="132" width="192" height="7" rx="1.5" fill={`url(#${goldGradId})`} />
      <rect x="22" y="139" width="216" height="6" rx="1.5" fill={goldMid} opacity="0.72" />
      <line x1="16" y1="149" x2="244" y2="149" stroke={goldLight} strokeWidth="0.8" strokeOpacity="0.4" />
    </svg>
  );
}

/**
 * Minimal, Serene Lotus & Diya Hairline Divider
 * Provides calm, breathable separation between wedding scroll sections.
 */
export function VarmalaDiyaDivider({ theme = 'emerald', className = '' }: WeddingArtProps) {
  if (theme === 'christian-ivory') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
        <span
          className="h-[1px] w-14 sm:w-20"
          style={{ background: 'linear-gradient(90deg, transparent, #C49A55)' }}
        />
        <svg className="h-5 w-14 shrink-0" viewBox="0 0 72 24" fill="none">
          <ellipse cx="18" cy="12" rx="7" ry="2.6" transform="rotate(-14 18 12)" fill="#7E9378" fillOpacity="0.82" />
          <ellipse cx="54" cy="12" rx="7" ry="2.6" transform="rotate(14 54 12)" fill="#7E9378" fillOpacity="0.82" />
          <path d="M36 4V20M30 10H42" stroke="#C49A55" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span
          className="h-[1px] w-14 sm:w-20"
          style={{ background: 'linear-gradient(270deg, transparent, #C49A55)' }}
        />
      </div>
    );
  }
  const isEmerald = theme === 'emerald';
  const lineHex =
    theme === 'royal-blue'
      ? '#C7A75A'
      : theme === 'temple-gold'
        ? '#C88D2E'
        : theme === 'rose-ivory'
          ? '#C7985A'
          : isEmerald
            ? '#C5A059'
            : '#D4AF37';
  const petalHex =
    theme === 'royal-blue'
      ? '#1B315E'
      : theme === 'temple-gold'
        ? '#6B1C14'
        : theme === 'rose-ivory'
          ? '#733246'
          : isEmerald
            ? '#38513D'
            : '#7A1224';
  const flameHex = '#E89B2D';

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span
        className="h-[1px] w-14 sm:w-20"
        style={{ background: `linear-gradient(90deg, transparent, ${lineHex})` }}
      />
      <svg className="h-6 w-14 shrink-0" viewBox="0 0 72 30" fill="none">
        {/* Left & Right Tiny Lotus Buds */}
        <circle cx="10" cy="17" r="1.6" fill={lineHex} fillOpacity="0.7" />
        <circle cx="62" cy="17" r="1.6" fill={lineHex} fillOpacity="0.7" />
        {/* Serene Center Lotus Cradle */}
        <path
          d="M23 19 C26 14.5, 31 14, 36 16.5 C41 14, 46 14.5, 49 19 C45 22.5, 40.5 23.5, 36 23.5 C31.5 23.5, 27 22.5, 23 19 Z"
          fill={lineHex}
          fillOpacity="0.2"
          stroke={lineHex}
          strokeWidth="1.15"
        />
        <path
          d="M28 19.5 Q36 22.5 44 19.5"
          stroke={petalHex}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        {/* Petite Sacred Diya Flame */}
        <path
          d="M36 5.5 C38.2 9, 38.4 12, 36 15 C33.6 12, 33.8 9, 36 5.5 Z"
          fill={flameHex}
          style={{
            transformOrigin: '36px 15px',
            animation: 'weddingDiyaFlicker 2.8s ease-in-out infinite',
          }}
        />
        <circle cx="36" cy="12" r="1.1" fill="#FFF7C8" />
      </svg>
      <span
        className="h-[1px] w-14 sm:w-20"
        style={{ background: `linear-gradient(270deg, transparent, ${lineHex})` }}
      />
    </div>
  );
}
