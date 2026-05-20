import {
  AccToken,
  BODY_SHAPES,
  BodyShape,
  EYE_PATCHES,
  EyeStyle,
  EyeToken,
  MOUTH_PATCHES,
  MouthStyle,
  MouthToken,
  PALETTES,
  Palette,
  PaletteName,
  PixelGrid,
  Token,
  TokenGrid,
} from "../constants/petParts";
import { Stage } from "../constants/config";
import { hashString, mulberry32, pick, randomSeed } from "./seededRandom";

/** 플레이오 선호 장르(1차). 추후 앱 연동 시 최빈 장르로 주입 가능. */
export const GAME_GENRES = [
  "puzzle",
  "simulation",
  "action",
  "rpg",
  "shooting",
] as const;
export type GameGenre = (typeof GAME_GENRES)[number];

export const GAME_GENRE_LABELS: Record<GameGenre, string> = {
  puzzle: "퍼즐",
  simulation: "시뮬레이션",
  action: "액션",
  rpg: "RPG",
  shooting: "슈팅",
};

export interface PetDNA {
  seed: string;
  /** 펫 생성 시 부가정보(선호 장르). 시뮬에서는 시드로 무작위 배정. */
  genre: GameGenre;
  bodyShape: BodyShape;
  eyes: EyeStyle;
  mouth: MouthStyle;
  palette: PaletteName;
}

/** 장르당 하나의 실루엣 — 실루엣만 봐도 장르가 구분되게 */
const GENRE_BODY: Record<GameGenre, BodyShape> = {
  puzzle: "square",
  simulation: "round",
  action: "tall",
  rpg: "blob",
  /** 액션과 같은 키 큰 실루엣 — 투구 vs 군모로 구분 */
  shooting: "tall",
};

/** 장르별 색 범위 (서로 겹치지 않게 그룹화) */
const GENRE_PALETTE_POOL: Record<GameGenre, readonly PaletteName[]> = {
  puzzle: ["sky", "mint"],
  simulation: ["peach", "yellow"],
  action: ["pink", "yellow"],
  rpg: ["lilac", "mint"],
  shooting: ["mint", "sky"],
};

/** 눈·입만 시드로 가변 (장착 파츠는 장르 고정 장비로 처리). */
const GENRE_FACE_POOLS: Record<
  GameGenre,
  {
    eyes: readonly EyeStyle[];
    mouth: readonly MouthStyle[];
  }
> = {
  puzzle: {
    eyes: ["dot", "sleepy"],
    mouth: ["smile", "dot"],
  },
  simulation: {
    eyes: ["sleepy", "dot", "oval"],
    mouth: ["smile", "dot", "wavy"],
  },
  action: {
    eyes: ["oval", "sparkle", "dot"],
    mouth: ["fang", "smile"],
  },
  rpg: {
    eyes: ["oval", "sparkle", "dot"],
    mouth: ["smile", "fang"],
  },
  shooting: {
    eyes: ["dot", "oval", "sparkle"],
    mouth: ["smile", "dot"],
  },
};

function isGameGenre(v: unknown): v is GameGenre {
  return (
    typeof v === "string" && (GAME_GENRES as readonly string[]).includes(v)
  );
}

function genrePaletteSet(genre: GameGenre): readonly PaletteName[] {
  return GENRE_PALETTE_POOL[genre];
}

function isCompletePetDNA(dna: Partial<PetDNA>): dna is PetDNA {
  return (
    isGameGenre(dna.genre) &&
    dna.bodyShape === GENRE_BODY[dna.genre] &&
    !!dna.eyes &&
    !!dna.mouth &&
    !!dna.palette &&
    genrePaletteSet(dna.genre).includes(dna.palette as PaletteName) &&
    typeof dna.seed === "string"
  );
}

/** 저장된 DNA에 genre·필드가 없으면 같은 seed로 새 규칙 재생성(1회 마이그레이션). */
export function normalizePetDNA(
  dna: Partial<PetDNA> & { seed: string },
): PetDNA {
  if (isCompletePetDNA(dna)) {
    return {
      seed: dna.seed,
      genre: dna.genre,
      bodyShape: dna.bodyShape,
      eyes: dna.eyes,
      mouth: dna.mouth,
      palette: dna.palette,
    };
  }
  return dnaFromSeed(dna.seed);
}

export function dnaFromSeed(seed: string): PetDNA {
  const rng = mulberry32(hashString(seed));
  const genre = pick(rng, GAME_GENRES);
  const bodyShape = GENRE_BODY[genre];
  const palette = pick(rng, GENRE_PALETTE_POOL[genre]);
  const face = GENRE_FACE_POOLS[genre];
  return {
    seed,
    genre,
    bodyShape,
    palette,
    eyes: pick(rng, face.eyes),
    mouth: pick(rng, face.mouth),
  };
}

