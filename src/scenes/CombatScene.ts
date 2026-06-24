import Phaser from "phaser";
import { SoundManager } from "../audio/SoundManager";
import { Fighter } from "../combat/Fighter";
import { HitboxSystem } from "../combat/HitboxSystem";
import { ProjectileSystem } from "../combat/ProjectileSystem";
import { SimpleAIController } from "../combat/SimpleAIController";
import { getArcadeRun } from "../data/arcade";
import { getCharacter } from "../data/characters";
import { getStage } from "../data/stages";
import { defaultTrainingConfig, trainingModes } from "../data/training";
import { KeyboardController, createEmptyInput } from "../input/InputController";
import { playerOneKeys, playerTwoKeys } from "../input/keymaps";
import type { FighterSnapshot, ImpactEffectConfig, InputState, MatchConfig, MatchResult, TrainingConfig } from "../types";
import { createBackdrop } from "./MenuScene";

const ROUND_SECONDS = 99;
const impactEffects: Record<"light" | "medium" | "heavy" | "block" | "break" | "burst" | "projectile", ImpactEffectConfig> = {
  light: { label: "命中", color: 0xf8f3df, flashColor: 0xffffff, hitStopMs: 48, shakeMs: 55, shakeIntensity: 0.002, ringScale: 1.1 },
  medium: { label: "命中", color: 0xf7c873, flashColor: 0xffe5a6, hitStopMs: 78, shakeMs: 80, shakeIntensity: 0.003, ringScale: 1.25 },
  heavy: { label: "重擊", color: 0xff6b35, flashColor: 0xffb45c, hitStopMs: 108, shakeMs: 130, shakeIntensity: 0.005, ringScale: 1.5 },
  block: { label: "格擋", color: 0x88f2d0, flashColor: 0x88f2d0, hitStopMs: 55, shakeMs: 45, shakeIntensity: 0.002, ringScale: 0.95 },
  break: { label: "破防", color: 0xffdf5a, flashColor: 0xffdf5a, hitStopMs: 128, shakeMs: 160, shakeIntensity: 0.006, ringScale: 1.75 },
  burst: { label: "爆氣", color: 0xffdf5a, flashColor: 0xfff3a0, hitStopMs: 122, shakeMs: 180, shakeIntensity: 0.006, ringScale: 2 },
  projectile: { label: "彈擊", color: 0x52ffaa, flashColor: 0x88f2d0, hitStopMs: 70, shakeMs: 70, shakeIntensity: 0.003, ringScale: 1.25 },
};

export class CombatScene extends Phaser.Scene {
  private matchConfig: MatchConfig = {
    mode: "ai",
    p1Character: "kai",
    p2Character: "mira",
    stageId: "moon-rail",
    aiDifficulty: "normal",
    training: undefined,
    arcade: undefined,
  };
  private p1!: Fighter;
  private p2!: Fighter;
  private p1Controller!: KeyboardController;
  private p2Controller?: KeyboardController;
  private ai!: SimpleAIController;
  private hitboxes!: HitboxSystem;
  private projectiles!: ProjectileSystem;
  private ui!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private stateText!: Phaser.GameObjects.Text;
  private p1ComboText!: Phaser.GameObjects.Text;
  private p2ComboText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private trainingText!: Phaser.GameObjects.Text;
  private trainingPanelText!: Phaser.GameObjects.Text;
  private roundBanner!: Phaser.GameObjects.Text;
  private flashOverlay!: Phaser.GameObjects.Rectangle;
  private sfx!: SoundManager;
  private roundMs = ROUND_SECONDS * 1000;
  private finished = false;
  private debugHitboxes = false;
  private hitStopMs = 0;
  private trainingConfig: TrainingConfig = { ...defaultTrainingConfig };
  private lastTrainingEvent = "尚未命中";

  constructor() {
    super("CombatScene");
  }

  init(data: MatchConfig): void {
    this.matchConfig = { ...this.matchConfig, ...data };
    this.trainingConfig = { ...defaultTrainingConfig, ...this.matchConfig.training };
    this.roundMs = ROUND_SECONDS * 1000;
    this.finished = false;
  }

