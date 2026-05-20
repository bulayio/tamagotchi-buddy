import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import PixelPetView from '../src/components/PixelPetView';
import {
  PetDNA,
  dnaFromComposite,
  spriteForStageWithBackdrop,
  computePetRarity,
  GAME_GENRE_LABELS,
  PET_RARITY_LABELS,
} from '../src/lib/petGenerator';
import { randomSeed } from '../src/lib/seededRandom';
import { Stage } from '../src/constants/config';

const GRID_SIZE = 9;

function makeBatch(
  activityScore: number,
  gameplayTimeMinutes: number,
): PetDNA[] {
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

function parseDigitsBounded(
  text: string,
  min: number,
  max: number,
): number {
  const digits = text.replace(/\D/g, '');
  if (digits === '') return min;
  const n = Number.parseInt(digits, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function DnaDemoScreen() {
  const router = useRouter();
  const [activityText, setActivityText] = useState('55');
  const [playText, setPlayText] = useState('180');
  const activityScore = useMemo(
    () => parseDigitsBounded(activityText, 0, 100),
    [activityText],
  );
  const gameplayMinutes = useMemo(
    () => parseDigitsBounded(playText, 0, 10080),
    [playText],
  );
  const [batch, setBatch] = useState<PetDNA[]>(() => makeBatch(55, 180));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = batch[selectedIndex] ?? batch[0];
  const previewRarity = computePetRarity(activityScore, gameplayMinutes);

  const reroll = useCallback(() => {
    const next = makeBatch(activityScore, gameplayMinutes);
    setBatch(next);
    setSelectedIndex(0);
  }, [activityScore, gameplayMinutes]);

  const variantSpecs: {
    label: string;
    stage: Stage;
    variant: 'sick' | 'happy' | null;
  }[] = [
    { label: 'EGG', stage: 'egg', variant: null },
    { label: 'BABY', stage: 'baby', variant: null },
    { label: 'GROWN', stage: 'grown', variant: null },
    { label: 'HAPPY', stage: 'grown', variant: 'happy' },
    { label: 'SICK', stage: 'grown', variant: 'sick' },
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
          프로토타입: <Text style={styles.subtitleEm}>활동점수</Text>와{' '}
          <Text style={styles.subtitleEm}>플레이 시간(분)</Text>을 숫자로 직접 입력해
          희귀도를 맞춘 뒤, 9마리를 다시 뽑을 수 있어요. 같은 숫자 조합이면 같은 패턴이
          재현됩니다.
        </Text>

        <View style={styles.signalCard}>
          <Text style={styles.signalTitle}>변수 값</Text>

          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>활동점수</Text>
            <TextInput
              style={styles.signalInput}
              value={activityText}
              onChangeText={setActivityText}
              keyboardType="number-pad"
              placeholder="0–100"
              placeholderTextColor="#888"
              maxLength={4}
            />
          </View>
          <Text style={styles.inputHint}>적용값: {activityScore} / 100</Text>

          <View style={[styles.signalRow, { marginTop: 10 }]}>
            <Text style={styles.signalLabel}>플레이(분)</Text>
            <TextInput
              style={styles.signalInput}
              value={playText}
              onChangeText={setPlayText}
              keyboardType="number-pad"
              placeholder="0–10080"
              placeholderTextColor="#888"
              maxLength={6}
            />
          </View>
          <Text style={styles.inputHint}>
            적용값: {gameplayMinutes}분 · {formatPlayTimeMinutes(gameplayMinutes)} (최대
            10080분 ≈ 7일)
          </Text>

          <Text style={styles.rarityPreview}>
            현재 변수 기준 예상 희귀도:{' '}
            <Text style={styles.rarityPreviewEm}>
              {PET_RARITY_LABELS[previewRarity]}
            </Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.rerollBtn} onPress={reroll}>
          <Text style={styles.rerollBtnText}>
            🎲 프로필 반영 · 9마리 다시 뽑기
          </Text>
        </TouchableOpacity>

        <View style={styles.screenWrap}>
          <View style={styles.lcdBezel}>
            <View style={styles.lcdScreen}>
              <View style={styles.grid}>
                {batch.map((dna, i) => {
                  const isSelected = i === selectedIndex;
                  const { backdrop, sprite } = spriteForStageWithBackdrop(
                    dna,
                    'grown',
                    null,
                  );
                  return (
                    <TouchableOpacity
                      key={`${dna.seed}-${i}-${dna.genre}`}
                      style={[styles.cell, isSelected && styles.cellSelected]}
                      onPress={() => setSelectedIndex(i)}
                    >
                      <PixelPetView
                        backdrop={backdrop}
                        sprite={sprite}
                        scale={1.6}
                      />
                      <Text style={styles.cellSeed} numberOfLines={1}>
                        {dna.seed}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>선택한 캐릭터의 변화</Text>
              <View style={styles.variantRow}>
                {variantSpecs.map(({ label, stage, variant }) => {
                  const { backdrop, sprite } = spriteForStageWithBackdrop(
                    selected,
                    stage,
                    variant,
                  );
                  return (
                    <View key={label} style={styles.variantCell}>
                      <PixelPetView
                        backdrop={backdrop}
                        sprite={sprite}
                        scale={1.8}
                      />
                      <Text style={styles.variantLabel}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dnaCard}>
          <Text style={styles.dnaTitle}>DNA (합성 결과)</Text>
          <Text style={styles.rarityBadge}>
            희귀도: {PET_RARITY_LABELS[selected.rarity ?? 'normal']}
          </Text>
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
            윤곽선(O)만 희귀도별 색이고, 몸·볼·액센트는 노말과 같은 규칙(검정 윤곽 기준
            HSL 절차 생성, 시드마다 다름)입니다. 저장 `palette` 이름은 그대로이고,
            baseSeed + 지표가 합쳐져 최종 파츠를 고릅니다.
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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  backBtn: { color: '#4488ff', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#1a1a2e', fontSize: 17, fontWeight: '800' },
  subtitle: {
    color: '#555',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  subtitleEm: { color: '#1a1a2e', fontWeight: '800' },
  signalCard: {
    backgroundColor: '#fdf1d6',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0c878',
  },
  signalTitle: {
    color: '#3b2557',
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
  signalLabel: { color: '#333', fontSize: 14, fontWeight: '600', width: 100 },
  signalInput: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#98b870',
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  inputHint: { color: '#666', fontSize: 11, marginTop: 4, marginBottom: 2 },
  rarityPreview: {
    color: '#555',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  rarityPreviewEm: { color: '#7a5500', fontWeight: '800' },
  rerollBtn: {
    backgroundColor: '#5a2a6e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#7a4a9e',
  },
  rerollBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  screenWrap: {
    width: '100%',
    alignItems: 'center',
  },
  lcdBezel: {
    width: '100%',
    backgroundColor: '#3b2557',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lcdScreen: {
    width: '100%',
    backgroundColor: '#c8e6a0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#98b870',
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cell: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(152,184,112,0.65)',
  },
  cellSelected: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 2,
    borderColor: '#5a2a6e',
  },
  cellSeed: {
    color: '#3d5c3d',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: '#2d4a2d',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(152,184,112,0.55)',
  },
  variantCell: { alignItems: 'center', flex: 1 },
  variantLabel: {
    color: '#3d5c3d',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dnaCard: {
    marginTop: 20,
    backgroundColor: '#fdf1d6',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0c878',
  },
  dnaTitle: {
    color: '#3b2557',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1,
  },
  rarityBadge: {
    color: '#7a5500',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  dnaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  dnaKey: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  dnaVal: {
    color: '#1a1a2e',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  dnaHint: { color: '#666', fontSize: 11, marginTop: 10, lineHeight: 16 },
});
