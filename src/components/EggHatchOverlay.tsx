import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useEggMetrics } from '../lib/eggMetrics';
import {
  EGG_BASE,
  EGG_SHADE,
  SPOT_DARK,
  SPOT_SOFT,
  SPOTS,
  EggSpot,
} from '../constants/eggTheme';

interface Props {
  onComplete: () => void;
}

const POP_IN_END = 250;
const SHAKE_START = 250;
const SHAKE_END = 750;
const BREAK_AT = 800;
const SCATTER_END = 1350;
const DONE = 1500;

interface Shard {
  /** percent of egg width (left edge) */
  x: number;
  /** percent of egg height (top edge) */
  y: number;
  /** width as fraction of egg width */
  w: number;
  /** height as fraction of egg height */
  h: number;
  /** outward translation as multiples of eggWidth */
  dx: number;
  /** outward translation as multiples of eggHeight (positive = down) */
  dy: number;
  /** final rotation in degrees */
  rot: number;
  /** asymmetric border radii in px */
  br: { tl: number; tr: number; bl: number; br: number };
}

// 8 shards arranged in a rough 2×4 grid, with overlap so the intact egg shape
// is fully covered. Each flies outward from center; bottom row biased downward
// for a gravity feel.
const SHARDS: Shard[] = [
  // Top row
  {
    x: -2,
    y: -2,
    w: 0.32,
    h: 0.58,
    dx: -1.1,
    dy: -0.6,
    rot: -140,
    br: { tl: 80, tr: 12, bl: 22, br: 14 },
  },
  {
    x: 24,
    y: -4,
    w: 0.3,
    h: 0.55,
    dx: -0.4,
    dy: -0.9,
    rot: -55,
    br: { tl: 28, tr: 36, bl: 16, br: 20 },
  },
  {
    x: 48,
    y: -4,
    w: 0.3,
    h: 0.55,
    dx: 0.4,
    dy: -0.9,
    rot: 60,
    br: { tl: 36, tr: 30, bl: 22, br: 16 },
  },
  {
    x: 72,
    y: -2,
    w: 0.32,
    h: 0.58,
    dx: 1.1,
    dy: -0.6,
    rot: 140,
    br: { tl: 14, tr: 80, bl: 18, br: 26 },
  },
  // Bottom row
  {
    x: -2,
    y: 46,
    w: 0.3,
    h: 0.58,
    dx: -1.0,
    dy: 0.7,
    rot: -100,
    br: { tl: 18, tr: 16, bl: 72, br: 20 },
  },
  {
    x: 22,
    y: 48,
    w: 0.32,
    h: 0.56,
    dx: -0.3,
    dy: 1.0,
    rot: -30,
    br: { tl: 14, tr: 18, bl: 30, br: 38 },
  },
  {
    x: 48,
    y: 48,
    w: 0.32,
    h: 0.56,
    dx: 0.3,
    dy: 1.0,
    rot: 30,
    br: { tl: 16, tr: 14, bl: 38, br: 30 },
  },
  {
    x: 72,
    y: 46,
    w: 0.3,
    h: 0.58,
    dx: 1.0,
    dy: 0.7,
    rot: 100,
    br: { tl: 16, tr: 18, bl: 24, br: 72 },
  },
];

