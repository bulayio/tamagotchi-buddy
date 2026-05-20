import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  gems: number;
  cost: number;
}

export default function ResetConfirmModal({
  visible,
  onCancel,
  onConfirm,
  gems,
  cost,
}: Props) {
  const insufficient = gems < cost;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>다시 뽑기</Text>
          <View style={styles.body}>
            <Text style={styles.message}>
              <Text style={styles.gem}>💎 {cost}</Text>을 쓰고 다시 뽑으시겠습니까?
            </Text>
            <Text style={styles.warn}>이전 캐릭터는 삭제됩니다.</Text>
            <Text
              style={[
                styles.balance,
                insufficient && styles.balanceInsufficient,
              ]}
            >
              보유 💎 {gems.toLocaleString()}
              {insufficient ? '  (부족)' : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.btn, styles.cancelBtn]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.btn,
                styles.confirmBtn,
                insufficient && styles.confirmBtnDisabled,
              ]}
              onPress={onConfirm}
              disabled={insufficient}
            >
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingTop: 22,
    paddingBottom: 14,
    paddingHorizontal: 22,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  body: {
    gap: 6,
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  gem: {
    color: '#a82240',
    fontWeight: '800',
  },
  warn: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  balance: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  balanceInsufficient: {
    color: '#a82240',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#a82240',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
