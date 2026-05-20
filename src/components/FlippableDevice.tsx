import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  /** Animation duration in ms. */
  duration?: number;
}

export default function FlippableDevice({
  front,
  back,
  flipped,
  duration = 700,
}: Props) {
  // Rotation accumulates in 180° increments. Each press of the flip button
  // continues spinning in the same direction, so it never feels like it's
  // "unwinding" — but exactly half a turn settles on the opposite face.
  const rotation = useSharedValue(0);
  const targetRef = useRef(0);
  const prevFlippedRef = useRef(flipped);

  useEffect(() => {
    // Skip the initial mount render — only animate on actual toggles.
    if (prevFlippedRef.current === flipped) return;
    prevFlippedRef.current = flipped;
    targetRef.current += 180;
    rotation.value = withTiming(targetRef.current, {
      duration,
      easing: Easing.inOut(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  const frontStyle = useAnimatedStyle(() => {
    const mod = ((rotation.value % 360) + 360) % 360;
    const visible = mod < 90 || mod > 270;
    return {
      opacity: visible ? 1 : 0,
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotation.value}deg` },
      ],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const back = rotation.value + 180;
    const mod = ((back % 360) + 360) % 360;
    const visible = mod < 90 || mod > 270;
    return {
      opacity: visible ? 1 : 0,
      transform: [
        { perspective: 1200 },
        { rotateY: `${back}deg` },
      ],
    };
  });

  return (
    <View style={styles.wrap}>
      {/* Front in flow so the parent gets its natural size */}
      <Animated.View
        style={frontStyle}
        pointerEvents={flipped ? 'none' : 'auto'}
      >
        {front}
      </Animated.View>
      {/* Back overlaid */}
      <Animated.View
        style={[styles.back, backStyle]}
        pointerEvents={flipped ? 'auto' : 'none'}
      >
        <View style={styles.backInner}>{back}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  back: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backInner: {
    // Matches the same centering used by TamagotchiFrame so both faces sit
    // identically.
  },
});
