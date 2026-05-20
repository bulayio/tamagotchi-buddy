import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GAME_CONFIG,
  DEFAULT_STATE,
  ECONOMY,
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
        // Migrate legacy saves that predate newer fields.
        if (parsed.isUnlocked && parsed.dna) {
          parsed.dna = normalizePetDNA(parsed.dna);
        }
        if (parsed.isUnlocked && !parsed.dna) {
          parsed.dna = generatePetDNA();
        }
        if (typeof parsed.gems !== 'number') parsed.gems = DEFAULT_STATE.gems;
        if (typeof parsed.poopCleansToday !== 'number') parsed.poopCleansToday = 0;
        if (typeof parsed.lastPoopCleanDayKey !== 'string') parsed.lastPoopCleanDayKey = '';
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

  /**
   * Clean wipes poop, increments today's clean counter, and on the 4th+ clean
   * of the day rolls a 30% chance for a 100-gem reward.
   * Returns the reward amount (0 if none) so the caller can show a modal.
   */
  const clean = useCallback((): number => {
    const now = Date.now();
    const prev = stateRef.current;
    const hadPoop = prev.poopCount > 0;

    // Compute today's day key (local midnight, YYYY-MM-DD)
    const d = new Date(now);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let cleansToday = prev.lastPoopCleanDayKey === dayKey ? prev.poopCleansToday : 0;
    let reward = 0;
    if (hadPoop) {
      cleansToday += 1;
      // 4th and subsequent cleans of the day each roll 30% for +100 gems.
      if (
        cleansToday > ECONOMY.POOP_REWARD_AFTER_CLEANS &&
        Math.random() < ECONOMY.POOP_REWARD_CHANCE
      ) {
        reward = ECONOMY.POOP_REWARD_GEMS;
      }
    }

    save(
      reconcileState(
        {
          ...prev,
          lastCleanTime: now,
          poopCount: 0,
          poopCleansToday: cleansToday,
          lastPoopCleanDayKey: dayKey,
          gems: prev.gems + reward,
        },
        now,
      ),
    );
    return reward;
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

  const setStageDev = useCallback(
    (stage: Stage) => {
      const now = Date.now();
      let createdAt = stateRef.current.createdAt;
      if (stage === 'egg') createdAt = now;
      else if (stage === 'baby') createdAt = now - GAME_CONFIG.EGG_DURATION_MS;
      else createdAt = now - GAME_CONFIG.EGG_DURATION_MS - GAME_CONFIG.BABY_DURATION_MS;
      save(reconcileState({ ...stateRef.current, createdAt }, now));
    },
    [save],
  );

  const addPoopDev = useCallback(() => {
    const next = Math.min(stateRef.current.poopCount + 1, GAME_CONFIG.MAX_POOP - 1);
    save({ ...stateRef.current, poopCount: next });
  }, [save]);

  const triggerHungryDev = useCallback(() => {
    const now = Date.now();
    save({
      ...stateRef.current,
      lastFeedTime: now - GAME_CONFIG.HUNGER_SICK_MS,
      isSick: false,
      sickSince: null,
    });
  }, [save]);

  const triggerSickDev = useCallback(() => {
    const now = Date.now();
    save({ ...stateRef.current, isSick: true, sickSince: now });
  }, [save]);

  const triggerDeadDev = useCallback(() => {
    save({ ...stateRef.current, isDead: true });
  }, [save]);

  const healDev = useCallback(() => {
    const now = Date.now();
    save({
      ...stateRef.current,
      isSick: false,
      sickSince: null,
      lastFeedTime: now,
    });
  }, [save]);

  /**
   * Spend gems to roll a brand-new buddy. Battle record is reset along with
   * everything else (this is the user's signal that the previous run is over).
   * Returns true on success, false if the player lacks the gem balance.
   */
  const rerollFresh = useCallback(async (): Promise<boolean> => {
    const prev = stateRef.current;
    if (prev.gems < ECONOMY.REROLL_COST) return false;
    const now = Date.now();
    await save({
      ...DEFAULT_STATE,
      lastFeedTime: now,
      lastCleanTime: now,
      createdAt: now,
      isUnlocked: true,
      dna: generatePetDNA(),
      gems: prev.gems - ECONOMY.REROLL_COST,
    });
    return true;
  }, [save]);

  return {
    state,
    isLoaded,
    feed,
    clean,
    play,
    unlock,
    restart,
    recordBattle,
    isHungry,
    rerollFresh,
    setStageDev,
    addPoopDev,
    triggerHungryDev,
    triggerSickDev,
    triggerDeadDev,
    healDev,
  };
}
