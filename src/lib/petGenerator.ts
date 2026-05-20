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

export const PET_RARITIES = ["normal", "rare", "epic", "legendary"] as const;
export type PetRarity = (typeof PET_RARITIES)[number];

export const PET_RARITY_LABELS: Record<PetRarity, string> = {
  normal: "노말",
  rare: "레어",
  epic: "에픽",
  legendary: "레전더리",
};

/** 희귀도 윤곽선(O) — 노말 검정·레어 어두운 금색·에픽 진보라·레전더리 빨간기 주황 */
export const PET_RARITY_OUTLINE_COLORS: Record<PetRarity, string> = {
  normal: "#000000",
  rare: "#b8941e",
  epic: "#5b21b6",
  legendary: "#f4511e",
};

type BodyFill = Pick<Palette, "body" | "bodyDark" | "cheek" | "accent">;

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const x = (v: number) => clamp255(v).toString(16).padStart(2, "0");
  return `#${x(r)}${x(g)}${x(b)}`;
}

/** sRGB 상대 휘도 0–1 (WCAG) */
function relativeLuminance(hex: string): number {
  const lin = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
    else if (max === G) h = ((B - R) / d + 2) / 6;
    else h = ((R - G) / d + 4) / 6;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
}

/**
 * 윤곽선 hex와 PRNG로 몸·음영·볼·액센트 생성.
 * 윤곽이 어두우면 밝은 몸, 밝으면 어두운 몸으로 대비를 맞춤.
 */
function contrastingBodyFillFromOutline(
  outlineHex: string,
  rng: () => number,
): BodyFill {
  const [or, og, ob] = hexToRgb(outlineHex);
  const [oH] = rgbToHsl(or, og, ob);
  const lum = relativeLuminance(outlineHex);
  const useLightBody = lum < 0.42;

  if (useLightBody) {
    const bh = (oH + 110 + rng() * 130) % 360;
    const bS = 0.26 + rng() * 0.44;
    const bL = 0.66 + rng() * 0.28;
    const [br, bg, bb] = hslToRgb(bh, bS, bL);
    const body = rgbToHex(br, bg, bb);
    const bLd = Math.max(0.2, bL - 0.09 - rng() * 0.14);
    const [dr, dg, db] = hslToRgb(bh, Math.min(0.92, bS + 0.1), bLd);
    const bodyDark = rgbToHex(dr, dg, db);
    const ch = (bh + 85 + rng() * 55) % 360;
    const [cr, cg, cb] = hslToRgb(ch, 0.58 + rng() * 0.32, 0.48 + rng() * 0.18);
    const cheek = rgbToHex(cr, cg, cb);
    const ah = (bh + 165 + rng() * 90) % 360;
    const [ar, ag, ab] = hslToRgb(ah, 0.48 + rng() * 0.32, 0.45 + rng() * 0.18);
    const accent = rgbToHex(ar, ag, ab);
    return { body, bodyDark, cheek, accent };
  }

  const bh = (oH + 145 + rng() * 110) % 360;
  const bS = 0.32 + rng() * 0.42;
  const bL = 0.14 + rng() * 0.24;
  const [br, bg, bb] = hslToRgb(bh, bS, bL);
  const body = rgbToHex(br, bg, bb);
  const bLd = Math.max(0.06, bL - 0.07 - rng() * 0.12);
  const [dr, dg, db] = hslToRgb(bh, Math.min(0.88, bS + 0.12), bLd);
  const bodyDark = rgbToHex(dr, dg, db);
  const ch = (bh + 100 + rng() * 50) % 360;
  const [cr, cg, cb] = hslToRgb(ch, 0.62 + rng() * 0.22, 0.52 + rng() * 0.18);
  const cheek = rgbToHex(cr, cg, cb);
  const ah = (bh + 200 + rng() * 70) % 360;
  const [ar, ag, ab] = hslToRgb(ah, 0.48 + rng() * 0.28, 0.48 + rng() * 0.2);
  const accent = rgbToHex(ar, ag, ab);
  return { body, bodyDark, cheek, accent };
}

