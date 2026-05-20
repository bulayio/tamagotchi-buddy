import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import PixelSprite from '../src/components/PixelSprite';
import {
  PetDNA,
  dnaFromComposite,
  spriteForStage,
  GAME_GENRE_LABELS,
} from '../src/lib/petGenerator';
import { randomSeed } from '../src/lib/seededRandom';
import { Stage } from '../src/constants/config';

const GRID_SIZE = 9;

function makeBatch(activityScore: number, gameplayTimeMinutes: number): PetDNA[] {
  return Array.from({ length: GRID_SIZE }, () =>
    dnaFromComposite(randomSeed(), activityScore, gameplayTimeMinutes),
  );
}

function formatPlayTimeMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}분`;
  const h = m / 60;
  if (h < 24) return `${h.toFixed(1)}시간`;
  const d = Math.floor(h / 24);
  const rh = h - d * 24;
  return `${d}일 ${rh.toFixed(1)}시간`;
}

export default function DnaDemoScreen() {
  const router = useRouter();
  const [activityScore, setActivityScore] = useState(55);
  const [gameplayMinutes, setGameplayMinutes] = useState(180);
  const [batch, setBatch] = useState<PetDNA[]>(() => makeBatch(55, 180));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = batch[selectedIndex] ?? batch[0];

  const reroll = useCallback(() => {
    const next = makeBatch(activityScore, gameplayMinutes);
    setBatch(next);
    setSelectedIndex(0);
  }, [activityScore, gameplayMinutes]);

  const variantSpecs: { label: string; stage: Stage; variant: 'sick' | 'happy' | null }[] = [
    { label: 'EGG',   stage: 'egg',   variant: null },
    { label: 'BABY',  stage: 'baby',  variant: null },
    { label: 'GROWN', stage: 'grown', variant: null },
    { label: 'HAPPY', stage: 'grown', variant: 'happy' },
    { label: 'SICK',  stage: 'grown', variant: 'sick' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🧬 펫 DNA 생성기</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          프로토타입:{' '}
          <Text style={styles.subtitleEm}>활동점수</Text>와{' '}
          <Text style={styles.subtitleEm}>게임플레이 시간</Text>을 비롯한 신호를 하나의 시드에
          합성해 외형을 결정합니다. 같은 숫자 조합이면 같은 패턴이 재현되는 결정론적 생성이에요.
        </Text>

        <View style={styles.signalCard}>
          <Text style={styles.signalTitle}>입력 신호</Text>

          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>활동점수</Text>
            <Text style={styles.signalValue}>{activityScore}</Text>
            <Text style={styles.signalUnit}> / 100</Text>
            <View style={styles.signalSpacer} />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setActivityScore((v) => Math.max(0, v - 5))}
              hitSlop={8}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setActivityScore((v) => Math.min(100, v + 5))}
              hitSlop={8}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>게임플레이 시간</Text>
            <Text style={styles.signalValue}>{formatPlayTimeMinutes(gameplayMinutes)}</Text>
            <View style={styles.signalSpacer} />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setGameplayMinutes((v) => Math.max(0, v - 30))}
              hitSlop={8}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setGameplayMinutes((v) => Math.min(10080, v + 30))}
              hitSlop={8}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.signalHint}>
            (± 는 30분 단위 · 최대 약 7일)
          </Text>
        </View>

        <TouchableOpacity style={styles.rerollBtn} onPress={reroll}>
          <Text style={styles.rerollBtnText}>🎲 프로필 반영 · 9마리 다시 뽑기</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {batch.map((dna, i) => {
            const isSelected = i === selectedIndex;
            return (
              <TouchableOpacity
                key={`${dna.seed}-${i}-${dna.genre}`}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => setSelectedIndex(i)}
              >
                <PixelSprite sprite={spriteForStage(dna, 'grown', null)} scale={1.6} />
                <Text style={styles.cellSeed} numberOfLines={1}>
                  {dna.seed}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>선택한 캐릭터의 변화</Text>
        <View style={styles.variantRow}>
          {variantSpecs.map(({ label, stage, variant }) => (
            <View key={label} style={styles.variantCell}>
              <PixelSprite sprite={spriteForStage(selected, stage, variant)} scale={1.8} />
              <Text style={styles.variantLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dnaCard}>
          <Text style={styles.dnaTitle}>DNA (합성 결과)</Text>
          <DnaRow k="장르" v={GAME_GENRE_LABELS[selected.genre]} />
          <DnaRow k="활동점수" v={`${selected.activityScore ?? '—'} (0–100)`} />
          <DnaRow
            k="게임플레이 시간"
            v={
              selected.gameplayTimeMinutes != null
                ? `${formatPlayTimeMinutes(selected.gameplayTimeMinutes)} · ${selected.gameplayTimeMinutes}분`
                : '—'
            }
          />
          <DnaRow k="base 시드" v={selected.seed} />
          <DnaRow k="bodyShape" v={selected.bodyShape} />
          <DnaRow k="eyes" v={selected.eyes} />
          <DnaRow k="mouth" v={selected.mouth} />
          <DnaRow k="palette" v={selected.palette} />
          <Text style={styles.dnaHint}>
            baseSeed + 활동점수 + 플레이시간(분)이 내부적으로 합쳐져 최종 외형을 고릅니다. 실서비스
            연동 시 같은 방식으로 지표를 추가할 수 있어요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DnaRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.dnaRow}>
      <Text style={styles.dnaKey}>{k}</Text>
      <Text style={styles.dnaVal} numberOfLines={2}>
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { color: '#4488ff', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#aaa', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  subtitleEm: { color: '#e0e8ff', fontWeight: '700' },
  signalCard: {
    backgroundColor: '#252547',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3d3d6b',
  },
  signalTitle: {
    color: '#ffcc00',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  signalLabel: { color: '#bbb', fontSize: 14, fontWeight: '600', width: 108 },
  signalValue: { color: '#fff', fontSize: 15, fontWeight: '800' },
  signalUnit: { color: '#888', fontSize: 13, marginLeft: 2 },
  signalSpacer: { flex: 1 },
  stepBtn: {
    minWidth: 40,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3d4a7a',
    alignItems: 'center',
  },
  stepBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  signalHint: { color: '#666', fontSize: 11, marginTop: 4 },
  rerollBtn: {
    backgroundColor: '#4488ff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  rerollBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cell: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 6,
  },
  cellSelected: { borderColor: '#ffcc00' },
  cellSeed: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 12,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a4e',
    borderRadius: 14,
    padding: 12,
  },
  variantCell: { alignItems: 'center', flex: 1 },
  variantLabel: {
    color: '#bbb',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dnaCard: {
    marginTop: 24,
    backgroundColor: '#2a2a4e',
    borderRadius: 14,
    padding: 16,
  },
  dnaTitle: {
    color: '#ffcc00',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 1,
  },
  dnaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  dnaKey: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  dnaVal: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  dnaHint: { color: '#666', fontSize: 11, marginTop: 10, lineHeight: 16 },
});
