import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTamagotchiState } from '../src/hooks/useTamagotchiState';
import TamagotchiFrame from '../src/components/TamagotchiFrame';
import PixelCharacter from '../src/components/PixelCharacter';
import StatusIndicators from '../src/components/StatusIndicators';
import ActionButtons from '../src/components/ActionButtons';
import FeedingAnimation from '../src/components/FeedingAnimation';
import PlayHearts from '../src/components/PlayHearts';
import GrowthStageLabel from '../src/components/GrowthStageLabel';
import BattleRecord from '../src/components/BattleRecord';
import BattleHud from '../src/components/BattleHud';
import EggHatchOverlay from '../src/components/EggHatchOverlay';
import DemoPanel from '../src/components/DemoPanel';
import FlippableDevice from '../src/components/FlippableDevice';
import DeviceBackFace from '../src/components/DeviceBackFace';
import ResetConfirmModal from '../src/components/ResetConfirmModal';
import { BATTLE_CONFIG } from '../src/constants/config';
import {
  Opponent,
  opponentLabel,
  opponentToNpcType,
  npcTapsAt,
  npcFinalScore,
  playerScore as computePlayerScore,
  pvpFinalScore,
} from '../src/lib/npcTapper';
import { generatePetDNA, PetDNA } from '../src/lib/petGenerator';

type BattlePhase = 'idle' | 'selecting' | 'playing' | 'done';

function isTruthyBattleParam(b: string | string[] | undefined): boolean {
  if (b === undefined) return false;
  const s = Array.isArray(b) ? b[0] : b;
  return s === '1' || s === 'true';
}

