export const EGG_BASE = '#f3e3c3';
export const EGG_SHADE = '#d9c39a';
export const SPOT_DARK = '#6b4423';
export const SPOT_SOFT = '#8a5a30';

export interface EggSpot {
  /** percent of egg width */
  x: number;
  /** percent of egg height */
  y: number;
  /** spot width as fraction of egg width */
  size: number;
  rotate: number;
  color: 'dark' | 'soft';
  /** height/width ratio for the spot ellipse */
  ratio: number;
}

export const SPOTS: EggSpot[] = [
  { x: 12, y: 7, size: 0.18, rotate: -20, color: 'dark', ratio: 0.85 },
  { x: 82, y: 18, size: 0.13, rotate: -10, color: 'dark', ratio: 0.9 },
  { x: 6, y: 68, size: 0.2, rotate: -30, color: 'soft', ratio: 0.95 },
  { x: 78, y: 88, size: 0.22, rotate: -8, color: 'dark', ratio: 0.9 },
  { x: 30, y: 90, size: 0.11, rotate: 18, color: 'soft', ratio: 1.0 },
];