  create(): void {
    const stage = getStage(this.matchConfig.stageId);
    createBackdrop(this, stage);
    this.add.rectangle(480, stage.groundY + 8, 860, 12, stage.palette.trim, 0.34);
    this.sfx = new SoundManager(this);

    this.p1 = new Fighter(this, "p1", getCharacter(this.matchConfig.p1Character), 250, stage.groundY, 1);
    this.p2 = new Fighter(this, "p2", getCharacter(this.matchConfig.p2Character), 710, stage.groundY, -1);
    this.p1Controller = new KeyboardController(this, playerOneKeys);
    this.p2Controller =
      this.matchConfig.mode === "versus"
        ? new KeyboardController(this, playerTwoKeys)
        : undefined;
    this.ai = new SimpleAIController(this.matchConfig.aiDifficulty);
    this.hitboxes = new HitboxSystem(this);
    this.projectiles = new ProjectileSystem(this, (impact) => {
      const effect = impact.guardBroken ? impactEffects.break : impact.blocked ? impactEffects.block : impactEffects.projectile;
      this.playImpact(effect, impact.x, impact.y, impact.blocked);
      this.lastTrainingEvent = `${effect.label}｜${impact.move.label}｜${impact.blocked ? Math.ceil(impact.move.damage * 0.25) : impact.move.damage} 傷害`;
    });

    this.ui = this.add.graphics().setDepth(30);
    this.timerText = this.add
      .text(480, 24, `${ROUND_SECONDS}`, {
        fontFamily: "Arial Black, Arial",
        fontSize: "30px",
        color: "#f8f3df",
        stroke: "#141821",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(31);
    this.stateText = this.add
      .text(480, 78, "", {
        fontFamily: "Arial Black, Arial",
        fontSize: "16px",
        color: "#88f2d0",
      })
      .setOrigin(0.5)
      .setDepth(31);
    this.p1ComboText = this.add.text(62, 95, "", this.comboStyle()).setDepth(31);
    this.p2ComboText = this.add.text(898, 95, "", this.comboStyle()).setOrigin(1, 0).setDepth(31);
    this.modeText = this.add.text(480, 102, "", {
      fontFamily: "Arial Black, Arial",
      fontSize: "13px",
      color: "#f7c873",
      stroke: "#141821",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    this.trainingText = this.add.text(480, 122, "", {
      fontFamily: "Arial Black, Arial",
      fontSize: "12px",
      color: "#88f2d0",
      stroke: "#141821",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    this.trainingPanelText = this.add.text(62, 386, "", {
      fontFamily: "Arial Black, Arial",
      fontSize: "12px",
      color: "#f8f3df",
      stroke: "#141821",
      strokeThickness: 3,
      lineSpacing: 5,
    }).setDepth(31);
    this.roundBanner = this.add.text(480, 230, "", {
      fontFamily: "Arial Black, Arial",
      fontSize: "48px",
      color: "#f8f3df",
      stroke: "#141821",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(32);
    this.flashOverlay = this.add.rectangle(480, 270, 960, 540, 0xffffff, 0).setDepth(29);
    this.showBanner(this.matchConfig.mode === "training" ? "訓練開始" : "回合開始", 750);

    this.input.keyboard?.on("keydown-H", () => {
      this.debugHitboxes = !this.debugHitboxes;
    });
    this.input.keyboard?.on("keydown-R", () => this.trainingReset());
    this.input.keyboard?.on("keydown-T", () => this.cycleDummyMode());
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("MenuScene"));
    this.cameras.main.fadeIn(180, 17, 21, 28);
  }

  update(_time: number, deltaMs: number): void {
    if (this.finished) return;

    if (this.hitStopMs > 0) {
      this.hitStopMs = Math.max(0, this.hitStopMs - deltaMs);
      this.drawUi(this.p1.snapshot(), this.p2.snapshot());
      return;
    }

    if (this.matchConfig.mode !== "training") {
      this.roundMs = Math.max(0, this.roundMs - deltaMs);
    }
    const p1Input = this.p1Controller.read();
    const p2Input = this.readP2Input(deltaMs);

    this.p1.update(p1Input, this.p2, deltaMs);
    this.p2.update(p2Input, this.p1, deltaMs);
    this.applyTrainingRules();
    this.spawnPendingProjectiles();
    this.projectiles.update(deltaMs, [this.p1, this.p2]);
    this.handleHitResult(this.hitboxes.resolve(this.p1, this.p2));
    this.handleHitResult(this.hitboxes.resolve(this.p2, this.p1));
    this.hitboxes.drawDebug([this.p1, this.p2], this.debugHitboxes);
    this.drawUi(this.p1.snapshot(), this.p2.snapshot());
    this.checkRoundEnd();
  }

  private readP2Input(deltaMs: number): InputState {
    if (this.matchConfig.mode === "training") return this.trainingInput(deltaMs);
    if (this.p2Controller) return this.p2Controller.read();
    if (this.p2.isDefeated) return createEmptyInput();
    return this.ai.update(this.p2, this.p1, deltaMs);
  }

  private spawnPendingProjectiles(): void {
    const p1Move = this.p1.consumeProjectileMove();
    if (p1Move) {
      this.sfx.play("projectile");
      this.projectiles.spawn(this.p1, p1Move);
    }
    const p2Move = this.p2.consumeProjectileMove();
    if (p2Move) {
      this.sfx.play("projectile");
      this.projectiles.spawn(this.p2, p2Move);
    }
  }

  private drawUi(p1: FighterSnapshot, p2: FighterSnapshot): void {
    this.ui.clear();
    this.drawBar(48, 28, 338, 24, p1.health / p1.maxHealth, 0xd94735, false);
    this.drawBar(574, 28, 338, 24, p2.health / p2.maxHealth, 0x3f7fea, true);
    this.drawBar(48, 60, 252, 10, p1.energy / p1.maxEnergy, 0x88f2d0, false);
    this.drawBar(660, 60, 252, 10, p2.energy / p2.maxEnergy, 0xffdf5a, true);
    this.drawBar(48, 74, 190, 5, p1.guardPressure, 0xff6b35, false);
    this.drawBar(722, 74, 190, 5, p2.guardPressure, 0xff6b35, true);
    this.drawBurstPip(312, 55, p1.burstActive, p1.burstPercent, false);
    this.drawBurstPip(632, 55, p2.burstActive, p2.burstPercent, true);

    this.timerText.setText(`${Math.ceil(this.roundMs / 1000)}`);
    this.stateText.setText(`${p1.characterName}  對  ${p2.characterName}`);
    this.modeText.setText(this.modeLabel());
    this.trainingText.setText(
      this.matchConfig.mode === "training"
        ? `假人：${this.trainingModeLabel()}   招式：${this.moveInfo(p1)}   R 重置   T 切換假人`
        : "",
    );
    this.trainingPanelText.setText(this.matchConfig.mode === "training" ? this.trainingPanel(p1) : "");
    this.p1ComboText.setText(p1.combo.hits >= 2 ? `${p1.combo.hits} 連擊  ${p1.combo.damage} 傷害` : "");
    this.p2ComboText.setText(p2.combo.hits >= 2 ? `${p2.combo.hits} 連擊  ${p2.combo.damage} 傷害` : "");
  }

  private drawBar(
    x: number,
    y: number,
    width: number,
    height: number,
    percent: number,
    color: number,
    reverse: boolean,
  ): void {
    const fillWidth = Phaser.Math.Clamp(percent, 0, 1) * width;
    this.ui.fillStyle(0x11151c, 0.84);
    this.ui.fillRect(x, y, width, height);
    this.ui.lineStyle(2, 0xf8f3df, 0.8);
    this.ui.strokeRect(x, y, width, height);
    this.ui.fillStyle(color, 0.96);
    if (reverse) {
      this.ui.fillRect(x + width - fillWidth, y, fillWidth, height);
    } else {
      this.ui.fillRect(x, y, fillWidth, height);
    }
  }

  private drawBurstPip(x: number, y: number, active: boolean, percent: number, reverse: boolean): void {
    const width = 74;
    this.ui.fillStyle(0x11151c, 0.84);
    this.ui.fillRect(reverse ? x - width : x, y, width, 20);
    this.ui.lineStyle(2, active ? 0xffdf5a : 0xf8f3df, 0.8);
    this.ui.strokeRect(reverse ? x - width : x, y, width, 20);
    if (active) {
      this.ui.fillStyle(0xffdf5a, 0.85);
      const fill = width * Phaser.Math.Clamp(percent, 0, 1);
      this.ui.fillRect(reverse ? x - fill : x, y, fill, 20);
    }
  }

  private checkRoundEnd(): void {
    if (this.matchConfig.mode === "training") return;
    const timeOut = this.roundMs <= 0;
    if (!this.p1.isDefeated && !this.p2.isDefeated && !timeOut) return;

    this.finished = true;
    const p1 = this.p1.snapshot();
    const p2 = this.p2.snapshot();
    const winner =
      p1.health === p2.health ? "平手" : p1.health > p2.health ? this.p1.character.name : this.p2.character.name;

    if (winner === this.p1.character.name) this.p1.setVictory();
    if (winner === this.p2.character.name) this.p2.setVictory();
    this.sfx.play(winner === "平手" ? "ko" : winner === this.p1.character.name ? "win" : "ko");
    this.hitStopMs = Math.max(this.hitStopMs, 180);
    this.flashScreen(0xfff3a0, 0.22, 260);
    this.showBanner(winner === "平手" ? "時間到" : "擊倒", 700);
    this.projectiles.clear();

    this.time.delayedCall(900, () => {
      if (this.matchConfig.mode === "arcade" && winner === this.p1.character.name && this.matchConfig.arcade) {
        const run = getArcadeRun(this.matchConfig.arcade.playerCharacter);
        const nextIndex = this.matchConfig.arcade.roundIndex + 1;
        if (nextIndex < run.rounds.length) {
          const nextRound = run.rounds[nextIndex];
          this.scene.start("CombatScene", {
            mode: "arcade",
            p1Character: this.matchConfig.p1Character,
            p2Character: nextRound.opponentId,
            stageId: nextRound.stageId,
            aiDifficulty: nextRound.aiDifficulty,
            arcade: {
              playerCharacter: this.matchConfig.arcade.playerCharacter,
              roundIndex: nextIndex,
              wins: this.matchConfig.arcade.wins + 1,
            },
          } satisfies MatchConfig);
          return;
        }
      }

      this.scene.start("ResultScene", {
        winner,
        mode: this.matchConfig.mode,
        p1Character: this.matchConfig.p1Character,
        p2Character: this.matchConfig.p2Character,
        stageId: this.matchConfig.stageId,
        aiDifficulty: this.matchConfig.aiDifficulty,
        p1Health: p1.health,
        p2Health: p2.health,
        p1MaxCombo: p1.combo.maxHits,
        p2MaxCombo: p2.combo.maxHits,
        arcade:
          this.matchConfig.mode === "arcade" && this.matchConfig.arcade
            ? {
                ...this.matchConfig.arcade,
                wins: winner === this.p1.character.name ? this.matchConfig.arcade.wins + 1 : this.matchConfig.arcade.wins,
                cleared: winner === this.p1.character.name && this.matchConfig.arcade.roundIndex >= getArcadeRun(this.matchConfig.arcade.playerCharacter).rounds.length - 1,
              }
            : undefined,
        training: this.matchConfig.training,
      } satisfies MatchResult);
    });
  }

  private trainingInput(deltaMs: number): InputState {
    const input = createEmptyInput();
    if (this.trainingConfig.dummyMode === "block") {
      input.block = true;
    }
    if (this.trainingConfig.dummyMode === "counter") {
      return this.ai.update(this.p2, this.p1, deltaMs);
    }
    return input;
  }

  private applyTrainingRules(): void {
    if (this.matchConfig.mode !== "training") return;
    if (this.trainingConfig.infiniteEnergy) {
      this.p1.refillEnergy();
      this.p2.refillEnergy();
    }
    if (this.p1.isDefeated || this.p2.isDefeated) {
      this.trainingReset();
    }
  }

  private trainingReset(): void {
    if (this.matchConfig.mode !== "training") return;
    this.projectiles?.clear();
    this.p1.resetForTraining(250);
    this.p2.resetForTraining(710);
    this.p1.refillEnergy();
    this.p2.refillEnergy();
    this.lastTrainingEvent = "重置完成";
    this.showBanner("重置", 420);
    this.sfx?.play("uiConfirm");
  }

  private cycleDummyMode(): void {
    if (this.matchConfig.mode !== "training") return;
    const index = trainingModes.findIndex((mode) => mode.id === this.trainingConfig.dummyMode);
    this.trainingConfig.dummyMode = trainingModes[(index + 1) % trainingModes.length].id;
    this.showBanner(trainingModes.find((mode) => mode.id === this.trainingConfig.dummyMode)?.label ?? "假人", 460);
    this.sfx.play("uiConfirm");
  }

  private handleHitResult(result: ReturnType<HitboxSystem["resolve"]>): void {
    if (!result?.accepted) return;
    const center = this.hitEffectPoint(result.blocked);
    const key = result.guardBroken
      ? "break"
      : result.blocked
        ? "block"
        : result.move.name === "burst"
          ? "burst"
          : result.move.name === "heavy" || result.move.effectKey === "quake"
            ? "heavy"
            : result.move.name === "medium"
              ? "medium"
              : "light";
    this.playImpact(impactEffects[key], center.x, center.y, result.blocked);
    this.lastTrainingEvent = `${impactEffects[key].label}｜${result.move.label}｜${result.blocked ? Math.ceil(result.move.damage * 0.25) : result.move.damage} 傷害`;
  }

  private hitEffectPoint(blocked: boolean): Phaser.Math.Vector2 {
    const x = (this.p1.x + this.p2.x) / 2;
    const y = Math.min(this.p1.y, this.p2.y) - (blocked ? 68 : 58);
    return new Phaser.Math.Vector2(x, y);
  }

  private playImpact(effect: ImpactEffectConfig, x: number, y: number, blocked: boolean): void {
    if (effect.label === "格擋") {
      this.sfx.play("block");
    } else if (effect.label === "爆氣") {
      this.sfx.play("burst");
    } else if (effect.label === "重擊" || effect.label === "破防") {
      this.sfx.play("hitHeavy");
    } else if (effect.label === "彈擊") {
      this.sfx.play("projectile");
    } else {
      this.sfx.play(effect.hitStopMs > 60 ? "hitMedium" : "hitLight");
    }
    this.hitStopMs = Math.max(this.hitStopMs, effect.hitStopMs);
    this.cameras.main.shake(effect.shakeMs, effect.shakeIntensity);
    this.flashScreen(effect.flashColor, blocked ? 0.08 : 0.13, 140);
    this.spawnImpact(x, y, effect);
  }

  private spawnImpact(x: number, y: number, effect: ImpactEffectConfig): void {
    const flash = this.add.star(x, y, 9, 8, 34, effect.color, 0.86).setDepth(24);
    const ring = this.add.ellipse(x, y, 54, 34, effect.color, 0).setStrokeStyle(3, effect.color, 0.75).setDepth(23);
    const text = this.add
      .text(x, y - 34, effect.label, {
        fontFamily: "Arial Black, Arial",
        fontSize: "14px",
        color: "#f8f3df",
        stroke: "#141821",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(25);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.55 * effect.ringScale,
      duration: 190,
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: effect.ringScale,
      scaleY: effect.ringScale * 0.72,
      duration: 240,
      onComplete: () => ring.destroy(),
    });
    this.tweens.add({
      targets: text,
      y: y - 52,
      alpha: 0,
      duration: 340,
      onComplete: () => text.destroy(),
    });
  }

  private showBanner(text: string, durationMs: number): void {
    this.roundBanner.setText(text);
    this.roundBanner.setAlpha(1);
    this.tweens.add({
      targets: this.roundBanner,
      alpha: 0,
      delay: Math.max(100, durationMs - 220),
      duration: 220,
    });
  }

  private flashScreen(color: number, alpha: number, durationMs: number): void {
    this.flashOverlay.setFillStyle(color, alpha);
    this.flashOverlay.setAlpha(alpha);
    this.tweens.killTweensOf(this.flashOverlay);
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: durationMs,
    });
  }

  private modeLabel(): string {
    if (this.matchConfig.mode === "arcade" && this.matchConfig.arcade) {
      return `街機 ${this.matchConfig.arcade.roundIndex + 1}/3`;
    }
    if (this.matchConfig.mode === "training") return "訓練模式";
    if (this.matchConfig.mode === "versus") return "本機雙人";
    return `對戰 AI ${this.difficultyLabel()}`;
  }

  private moveInfo(snapshot: FighterSnapshot): string {
    if (!snapshot.moveName) return "待機";
    const move = this.p1.character.moves[snapshot.moveName];
    return move ? `${move.label} ${move.damage}傷害` : snapshot.moveName;
  }

  private trainingPanel(snapshot: FighterSnapshot): string {
    const chain = "取消：輕擊 > 中擊 > 重擊 > 必殺";
    const combo = `連段：${snapshot.combo.hits}  目前傷害 ${snapshot.combo.damage}  最高 ${snapshot.combo.maxHits}`;
    return `${this.lastTrainingEvent}\n${combo}\n${chain}`;
  }

  private trainingModeLabel(): string {
    return trainingModes.find((mode) => mode.id === this.trainingConfig.dummyMode)?.label ?? "站立";
  }

  private difficultyLabel(): string {
    return {
      easy: "簡單",
      normal: "普通",
      hard: "困難",
    }[this.matchConfig.aiDifficulty];
  }

  private comboStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Arial Black, Arial",
      fontSize: "18px",
      color: "#ffdf5a",
      stroke: "#141821",
      strokeThickness: 4,
    };
  }
}
