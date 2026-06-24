import { characters } from "./characters";
import type { ArcadeRunConfig } from "../types";

export const arcadeRuns: Record<string, ArcadeRunConfig> = {
  kai: {
    playerCharacter: "kai",
    rounds: [
      { opponentId: "mira", stageId: "moon-rail", aiDifficulty: "easy" },
      { opponentId: "nyx", stageId: "ember-dojo", aiDifficulty: "normal" },
      { opponentId: "bront", stageId: "moon-rail", aiDifficulty: "hard" },
    ],
  },
  mira: {
    playerCharacter: "mira",
    rounds: [
      { opponentId: "kai", stageId: "moon-rail", aiDifficulty: "easy" },
      { opponentId: "bront", stageId: "ember-dojo", aiDifficulty: "normal" },
      { opponentId: "nyx", stageId: "moon-rail", aiDifficulty: "hard" },
    ],
  },
  bront: {
    playerCharacter: "bront",
    rounds: [
      { opponentId: "nyx", stageId: "ember-dojo", aiDifficulty: "easy" },
      { opponentId: "mira", stageId: "moon-rail", aiDifficulty: "normal" },
      { opponentId: "kai", stageId: "ember-dojo", aiDifficulty: "hard" },
    ],
  },
  nyx: {
    playerCharacter: "nyx",
    rounds: [
      { opponentId: "bront", stageId: "moon-rail", aiDifficulty: "easy" },
      { opponentId: "kai", stageId: "ember-dojo", aiDifficulty: "normal" },
      { opponentId: "mira", stageId: "moon-rail", aiDifficulty: "hard" },
    ],
  },
};

export function getArcadeRun(characterId: string): ArcadeRunConfig {
  return arcadeRuns[characterId] ?? arcadeRuns[characters[0].id];
}
