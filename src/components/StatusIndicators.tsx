import React from 'react';
import { View, StyleSheet } from 'react-native';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';

interface Props {
  poopCount: number;
  isHungry: boolean;
  isSick: boolean;
  isDead: boolean;
}

export default function StatusIndicators({ poopCount, isHungry, isSick, isDead }: Props) {
  if (isDead) return null;

  return (
    <View style={styles.container}>
      {isSick && (
        <View style={styles.indicator}>
          <PixelSprite sprite={SPRITES.skull} scale={2} />
        </View>
      )}
      {isHungry && !isSick && (
        <View style={styles.indicator}>
          <PixelSprite sprite={SPRITES.food} scale={2} />
        </View>
      )}
      <View style={styles.poopRow}>
        {Array.from({ length: poopCount }).map((_, i) => (
          <View key={i} style={styles.poopItem}>
            <PixelSprite sprite={SPRITES.poop} scale={1.5} />
          </View>
        ))}
      </View>
    </View>
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
    top: 8,
    right: 16,
  },
  poopRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 2,
  },
  poopItem: {},
});
