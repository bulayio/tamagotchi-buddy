import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import PixelSprite from './PixelSprite';
import { SPRITES, PIXEL_SIZE } from '../constants/sprites';
import { PetDNA, spriteForStage } from '../lib/petGenerator';
import { Stage } from '../constants/config';
import { useEggMetrics } from '../lib/eggMetrics';

interface Props {
  playerDna: PetDNA | null;
  playerStage: Stage;
  opponentDna: PetDNA | null;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  playerTaps: number;
  timeLeftMs: number;
  result?: 'win' | 'loss' | null;
}

const LCD_INK = '#1a3320';
const LCD_INK_FAINT = '#3a5b40';
const VS_RED = '#a82240';
const PLAYER_BAR = '#1a3320';
const OPPONENT_BAR = '#7a2020';

const BLAST_TTL_MS = 320;

interface Blast {
  id: number;
}

export default function BattleHud({
  playerDna,
  playerStage,
  opponentDna,
  opponentName,
  playerScore,
  opponentScore,
  playerTaps,
  timeLeftMs,
  result,
}: Props) {
  const { screenWidth, screenHeight } = useEggMetrics();
  const timeLeft = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const maxScore = Math.max(playerScore, opponentScore, 30);
  const playerPct = Math.min(100, (playerScore / maxScore) * 100);
  const opponentPct = Math.min(100, (opponentScore / maxScore) * 100);

  // ── Energy blasts ────────────────────────────────────────────────────
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const blastIdRef = useRef(0);
  const prevTapsRef = useRef(playerTaps);

  useEffect(() => {
    if (playerTaps > prevTapsRef.current) {
      blastIdRef.current += 1;
      const id = blastIdRef.current;
      setBlasts((prev) => [...prev, { id }]);
      setTimeout(() => {
        setBlasts((prev) => prev.filter((b) => b.id !== id));
      }, BLAST_TTL_MS + 30);
    }
    prevTapsRef.current = playerTaps;
  }, [playerTaps]);

  // ── Opponent flinch on hit ───────────────────────────────────────────
  const flinch = useSharedValue(0);
  useEffect(() => {
    if (playerTaps > prevTapsRef.current - 0) {
      // Fire flinch in next tick — playerTaps changed
      flinch.value = withSequence(
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 80 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerTaps]);
  const flinchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: flinch.value }],
  }));

  // ── Result screen ────────────────────────────────────────────────────
  if (result) {
    return (
      <View style={styles.resultWrap}>
        <Text
          style={[
            styles.resultTitle,
            { color: result === 'win' ? LCD_INK : VS_RED },
          ]}
        >
          {result === 'win' ? 'WIN!' : 'LOSE'}
        </Text>
        <Text style={styles.resultScore}>
          {playerScore} : {opponentScore}
        </Text>
      </View>
    );
  }

  // ── Layout calculations ──────────────────────────────────────────────
  // Sprites are 12 cols × 12 rows at PIXEL_SIZE px each (natural 72×72).
  // Scale them down so two characters + a VS gap fit cleanly in the LCD.
  const charScale = Math.min(0.85, Math.max(0.55, (screenWidth * 0.22) / (12 * PIXEL_SIZE)));
  const charSize = 12 * PIXEL_SIZE * charScale;
  const playerSprite = playerDna
    ? spriteForStage(playerDna, playerStage, null)
    : SPRITES.dead;
  const opponentSprite = opponentDna
    ? spriteForStage(opponentDna, 'grown', null)
    : SPRITES.dead;

  // Position rails: chars near each LCD edge with a generous center gap
  const playerX = screenWidth * 0.06;
  const opponentX = screenWidth * 0.94 - charSize;
  const battleY = screenHeight * 0.22;

  // kiBlast pixel sprite: 5 cols at PIXEL_SIZE × blastScale
  const blastScale = 1.0;
  const blastWidth = 5 * PIXEL_SIZE * blastScale;
  // Travel from the player's right edge to the opponent's left edge
  const blastStartX = playerX + charSize;
  const blastEndX = opponentX - blastWidth;
  const blastY = battleY + charSize * 0.35;

  return (
    <View style={styles.wrap}>
      {/* Top row: VS center + timer right */}
      <View style={styles.topRow}>
        <View style={{ width: 30 }} />
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <Text style={styles.timer}>{timeLeft}s</Text>
      </View>

      <Text style={styles.opponentName} numberOfLines={1}>
        {opponentName}
      </Text>

      {/* Battle scene */}
      <View style={styles.scene}>
        {/* Player on left */}
        <View
          style={{
            position: 'absolute',
            left: playerX,
            top: battleY,
          }}
        >
          <PixelSprite sprite={playerSprite} scale={charScale} />
        </View>

        {/* Opponent on right, mirrored to face player */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: opponentX,
              top: battleY,
              transform: [{ scaleX: -1 }],
            },
            flinchStyle,
          ]}
        >
          <PixelSprite sprite={opponentSprite} scale={charScale} />
        </Animated.View>

        {/* Energy projectiles — fired from player toward opponent */}
        {blasts.map((b) => (
          <EnergyBlast
            key={b.id}
            startX={blastStartX}
            endX={blastEndX}
            y={blastY}
            scale={blastScale}
          />
        ))}
      </View>

      {/* Score bars */}
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>나</Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${playerPct}%`, backgroundColor: PLAYER_BAR },
            ]}
          />
        </View>
        <Text style={styles.barCount}>{playerScore}</Text>
      </View>
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>적</Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${opponentPct}%`, backgroundColor: OPPONENT_BAR },
            ]}
          />
        </View>
        <Text style={styles.barCount}>{opponentScore}</Text>
      </View>
    </View>
  );
}

function EnergyBlast({
  startX,
  endX,
  y,
  scale,
}: {
  startX: number;
  endX: number;
  y: number;
  scale: number;
}) {
  // Travel target is clamped so the blast always heads toward the opponent
  // even if the layout briefly collapses (e.g., very narrow screen).
  const safeEnd = Math.max(endX, startX + 10);
  const tx = useSharedValue(startX);
  const opacity = useSharedValue(1);

  useEffect(() => {
    tx.value = withTiming(safeEnd, {
      duration: BLAST_TTL_MS,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withSequence(
      withTiming(1, { duration: BLAST_TTL_MS - 80 }),
      withTiming(0, { duration: 80 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: y,
          left: 0,
        },
        animStyle,
      ]}
    >
      <PixelSprite sprite={SPRITES.kiBlast} scale={scale} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flex: 1,
    paddingTop: 14, // leave room for BattleRecord at top of LCD
    paddingHorizontal: 2,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vsBadge: {
    backgroundColor: VS_RED,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5a1020',
  },
  vsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timer: {
    color: LCD_INK,
    fontSize: 14,
    fontWeight: '900',
    width: 30,
    textAlign: 'right',
  },
  opponentName: {
    color: LCD_INK_FAINT,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  scene: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    color: LCD_INK,
    fontSize: 10,
    fontWeight: '800',
    width: 14,
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#a3c478',
    borderWidth: 1,
    borderColor: '#7a9c5a',
  },
  barFill: {
    height: '100%',
  },
  barCount: {
    color: LCD_INK,
    fontSize: 10,
    fontWeight: '800',
    width: 22,
    textAlign: 'right',
  },
  resultWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultScore: {
    color: LCD_INK,
    fontSize: 16,
    fontWeight: '800',
  },
});
