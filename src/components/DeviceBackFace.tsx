import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEggMetrics } from '../lib/eggMetrics';
import {
  EGG_BASE,
  EGG_SHADE,
  SPOT_DARK,
  SPOT_SOFT,
  SPOTS,
} from '../constants/eggTheme';

interface Props {
  onReset: () => void;
  gems: number;
  cost: number;
}

export default function DeviceBackFace({ onReset, gems, cost }: Props) {
  const insufficient = gems < cost;
  const { eggWidth, eggHeight } = useEggMetrics();

  const eggStyle = {
    width: eggWidth,
    height: eggHeight,
    borderTopLeftRadius: eggWidth / 2,
    borderTopRightRadius: eggWidth / 2,
    borderBottomLeftRadius: eggWidth / 1.6,
    borderBottomRightRadius: eggWidth / 1.6,
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.shadow, { borderRadius: eggWidth / 2 }]}>
        <View style={[styles.egg, eggStyle]}>
          {/* spots (same as front for a consistent shell) */}
          {SPOTS.map((s, i) => {
            const w = eggWidth * s.size;
            const h = w * s.ratio;
            return (
              <View
                key={i}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: (eggWidth * s.x) / 100 - w / 2,
                  top: (eggHeight * s.y) / 100 - h / 2,
                  width: w,
                  height: h,
                  borderRadius: w / 2,
                  backgroundColor: s.color === 'dark' ? SPOT_DARK : SPOT_SOFT,
                  opacity: s.color === 'dark' ? 0.78 : 0.55,
                  transform: [{ rotate: `${s.rotate}deg` }],
                }}
              />
            );
          })}

          {/* darker back panel hint */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: eggHeight * 0.25,
              left: eggWidth * 0.14,
              width: eggWidth * 0.72,
              height: eggHeight * 0.5,
              borderRadius: 18,
              backgroundColor: 'rgba(0,0,0,0.08)',
              borderWidth: 2,
              borderColor: 'rgba(0,0,0,0.12)',
            }}
          />

          {/* Reset button cluster */}
          <View style={styles.centered} pointerEvents="box-none">
            <Text style={styles.label}>RESET DEVICE</Text>
            <View style={styles.balance}>
              <Text style={styles.balanceText}>보유 💎 {gems.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReset}
              disabled={insufficient}
              style={[styles.resetBtn, insufficient && styles.resetBtnDisabled]}
            >
              <Text style={styles.resetText}>🔄 다시 뽑기</Text>
              <View style={styles.cost}>
                <Text style={styles.costText}>💎 {cost}</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.warn}>
              {insufficient
                ? '젬이 부족합니다'
                : '이전 캐릭터는 삭제됩니다'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  egg: {
    backgroundColor: EGG_BASE,
    borderColor: EGG_SHADE,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#5a3b2a',
    letterSpacing: 3,
  },
  balance: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  balanceText: {
    color: '#3b2557',
    fontSize: 12,
    fontWeight: '800',
  },
  resetBtn: {
    backgroundColor: '#a82240',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#5a1020',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resetBtnDisabled: {
    opacity: 0.4,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cost: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  costText: {
    color: '#a82240',
    fontSize: 13,
    fontWeight: '900',
  },
  warn: {
    fontSize: 10,
    color: '#5a3b2a',
    fontWeight: '600',
  },
});
