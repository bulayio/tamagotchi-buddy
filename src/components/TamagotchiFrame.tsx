import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function TamagotchiFrame({ children }: Props) {
  return (
    <View style={styles.outerFrame}>
      <View style={styles.innerFrame}>
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: '#d4a574',
    borderRadius: 32,
    padding: 12,
    borderWidth: 3,
    borderColor: '#b8895a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerFrame: {
    backgroundColor: '#a67c52',
    borderRadius: 24,
    padding: 8,
  },
  screen: {
    backgroundColor: '#c8e6a0',
    borderRadius: 16,
    minHeight: 260,
    padding: 16,
    borderWidth: 2,
    borderColor: '#98b870',
    position: 'relative',
    overflow: 'hidden',
  },
});
