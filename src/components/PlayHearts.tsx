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

const SLOTS: { dx: number; delay: number }[] = [
  { dx: -34, delay: 0 },
  { dx: 30, delay: 90 },
  { dx: -14, delay: 200 },
  { dx: 22, delay: 300 },
  { dx: -28, delay: 420 },
];

function Heart({ dx, delay, trigger }: { dx: number; delay: number; trigger: number }) {
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    if (trigger === 0) return;
    ty.value = 0;
    opacity.value = 0;
    scale.value = 0.4;
    ty.value = withDelay(
      delay,
      withTiming(-46, { duration: 1100, easing: Easing.out(Easing.quad) }),
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 180 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 420 }),
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
      { translateX: dx },
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
        <Heart key={i} dx={slot.dx} delay={slot.delay} trigger={trigger} />
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
