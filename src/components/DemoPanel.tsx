import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stage } from '../constants/config';

interface Props {
  currentStage: Stage;
  isHungry: boolean;
  isSick: boolean;
  isDead: boolean;
  onSetStage: (stage: Stage) => void;
  onAddPoop: () => void;
  onTriggerHungry: () => void;
  onTriggerSick: () => void;
  onTriggerDead: () => void;
  onHeal: () => void;
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'egg', label: '알' },
  { key: 'baby', label: '유년기' },
  { key: 'grown', label: '성장기' },
];

export default function DemoPanel({
  currentStage,
  isHungry,
  isSick,
  isDead,
  onSetStage,
  onAddPoop,
  onTriggerHungry,
  onTriggerSick,
  onTriggerDead,
  onHeal,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>DEMO</Text>

      {/* Stage row */}
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
      </View>

      {/* Status row */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onAddPoop}
          style={[styles.btn, styles.poopBtn]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>💩 똥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTriggerHungry}
          style={[styles.btn, isHungry && styles.btnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, isHungry && styles.btnTextActive]}>
            🍽️ 배고픔
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTriggerSick}
          style={[styles.btn, isSick && styles.btnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, isSick && styles.btnTextActive]}>
            🤢 병
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTriggerDead}
          style={[styles.btn, isDead && styles.btnDead]}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, isDead && styles.btnTextActive]}>
            💀 죽음
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onHeal}
          style={[styles.btn, styles.healBtn]}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, styles.btnTextHeal]}>✨ 회복</Text>
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1eaf6',
    borderWidth: 1,
    borderColor: '#d6c9e0',
  },
  btnSelected: {
    backgroundColor: '#3b2557',
    borderColor: '#3b2557',
  },
  btnActive: {
    backgroundColor: '#ffd6c2',
    borderColor: '#d9885a',
  },
  btnText: {
    color: '#3b2557',
    fontSize: 12,
    fontWeight: '700',
  },
  btnTextSelected: {
    color: '#fff',
  },
  btnTextActive: {
    color: '#7a3a10',
  },
  poopBtn: {
    backgroundColor: '#fff4d6',
    borderColor: '#e8d4a0',
  },
  btnDead: {
    backgroundColor: '#333',
    borderColor: '#000',
  },
  healBtn: {
    backgroundColor: '#d6f5e0',
    borderColor: '#7ac49a',
  },
  btnTextHeal: {
    color: '#1a5a30',
  },
});
