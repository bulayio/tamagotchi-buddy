import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BATTLE_CONFIG, Stage } from '../constants/config';

interface Props {
  playerStage: Stage;
  playerSick: boolean;
  opponentName: string;
  npcType?: 'weak' | 'strong';
  onFinish: (result: 'win' | 'loss') => void;
}

export default function TapMiniGame({
  playerStage,
  playerSick,
  opponentName,
  npcType,
  onFinish,
}: Props) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(BATTLE_CONFIG.DURATION_MS / 1000);
  const [taps, setTaps] = useState(0);
  const [opponentTaps, setOpponentTaps] = useState(0);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const tapsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const playerProgress = useSharedValue(0);
  const opponentProgress = useSharedValue(0);

  const playerBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(playerProgress.value, 100)}%`,
  }));
  const opponentBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(opponentProgress.value, 100)}%`,
  }));

  const calculateScore = useCallback(
    (rawTaps: number) => {
      let bonus = 1 + BATTLE_CONFIG.STAGE_BONUS[playerStage];
      if (playerSick) bonus -= BATTLE_CONFIG.SICK_PENALTY;
      return Math.round(rawTaps * Math.max(bonus, 0.1));
    },
    [playerStage, playerSick],
  );

  const startGame = useCallback(() => {
    setPhase('playing');
    tapsRef.current = 0;
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, BATTLE_CONFIG.DURATION_MS - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));

      // NPC taps simulation
      if (npcType) {
        const npcTps = BATTLE_CONFIG.NPC_TAPS_PER_SECOND[npcType];
        const npcTotal = Math.round((elapsed / 1000) * npcTps * (0.8 + Math.random() * 0.4));
        setOpponentTaps(npcTotal);
        opponentProgress.value = withTiming((npcTotal / 80) * 100, { duration: 100 });
      }

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);

        const playerScore = calculateScore(tapsRef.current);
        const opponentScore = npcType
          ? Math.round(
              (BATTLE_CONFIG.DURATION_MS / 1000) *
                BATTLE_CONFIG.NPC_TAPS_PER_SECOND[npcType] *
                (0.9 + Math.random() * 0.2),
            )
          : 0;

        setOpponentTaps(opponentScore);
        const r = playerScore >= opponentScore ? 'win' : 'loss';
        setResult(r);
        setPhase('done');
      }
    }, 100);
  }, [npcType, calculateScore, opponentProgress]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTap = () => {
    if (phase !== 'playing') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    tapsRef.current++;
    setTaps(tapsRef.current);
    playerProgress.value = withTiming((tapsRef.current / 80) * 100, { duration: 50 });
  };

  if (phase === 'ready') {
    return (
      <View style={styles.container}>
        <Text style={styles.vsTitle}>VS 대결!</Text>
        <Text style={styles.opponentName}>{opponentName}</Text>
        <Text style={styles.instruction}>10초 동안 최대한 빠르게 탭하세요!</Text>
        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <Text style={styles.startBtnText}>시작!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'done' && result) {
    const playerScore = calculateScore(taps);
    return (
      <View style={styles.container}>
        <Text style={[styles.resultTitle, result === 'win' ? styles.winText : styles.loseText]}>
          {result === 'win' ? '승리!' : '패배...'}
        </Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>내 버디</Text>
            <Text style={styles.scoreValue}>{playerScore}점</Text>
            <Text style={styles.scoreSub}>({taps}탭)</Text>
          </View>
          <Text style={styles.vsSmall}>VS</Text>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>{opponentName}</Text>
            <Text style={styles.scoreValue}>{opponentTaps}점</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.doneBtn} onPress={() => onFinish(result)}>
          <Text style={styles.doneBtnText}>확인</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{timeLeft}초</Text>

      <View style={styles.barContainer}>
        <Text style={styles.barLabel}>나: {taps}</Text>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, styles.playerBar, playerBarStyle]} />
        </View>
      </View>
      <View style={styles.barContainer}>
        <Text style={styles.barLabel}>{opponentName}: {opponentTaps}</Text>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, styles.opponentBar, opponentBarStyle]} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.tapArea}
        onPress={handleTap}
        activeOpacity={0.6}
      >
        <Text style={styles.tapText}>TAP!</Text>
        <Text style={styles.tapCount}>{taps}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  vsTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ff4444',
    marginBottom: 8,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  timer: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ff8800',
    marginBottom: 16,
  },
  barContainer: {
    width: '100%',
    marginBottom: 8,
  },
  barLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '600',
  },
  barBg: {
    width: '100%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  playerBar: {
    backgroundColor: '#4488ff',
  },
  opponentBar: {
    backgroundColor: '#ff4444',
  },
  tapArea: {
    marginTop: 24,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ff6666',
  },
  tapText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  tapCount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 24,
  },
  winText: {
    color: '#4488ff',
  },
  loseText: {
    color: '#ff4444',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  scoreSub: {
    color: '#888',
    fontSize: 11,
  },
  vsSmall: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: '900',
  },
  doneBtn: {
    backgroundColor: '#4488ff',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
