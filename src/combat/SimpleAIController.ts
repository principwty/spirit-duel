import Phaser from "phaser";
import { Fighter } from "./Fighter";
import { createEmptyInput } from "../input/InputController";
import type { AiDifficulty, AiDifficultyConfig, InputState } from "../types";

export const aiDifficulties: Record<AiDifficulty, AiDifficultyConfig> = {
  easy: {
    id: "easy",
    label: "簡單",
    reactionMs: 360,
    blockChance: 0.18,
    attackChance: 0.42,
    comboChance: 0.16,
    burstChance: 0.12,
  },
  normal: {
    id: "normal",
    label: "普通",
    reactionMs: 220,
    blockChance: 0.36,
    attackChance: 0.62,
    comboChance: 0.42,
    burstChance: 0.28,
  },
  hard: {
    id: "hard",
    label: "困難",
    reactionMs: 120,
    blockChance: 0.56,
    attackChance: 0.78,
    comboChance: 0.68,
    burstChance: 0.48,
  },
};

export class SimpleAIController {
  private readonly config: AiDifficultyConfig;
  private decisionTimer = 0;
  private attackCooldown = 0;
  private queuedCombo: Array<"medium" | "heavy" | "special"> = [];
  private wantsBlock = false;

  constructor(difficulty: AiDifficulty = "normal") {
    this.config = aiDifficulties[difficulty];
  }

  update(self: Fighter, opponent: Fighter, deltaMs: number): InputState {
    this.decisionTimer -= deltaMs;
    this.attackCooldown -= deltaMs;

    const input = createEmptyInput();
    const distance = Math.abs(opponent.x - self.x);
    const opponentAttacking = opponent.state === "attack" || opponent.state === "burst";
    const closeRange = distance < 126;

    if (this.decisionTimer <= 0) {
      this.decisionTimer = Phaser.Math.Between(this.config.reactionMs, this.config.reactionMs + 170);
      this.wantsBlock = opponentAttacking && closeRange && Math.random() < this.config.blockChance;
    }

    if (self.energy >= self.character.maxEnergy && Math.random() < this.config.burstChance * 0.012) {
      input.burst = true;
      return input;
    }

    if (this.wantsBlock) {
      input.block = true;
      return input;
    }

    if (this.queuedCombo.length > 0 && Math.random() < this.config.comboChance) {
      input[this.queuedCombo.shift()!] = true;
      return input;
    }

    if (distance > this.preferredRange(self)) {
      input.left = opponent.x < self.x;
      input.right = opponent.x > self.x;
      if (distance > 300 && self.isGrounded && Math.random() > 0.985) {
        input.down = true;
      }
      return input;
    }

    if (this.attackCooldown <= 0 && Math.random() < this.config.attackChance) {
      this.attackCooldown = Phaser.Math.Between(320, 760);
      if (self.energy >= self.character.moves.special.energyCost && distance > 145 && self.character.moves.special.projectile) {
        input.special = true;
      } else {
        input.light = true;
        this.queuedCombo = Math.random() < this.config.comboChance ? ["medium", "heavy", "special"] : [];
      }
    }

    if (opponent.x < self.x) input.left = true;
    if (opponent.x > self.x) input.right = true;
    return input;
  }

  private preferredRange(self: Fighter): number {
    return self.character.moves.special.projectile ? 210 : 118;
  }
}
