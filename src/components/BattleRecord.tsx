import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  wins: number;
  losses: number;
  npcWins: number;
}

export default function BattleRecord({ wins, losses, npcWins }: Props) {
  const total = wins + losses + npcWins;
  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전적</Text>
      <View style={styles.row}>
        <Text style={styles.win}>{wins}승</Text>
        <Text style={styles.separator}> / </Text>
        <Text style={styles.loss}>{losses}패</Text>
        {npcWins > 0 && (
          <>
            <Text style={styles.separator}> / </Text>
            <Text style={styles.npc}>NPC {npcWins}승</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  win: {
    fontSize: 13,
    color: '#4488ff',
    fontWeight: '700',
  },
  loss: {
    fontSize: 13,
    color: '#ff4444',
    fontWeight: '700',
  },
  npc: {
    fontSize: 13,
    color: '#ff8800',
    fontWeight: '700',
  },
  separator: {
    fontSize: 13,
    color: '#888',
  },
});
