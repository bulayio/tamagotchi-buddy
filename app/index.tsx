import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { SECRET_COMMAND, HINTS } from '../src/constants/config';

const UNLOCK_KEY = '@tamagotchi_state';

export default function CommunityScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [hint, setHint] = useState('');
  const [showError, setShowError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Check if already unlocked
    AsyncStorage.getItem(UNLOCK_KEY).then((raw) => {
      if (raw) {
        const data = JSON.parse(raw);
        if (data.isUnlocked) setIsUnlocked(true);
      }
    });
    // Show a random hint
    setHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
  }, []);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === SECRET_COMMAND) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/tamagotchi');
    } else {
      setShowError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleGoToTamagotchi = () => {
    router.push('/tamagotchi');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>커뮤니티</Text>

        {/* Hint Banner */}
        <View style={styles.hintBanner}>
          <Text style={styles.hintIcon}>✨</Text>
          <View style={styles.hintContent}>
            <Text style={styles.hintTitle}>특별한 명령어의 힌트를 발견했어요!</Text>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        </View>

        {/* Quick access if already unlocked */}
        {isUnlocked && (
          <TouchableOpacity style={styles.quickAccess} onPress={handleGoToTamagotchi}>
            <Text style={styles.quickAccessText}>🐣 내 다마고치 보러가기</Text>
          </TouchableOpacity>
        )}

        {/* Command Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>명령어 입력</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="명령어를 입력하세요..."
              placeholderTextColor="#666"
              autoCapitalize="characters"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit}>
              <Text style={styles.sendBtnText}>전송</Text>
            </TouchableOpacity>
          </View>
          {showError && (
            <Text style={styles.errorText}>잘못된 명령어입니다. 힌트를 모아보세요!</Text>
          )}
        </View>

        {/* Fake community feed */}
        <View style={styles.feed}>
          <Text style={styles.feedTitle}>커뮤니티 피드</Text>
          {[
            { user: '유저A', msg: '혹시 특별한 명령어 힌트 받으신 분? 저는 첫 글자를 알아냈어요!', time: '5분 전' },
            { user: '유저B', msg: '저도요! 세 번째 글자 힌트 받았는데 같이 맞춰볼까요?', time: '3분 전' },
            { user: '유저C', msg: '다섯 글자인 것 같아요. 마지막 글자 아시는 분?', time: '1분 전' },
          ].map((item, i) => (
            <View key={i} style={styles.feedItem}>
              <View style={styles.feedHeader}>
                <Text style={styles.feedUser}>{item.user}</Text>
                <Text style={styles.feedTime}>{item.time}</Text>
              </View>
              <Text style={styles.feedMsg}>{item.msg}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },
  hintBanner: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ffcc00',
    marginBottom: 16,
  },
  hintIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  hintContent: {
    flex: 1,
  },
  hintTitle: {
    color: '#ffcc00',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  hintText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAccess: {
    backgroundColor: '#3a5a3a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#5a8a5a',
  },
  quickAccessText: {
    color: '#88ff88',
    fontSize: 16,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a6e',
  },
  sendBtn: {
    backgroundColor: '#4488ff',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
  feed: {
    gap: 12,
  },
  feedTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedItem: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 14,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedUser: {
    color: '#4488ff',
    fontSize: 13,
    fontWeight: '700',
  },
  feedTime: {
    color: '#666',
    fontSize: 11,
  },
  feedMsg: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
});
