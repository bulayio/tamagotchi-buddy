export const SECRET_COMMAND = 'BUDDY';

export const HINTS = [
  '첫 번째 글자는 B',
  '두 번째 글자는 U',
  '세 번째 글자는 D',
  '네 번째와 다섯 번째는 같은 글자 (D, Y 중 하나)',
];

export const GAME_CONFIG = {
  POOP_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes
  HUNGER_SICK_MS: 60 * 60 * 1000,   // 1 hour without feeding -> sick
  SICK_DEATH_MS: 6 * 60 * 60 * 1000, // 6 hours sick -> death
  MAX_POOP: 6,                        // 6 poop -> death
  EGG_DURATION_MS: 60 * 60 * 1000,   // 1 hour as egg
  BABY_DURATION_MS: 6 * 60 * 60 * 1000, // 6 hours as baby
} as const;

export const BATTLE_CONFIG = {
  DURATION_MS: 10_000, // 10 seconds
  STAGE_BONUS: {
    egg: 0,
    baby: 0.1,
    grown: 0.2,
  },
  SICK_PENALTY: 0.3,
  NPC_TAPS_PER_SECOND: {
    weak: 4,
    strong: 7,
  },
} as const;

export type Stage = 'egg' | 'baby' | 'grown';

export interface TamagotchiData {
  lastFeedTime: number;
  lastCleanTime: number;
  poopCount: number;
  isSick: boolean;
  sickSince: number | null;
  isDead: boolean;
  stage: Stage;
  createdAt: number;
  isUnlocked: boolean;
  battleRecord: { wins: number; losses: number; npcWins: number };
}

export const DEFAULT_STATE: TamagotchiData = {
  lastFeedTime: Date.now(),
  lastCleanTime: Date.now(),
  poopCount: 0,
  isSick: false,
  sickSince: null,
  isDead: false,
  stage: 'egg',
  createdAt: Date.now(),
  isUnlocked: false,
  battleRecord: { wins: 0, losses: 0, npcWins: 0 },
};