function ShardView({
  shard,
  eggWidth,
  eggHeight,
}: {
  shard: Shard;
  eggWidth: number;
  eggHeight: number;
}) {
  const opacity = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    // Pop into existence the instant the egg "breaks"
    opacity.value = withDelay(BREAK_AT, withTiming(1, { duration: 40 }));
    // Then translate outward and rotate
    const scatterDuration = SCATTER_END - BREAK_AT;
    tx.value = withDelay(
      BREAK_AT,
      withTiming(eggWidth * shard.dx, {
        duration: scatterDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    ty.value = withDelay(
      BREAK_AT,
      withTiming(eggHeight * shard.dy, {
        duration: scatterDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    rot.value = withDelay(
      BREAK_AT,
      withTiming(shard.rot, {
        duration: scatterDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    // Fade out during the back half of the scatter
    opacity.value = withDelay(
      BREAK_AT + scatterDuration * 0.4,
      withTiming(0, { duration: scatterDuration * 0.6 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eggWidth, eggHeight]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: (eggWidth * shard.x) / 100,
          top: (eggHeight * shard.y) / 100,
          width: eggWidth * shard.w,
          height: eggHeight * shard.h,
          backgroundColor: EGG_BASE,
          borderWidth: 2,
          borderColor: EGG_SHADE,
          borderTopLeftRadius: shard.br.tl,
          borderTopRightRadius: shard.br.tr,
          borderBottomLeftRadius: shard.br.bl,
          borderBottomRightRadius: shard.br.br,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 3,
        },
        animStyle,
      ]}
    />
  );
}

function renderSpot(s: EggSpot, i: number, eggWidth: number, eggHeight: number) {
  const w = eggWidth * s.size;
  const h = w * s.ratio;
  return (
    <View
      key={i}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (eggWidth * s.x) / 100 - w / 2,
        top: (eggHeight * s.y) / 100 - h / 2,
        width: w,
        height: h,
        borderRadius: w / 2,
        backgroundColor: s.color === 'dark' ? SPOT_DARK : SPOT_SOFT,
        opacity: s.color === 'dark' ? 0.78 : 0.55,
        transform: [{ rotate: `${s.rotate}deg` }],
      }}
    />
  );
}

export default function EggHatchOverlay({ onComplete }: Props) {
  const { eggWidth, eggHeight } = useEggMetrics();

  const popScale = useSharedValue(0.85);
  const popOpacity = useSharedValue(0);
  const shake = useSharedValue(0);
  const intactOpacity = useSharedValue(1);

  useEffect(() => {
    // Phase 1: pop in
    popOpacity.value = withTiming(1, {
      duration: POP_IN_END,
      easing: Easing.out(Easing.cubic),
    });
    popScale.value = withTiming(1, {
      duration: POP_IN_END,
      easing: Easing.out(Easing.back(1.6)),
    });

    // Phase 2: increasingly violent shake
    const shakeDuration = SHAKE_END - SHAKE_START;
    shake.value = withDelay(
      SHAKE_START,
      withSequence(
        withRepeat(
          withSequence(
            withTiming(-2, { duration: 50 }),
            withTiming(2, { duration: 50 }),
          ),
          2,
          false,
        ),
        // Stronger second wave
        withRepeat(
          withSequence(
            withTiming(-5, { duration: 40 }),
            withTiming(5, { duration: 40 }),
          ),
          3,
          false,
        ),
        withTiming(0, { duration: 40 }),
      ),
    );

    // Phase 3: hide intact egg the moment shards take over
    intactOpacity.value = withDelay(
      BREAK_AT,
      withTiming(0, { duration: 60 }),
    );

    // Notify caller after scatter completes
    const safety = setTimeout(() => onComplete(), DONE);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eggHeight]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: popOpacity.value,
    transform: [
      { scale: popScale.value },
      { rotate: `${shake.value}deg` },
    ],
  }));

  const intactStyle = useAnimatedStyle(() => ({
    opacity: intactOpacity.value,
  }));

  const topRadius = eggWidth / 2;
  const bottomRadius = eggWidth / 1.6;

  return (
    <View pointerEvents="none" style={styles.absoluteFill}>
      <View style={styles.center}>
        <Animated.View
          style={[{ width: eggWidth, height: eggHeight }, wrapperStyle]}
        >
          {/* Intact egg — visible during pop-in and shake, hidden when shards appear */}
          <Animated.View
            style={[
              styles.intact,
              {
                width: eggWidth,
                height: eggHeight,
                borderTopLeftRadius: topRadius,
                borderTopRightRadius: topRadius,
                borderBottomLeftRadius: bottomRadius,
                borderBottomRightRadius: bottomRadius,
              },
              intactStyle,
            ]}
          >
            {SPOTS.map((s, i) => renderSpot(s, i, eggWidth, eggHeight))}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: eggHeight * 0.06,
                left: eggWidth * 0.15,
                width: eggWidth * 0.55,
                height: eggHeight * 0.22,
                borderRadius: eggWidth / 2,
                backgroundColor: 'rgba(255,255,255,0.35)',
              }}
            />
          </Animated.View>

          {/* Shards — invisible until BREAK_AT, then fly outward */}
          {SHARDS.map((shard, i) => (
            <ShardView
              key={i}
              shard={shard}
              eggWidth={eggWidth}
              eggHeight={eggHeight}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intact: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: EGG_BASE,
    borderWidth: 2,
    borderColor: EGG_SHADE,
    overflow: 'hidden',
  },
});