export default function TamagotchiScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hatch?: string; battle?: string }>();
  const {
    state,
    isLoaded,
    feed,
    clean,
    play,
    unlock,
    restart,
    rerollFresh,
    recordBattle,
    isHungry,
    setStageDev,
    addPoopDev,
    triggerHungryDev,
    triggerSickDev,
    triggerDeadDev,
    healDev,
  } = useTamagotchiState();

  // Routine action animations
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isHatching, setIsHatching] = useState(params.hatch === '1');

  // Device flip + reset modal
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Battle state machine
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('idle');
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [opponentDna, setOpponentDna] = useState<PetDNA | null>(null);
  const [playerTaps, setPlayerTaps] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(BATTLE_CONFIG.DURATION_MS);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);
  const tapsRef = useRef(0);
  const battleStartRef = useRef(0);
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPvpFromLinkRef = useRef(false);

  const revealOpacity = useSharedValue(isHatching ? 0 : 1);
  const revealScale = useSharedValue(isHatching ? 0.85 : 1);

  useEffect(() => {
    if (!isHatching) return;
    revealOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    revealScale.value = withDelay(
      1000,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ scale: revealScale.value }],
  }));

  // Auto-unlock on first visit
  useEffect(() => {
    if (isLoaded && !state.isUnlocked) {
      unlock();
    }
  }, [isLoaded, state.isUnlocked, unlock]);

  // Cleanup any running battle timer on unmount
  useEffect(() => {
    return () => {
      if (battleTimerRef.current) clearInterval(battleTimerRef.current);
    };
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    play();
    setTimeout(() => setIsPlaying(false), 2000);
  }, [play]);

  const handleFeed = useCallback(() => {
    if (isFeeding) return;
    setIsFeeding(true);
    setIsPlaying(true);
    setTimeout(() => {
      feed();
      setIsFeeding(false);
      setIsPlaying(false);
    }, 950);
  }, [feed, isFeeding]);

  const handleClean = useCallback(() => {
    if (isCleaning) return;
    if (state.poopCount === 0) {
      clean();
      return;
    }
    setIsCleaning(true);
    const sweepMs = (state.poopCount - 1) * 70 + 380;
    setTimeout(() => {
      clean();
      setIsCleaning(false);
    }, sweepMs);
  }, [clean, isCleaning, state.poopCount]);

  // ── Battle ───────────────────────────────────────────────────────────
  const finishBattle = useCallback(
    (playerFinalRaw: number, npc: ReturnType<typeof opponentToNpcType>) => {
      const finalPlayerScore = computePlayerScore(
        playerFinalRaw,
        state.stage,
        state.isSick,
      );
      const finalOpponentScore = npc
        ? npcFinalScore(npc)
        : pvpFinalScore(finalPlayerScore);
      setOpponentScore(finalOpponentScore);
      const won = finalPlayerScore >= finalOpponentScore;
      const result: 'win' | 'loss' = won ? 'win' : 'loss';
      setBattleResult(result);
      setBattlePhase('done');

      // Record outcome
      if (npc) {
        recordBattle(won ? 'npcWin' : 'loss');
      } else {
        recordBattle(result);
      }

      // Return to idle after a brief result display
      setTimeout(() => {
        setBattlePhase('idle');
        setOpponent(null);
        setBattleResult(null);
        setPlayerTaps(0);
        setOpponentScore(0);
        setTimeLeftMs(BATTLE_CONFIG.DURATION_MS);
        tapsRef.current = 0;
      }, 1800);
    },
    [recordBattle, state.stage, state.isSick],
  );

  const startBattle = useCallback(
    (opp: Opponent) => {
      setOpponent(opp);
      setOpponentDna(generatePetDNA());
      setPlayerTaps(0);
      setOpponentScore(0);
      setBattleResult(null);
      setTimeLeftMs(BATTLE_CONFIG.DURATION_MS);
      tapsRef.current = 0;
      battleStartRef.current = Date.now();
      setBattlePhase('playing');

      const npc = opponentToNpcType(opp);
      battleTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - battleStartRef.current;
        const remaining = Math.max(0, BATTLE_CONFIG.DURATION_MS - elapsed);
        setTimeLeftMs(remaining);

        if (npc) {
          setOpponentScore(npcTapsAt(elapsed, npc));
        } else {
          // PvP shadow: nudge opponent score toward player's current score
          setOpponentScore((prev) => {
            const target = Math.round(tapsRef.current * (0.8 + Math.random() * 0.4));
            if (prev < target) return prev + 1;
            return prev;
          });
        }

        if (remaining <= 0) {
          if (battleTimerRef.current) {
            clearInterval(battleTimerRef.current);
            battleTimerRef.current = null;
          }
          finishBattle(tapsRef.current, npc);
        }
      }, 100);
    },
    [finishBattle],
  );

  /** 커뮤니티 `/battle` 등: 상대 선택 없이 바로 PvP */
  useLayoutEffect(() => {
    if (!isTruthyBattleParam(params.battle)) return;
    if (!isLoaded || !state.isUnlocked || state.isDead) return;
    if (autoPvpFromLinkRef.current) return;
    autoPvpFromLinkRef.current = true;
    startBattle('pvp');
  }, [params.battle, isLoaded, state.isUnlocked, state.isDead, startBattle]);

  const handleTap = useCallback(() => {
    if (battlePhase !== 'playing') return;
    tapsRef.current += 1;
    setPlayerTaps(tapsRef.current);
  }, [battlePhase]);

  const cancelSelection = () => {
    setBattlePhase('idle');
    setOpponent(null);
  };

  const handleFlip = useCallback(() => {
    if (battlePhase === 'playing' || battlePhase === 'done') return;
    setIsFlipped((prev) => !prev);
  }, [battlePhase]);

  const handleConfirmReset = useCallback(async () => {
    setShowResetModal(false);
    // Wipe ALL state (incl. battle record) and roll new DNA
    await rerollFresh();
    // Now that the reroll succeeded, flip the device back to the front face
    setIsFlipped(false);
    // Cover the device with the hatch overlay during the flip so the back→front
    // animation isn't visible until the new buddy is revealed.
    setIsHatching(true);
    revealOpacity.value = 0;
    revealScale.value = 0.85;
    revealOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    revealScale.value = withDelay(
      1000,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
  }, [rerollFresh, revealOpacity, revealScale]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>로딩중...</Text>
      </View>
    );
  }

  const { battleRecord } = state;
  const battleActive = battlePhase === 'playing' || battlePhase === 'done';
  const opponentNameLive =
    opponent !== null ? opponentLabel(opponent) : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← 커뮤니티</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Buddy</Text>
        <TouchableOpacity
          onPress={handleFlip}
          style={styles.flipBtn}
          activeOpacity={0.7}
          disabled={battleActive}
        >
          <Text style={[styles.flipBtnText, battleActive && styles.flipBtnDisabled]}>
            ↻ 뒤집기
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, revealStyle]}>
        <FlippableDevice
          flipped={isFlipped}
          front={
            <TamagotchiFrame
              controls={
                !state.isDead ? (
                  <ActionButtons
                    onFeed={handleFeed}
                    onClean={handleClean}
                    onPlay={handlePlay}
                    disabled={
                      state.isDead || isFeeding || isCleaning || battleActive
                    }
                    tapAction={
                      battlePhase === 'playing'
                        ? {
                            onTap: handleTap,
                            tapCount: playerTaps,
                          }
                        : undefined
                    }
                  />
                ) : null
              }
            >
              {/* Always-visible battle record at LCD top */}
              <BattleRecord
                wins={battleRecord.wins}
                losses={battleRecord.losses}
                npcWins={battleRecord.npcWins}
              />

              {battleActive ? (
                <BattleHud
                  playerDna={state.dna}
                  playerStage={state.stage}
                  opponentDna={opponentDna}
                  opponentName={opponentNameLive}
                  playerScore={computePlayerScore(playerTaps, state.stage, state.isSick)}
                  opponentScore={opponentScore}
                  playerTaps={playerTaps}
                  timeLeftMs={timeLeftMs}
                  result={battleResult}
                />
              ) : (
                <>
                  <PixelCharacter
                    stage={state.stage}
                    isSick={state.isSick}
                    isDead={state.isDead}
                    isPlaying={isPlaying}
                    dna={state.dna}
                  />
                  <StatusIndicators
                    poopCount={state.poopCount}
                    isHungry={isHungry}
                    isSick={state.isSick}
                    isDead={state.isDead}
                    isCleaning={isCleaning}
                  />
                  <FeedingAnimation active={isFeeding} />
                  <PlayHearts active={isPlaying && !isFeeding} />
                </>
              )}
            </TamagotchiFrame>
          }
          back={<DeviceBackFace onReset={() => setShowResetModal(true)} />}
        />

        <GrowthStageLabel stage={state.stage} isDead={state.isDead} />

        {state.isDead ? (
          <View style={styles.deathActions}>
            <Text style={styles.deathText}>버디가 무지개 다리를 건넜어요...</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={restart}>
              <Text style={styles.restartBtnText}>다시 시작</Text>
            </TouchableOpacity>
          </View>
        ) : battlePhase === 'idle' ? (
          <TouchableOpacity
            style={styles.battleBtn}
            onPress={() => setBattlePhase('selecting')}
          >
            <Text style={styles.battleBtnText}>⚔️ 대결하기</Text>
          </TouchableOpacity>
        ) : battlePhase === 'selecting' ? (
          <View style={styles.selectionWrap}>
            <View style={styles.selectionRow}>
              <OpponentCard
                emoji="👥"
                title="PvP"
                onPress={() => startBattle('pvp')}
                tint="#3b2557"
              />
              <OpponentCard
                emoji="🐣"
                title="약체"
                onPress={() => startBattle('npc_weak')}
                tint="#2a4a2a"
              />
              <OpponentCard
                emoji="🐉"
                title="강체"
                onPress={() => startBattle('npc_strong')}
                tint="#4a2a2a"
              />
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelSelection}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <DemoPanel
          currentStage={state.stage}
          isHungry={isHungry}
          isSick={state.isSick}
          isDead={state.isDead}
          onSetStage={setStageDev}
          onAddPoop={addPoopDev}
          onTriggerHungry={triggerHungryDev}
          onTriggerSick={triggerSickDev}
          onTriggerDead={triggerDeadDev}
          onHeal={healDev}
        />
      </Animated.View>

      {isHatching && (
        <EggHatchOverlay onComplete={() => setIsHatching(false)} />
      )}

      <ResetConfirmModal
        visible={showResetModal}
        onCancel={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />
    </SafeAreaView>
  );
}

function OpponentCard({
  emoji,
  title,
  tint,
  onPress,
}: {
  emoji: string;
  title: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.oppCard, { backgroundColor: tint }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.oppEmoji}>{emoji}</Text>
      <Text style={styles.oppTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#1a1a2e',
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
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: '800',
  },
  flipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3b2557',
    minWidth: 80,
    alignItems: 'center',
  },
  flipBtnText: {
    color: '#3b2557',
    fontSize: 13,
    fontWeight: '800',
  },
  flipBtnDisabled: {
    opacity: 0.35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
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
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#7a4a9e',
  },
  battleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  selectionWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  oppCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    maxWidth: 110,
  },
  oppEmoji: {
    fontSize: 28,
  },
  oppTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
});
