import type { TrainingConfig, TrainingDummyMode } from "../types";

export const trainingModes: Array<{ id: TrainingDummyMode; label: string }> = [
  { id: "stand", label: "站立" },
  { id: "block", label: "格擋" },
  { id: "counter", label: "反擊" },
];

export const defaultTrainingConfig: TrainingConfig = {
  dummyMode: "stand",
  infiniteEnergy: true,
  infiniteHealth: true,
  autoReset: true,
  showHitboxes: false,
  showFrameData: true,
  showInputHistory: true,
  showMoveInfo: true,
};
