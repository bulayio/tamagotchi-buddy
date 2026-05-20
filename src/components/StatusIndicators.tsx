import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import { SPRITES, PIXEL_SIZE } from '../constants/sprites';
import { useEggMetrics } from '../lib/eggMetrics';

interface Props {
  poopCount: number;
  isHungry: boolean;
  isSick: boolean;
  isDead: boolean;
  isCleaning: boolean;
}

export default function StatusIndicators({
  poopCount,
  isHungry,
  isSick,
  isDead,
  isCleaning,
}: Props) {
  const { screenWidth } = useEggMetrics();
  // Target indicator width ≈ 16% of LCD width — scales with the device.
  const targetW = screenWidth * 0.16;
  const skullScale = targetW / (8 * PIXEL_SIZE); // skull is 8 cols wide
  const foodScale = targetW / (6 * PIXEL_SIZE); // food is 6 cols wide

  if (isDead) return null;

  return (
    <View style={styles.container}>
      {isSick && (
        <View style={styles.indicator}>
          <PixelSprite sprite={SPRITES.skull} scale={skullScale} />
        </View>
      )}
      {isHungry && !isSick && (
        <View style={styles.indicator}>
          <PixelSprite sprite={SPRITES.food} scale={foodScale} />
        </View>
      )}
      <View style={styles.poopColLeft}>
        {Array.from({ length: poopCount })
          .map((_, i) => i)
          .filter((i) => i % 2 === 0)
          .map((i) => (
            <PoopItem key={i} index={i} isCleaning={isCleaning} />
          ))}
      </View>
      <View style={styles.poopColRight}>
        {Array.from({ length: poopCount })
          .map((_, i) => i)
          .filter((i) => i % 2 === 1)
          .map((i) => (
            <PoopItem key={i} index={i} isCleaning={isCleaning} />
          ))}
      </View>
    </View>
  );
}

function PoopItem({ index, isCleaning }: { index: number; isCleaning: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-16);

  // Bounce-in on mount (new poop appearing)
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withSpring(0, { damping: 8, stiffness: 140 });
  }, [opacity, translateY]);

  // Sweep up + fade out when cleaning, staggered left-to-right
  useEffect(() => {
    if (!isCleaning) return;
    const delay = index * 70;
    opacity.value = withDelay(delay, withTiming(0, { duration: 280 }));
    translateY.value = withDelay(
      delay,
      withTiming(-32, { duration: 360, easing: Easing.in(Easing.quad) }),
    );
  }, [isCleaning, index, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.poopItem, style]}>
      <PixelSprite sprite={SPRITES.poopDrop} scale={1.2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    right: 6,
  },
  poopColLeft: {
    position: 'absolute',
    bottom: 4,
    left: 2,
    flexDirection: 'column-reverse',
    gap: 2,
  },
  poopColRight: {
    position: 'absolute',
    bottom: 4,
    right: 2,
    flexDirection: 'column-reverse',
    gap: 2,
  },
  poopItem: {},
});