/** 플레이오 등에서 선호 장르가 정해진 경우: 해당 장르 파츠 풀만 사용해 생성. */
export function dnaFromSeedWithGenre(seed: string, genre: GameGenre): PetDNA {
  const rng = mulberry32(hashString(seed));
  const bodyShape = GENRE_BODY[genre];
  const palette = pick(rng, GENRE_PALETTE_POOL[genre]);
  const face = GENRE_FACE_POOLS[genre];
  return {
    seed,
    genre,
    bodyShape,
    palette,
    eyes: pick(rng, face.eyes),
    mouth: pick(rng, face.mouth),
  };
}

export function generatePetDNA(): PetDNA {
  return dnaFromSeed(randomSeed());
}

export function generatePetDNAWithGenre(genre: GameGenre): PetDNA {
  return dnaFromSeedWithGenre(randomSeed(), genre);
}

export type SpriteVariant = "sick" | "happy" | null;
type BodyStage = "baby" | "grown";

const WHITE = "#ffffff";

function tokenToColor(t: Token, p: Palette): string | null {
  switch (t) {
    case "O":
      return p.outline;
    case "B":
      return p.body;
    case "D":
      return p.bodyDark;
    case "C":
      return p.cheek;
    case null:
      return null;
  }
}

function eyeTokenToColor(t: EyeToken, p: Palette): string | null | undefined {
  // undefined means "do not overwrite this pixel" (transparent stamp slot)
  switch (t) {
    case null:
      return undefined;
    case "O":
      return p.outline;
    case "W":
      return WHITE;
    case "S":
      return WHITE;
  }
}

function mouthTokenToColor(
  t: MouthToken,
  p: Palette,
): string | null | undefined {
  switch (t) {
    case null:
      return undefined;
    case "O":
      return p.outline;
    case "C":
      return p.cheek;
  }
}

/** 장비 전용 — 몸 색과 겹쳐도 잘 보이게 윤곽·액센트·하이라이트 대비 강화 */
function gearTokenToColor(t: AccToken, p: Palette): string | null | undefined {
  switch (t) {
    case null:
      return undefined;
    case "O":
      return p.outline;
    case "B":
      return p.accent;
    case "D":
      return p.bodyDark;
    case "C":
      return p.accent;
    case "A":
      return WHITE;
  }
}

function cloneTokenGrid(g: TokenGrid): TokenGrid {
  return g.map((row) => row.slice());
}

function renderBody(tokens: TokenGrid, palette: Palette): PixelGrid {
  return tokens.map((row) => row.map((t) => tokenToColor(t, palette)));
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
  hatAnchorY: number;
  hatAnchorX: number;
}

const FACE_BY_SHAPE: Record<
  BodyShape,
  { baby: FacePositions; grown: FacePositions }
> = {
  round: {
    baby: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 7,
      mouthY: 6,
      mouthX: 4,
      cheekY: 5,
      leftCheekX: 2,
      rightCheekX: 9,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
    grown: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 7,
      mouthY: 6,
      mouthX: 4,
      cheekY: 6,
      leftCheekX: 1,
      rightCheekX: 10,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
  },
  tall: {
    baby: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 6,
      mouthY: 7,
      mouthX: 4,
      cheekY: 5,
      leftCheekX: 2,
      rightCheekX: 8,
      hatAnchorY: 0,
      hatAnchorX: 3,
    },
    grown: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 6,
      mouthY: 7,
      mouthX: 4,
      cheekY: 6,
      leftCheekX: 1,
      rightCheekX: 9,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
  },
  blob: {
    baby: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 7,
      mouthY: 5,
      mouthX: 4,
      cheekY: 5,
      leftCheekX: 1,
      rightCheekX: 10,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
    grown: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 7,
      mouthY: 6,
      mouthX: 4,
      cheekY: 5,
      leftCheekX: 1,
      rightCheekX: 10,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
  },
  square: {
    baby: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 6,
      mouthY: 7,
      mouthX: 4,
      cheekY: 5,
      leftCheekX: 2,
      rightCheekX: 8,
      hatAnchorY: 0,
      hatAnchorX: 3,
    },
    grown: {
      eyeY: 3,
      leftEyeX: 2,
      rightEyeX: 7,
      mouthY: 7,
      mouthX: 4,
      cheekY: 6,
      leftCheekX: 1,
      rightCheekX: 10,
      hatAnchorY: 0,
      hatAnchorX: 4,
    },
  },
};

function mirrorEyePatch(p: EyeToken[][]): EyeToken[][] {
  return p.map((row) => row.slice().reverse());
}

