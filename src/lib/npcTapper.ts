import { BATTLE_CONFIG, Stage } from '../constants/config';

export type NpcType = 'weak' | 'strong';
export type Opponent = 'pvp' | 'npc_weak' | 'npc_strong';

export function opponentToNpcType(o: Opponent): NpcType | null {
  if (o === 'npc_weak') return 'weak';
  if (o === 'npc_strong') return 'strong';
  return null;
}

export function opponentLabel(o: Opponent): string {
  if (o === 'pvp') return '상대 버디';
  if (o === 'npc_weak') return 'NPC (약함)';
  return 'NPC (강함)';
}

/**
 * Estimate NPC tap count for the given elapsed time.
 * Adds a small per-second jitter so the bar doesn't look perfectly linear.
 */
export function npcTapsAt(elapsedMs: number, npc: NpcType): number {
  const tps = BATTLE_CONFIG.NPC_TAPS_PER_SECOND[npc];
  const jitter = 0.8 + Math.random() * 0.4;
  return Math.round((elapsedMs / 1000) * tps * jitter);
}

/**
 * Final NPC score at the end of a full-duration round.
 */
export function npcFinalScore(npc: NpcType): number {
  const tps = BATTLE_CONFIG.NPC_TAPS_PER_SECOND[npc];
  const jitter = 0.9 + Math.random() * 0.2;
  return Math.round((BATTLE_CONFIG.DURATION_MS / 1000) * tps * jitter);
}

/**
 * Apply stage bonus + sick penalty to the player's raw tap count.
 */
export function playerScore(rawTaps: number, stage: Stage, sick: boolean): number {
  let bonus = 1 + BATTLE_CONFIG.STAGE_BONUS[stage];
  if (sick) bonus -= BATTLE_CONFIG.SICK_PENALTY;
  return Math.round(rawTaps * Math.max(bonus, 0.1));
}

/**
 * PvP opponent: simulate against a "phantom" buddy roughly matching player's
 * own taps with some variance. Same payload shape as NPC for consistency.
 */
export function pvpFinalScore(playerScoreValue: number): number {
  const variance = 0.8 + Math.random() * 0.4;
  return Math.round(playerScoreValue * variance);
}
