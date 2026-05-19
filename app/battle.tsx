import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTamagotchiState } from '../src/hooks/useTamagotchiState';
import TapMiniGame from '../src/components/TapMiniGame';

type BattleMode = 'select' | 'pvp' | 'npc_weak' | 'npc_strong';

export default function BattleScreen() {
  const router = useRouter();
  const { state, recordBattle } = useTamagotchiState();
  const [mode, setMode] = useState<BattleMode>('select');

  const handleFinish = (result: 'win' | 'loss') => {
    if (mode === 'npc_weak' || mode === 'npc_strong') {
      recordBattle(result === 'win' ? 'npcWin' : 'loss');
    } else {
      recordBattle(result);
    }
    setTimeout(() => router.back(), 500);
  };

  if (mode !== 'select') {
    const isNpc = mode === 'npc_weak' || mode === 'npc_strong';
    const npcType = mode === 'npc_weak' ? 'weak' : mode === 'npc_strong' ? 'strong' : undefined;
    const opponentName = mode === 'pvp'
      ? '상대 버디'
      : mode === 'npc_weak'
      ? 'NPC (약함)'
      : 'NPC (강함)';

    return (
      <SafeAreaView style={styles.container}>
        <TapMiniGame
          playerStage={state.stage}
          playerSick={state.isSick}
          opponentName={opponentName}
          npcType={isNpc ? npcType : 'weak'}
          onFinish={handleFinish}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← 돌아가기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>⚔️ 대결 모드</Text>
        <Text style={styles.subtitle}>상대를 선택하세요</Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, styles.pvpOption]}
            onPress={() => setMode('pvp')}
          >
            <Text style={styles.optionEmoji}>👥</Text>
            <Text style={styles.optionTitle}>PvP 대결</Text>
            <Text style={styles.optionDesc}>다른 유저의 버디와 대결</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.npcWeakOption]}
            onPress={() => setMode('npc_weak')}
          >
            <Text style={styles.optionEmoji}>🐣</Text>
            <Text style={styles.optionTitle}>NPC (약함)</Text>
            <Text style={styles.optionDesc}>초보자용 NPC 대결</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.npcStrongOption]}
            onPress={() => setMode('npc_strong')}
          >
            <Text style={styles.optionEmoji}>🐉</Text>
            <Text style={styles.optionTitle}>NPC (강함)</Text>
            <Text style={styles.optionDesc}>숙련자용 NPC 대결</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stageInfo}>
          <Text style={styles.stageInfoTitle}>내 버디 스탯</Text>
          <Text style={styles.stageInfoText}>
            성장 단계: {state.stage === 'egg' ? '알' : state.stage === 'baby' ? '유년기' : '성장기'}
          </Text>
          <Text style={styles.stageInfoText}>
            보너스: +{state.stage === 'egg' ? '0' : state.stage === 'baby' ? '10' : '20'}%
          </Text>
          {state.isSick && (
            <Text style={[styles.stageInfoText, { color: '#ff4444' }]}>
              병 페널티: -30%
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    color: '#4488ff',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  options: {
    gap: 16,
  },
  option: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  pvpOption: {
    backgroundColor: '#2a2a5e',
    borderColor: '#4a4a8e',
  },
  npcWeakOption: {
    backgroundColor: '#2a4a2a',
    borderColor: '#4a7a4a',
  },
  npcStrongOption: {
    backgroundColor: '#4a2a2a',
    borderColor: '#8a4a4a',
  },
  optionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  optionDesc: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  stageInfo: {
    marginTop: 32,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
  },
  stageInfoTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  stageInfoText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
});
