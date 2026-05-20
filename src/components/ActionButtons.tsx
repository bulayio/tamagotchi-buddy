import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';

interface Props {
  onFeed: () => void;
  onClean: () => void;
  onPlay: () => void;
  disabled: boolean;
}

const BUTTONS = [
  { key: 'feed', sprite: SPRITES.cake, label: '밥' },
  { key: 'clean', sprite: SPRITES.broom, label: '청소' },
  { key: 'play', sprite: SPRITES.heart, label: '놀기' },
] as const;

export default function ActionButtons({ onFeed, onClean, onPlay, disabled }: Props) {
  const handlePress = (action: () => void) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  const handlers: Record<(typeof BUTTONS)[number]['key'], () => void> = {
    feed: onFeed,
    clean: onClean,
    play: onPlay,
  };

  return (
    <View style={styles.container}>
      {BUTTONS.map((b) => (
        <View key={b.key} style={styles.cell}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, disabled && styles.disabled]}
            onPress={() => handlePress(handlers[b.key])}
            disabled={disabled}
          >
            <View style={styles.buttonInner}>
              <PixelSprite sprite={b.sprite} scale={ICON_SCALE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.label}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const BTN_SIZE = 64;
const BTN_INNER = 54;
const ICON_PADDING = 8;
// Icons are 8 px wide at PIXEL_SIZE=6 → natural 48 px. Fit them into
// BTN_INNER minus padding on both sides.
const ICON_SCALE = (BTN_INNER - ICON_PADDING * 2) / (8 * 6);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 8,
  },
  cell: {
    alignItems: 'center',
    gap: 4,
  },
  button: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: '#3b2557',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonInner: {
    width: BTN_INNER,
    height: BTN_INNER,
    borderRadius: BTN_INNER / 2,
    backgroundColor: '#5a3b8a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7a5cb8',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: '#3b2557',
    fontSize: 11,
    fontWeight: '700',
  },
});
