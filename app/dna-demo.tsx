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
  generatePetDNA,
  spriteForStage,
  GAME_GENRE_LABELS,
} from '../src/lib/petGenerator';
import { Stage } from '../src/constants/config';

const GRID_SIZE = 9;

function makeBatch(): PetDNA[] {
  return Array.from({ length: GRID_SIZE }, () => generatePetDNA());
}

export default function DnaDemoScreen() {
  const router = useRouter();
  const [batch, setBatch] = useState<PetDNA[]>(() => makeBatch());
  const [selected, setSelected] = useState<PetDNA>(batch[0]);

  const reroll = useCallback(() => {
    const next = makeBatch();
    setBatch(next);
    setSelected(next[0]);
  }, []);

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
          버튼을 눌러 새 캐릭터 9마리를 즉석에서 생성합니다. 마음에 드는 캐릭터를 탭하면 아래에서
          성장 단계와 표정 변화를 볼 수 있어요.
        </Text>

        <TouchableOpacity style={styles.rerollBtn} onPress={reroll}>
          <Text style={styles.rerollBtnText}>🎲 새로 9마리 뽑기</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {batch.map((dna) => {
            const isSelected = dna.seed === selected.seed;
            return (
              <TouchableOpacity
                key={`${dna.seed}-${dna.genre}`}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => setSelected(dna)}
              >
                <PixelSprite sprite={spriteForStage(dna, 'grown', null)} scale={1.6} />
                <Text style={styles.cellSeed}>{dna.seed}</Text>
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
          <Text style={styles.dnaTitle}>DNA</Text>
          <DnaRow k="genre" v={GAME_GENRE_LABELS[selected.genre]} />
          <DnaRow k="seed" v={selected.seed} />
          <DnaRow k="bodyShape" v={selected.bodyShape} />
          <DnaRow k="eyes" v={selected.eyes} />
          <DnaRow k="mouth" v={selected.mouth} />
          <DnaRow k="accessory" v={selected.accessory} />
          <DnaRow k="palette" v={selected.palette} />
          <Text style={styles.dnaHint}>
            같은 seed로 호출하면 항상 같은 캐릭터가 나옵니다 (결정론적 생성).
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
      <Text style={styles.dnaVal}>{v}</Text>
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
  subtitle: { color: '#aaa', fontSize: 13, lineHeight: 20, marginBottom: 16 },
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
  },
  dnaKey: { color: '#888', fontSize: 13, fontFamily: 'monospace' },
  dnaVal: { color: '#fff', fontSize: 13, fontFamily: 'monospace', fontWeight: '700' },
  dnaHint: { color: '#666', fontSize: 11, marginTop: 10, lineHeight: 16 },
});
