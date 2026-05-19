import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stage } from '../constants/config';

const STAGE_LABELS: Record<Stage, string> = {
  egg: '알',
  baby: '유년기',
  grown: '성장기',
};

const STAGE_COLORS: Record<Stage, string> = {
  egg: '#888',
  baby: '#4488ff',
  grown: '#ff8800',
};

interface Props {
  stage: Stage;
  isDead: boolean;
}

export default function GrowthStageLabel({ stage, isDead }: Props) {
  if (isDead) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: '#ff4444' }]}>사망</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>Stage: </Text>
      <Text style={[styles.label, { color: STAGE_COLORS[stage] }]}>
        {STAGE_LABELS[stage]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  prefix: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
});
