// Pixel art represented as 2D arrays of hex colors (null = transparent)
// Each sprite is 12x12 pixels

type PixelRow = (string | null)[];
type Sprite = PixelRow[];

const C = '#2d2d2d'; // dark outline
const W = '#ffffff'; // white
const Y = '#f0d060'; // yellow body
const P = '#ff8fab'; // pink cheek
const R = '#ff4444'; // red/danger
const G = '#88cc44'; // green
const B = '#4488ff'; // blue
const BR = '#8b6914'; // brown

export const SPRITES: Record<string, Sprite> = {
  egg: [
    [null, null, null, null, C, C, C, C, null, null, null, null],
    [null, null, null, C, W, W, W, W, C, null, null, null],
    [null, null, C, W, W, W, W, W, W, C, null, null],
    [null, C, W, W, W, W, W, W, W, W, C, null],
    [null, C, W, W, W, W, W, W, W, W, C, null],
    [null, C, W, W, C, W, W, C, W, W, C, null],
    [null, C, W, W, W, W, W, W, W, W, C, null],
    [null, C, W, W, W, W, W, W, W, W, C, null],
    [null, null, C, W, W, W, W, W, W, C, null, null],
    [null, null, null, C, W, W, W, W, C, null, null, null],
    [null, null, null, null, C, C, C, C, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  baby: [
    [null, null, null, C, C, C, C, C, C, null, null, null],
    [null, null, C, Y, Y, Y, Y, Y, Y, C, null, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, C, Y, C, Y, Y, Y, Y, C, Y, C, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, C, P, Y, Y, C, C, Y, Y, P, C, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, null, C, Y, Y, Y, Y, Y, Y, C, null, null],
    [null, null, C, C, Y, Y, Y, Y, C, C, null, null],
    [null, null, null, C, C, C, C, C, null, null, null, null],
    [null, null, C, C, null, null, null, null, C, C, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  grown: [
    [null, null, C, C, C, C, C, C, C, C, null, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, Y, C, C, Y, Y, Y, Y, C, C, Y, C],
    [C, Y, C, W, Y, Y, Y, Y, C, W, Y, C],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, P, Y, Y, C, C, C, C, Y, Y, P, C],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, C, C, Y, Y, Y, Y, Y, Y, C, C, null],
    [null, C, C, C, C, C, C, C, C, C, C, null],
    [null, C, C, null, null, null, null, null, null, C, C, null],
  ],
  sick: [
    [null, null, C, C, C, C, C, C, C, C, null, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, Y, C, C, Y, Y, Y, Y, C, C, Y, C],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, Y, Y, Y, C, C, C, C, Y, Y, Y, C],
    [C, Y, Y, C, Y, Y, Y, Y, C, Y, Y, C],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, C, C, Y, Y, Y, Y, Y, Y, C, C, null],
    [null, C, C, C, C, C, C, C, C, C, C, null],
    [null, C, C, null, null, null, null, null, null, C, C, null],
  ],
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
  happy: [
    [null, null, C, C, C, C, C, C, C, C, null, null],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, Y, C, C, Y, Y, Y, Y, C, C, Y, C],
    [C, Y, C, W, Y, Y, Y, Y, C, W, Y, C],
    [C, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, C],
    [C, P, Y, C, Y, Y, Y, Y, C, Y, P, C],
    [C, Y, Y, Y, C, C, C, C, Y, Y, Y, C],
    [null, C, Y, Y, Y, Y, Y, Y, Y, Y, C, null],
    [null, C, C, Y, Y, Y, Y, Y, Y, C, C, null],
    [null, C, C, C, C, C, C, C, C, C, C, null],
    [null, C, C, null, null, null, null, null, null, C, C, null],
  ],
};

export const PIXEL_SIZE = 6;
