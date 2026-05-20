import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useEggMetrics } from '../lib/eggMetrics';
import {
  EGG_BASE,
  EGG_SHADE,
  SPOT_DARK,
  SPOT_SOFT,
  SPOTS,
} from '../constants/eggTheme';

interface Props {
  children: React.ReactNode;
  controls?: React.ReactNode;
}

export default function TamagotchiFrame({ children, controls }: Props) {
  const { eggWidth, eggHeight, screenWidth, screenHeight } = useEggMetrics();

  const eggStyle = {
    width: eggWidth,
    height: eggHeight,
    borderTopLeftRadius: eggWidth / 2,
    borderTopRightRadius: eggWidth / 2,
    borderBottomLeftRadius: eggWidth / 1.6,
    borderBottomRightRadius: eggWidth / 1.6,
    paddingTop: eggHeight * 0.11,
    paddingHorizontal: eggWidth * 0.09,
    paddingBottom: eggHeight * 0.08,
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.shadow, { borderRadius: eggWidth / 2 }]}>
        <View style={[styles.egg, eggStyle]}>
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

          <View
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                width: eggWidth * 0.55,
                height: eggHeight * 0.22,
                top: eggHeight * 0.06,
                left: eggWidth * 0.15,
                borderRadius: eggWidth / 2,
              },
            ]}
          />

          <View style={styles.screenWrap}>
            <View style={styles.screenBezel}>
              <View
                style={[
                  styles.screen,
                  { width: screenWidth, height: screenHeight },
                ]}
              >
                {children}
              </View>
            </View>
          </View>

          {controls ? <View style={styles.controlsSlot}>{controls}</View> : null}
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
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  screenWrap: {
    width: '100%',
    alignItems: 'center',
  },
  screenBezel: {
    backgroundColor: '#3b2557',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  screen: {
    backgroundColor: '#c8e6a0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#98b870',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsSlot: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
});
