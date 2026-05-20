import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GAME_CONFIG,
  DEFAULT_STATE,
  TamagotchiData,
  Stage,
} from '../constants/config';
import { generatePetDNA, normalizePetDNA } from '../lib/petGenerator';

const STORAGE_KEY = '@tamagotchi_state';

function computeStage(createdAt: number, now: number): Stage {
  const elapsed = now - createdAt;
  if (elapsed < GAME_CONFIG.EGG_DURATION_MS) return 'egg';
  if (elapsed < GAME_CONFIG.BABY_DURATION_MS) return 'baby';
  return 'grown';
}

function reconcileState(state: TamagotchiData, now: number): TamagotchiData {
  if (state.isDead) return state;

  const updated = { ...state };

  // Calculate new poops
  const timeSinceClean = now - updated.lastCleanTime;
  const newPoops = Math.floor(timeSinceClean / GAME_CONFIG.POOP_INTERVAL_MS);
  updated.poopCount = Math.min(newPoops, GAME_CONFIG.MAX_POOP);

  // Check poop death
  if (updated.poopCount >= GAME_CONFIG.MAX_POOP) {
    updated.isDead = true;
    return updated;
  }

  // Check hunger -> sickness
  const timeSinceFeed = now - updated.lastFeedTime;
  if (timeSinceFeed >= GAME_CONFIG.HUNGER_SICK_MS && !updated.isSick) {
    updated.isSick = true;
    updated.sickSince = updated.lastFeedTime + GAME_CONFIG.HUNGER_SICK_MS;
  }

  // Check sickness -> death
  if (updated.isSick && updated.sickSince) {
    const sickDuration = now - updated.sickSince;
    if (sickDuration >= GAME_CONFIG.SICK_DEATH_MS) {
      updated.isDead = true;
      return updated;
    }
  }

  // Growth stage
  updated.stage = computeStage(updated.createdAt, now);

  return updated;
}

export function useTamagotchiState() {
  const [state, setState] = useState<TamagotchiData>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const save = useCallback(async (newState: TamagotchiData) => {
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Load on mount
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: TamagotchiData = JSON.parse(raw);
        // Migrate legacy saves that predate the dna field.
        if (parsed.isUnlocked && parsed.dna) {
          parsed.dna = normalizePetDNA(parsed.dna);
        }
        if (parsed.isUnlocked && !parsed.dna) {
          parsed.dna = generatePetDNA();
        }
        const reconciled = reconcileState(parsed, Date.now());
        setState(reconciled);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
      }
      setIsLoaded(true);
    })();
  }, []);

  // Reconcile on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') {
        const reconciled = reconcileState(stateRef.current, Date.now());
        save(reconciled);
      }
    });
    return () => sub.remove();
  }, [save]);

  // Periodic tick every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const reconciled = reconcileState(stateRef.current, Date.now());
      save(reconciled);
    }, 30_000);
    return () => clearInterval(interval);
  }, [save]);

  const feed = useCallback(() => {
    const now = Date.now();
    const updated = { ...stateRef.current, lastFeedTime: now, isSick: false, sickSince: null };
    save(reconcileState(updated, now));
  }, [save]);

  const clean = useCallback(() => {
    const now = Date.now();
    const updated = { ...stateRef.current, lastCleanTime: now, poopCount: 0 };
    save(reconcileState(updated, now));
  }, [save]);

  const play = useCallback(() => {
    // Play doesn't change persistent state, just triggers animation
    // But we reconcile anyway
    save(reconcileState(stateRef.current, Date.now()));
  }, [save]);

  const unlock = useCallback(async () => {
    const now = Date.now();
    const newState: TamagotchiData = {
      ...DEFAULT_STATE,
      lastFeedTime: now,
      lastCleanTime: now,
      createdAt: now,
      isUnlocked: true,
      dna: generatePetDNA(),
    };
    await save(newState);
  }, [save]);

  const restart = useCallback(async () => {
    const now = Date.now();
    const newState: TamagotchiData = {
      ...DEFAULT_STATE,
      lastFeedTime: now,
      lastCleanTime: now,
      createdAt: now,
      isUnlocked: true,
      battleRecord: stateRef.current.battleRecord, // preserve battle record
      dna: generatePetDNA(),
    };
    await save(newState);
  }, [save]);

  /**
   * Full reset for the gem-cost reroll flow: wipes battle record and every
   * other piece of state. The pet is reborn with fresh DNA.
   */
  const rerollFresh = useCallback(async () => {
    const now = Date.now();
    const newState: TamagotchiData = {
      ...DEFAULT_STATE,
      lastFeedTime: now,
      lastCleanTime: now,
      createdAt: now,
      isUnlocked: true,
      dna: generatePetDNA(),
    };
    await save(newState);
  }, [save]);

  // ── Dev / demo helpers ─────────────────────────────────────────────
  const setStageDev = useCallback(
    (stage: Stage) => {
      const now = Date.now();
      // Pick a createdAt that, after reconcileState's stage computation,
      // resolves to the requested stage so the override persists.
      let createdAt = now;
      if (stage === 'baby') {
        createdAt = now - GAME_CONFIG.EGG_DURATION_MS - 1000;
      } else if (stage === 'grown') {
        createdAt = now - GAME_CONFIG.BABY_DURATION_MS - 1000;
      }
      const updated: TamagotchiData = {
        ...stateRef.current,
        createdAt,
        stage,
      };
      save(reconcileState(updated, now));
    },
    [save],
  );

  const addPoopDev = useCallback(() => {
    const next = Math.min(
      stateRef.current.poopCount + 1,
      GAME_CONFIG.MAX_POOP,
    );
    save({ ...stateRef.current, poopCount: next });
  }, [save]);

  const triggerHungryDev = useCallback(() => {
    // Push lastFeedTime back so isHungry crosses its threshold (50% of
    // HUNGER_SICK_MS) but doesn't auto-promote to sick yet.
    const now = Date.now();
    const lastFeedTime = now - Math.floor(GAME_CONFIG.HUNGER_SICK_MS * 0.7);
    save({ ...stateRef.current, lastFeedTime });
  }, [save]);

  const triggerSickDev = useCallback(() => {
    save({
      ...stateRef.current,
      isSick: true,
      sickSince: Date.now(),
    });
  }, [save]);

  const triggerDeadDev = useCallback(() => {
    save({ ...stateRef.current, isDead: true });
  }, [save]);

  const healDev = useCallback(() => {
    const now = Date.now();
    save({
      ...stateRef.current,
      lastFeedTime: now,
      lastCleanTime: now,
      isSick: false,
      sickSince: null,
      isDead: false,
      poopCount: 0,
    });
  }, [save]);

  const recordBattle = useCallback(
    (result: 'win' | 'loss' | 'npcWin') => {
      const record = { ...stateRef.current.battleRecord };
      if (result === 'win') record.wins++;
      else if (result === 'loss') record.losses++;
      else record.npcWins++;
      save({ ...stateRef.current, battleRecord: record });
    },
    [save],
  );

  const isHungry = !state.isDead && Date.now() - state.lastFeedTime > GAME_CONFIG.HUNGER_SICK_MS * 0.5;

  return {
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
  };
}
