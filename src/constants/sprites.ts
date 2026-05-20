// Static sprites that are NOT character-dependent.
// Per-pet characters are now composed at runtime via src/lib/petGenerator.ts.

type PixelRow = (string | null)[];
type Sprite = PixelRow[];

const C = '#2d2d2d'; // dark outline
const W = '#ffffff'; // white
const Y = '#f0d060'; // yellow (used by food)
const R = '#ff4444'; // red
const BR = '#8b6914'; // brown
const P = '#ff8fb1'; // pink (cake decoration)
const O = '#ff9933'; // orange (flame)
const LG = '#a8a8a8'; // light gray (tombstone fill)
const DG = '#6a6a6a'; // dark gray (tombstone shadow)

export const SPRITES: Record<string, Sprite> = {
  dead: [
    // Gray cross tombstone — vertical bar at cols 5-6, horizontal arm rows 3-6
    [null, null, null, null, C, C, C, C, null, null, null, null],
    [null, null, null, null, C, LG, LG, C, null, null, null, null],
    [null, null, null, null, C, LG, DG, C, null, null, null, null],
    [null, C, C, C, C, LG, DG, C, C, C, C, null],
    [null, C, LG, LG, LG, LG, LG, LG, DG, DG, C, null],
    [null, C, LG, LG, LG, LG, LG, LG, DG, DG, C, null],
    [null, C, C, C, C, LG, DG, C, C, C, C, null],
    [null, null, null, null, C, LG, DG, C, null, null, null, null],
    [null, null, null, null, C, LG, DG, C, null, null, null, null],
    [null, null, null, null, C, LG, DG, C, null, null, null, null],
    [null, null, null, C, C, LG, DG, DG, C, C, null, null],
    [null, null, C, C, LG, LG, DG, DG, DG, C, C, null],
  ],
  poop: [
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, BR, null, null, null, null, null, null, null],
    [null, null, null, BR, BR, BR, null, null, null, null, null, null],
    [null, null, BR, BR, BR, BR, BR, null, null, null, null, null],
    [null, null, null, BR, BR, BR, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  // Compact drop with no surrounding padding — used by StatusIndicators
  // so the bounding box hugs the visible shape.
  poopDrop: [
    [null, null, BR, null, null],
    [null, BR, BR, BR, null],
    [BR, BR, BR, BR, BR],
    [null, BR, BR, BR, null],
  ],
  skull: [
    [null, null, C, C, C, C, null, null],
    [null, C, W, W, W, W, C, null],
    [C, W, C, W, W, C, W, C],
    [C, W, W, W, W, W, W, C],
    [null, C, W, C, W, C, null, null],
    [null, null, C, C, C, null, null, null],
  ],
  food: [
    [null, null, R, R, null, null],
    [null, R, R, R, R, null],
    [BR, BR, BR, BR, BR, BR],
    [BR, Y, Y, Y, Y, BR],
    [BR, BR, BR, BR, BR, BR],
    [null, BR, BR, BR, BR, null],
  ],
  cake: [
    [null, null, null, O, null, null, null, null],
    [null, null, null, O, null, null, null, null],
    [null, null, null, W, null, null, null, null],
    [null, W, W, W, W, W, W, null],
    [W, P, W, W, P, W, P, W],
    [Y, Y, Y, Y, Y, Y, Y, Y],
    [Y, BR, Y, Y, BR, Y, Y, Y],
    [Y, Y, Y, Y, Y, Y, Y, Y],
  ],
  broom: [
    [null, null, null, null, null, null, BR, null],
    [null, null, null, null, null, BR, BR, null],
    [null, null, null, null, BR, BR, null, null],
    [null, null, null, BR, BR, null, null, null],
    [null, null, C, C, C, C, null, null],
    [null, Y, Y, Y, Y, Y, Y, null],
    [Y, Y, Y, Y, Y, Y, Y, Y],
    [Y, null, Y, Y, Y, Y, null, Y],
  ],
  heart: [
    [null, R, R, null, null, R, R, null],
    [R, R, R, R, R, R, R, R],
    [R, R, R, R, R, R, R, R],
    [R, R, R, R, R, R, R, R],
    [null, R, R, R, R, R, R, null],
    [null, null, R, R, R, R, null, null],
    [null, null, null, R, R, null, null, null],
    [null, null, null, null, null, null, null, null],
  ],
  kiBlast: [
    [null, Y, O, Y, null],
    [Y, O, W, O, Y],
    [O, W, W, W, O],
    [Y, O, W, O, Y],
    [null, Y, O, Y, null],
  ],
  impact: [
    [Y, null, null, null, Y],
    [null, O, Y, O, null],
    [null, Y, W, Y, null],
    [null, O, Y, O, null],
    [Y, null, null, null, Y],
  ],
};

export const PIXEL_SIZE = 6;
