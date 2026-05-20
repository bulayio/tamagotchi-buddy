import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stage } from '../constants/config';

interface Props {
  currentStage: Stage;
  onSetStage: (stage: Stage) => void;
  onAddPoop: () => void;
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'egg', label: '알' },
  { key: 'baby', label: '유년기' },
  { key: 'grown', label: '성장기' },
];

export default function DemoPanel({ currentStage, onSetStage, onAddPoop }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>DEMO</Text>
      <View style={styles.row}>
        {STAGES.map((s) => {
          const selected = s.key === currentStage;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => onSetStage(s.key)}
              style={[styles.btn, selected && styles.btnSelected]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.btnText, selected && styles.btnTextSelected]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={onAddPoop}
          style={[styles.btn, styles.poopBtn]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>💩 똥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1eaf6',
    borderWidth: 1,
    borderColor: '#d6c9e0',
  },
  btnSelected: {
    backgroundColor: '#3b2557',
    borderColor: '#3b2557',
  },
  btnText: {
    color: '#3b2557',
    fontSize: 13,
    fontWeight: '700',
  },
  btnTextSelected: {
    color: '#fff',
  },
  poopBtn: {
    backgroundColor: '#fff4d6',
    borderColor: '#e8d4a0',
  },
});