/** 몸·음영·볼·액센트는 등급과 무관하게 노말(검정 윤곽)과 동일한 생성 규칙을 씀 */
function bodyFillFromOutlineForDna(dna: PetDNA): BodyFill {
  const outlineHex = PET_RARITY_OUTLINE_COLORS.normal;
  const rng = mulberry32(
    hashString(`${dna.seed}\0bodyFromOutline\0${outlineHex}`),
  );
  return contrastingBodyFillFromOutline(outlineHex, rng);
}

function paletteWithRarityStyle(dna: PetDNA): Palette {
  const base = PALETTES[dna.palette];
  const tier = dna.rarity ?? "normal";
  const fill = bodyFillFromOutlineForDna(dna);
  return {
    ...base,
    outline: PET_RARITY_OUTLINE_COLORS[tier],
    body: fill.body,
    bodyDark: fill.bodyDark,
    cheek: fill.cheek,
    accent: fill.accent,
  };
}

export interface PetDNA {
  seed: string;
  /** 펫 생성 시 부가정보(선호 장르). 시뮬에서는 시드로 무작위 배정. */
  genre: GameGenre;
  bodyShape: BodyShape;
  eyes: EyeStyle;
  mouth: MouthStyle;
  palette: PaletteName;
  /** 활동·플레이타임 기반 등급. `dnaFromComposite`·Playio 연동 시 설정. */
  rarity?: PetRarity;
  /**
   * 프로토타입/연동용: 활동·플레이타임을 DNA 생성에 합성할 때만 설정.
   * 실제 저장 DNA에는 보통 없음.
   */
  activityScore?: number;
  /** 누적 플레이(분). 표시는 화면에서 시간/분으로 가공 */
  gameplayTimeMinutes?: number;
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

const PLAY_TIME_SCORE_CAP_MINUTES = 10080; // dna-demo 상한(약 7일)과 동일

function playTimeScore(minutes: number): number {
  const t = Math.max(0, minutes);
  return Math.min(100, (t / PLAY_TIME_SCORE_CAP_MINUTES) * 100);
}

/** 활동점수(0–100)와 플레이 시간(분) 가중 합산 → 노말 / 레어 / 에픽 / 레전더리. */
export function computePetRarity(
  activityScore: number,
  gameplayTimeMinutes: number,
): PetRarity {
  const a = Math.max(0, Math.min(100, Math.round(activityScore)));
  const p = playTimeScore(gameplayTimeMinutes);
  const score = 0.55 * a + 0.45 * p;
  if (score < 40) return "normal";
  if (score < 65) return "rare";
  if (score < 82) return "epic";
  return "legendary";
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

/**
 * 활동점수·게임플레이 시간을 base 시드에 합성해 최종 DNA를 만든다.
 * 데모에서 “여러 신호를 종합해 캐릭터가 결정된다”는 인상을 줌 (결정론적).
 */
export function dnaFromComposite(
  baseSeed: string,
  activityScore: number,
  gameplayTimeMinutes: number,
): PetDNA {
  const a = Math.max(0, Math.min(100, Math.round(activityScore)));
  const t = Math.max(0, Math.round(gameplayTimeMinutes));
  const compositeKey = `${baseSeed}\0act:${a}\0playMin:${t}`;
  const dna = dnaFromSeed(compositeKey);
  return {
    ...dna,
    seed: baseSeed,
    activityScore: a,
    gameplayTimeMinutes: t,
    rarity: computePetRarity(a, t),
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

/** 모자 패치 세로 칸 수(모든 장르 동일) */
const GEAR_HAT_PATCH_ROWS = 3;

function padCanvasTop(grid: PixelGrid, n: number): PixelGrid {
  if (n <= 0) return grid;
  const w = grid[0]?.length ?? 0;
  const prefix = Array.from({ length: n }, () =>
    Array<string | null>(w).fill(null),
  );
  return [...prefix, ...grid];
}

/**
 * 머리 윗줄 위 빈 행 + 모자 마지막 줄이 머리 첫 줄과 1칸 겹쳐 “얹힌” 느낌
 * (패딩만 모자 높이만큼 두면 윤곽선이 맞닿아 떠 보일 수 있음)
 */
const SPRITE_TOP_PAD_ROWS = GEAR_HAT_PATCH_ROWS - 1;
/** 모자 하단이 머리 도트와 겹치는 행 수 — 테두리만 맞닿는 공간 감소 */
const HAT_HEAD_OVERLAP_ROWS = 1;

function hatStackOriginY(face: FacePositions, stackPad: number): number {
  return (
    stackPad +
    face.hatAnchorY -
    GEAR_HAT_PATCH_ROWS +
    HAT_HEAD_OVERLAP_ROWS
  );
}

/** 모자 아래 깔기 — 몸/머리 윤곽이 모자 null 슬롯으로 비치지 않게 함 */
const GEAR_HAT_BACKDROP_BY_GENRE: Record<GameGenre, AccToken[][]> = {
  puzzle: [
    ["O", "O", "O", "O", "O"],
    ["O", "B", "B", "B", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  rpg: [
    ["O", "O", "O", "O", "O"],
    ["O", "B", "B", "B", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  action: [
    ["O", "O", "O", "O", "O"],
    ["O", "B", "B", "B", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  simulation: [
    ["O", "O", "O", "O", "O"],
    ["O", "B", "B", "B", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  shooting: [
    ["O", "O", "O", "O", "O"],
    ["O", "B", "B", "B", "O"],
    ["B", "B", "B", "B", "B"],
  ],
};

/** 장르별 모자 (머리 hatAnchor 기준). 퍼즐=마법사, RPG=광부, 액션=투구, 시뮬=셰프, 슈팅=군모 */
const GEAR_HAT_BY_GENRE: Record<GameGenre, AccToken[][]> = {
  puzzle: [
    [null, null, "O", null, null],
    [null, "O", "A", "O", null],
    ["B", "O", "B", "O", "B"],
  ],
  rpg: [
    [null, "O", "O", "O", null],
    ["O", "A", "A", "A", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  action: [
    ["O", "O", "O", "O", "O"],
    ["O", "A", null, "A", "O"],
    ["B", "B", "B", "B", "B"],
  ],
  simulation: [
    ["O", "O", "O", "O", "O"],
    ["B", "B", "B", "B", "B"],
    [null, "B", "O", "B", null],
  ],
  /** 패트롤캡 느낌: 평평한 정상 + 챙(A 군장 스트라이프) */
  shooting: [
    [null, "O", "O", "O", null],
    ["O", "B", "B", "B", "O"],
    ["B", "A", "D", "A", "B"],
  ],
};

function shouldShowHat(stage: BodyStage, variant: SpriteVariant): boolean {
  return (stage === "grown" || stage === "baby") && variant !== "sick";
}

function stampGenreHatBackdrop(
  canvas: PixelGrid,
  dna: PetDNA,
  palette: Palette,
  face: FacePositions,
  stage: BodyStage,
  variant: SpriteVariant,
  stackPad: number,
): void {
  if (!shouldShowHat(stage, variant)) return;
  const acc = (t: AccToken) => gearTokenToColor(t, palette);
  const ox = face.hatAnchorX - 1;
  const oy = hatStackOriginY(face, stackPad);
  stamp(canvas, GEAR_HAT_BACKDROP_BY_GENRE[dna.genre], oy, ox, acc);
}

function stampGenreGear(
  canvas: PixelGrid,
  dna: PetDNA,
  palette: Palette,
  face: FacePositions,
  stage: BodyStage,
  variant: SpriteVariant,
  stackPad: number,
): void {
  if (!shouldShowHat(stage, variant)) return;
  const acc = (t: AccToken) => gearTokenToColor(t, palette);
  /* 기존 뿔/모자 앵커는 폭 4 기준 — 장르 모자는 폭 5, 왼쪽으로 1칸 당겨 가운데 맞춤 */
  const ox = face.hatAnchorX - 1;
  const oy = hatStackOriginY(face, stackPad);
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
  const palette = paletteWithRarityStyle(dna);
  const silhouette = cloneTokenGrid(BODY_SHAPES[dna.bodyShape][stage]);
  const stackPad = shouldShowHat(stage, variant) ? SPRITE_TOP_PAD_ROWS : 0;
  const canvas: PixelGrid = padCanvasTop(renderBody(silhouette, palette), stackPad);
  const face = FACE_BY_SHAPE[dna.bodyShape][stage];
  const dy = stackPad;

  stampGenreHatBackdrop(canvas, dna, palette, face, stage, variant, dy);

  // Variant-driven eye/mouth override
  const effectiveEyes: EyeStyle =
    variant === "sick" ? "cross" : variant === "happy" ? "sparkle" : dna.eyes;
  const effectiveMouth: MouthStyle =
    variant === "sick" ? "wavy" : variant === "happy" ? "smile" : dna.mouth;

  // Eyes (mirror right eye for symmetry)
  const eyePatch = EYE_PATCHES[effectiveEyes];
  stamp(canvas, eyePatch, face.eyeY + dy, face.leftEyeX, (t) =>
    eyeTokenToColor(t, palette),
  );
  stamp(canvas, mirrorEyePatch(eyePatch), face.eyeY + dy, face.rightEyeX, (t) =>
    eyeTokenToColor(t, palette),
  );

  // Mouth
  stamp(canvas, MOUTH_PATCHES[effectiveMouth], face.mouthY + dy, face.mouthX, (t) =>
    mouthTokenToColor(t, palette),
  );

  // Cheeks (single pixel each) – skip for sick to look paler
  if (variant !== "sick") {
    const cheekY = face.cheekY + dy;
    if (
      canvas[cheekY]?.[face.leftCheekX] !== undefined &&
      canvas[cheekY][face.leftCheekX] !== null
    ) {
      canvas[cheekY][face.leftCheekX] = palette.cheek;
    }
    if (
      canvas[cheekY]?.[face.rightCheekX] !== undefined &&
      canvas[cheekY][face.rightCheekX] !== null
    ) {
      canvas[cheekY][face.rightCheekX] = palette.cheek;
    }
  }

  stampGenreGear(canvas, dna, palette, face, stage, variant, dy);

  return canvas;
}

// Build an egg sprite tinted with the DNA's palette (palette.body for shell).
export function composeEggSprite(dna: PetDNA): PixelGrid {
  const palette = paletteWithRarityStyle(dna);
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

/**
 * 스프라이트와 동일 크기의 투명 배경. 희귀도는 `composeSprite`의 팔레트 `outline`(O 토큰)으로 반영.
 */
export function composeRarityBackdrop(
  _dna: PetDNA,
  _variant: SpriteVariant,
  innerRows: number,
  innerCols: number,
): PixelGrid {
  return Array.from({ length: innerRows }, () =>
    Array.from({ length: innerCols }, () => null),
  );
}

export function spriteForStageWithBackdrop(
  dna: PetDNA,
  stage: Stage,
  variant: SpriteVariant,
): { backdrop: PixelGrid; sprite: PixelGrid } {
  const sprite = spriteForStage(dna, stage, variant);
  const innerRows = sprite.length;
  const innerCols = sprite[0]?.length ?? 12;
  const backdrop = composeRarityBackdrop(dna, variant, innerRows, innerCols);
  return { backdrop, sprite };
}

export function spriteForStage(
  dna: PetDNA,
  stage: Stage,
  variant: SpriteVariant,
): PixelGrid {
  if (stage === "egg") return composeEggSprite(dna); // variant intentionally ignored in egg form
  return composeSprite(dna, stage, variant);
}
