import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTamagotchiState } from '../src/hooks/useTamagotchiState';
import TamagotchiFrame from '../src/components/TamagotchiFrame';
import PixelCharacter from '../src/components/PixelCharacter';
import StatusIndicators from '../src/components/StatusIndicators';
import ActionButtons from '../src/components/ActionButtons';
import GrowthStageLabel from '../src/components/GrowthStageLabel';
import BattleRecord from '../src/components/BattleRecord';

export default function TamagotchiScreen() {
  const router = useRouter();
  const { state, isLoaded, feed, clean, play, unlock, restart, isHungry } =
    useTamagotchiState();
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-unlock on first visit
  React.useEffect(() => {
    if (isLoaded && !state.isUnlocked) {
      unlock();
    }
  }, [isLoaded, state.isUnlocked, unlock]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    play();
    setTimeout(() => setIsPlaying(false), 2000);
  }, [play]);

  const handleBattle = () => {
    if (state.isDead) return;
    router.push('/battle');
  };

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>로딩중...</Text>
      </View>
    );
  }

  const { battleRecord } = state;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← 커뮤니티</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Buddy</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.content}>
        <TamagotchiFrame>
          <View style={styles.screenContent}>
            <PixelCharacter
              stage={state.stage}
              isSick={state.isSick}
              isDead={state.isDead}
              isPlaying={isPlaying}
            />
            <StatusIndicators
              poopCount={state.poopCount}
              isHungry={isHungry}
              isSick={state.isSick}
              isDead={state.isDead}
            />
          </View>
        </TamagotchiFrame>

        <GrowthStageLabel stage={state.stage} isDead={state.isDead} />
        <BattleRecord
          wins={battleRecord.wins}
          losses={battleRecord.losses}
          npcWins={battleRecord.npcWins}
        />

        {state.isDead ? (
          <View style={styles.deathActions}>
            <Text style={styles.deathText}>버디가 무지개 다리를 건넜어요...</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={restart}>
              <Text style={styles.restartBtnText}>다시 시작</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ActionButtons
              onFeed={feed}
              onClean={clean}
              onPlay={handlePlay}
              disabled={state.isDead}
            />
            <TouchableOpacity
              style={[styles.battleBtn, state.isDead && styles.battleBtnDisabled]}
              onPress={handleBattle}
              disabled={state.isDead}
            >
              <Text style={styles.battleBtnText}>⚔️ 대결하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    color: '#4488ff',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  screenContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  deathActions: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  deathText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  restartBtn: {
    backgroundColor: '#4488ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  battleBtn: {
    backgroundColor: '#5a2a6e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#7a4a9e',
  },
  battleBtnDisabled: {
    opacity: 0.4,
  },
  battleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
