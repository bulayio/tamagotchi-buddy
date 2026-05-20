// Static sprites that are NOT character-dependent.
// Per-pet characters are now composed at runtime via src/lib/petGenerator.ts.

type PixelRow = (string | null)[];
type Sprite = PixelRow[];

const C = '#2d2d2d'; // dark outline
const W = '#ffffff'; // white
const Y = '#f0d060'; // yellow (used by food)
const R = '#ff4444'; // red
const BR = '#8b6914'; // brown

export const SPRITES: Record<string, Sprite> = {
  dead: [
    [null, null, null, C, C, C, C, C, null, null, null, null],
    [null, null, C, BR, BR, BR, BR, BR, C, null, null, null],
    [null, C, BR, BR, BR, BR, BR, BR, BR, C, null, null],
    [null, C, BR, BR, BR, BR, BR, BR, BR, C, null, null],
    [null, C, BR, BR, BR, BR, BR, BR, BR, C, null, null],
    [C, C, C, C, C, C, C, C, C, C, C, null],
    [C, BR, BR, BR, BR, BR, BR, BR, BR, BR, C, null],
    [C, BR, C, C, BR, BR, BR, C, C, BR, C, null],
    [C, BR, C, C, BR, BR, BR, C, C, BR, C, null],
    [C, BR, BR, BR, C, C, C, BR, BR, BR, C, null],
    [C, BR, BR, BR, BR, BR, BR, BR, BR, BR, C, null],
    [null, C, C, C, C, C, C, C, C, C, null, null],
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
};

export const PIXEL_SIZE = 6;
