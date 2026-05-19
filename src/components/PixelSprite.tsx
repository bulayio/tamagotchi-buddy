import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PIXEL_SIZE } from '../constants/sprites';

interface Props {
  sprite: (string | null)[][];
  scale?: number;
}

export default function PixelSprite({ sprite, scale = 1 }: Props) {
  const size = PIXEL_SIZE * scale;
  return (
    <View style={styles.container}>
      {sprite.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((color, x) => (
            <View
              key={x}
              style={{
                width: size,
                height: size,
                backgroundColor: color ?? 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  row: { flexDirection: 'row' },
});
