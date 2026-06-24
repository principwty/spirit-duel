import Phaser from "phaser";
import type { DebugCombatState, MatchConfig, TrainingConfig } from "../types";

export interface CombatDebugSetup {
  p1X?: number;
  p2X?: number;
  p1Health?: number;
  p2Health?: number;
  p1Energy?: number;
  p2Energy?: number;
  training?: Partial<TrainingConfig>;
  debugOverlay?: boolean;
  showHitboxes?: boolean;
  paused?: boolean;
  slowMotionScale?: number;
}

export interface DebuggableCombatScene extends Phaser.Scene {
  applyDebugSetup(setup: CombatDebugSetup): void;
  debugSnapshot(): DebugCombatState;
}

interface SpiritDebugApi {
  startCombat(config: MatchConfig): void;
  startTraining(config?: Partial<MatchConfig>): void;
  setupCombat(setup: CombatDebugSetup): boolean;
  snapshot(): DebugCombatState | undefined;
}

let activeCombatScene: DebuggableCombatScene | undefined;

export function registerCombatScene(scene: DebuggableCombatScene): void {
  activeCombatScene = scene;
}

export function unregisterCombatScene(scene: DebuggableCombatScene): void {
  if (activeCombatScene === scene) {
    activeCombatScene = undefined;
  }
}

export function installCombatDebug(game: Phaser.Game): void {
  const api: SpiritDebugApi = {
    startCombat(config) {
      game.scene.start("CombatScene", config);
    },
    startTraining(config = {}) {
      const training = {
        dummyMode: "stand",
        infiniteEnergy: true,
        infiniteHealth: true,
        autoReset: true,
        showHitboxes: false,
        showFrameData: true,
        showInputHistory: true,
        showMoveInfo: true,
        ...config.training,
      } satisfies TrainingConfig;
      game.scene.start("CombatScene", {
        mode: "training",
        p1Character: "kai",
        p2Character: "mira",
        stageId: "moon-rail",
        aiDifficulty: "normal",
        ...config,
        training,
      } satisfies MatchConfig);
    },
    setupCombat(setup) {
      if (!activeCombatScene) return false;
      activeCombatScene.applyDebugSetup(setup);
      return true;
    },
    snapshot() {
      return activeCombatScene?.debugSnapshot();
    },
  };

  Object.assign(game, { spiritDuel: api });
}
