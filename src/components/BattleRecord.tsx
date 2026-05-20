import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  wins: number;
  losses: number;
  npcWins: number;
}

// Compact LCD-style record displayed at the top of the device's LCD screen.
export default function BattleRecord({ wins, losses, npcWins }: Props) {
  const total = wins + losses + npcWins;
  if (total === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.text}>
        <Text style={styles.win}>{wins}W</Text>
        <Text style={styles.sep}> </Text>
        <Text style={styles.loss}>{losses}L</Text>
        {npcWins > 0 && (
          <>
            <Text style={styles.sep}>  </Text>
            <Text style={styles.npc}>N{npcWins}</Text>
          </>
        )}
      </Text>
    </View>
  );
}

const LCD_INK = '#1a3320';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  win: {
    color: LCD_INK,
  },
  loss: {
    color: '#7a2020',
  },
  npc: {
    color: '#7a5500',
  },
  sep: {
    color: LCD_INK,
  },
});