/** 장르별 모자 (머리 hatAnchor 기준). 퍼즐=마법사, RPG=광부, 액션=투구, 시뮬=셰프, 슈팅=군모 */
const GEAR_HAT_BY_GENRE: Record<GameGenre, AccToken[][]> = {
  puzzle: [
    [null, null, "O", null, null],
    [null, "O", "A", "O", null],
    ["O", "O", "B", "O", "O"],
  ],
  rpg: [
    [null, "O", "O", "O", null],
    ["O", "A", "A", "A", "O"],
    ["O", "B", "B", "B", "O"],
  ],
  action: [
    ["O", "O", "O", "O", "O"],
    ["O", "A", null, "A", "O"],
    ["O", "B", "B", "B", "O"],
  ],
  simulation: [
    ["O", "O", "O", "O", "O"],
    ["B", "B", "B", "B", "B"],
    [null, "O", "O", "O", null],
  ],
  /** 패트롤캡 느낌: 평평한 정상 + 챙(A 군장 스트라이프) */
  shooting: [
    [null, "O", "O", "O", null],
    ["O", "B", "B", "B", "O"],
    ["O", "A", "D", "A", "O"],
  ],
};

function stampGenreGear(
  canvas: PixelGrid,
  dna: PetDNA,
  palette: Palette,
  face: FacePositions,
  stage: BodyStage,
  variant: SpriteVariant,
): void {
  if ((stage !== "grown" && stage !== "baby") || variant === "sick") return;
  const acc = (t: AccToken) => gearTokenToColor(t, palette);
  /* 기존 뿔/모자 앵커는 폭 4 기준 — 장르 모자는 폭 5, 왼쪽으로 1칸 당겨 가운데 맞춤 */
  const ox = face.hatAnchorX - 1;
  const oy = face.hatAnchorY;
  stamp(canvas, GEAR_HAT_BY_GENRE[dna.genre], oy, ox, acc);
}

function applyEggGenrePattern(
  grid: PixelGrid,
  genre: GameGenre,
  p: Palette,
): void {
  const spot = (r: number, c: number) => {
    const v = grid[r]?.[c];
    if (v === p.body || v === p.bodyDark) grid[r][c] = p.accent;
  };
  switch (genre) {
    case "puzzle":
      spot(4, 5);
      spot(4, 6);
      spot(5, 5);
      spot(5, 6);
      break;
    case "simulation":
      spot(3, 5);
      spot(6, 6);
      break;
    case "action":
      spot(4, 7);
      spot(5, 6);
      spot(6, 7);
      break;
    case "rpg":
      spot(3, 6);
      spot(6, 5);
      spot(7, 6);
      break;
    case "shooting":
      spot(4, 4);
      spot(4, 7);
      spot(6, 5);
      break;
  }
}

export function composeSprite(
  dna: PetDNA,
  stage: BodyStage,
  variant: SpriteVariant,
): PixelGrid {
  const palette = PALETTES[dna.palette];
  const silhouette = cloneTokenGrid(BODY_SHAPES[dna.bodyShape][stage]);
  const canvas: PixelGrid = renderBody(silhouette, palette);
  const face = FACE_BY_SHAPE[dna.bodyShape][stage];

  // Variant-driven eye/mouth override
  const effectiveEyes: EyeStyle =
    variant === "sick" ? "cross" : variant === "happy" ? "sparkle" : dna.eyes;
  const effectiveMouth: MouthStyle =
    variant === "sick" ? "wavy" : variant === "happy" ? "smile" : dna.mouth;

  // Eyes (mirror right eye for symmetry)
  const eyePatch = EYE_PATCHES[effectiveEyes];
  stamp(canvas, eyePatch, face.eyeY, face.leftEyeX, (t) =>
    eyeTokenToColor(t, palette),
  );
  stamp(canvas, mirrorEyePatch(eyePatch), face.eyeY, face.rightEyeX, (t) =>
    eyeTokenToColor(t, palette),
  );

  // Mouth
  stamp(canvas, MOUTH_PATCHES[effectiveMouth], face.mouthY, face.mouthX, (t) =>
    mouthTokenToColor(t, palette),
  );

  // Cheeks (single pixel each) – skip for sick to look paler
  if (variant !== "sick") {
    if (
      canvas[face.cheekY]?.[face.leftCheekX] !== undefined &&
      canvas[face.cheekY][face.leftCheekX] !== null
    ) {
      canvas[face.cheekY][face.leftCheekX] = palette.cheek;
    }
    if (
      canvas[face.cheekY]?.[face.rightCheekX] !== undefined &&
      canvas[face.cheekY][face.rightCheekX] !== null
    ) {
      canvas[face.cheekY][face.rightCheekX] = palette.cheek;
    }
  }

  stampGenreGear(canvas, dna, palette, face, stage, variant);

  return canvas;
}

// Build an egg sprite tinted with the DNA's palette (palette.body for shell).
export function composeEggSprite(dna: PetDNA): PixelGrid {
  const palette = PALETTES[dna.palette];
  const O = palette.outline;
  const B = palette.body;
  const D = palette.bodyDark;
  const grid: PixelGrid = [
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
  applyEggGenrePattern(grid, dna.genre, palette);
  return grid;
}

export function spriteForStage(
  dna: PetDNA,
  stage: Stage,
  variant: SpriteVariant,
): PixelGrid {
  if (stage === "egg") return composeEggSprite(dna); // variant intentionally ignored in egg form
  return composeSprite(dna, stage, variant);
}
