import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';

interface Props {
  active: boolean;
}

// Drops a food sprite from above into the character's mouth area, then fades.
// Pure overlay — sits inside the tamagotchi screen with absolute positioning.
export default function FeedingAnimation({ active }: Props) {
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      translateY.value = -60;
      scale.value = 1;
      return;
    }
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(530, withTiming(0, { duration: 220 })),
    );
    translateY.value = withTiming(36, {
      duration: 650,
      easing: Easing.in(Easing.quad),
    });
    scale.value = withDelay(
      650,
      withTiming(0.2, { duration: 220, easing: Easing.in(Easing.quad) }),
    );
  }, [active, opacity, translateY, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, style]}>
      <PixelSprite sprite={SPRITES.food} scale={2.5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
