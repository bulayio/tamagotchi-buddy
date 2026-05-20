// Pet parts catalog. Body silhouettes use token strings that get resolved
// to palette colors at compose time. Eye/mouth patches are tiny grids
// stamped onto the silhouette.
//
// Tokens used inside silhouettes:
//   'O' = outline color
//   'B' = body color
//   'D' = body-dark (shading) color
//   'C' = cheek color
//   null = transparent

export type Token = "O" | "B" | "D" | "C" | null;
export type TokenGrid = Token[][];
export type PixelGrid = (string | null)[][];

export type BodyShape = "round" | "tall" | "blob" | "square";
export type EyeStyle = "dot" | "oval" | "sleepy" | "sparkle" | "cross";
export type MouthStyle = "smile" | "dot" | "fang" | "wavy";
export type PaletteName =
  | "yellow"
  | "mint"
  | "sky"
  | "pink"
  | "lilac"
  | "peach";

export const BODY_SHAPES: Record<
  BodyShape,
  { baby: TokenGrid; grown: TokenGrid }
> = {
  round: {
    baby: [
      [null, null, null, "O", "O", "O", "O", "O", "O", null, null, null],
      [null, null, "O", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "B", "O", "B", "B", "B", "B", "B", "O", "B", "O"],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, null, "O", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, null, "O", "O", "B", "B", "B", "B", "O", "O", null, null],
      [null, null, "O", "B", null, null, null, null, "B", "O", null, null],
      [null, null, "O", null, null, null, null, null, null, "O", null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    grown: [
      [null, null, "O", "O", "O", "O", "O", "O", "O", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "O", "B", "B", "B", "B", "B", "B", "O", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "O", "B", "B", "B", "B", "B", "B", "O", "O", null],
      [null, "O", "B", null, null, null, null, null, null, "B", "O", null],
      [null, "O", null, null, null, null, null, null, null, null, "O", null],
    ],
  },
  tall: {
    baby: [
      [null, null, null, "O", "O", "O", "O", "O", null, null, null, null],
      [null, null, "O", "B", "B", "B", "B", "B", "O", null, null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "B", "O", "B", "B", "B", "B", "B", "O", "B", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, null, "O", "B", "B", "B", "B", "B", "O", null, null, null],
      [null, "O", "B", null, null, null, null, "B", "O", null, null, null],
      [null, "O", null, null, null, null, null, null, "O", null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    grown: [
      [null, null, "O", "O", "O", "O", "O", "O", "O", null, null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["B", "O", "B", "B", "B", "B", "B", "B", "B", "O", "B", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", null, null, null, null, "B", "O", null, null, null],
      [null, "O", null, null, null, null, null, null, "O", null, null, null],
    ],
  },
  blob: {
    baby: [
      [null, null, "O", "O", "O", "O", "O", "O", "O", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "O", "B", "B", "B", "B", "B", "B", "O", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "O", "B", "B", "B", "B", "B", "B", "O", "O", null],
      [null, "O", "B", null, null, null, null, null, "B", "O", null, null],
      [null, "O", null, null, null, null, null, null, null, "O", null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    grown: [
      [null, "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", null],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "O", "B", "B", "B", "B", "B", "B", "O", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "O", "B", "B", "B", "B", "B", "B", "O", "O", null],
      [null, "O", "B", null, null, null, null, null, null, "B", "O", null],
      [null, "O", null, null, null, null, null, null, null, null, "O", null],
    ],
  },
  square: {
    baby: [
      [null, "O", "O", "O", "O", "O", "O", "O", "O", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "O", "B", "B", "B", "B", "B", "O", "B", "O"],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "B", "O", null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "B", "B", "B", "B", "B", "B", "B", "O", null, null],
      [null, "O", "O", "B", null, null, null, "B", "O", "O", null, null],
      [null, "O", "O", null, null, null, null, null, "O", "O", null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    grown: [
      ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "O", "B", "B", "B", "B", "B", "B", "O", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "O"],
      ["O", "O", "B", null, null, null, null, null, null, "B", "O", "O"],
      ["O", "O", null, null, null, null, null, null, null, null, "O", "O"],
    ],
  },
};

// Eye patches are 3x3, stamped at (eyeY, leftX) and mirrored to (eyeY, rightX).
// 'W' = white sclera token (mapped to white at render). null = leave body color.
export type EyeToken = "O" | "W" | "S" | null; // S = sparkle (white highlight)
export const EYE_PATCHES: Record<EyeStyle, EyeToken[][]> = {
  dot: [
    [null, null, null],
    [null, "O", null],
    [null, null, null],
  ],
  oval: [
    [null, "O", null],
    ["O", "W", "O"],
    [null, "O", null],
  ],
  sleepy: [
    [null, null, null],
    ["O", "O", "O"],
    [null, null, null],
  ],
  sparkle: [
    ["O", "O", null],
    ["O", "W", "S"],
    [null, "O", null],
  ],
  cross: [
    ["O", null, "O"],
    [null, "O", null],
    ["O", null, "O"],
  ],
};

// Mouth patches are 3x2, centered horizontally.
export type MouthToken = "O" | "C" | null;
export const MOUTH_PATCHES: Record<MouthStyle, MouthToken[][]> = {
  smile: [
    ["O", null, "O"],
    [null, "O", null],
  ],
  dot: [
    [null, "O", null],
    [null, null, null],
  ],
  fang: [
    ["O", "O", "O"],
    ["O", null, null],
  ],
  wavy: [
    ["O", null, "O"],
    [null, "O", null],
  ],
};

// Cheek patches: 1x1 dots at fixed cheek positions
export const CHEEK_TOKEN: "C" = "C";

/** 장르 모자 등 합성 시 스탬프용 토큰. */
export type AccToken = "O" | "B" | "D" | "C" | "A" | null; // A = accent (special)

// Palettes: body / bodyDark / cheek / outline / accent
export interface Palette {
  body: string;
  bodyDark: string;
  cheek: string;
  outline: string;
  accent: string;
}

export const PALETTES: Record<PaletteName, Palette> = {
  yellow: {
    body: "#f0d060",
    bodyDark: "#c9a93f",
    cheek: "#ff8fab",
    outline: "#2d2d2d",
    accent: "#ff7a59",
  },
  mint: {
    body: "#9ee5b5",
    bodyDark: "#5fb381",
    cheek: "#ff8fab",
    outline: "#234134",
    accent: "#ffd166",
  },
  sky: {
    body: "#a0d2ff",
    bodyDark: "#5b9be0",
    cheek: "#ff9ab2",
    outline: "#1f3a5f",
    accent: "#ffd166",
  },
  pink: {
    body: "#ffb3c6",
    bodyDark: "#d97a93",
    cheek: "#ff5d8f",
    outline: "#4a1d2c",
    accent: "#fff1a8",
  },
  lilac: {
    body: "#cdb4ff",
    bodyDark: "#8e72d8",
    cheek: "#ff8fab",
    outline: "#2f1f54",
    accent: "#a8f0e0",
  },
  peach: {
    body: "#ffc28a",
    bodyDark: "#d28b50",
    cheek: "#ff7a91",
    outline: "#4a2914",
    accent: "#88e1c8",
  },
};

export const BODY_SHAPE_KEYS: readonly BodyShape[] = [
  "round",
  "tall",
  "blob",
  "square",
];
export const EYE_KEYS: readonly EyeStyle[] = [
  "dot",
  "oval",
  "sleepy",
  "sparkle",
  "cross",
];
export const MOUTH_KEYS: readonly MouthStyle[] = [
  "smile",
  "dot",
  "fang",
  "wavy",
];
export const PALETTE_KEYS: readonly PaletteName[] = [
  "yellow",
  "mint",
  "sky",
  "pink",
  "lilac",
  "peach",
];
