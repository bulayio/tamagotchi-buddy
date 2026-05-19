import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';
import { Stage } from '../constants/config';

interface Props {
  stage: Stage;
  isSick: boolean;
  isDead: boolean;
  isPlaying: boolean;
}

export default function PixelCharacter({ stage, isSick, isDead, isPlaying }: Props) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isDead) {
      translateY.value = 0;
      translateX.value = 0;
      rotate.value = 0;
      return;
    }

    if (isPlaying) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 100 }),
          withTiming(8, { duration: 100 }),
        ),
        5,
        true,
      );
      setTimeout(() => {
        translateX.value = withTiming(0, { duration: 200 });
      }, 2000);
      return;
    }

    if (isSick) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }),
        ),
        -1,
        true,
      );
      return;
    }

    // Idle bounce
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    translateX.value = withTiming(0, { duration: 200 });
  }, [isDead, isSick, isPlaying, translateY, translateX, rotate]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  const getSpriteKey = () => {
    if (isDead) return 'dead';
    if (isPlaying) return 'happy';
    if (isSick) return 'sick';
    return stage;
  };

  const sprite = SPRITES[getSpriteKey()];

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <PixelSprite sprite={sprite} scale={stage === 'egg' ? 3 : 3.5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
