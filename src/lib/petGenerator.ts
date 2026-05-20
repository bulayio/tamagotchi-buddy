import {
  ACCESSORY_KEYS,
  ACCESSORY_PATCHES,
  Accessory,
  BODY_SHAPES,
  BODY_SHAPE_KEYS,
  BodyShape,
  EYE_KEYS,
  EYE_PATCHES,
  EyeStyle,
  EyeToken,
  MOUTH_KEYS,
  MOUTH_PATCHES,
  MouthStyle,
  MouthToken,
  PALETTES,
  PALETTE_KEYS,
  Palette,
  PaletteName,
  PixelGrid,
  Token,
  TokenGrid,
} from '../constants/petParts';
import { Stage } from '../constants/config';
import { hashString, mulberry32, pick, randomSeed } from './seededRandom';

export interface PetDNA {
  seed: string;
  bodyShape: BodyShape;
  eyes: EyeStyle;
  mouth: MouthStyle;
  accessory: Accessory;
  palette: PaletteName;
}

export function dnaFromSeed(seed: string): PetDNA {
  const rng = mulberry32(hashString(seed));
  return {
    seed,
    bodyShape: pick(rng, BODY_SHAPE_KEYS),
    eyes: pick(rng, EYE_KEYS),
    mouth: pick(rng, MOUTH_KEYS),
    accessory: pick(rng, ACCESSORY_KEYS),
    palette: pick(rng, PALETTE_KEYS),
  };
}

export function generatePetDNA(): PetDNA {
  return dnaFromSeed(randomSeed());
}

export type SpriteVariant = 'sick' | 'happy' | null;
type BodyStage = 'baby' | 'grown';

const WHITE = '#ffffff';

function tokenToColor(t: Token, p: Palette): string | null {
  switch (t) {
    case 'O': return p.outline;
    case 'B': return p.body;
    case 'D': return p.bodyDark;
    case 'C': return p.cheek;
    case null: return null;
  }
}

function eyeTokenToColor(t: EyeToken, p: Palette): string | null | undefined {
  // undefined means "do not overwrite this pixel" (transparent stamp slot)
  switch (t) {
    case null: return undefined;
    case 'O': return p.outline;
    case 'W': return WHITE;
    case 'S': return WHITE;
  }
}

function mouthTokenToColor(t: MouthToken, p: Palette): string | null | undefined {
  switch (t) {
    case null: return undefined;
    case 'O': return p.outline;
    case 'C': return p.cheek;
  }
}

function accTokenToColor(t: Token | 'A', p: Palette): string | null | undefined {
  switch (t) {
    case null: return undefined;
    case 'O': return p.outline;
    case 'B': return p.body;
    case 'D': return p.bodyDark;
    case 'C': return p.cheek;
    case 'A': return p.accent;
  }
}

function cloneTokenGrid(g: TokenGrid): TokenGrid {
  return g.map(row => row.slice());
}

function renderBody(tokens: TokenGrid, palette: Palette): PixelGrid {
  return tokens.map(row => row.map(t => tokenToColor(t, palette)));
}

function stamp<T>(
  canvas: PixelGrid,
  patch: T[][],
  originY: number,
  originX: number,
  resolve: (t: T) => string | null | undefined,
): void {
  for (let py = 0; py < patch.length; py++) {
    for (let px = 0; px < patch[py].length; px++) {
      const cy = originY + py;
      const cx = originX + px;
      if (cy < 0 || cy >= canvas.length) continue;
      if (cx < 0 || cx >= canvas[cy].length) continue;
      const color = resolve(patch[py][px]);
      if (color === undefined) continue; // skip transparent slots in patch
      canvas[cy][cx] = color;
    }
  }
}

interface FacePositions {
  eyeY: number;
  leftEyeX: number;
  rightEyeX: number;
  mouthY: number;
  mouthX: number;
  cheekY: number;
  leftCheekX: number;
  rightCheekX: number;
  accessoryAnchorY: number;
  accessoryAnchorX: number;
}

