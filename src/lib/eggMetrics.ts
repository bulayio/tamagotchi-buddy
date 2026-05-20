import { useWindowDimensions } from 'react-native';

export const MAX_EGG_WIDTH = 400;
export const MIN_EGG_WIDTH = 240;
export const EGG_HORIZONTAL_MARGIN = 32;
export const EGG_ASPECT = 1.27; // height / width
/**
 * The device (egg) shouldn't dominate the screen on short viewports — cap it
 * to roughly half the visible height so growth label / buttons / demo panel
 * fit below without scrolling on a typical phone.
 */
export const EGG_HEIGHT_RATIO = 0.5;

export interface EggMetrics {
  eggWidth: number;
  eggHeight: number;
  screenWidth: number;
  screenHeight: number;
}

export function computeEggMetrics(
  windowWidth: number,
  windowHeight: number,
): EggMetrics {
  const fromWidth = windowWidth - EGG_HORIZONTAL_MARGIN;
  const fromHeight = (windowHeight * EGG_HEIGHT_RATIO) / EGG_ASPECT;
  const eggWidth = Math.max(
    MIN_EGG_WIDTH,
    Math.min(MAX_EGG_WIDTH, fromWidth, fromHeight),
  );
  const eggHeight = eggWidth * EGG_ASPECT;
  const screenWidth = eggWidth * 0.74;
  const screenHeight = eggHeight * 0.47;
  return { eggWidth, eggHeight, screenWidth, screenHeight };
}

export function useEggMetrics(): EggMetrics {
  const { width, height } = useWindowDimensions();
  return computeEggMetrics(width, height);
}
