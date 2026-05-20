import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export default function GemRewardModal({ visible, amount, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.title}>보너스 획득!</Text>
          <View style={styles.gemRow}>
            <Text style={styles.gemBig}>💎</Text>
            <Text style={styles.amount}>+{amount}</Text>
          </View>
          <Text style={styles.subtitle}>꾸준한 청소의 보상이에요</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.btn}
            onPress={onClose}
          >
            <Text style={styles.btnText}>좋아요!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  sparkle: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  gemBig: {
    fontSize: 36,
  },
  amount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#a82240',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  btn: {
    marginTop: 12,
    backgroundColor: '#a82240',
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
