import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import PixelPetView from './PixelPetView';
import { SPRITES, PIXEL_SIZE } from '../constants/sprites';
import { Stage } from '../constants/config';
import {
  PetDNA,
  spriteForStageWithBackdrop,
} from '../lib/petGenerator';
import { useEggMetrics } from '../lib/eggMetrics';

interface Props {
  stage: Stage;
  isSick: boolean;
  isDead: boolean;
  isPlaying: boolean;
  dna: PetDNA | null;
}

export default function PixelCharacter({ stage, isSick, isDead, isPlaying, dna }: Props) {
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

  const petPack = useMemo(() => {
    if (isDead || !dna) return null;
    if (isPlaying) return spriteForStageWithBackdrop(dna, stage, 'happy');
    if (isSick) return spriteForStageWithBackdrop(dna, stage, 'sick');
    return spriteForStageWithBackdrop(dna, stage, null);
  }, [dna, stage, isDead, isPlaying, isSick]);

  const { screenWidth, screenHeight } = useEggMetrics();
  const deadSprite = SPRITES.dead;
  const innerCols = petPack ? petPack.backdrop[0]?.length ?? 12 : deadSprite[0]?.length ?? 12;
  const innerRows = petPack ? petPack.backdrop.length : deadSprite.length;
  // Fit sprite to ~60% of LCD width and ~70% of LCD height, then take the smaller.
  // Leaves room for the idle bounce and status indicators.
  const targetW = screenWidth * 0.6;
  const targetH = screenHeight * 0.7;
  const baseScale = Math.min(
    targetW / (innerCols * PIXEL_SIZE),
    targetH / (innerRows * PIXEL_SIZE),
  );
  const stageScale = stage === 'egg' ? 0.85 : 1;
  const scale = Math.max(1.4, baseScale * stageScale);

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {petPack ? (
        <PixelPetView
          backdrop={petPack.backdrop}
          sprite={petPack.sprite}
          scale={scale}
        />
      ) : (
        <PixelSprite sprite={deadSprite} scale={scale} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
