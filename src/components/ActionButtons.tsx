import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onFeed: () => void;
  onClean: () => void;
  onPlay: () => void;
  disabled: boolean;
}

export default function ActionButtons({ onFeed, onClean, onPlay, disabled }: Props) {
  const handlePress = (action: () => void) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={() => handlePress(onFeed)}
        disabled={disabled}
      >
        <Text style={styles.emoji}>🍖</Text>
        <Text style={styles.label}>밥</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={() => handlePress(onClean)}
        disabled={disabled}
      >
        <Text style={styles.emoji}>🧹</Text>
        <Text style={styles.label}>청소</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={() => handlePress(onPlay)}
        disabled={disabled}
      >
        <Text style={styles.emoji}>🎮</Text>
        <Text style={styles.label}>놀기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#3a3a5c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5a5a8c',
  },
  disabled: {
    opacity: 0.4,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});
