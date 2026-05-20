import React from 'react';
import { View, StyleSheet } from 'react-native';
import PixelSprite from './PixelSprite';
import { PIXEL_SIZE } from '../constants/sprites';

interface Props {
  backdrop: (string | null)[][];
  sprite: (string | null)[][];
  scale?: number;
}

/** 투명 배경 + 스프라이트 2레이어. 희귀도 윤곽선은 스프라이트 합성 시 팔레트 `outline`으로 처리. */
export default function PixelPetView({ backdrop, sprite, scale = 1 }: Props) {
  const bw = backdrop[0]?.length ?? 16;
  const bh = backdrop.length;
  const sw = sprite[0]?.length ?? 12;
  const sh = sprite.length;
  const padX = Math.max(0, Math.floor((bw - sw) / 2));
  const padY = Math.max(0, Math.floor((bh - sh) / 2));
  const px = PIXEL_SIZE * scale;

  return (
    <View style={[styles.wrap, { width: bw * px, height: bh * px }]}>
      <View style={StyleSheet.absoluteFillObject}>
        <PixelSprite sprite={backdrop} scale={scale} />
      </View>
      <View style={{ position: 'absolute', left: padX * px, top: padY * px }}>
        <PixelSprite sprite={sprite} scale={scale} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});