const FACE_BY_SHAPE: Record<BodyShape, { baby: FacePositions; grown: FacePositions }> = {
  round: {
    baby:  { eyeY: 3, leftEyeX: 2, rightEyeX: 7, mouthY: 6, mouthX: 4, cheekY: 5, leftCheekX: 2, rightCheekX: 9, accessoryAnchorY: 0, accessoryAnchorX: 4 },
    grown: { eyeY: 3, leftEyeX: 2, rightEyeX: 7, mouthY: 6, mouthX: 4, cheekY: 6, leftCheekX: 1, rightCheekX: 10, accessoryAnchorY: 0, accessoryAnchorX: 4 },
  },
  tall: {
    baby:  { eyeY: 3, leftEyeX: 2, rightEyeX: 6, mouthY: 7, mouthX: 4, cheekY: 5, leftCheekX: 2, rightCheekX: 8, accessoryAnchorY: 0, accessoryAnchorX: 3 },
    grown: { eyeY: 3, leftEyeX: 2, rightEyeX: 6, mouthY: 7, mouthX: 4, cheekY: 6, leftCheekX: 1, rightCheekX: 9, accessoryAnchorY: 0, accessoryAnchorX: 4 },
  },
  blob: {
    baby:  { eyeY: 3, leftEyeX: 2, rightEyeX: 7, mouthY: 5, mouthX: 4, cheekY: 5, leftCheekX: 1, rightCheekX: 10, accessoryAnchorY: 0, accessoryAnchorX: 4 },
    grown: { eyeY: 3, leftEyeX: 2, rightEyeX: 7, mouthY: 6, mouthX: 4, cheekY: 5, leftCheekX: 1, rightCheekX: 10, accessoryAnchorY: 0, accessoryAnchorX: 4 },
  },
  square: {
    baby:  { eyeY: 3, leftEyeX: 2, rightEyeX: 6, mouthY: 7, mouthX: 4, cheekY: 5, leftCheekX: 2, rightCheekX: 8, accessoryAnchorY: 0, accessoryAnchorX: 3 },
    grown: { eyeY: 3, leftEyeX: 2, rightEyeX: 7, mouthY: 7, mouthX: 4, cheekY: 6, leftCheekX: 1, rightCheekX: 10, accessoryAnchorY: 0, accessoryAnchorX: 4 },
  },
};

function mirrorEyePatch(p: EyeToken[][]): EyeToken[][] {
  return p.map(row => row.slice().reverse());
}

export function composeSprite(dna: PetDNA, stage: BodyStage, variant: SpriteVariant): PixelGrid {
  const palette = PALETTES[dna.palette];
  const silhouette = cloneTokenGrid(BODY_SHAPES[dna.bodyShape][stage]);
  const canvas: PixelGrid = renderBody(silhouette, palette);
  const face = FACE_BY_SHAPE[dna.bodyShape][stage];

  // Variant-driven eye/mouth override
  const effectiveEyes: EyeStyle =
    variant === 'sick' ? 'cross'
    : variant === 'happy' ? 'sparkle'
    : dna.eyes;
  const effectiveMouth: MouthStyle =
    variant === 'sick' ? 'wavy'
    : variant === 'happy' ? 'smile'
    : dna.mouth;

  // Eyes (mirror right eye for symmetry)
  const eyePatch = EYE_PATCHES[effectiveEyes];
  stamp(canvas, eyePatch, face.eyeY, face.leftEyeX, t => eyeTokenToColor(t, palette));
  stamp(canvas, mirrorEyePatch(eyePatch), face.eyeY, face.rightEyeX, t => eyeTokenToColor(t, palette));

  // Mouth
  stamp(canvas, MOUTH_PATCHES[effectiveMouth], face.mouthY, face.mouthX, t => mouthTokenToColor(t, palette));

  // Cheeks (single pixel each) – skip for sick to look paler
  if (variant !== 'sick') {
    if (canvas[face.cheekY]?.[face.leftCheekX] !== undefined && canvas[face.cheekY][face.leftCheekX] !== null) {
      canvas[face.cheekY][face.leftCheekX] = palette.cheek;
    }
    if (canvas[face.cheekY]?.[face.rightCheekX] !== undefined && canvas[face.cheekY][face.rightCheekX] !== null) {
      canvas[face.cheekY][face.rightCheekX] = palette.cheek;
    }
  }

  // Accessory only on grown silhouette (baby keeps a simple look)
  if (stage === 'grown' && dna.accessory !== 'none') {
    stamp(
      canvas,
      ACCESSORY_PATCHES[dna.accessory],
      face.accessoryAnchorY,
      face.accessoryAnchorX,
      t => accTokenToColor(t, palette),
    );
  }

  return canvas;
}

// Build an egg sprite tinted with the DNA's palette (palette.body for shell).
export function composeEggSprite(dna: PetDNA): PixelGrid {
  const palette = PALETTES[dna.palette];
  const O = palette.outline;
  const B = palette.body;
  const D = palette.bodyDark;
  return [
    [null, null, null, null, O, O, O, O, null, null, null, null],
    [null, null, null, O, B, B, B, B, O, null, null, null],
    [null, null, O, B, B, B, D, B, B, O, null, null],
    [null, O, B, B, D, B, B, B, B, B, O, null],
    [null, O, B, B, B, B, B, B, D, B, O, null],
    [null, O, B, D, B, B, B, B, B, B, O, null],
    [null, O, B, B, B, B, D, B, B, B, O, null],
    [null, O, B, B, B, B, B, B, B, B, O, null],
    [null, null, O, B, B, B, B, B, B, O, null, null],
    [null, null, null, O, B, B, B, B, O, null, null, null],
    [null, null, null, null, O, O, O, O, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
  ];
}

export function spriteForStage(dna: PetDNA, stage: Stage, variant: SpriteVariant): PixelGrid {
  if (stage === 'egg') return composeEggSprite(dna); // variant intentionally ignored in egg form
  return composeSprite(dna, stage, variant);
}
