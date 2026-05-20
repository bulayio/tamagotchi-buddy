import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../constants/sprites';

interface TapAction {
  onTap: () => void;
  tapCount: number;
  disabled?: boolean;
}

interface Props {
  onFeed: () => void;
  onClean: () => void;
  onPlay: () => void;
  disabled: boolean;
  tapAction?: TapAction;
}

const BUTTONS = [
  { key: 'feed', sprite: SPRITES.cake, label: '밥' },
  { key: 'clean', sprite: SPRITES.broom, label: '청소' },
  { key: 'play', sprite: SPRITES.heart, label: '놀기' },
] as const;

export default function ActionButtons({
  onFeed,
  onClean,
  onPlay,
  disabled,
  tapAction,
}: Props) {
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

  const handleTap = () => {
    if (!tapAction || tapAction.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    tapAction.onTap();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
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

      {tapAction && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tapBtn, tapAction.disabled && styles.disabled]}
          onPress={handleTap}
          disabled={tapAction.disabled}
        >
          <Text style={styles.tapLabel}>TAP!</Text>
          <View style={styles.tapBadge}>
            <Text style={styles.tapBadgeText}>{tapAction.tapCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const BTN_SIZE = 64;
const BTN_INNER = 54;
const ICON_PADDING = 8;
const ICON_SCALE = (BTN_INNER - ICON_PADDING * 2) / (8 * 6);

const ACCENT = '#ff5577';
const ACCENT_DARK = '#a82240';

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  row: {
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
  // 4th TAP button (only visible during battle)
  tapBtn: {
    width: '92%',
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: ACCENT_DARK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  tapLabel: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tapBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 40,
    alignItems: 'center',
  },
  tapBadgeText: {
    color: ACCENT_DARK,
    fontSize: 16,
    fontWeight: '900',
  },
});
