import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';

interface Props {
  active: boolean;
}

// Hearts spawn at the left/right edges of the character's head and drift up
// and slightly outward. `startX` is measured in px from the character's center.
// Position startX just outside the character's silhouette so hearts never
// overlap the sprite. Character is up to ~100 px wide → half-width ~50; the
// heart sprite is ~24 px wide so its inner edge sits ~12 px from startX.
const SLOTS: { startX: number; driftX: number; delay: number }[] = [
  { startX: -64, driftX: -8, delay: 0 },
  { startX: 64, driftX: 8, delay: 90 },
  { startX: -60, driftX: -14, delay: 220 },
  { startX: 60, driftX: 14, delay: 320 },
  { startX: -68, driftX: -6, delay: 450 },
];

function Heart({
  startX,
  driftX,
  delay,
  trigger,
}: {
  startX: number;
  driftX: number;
  delay: number;
  trigger: number;
}) {
  const tx = useSharedValue(startX);
  const ty = useSharedValue(-6); // start near top of head
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    if (trigger === 0) return;
    tx.value = startX;
    ty.value = -6;
    opacity.value = 0;
    scale.value = 0.3;
    tx.value = withDelay(
      delay,
      withTiming(startX + driftX, {
        duration: 1100,
        easing: Easing.out(Easing.quad),
      }),
    );
    ty.value = withDelay(
      delay,
      withTiming(-50, { duration: 1100, easing: Easing.out(Easing.quad) }),
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 160 }),
        withTiming(1, { duration: 540 }),
        withTiming(0, { duration: 400 }),
      ),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 180, easing: Easing.out(Easing.back(2)) }),
        withTiming(0.85, { duration: 700 }),
      ),
    );
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.heart, style]}>
      <PixelSprite sprite={SPRITES.heart} scale={0.5} />
    </Animated.View>
  );
}

export default function PlayHearts({ active }: Props) {
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (active) setTrigger((t) => t + 1);
  }, [active]);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {SLOTS.map((slot, i) => (
        <Heart
          key={i}
          startX={slot.startX}
          driftX={slot.driftX}
          delay={slot.delay}
          trigger={trigger}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    position: 'absolute',
  },
});
