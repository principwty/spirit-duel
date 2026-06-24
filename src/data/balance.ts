import type { BalanceConfig } from "../types";

export const balance: BalanceConfig = {
  gravity: 1900,
  arenaMinX: 70,
  arenaMaxX: 890,
  initialEnergy: 24,
  blockDamageRatio: 0.25,
  guardPressureMax: 100,
  guardPressureDecayPerMs: 0.018,
  guardPressureNormalMultiplier: 3.1,
  guardPressureQuakeMultiplier: 4.2,
  guardBreakStunMs: 520,
  guardBreakLift: -90,
  comboTimerMs: 1500,
  dashDurationMs: 170,
  dashFriction: 0.96,
  groundedFriction: 0.84,
  trainingP1X: 250,
  trainingP2X: 710,
};
