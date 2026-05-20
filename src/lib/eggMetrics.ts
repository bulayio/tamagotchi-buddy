import { useWindowDimensions } from 'react-native';

export const MAX_EGG_WIDTH = 500;
export const MIN_EGG_WIDTH = 260;
export const EGG_HORIZONTAL_MARGIN = 32;
export const EGG_ASPECT = 1.27; // height / width

export interface EggMetrics {
  eggWidth: number;
  eggHeight: number;
  screenWidth: number;
  screenHeight: number;
}

export function computeEggMetrics(windowWidth: number): EggMetrics {
  const eggWidth = Math.max(
    MIN_EGG_WIDTH,
    Math.min(MAX_EGG_WIDTH, windowWidth - EGG_HORIZONTAL_MARGIN),
  );
  const eggHeight = eggWidth * EGG_ASPECT;
  const screenWidth = eggWidth * 0.74;
  const screenHeight = eggHeight * 0.47;
  return { eggWidth, eggHeight, screenWidth, screenHeight };
}

export function useEggMetrics(): EggMetrics {
  const { width } = useWindowDimensions();
  return computeEggMetrics(width);
}
