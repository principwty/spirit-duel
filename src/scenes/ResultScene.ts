import Phaser from "phaser";
import type { MatchConfig, MatchResult } from "../types";
import { getStage } from "../data/stages";
import { createBackdrop } from "./MenuScene";
import { SoundManager } from "../audio/SoundManager";

export class ResultScene extends Phaser.Scene {
  private result: MatchResult = {
    winner: "平手",
    mode: "ai",
    p1Character: "kai",
    p2Character: "mira",
    stageId: "moon-rail",
    aiDifficulty: "normal",
    p1Health: 0,
    p2Health: 0,
    p1MaxCombo: 0,
    p2MaxCombo: 0,
    arcade: undefined,
    training: undefined,
  };

  constructor() {
    super("ResultScene");
  }

  init(data: MatchResult): void {
    this.result = { ...this.result, ...data };
  }

  create(): void {
    createBackdrop(this, getStage(this.result.stageId));
    const sfx = new SoundManager(this);
    sfx.play(this.result.arcade?.cleared ? "win" : "uiConfirm");
    this.add
      .text(480, 122, this.titleText(), {
        fontFamily: "Arial Black, Arial",
        fontSize: "54px",
        color: "#f7c873",
        stroke: "#141821",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 202, this.result.winner, {
        fontFamily: "Arial Black, Arial",
        fontSize: "42px",
        color: "#f8f3df",
      })
      .setOrigin(0.5);
    this.add
      .text(
        480,
        266,
        `P1 體力 ${this.result.p1Health}  最高連擊 ${this.result.p1MaxCombo}     P2 體力 ${this.result.p2Health}  最高連擊 ${this.result.p2MaxCombo}`,
        {
          fontFamily: "Arial Black, Arial",
          fontSize: "16px",
          color: "#88f2d0",
        },
      )
      .setOrigin(0.5);
    if (this.result.arcade?.cleared) {
      const clearText = this.add
        .text(480, 306, "ARCADE CLEAR", {
          fontFamily: "Arial Black, Arial",
          fontSize: "24px",
          color: "#ffdf5a",
          stroke: "#141821",
          strokeThickness: 5,
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: clearText,
        scale: 1.08,
        duration: 520,
        yoyo: true,
        repeat: -1,
      });
    }

    this.makeButton(480, this.result.arcade?.cleared ? 362 : 340, this.result.arcade?.cleared ? "再玩一次" : "重新對戰", () => {
      this.scene.start("CombatScene", this.matchConfig());
    });
    this.makeButton(480, this.result.arcade?.cleared ? 426 : 410, "返回選角", () => {
      this.scene.start("SelectScene", { mode: this.result.mode });
    });

    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("CombatScene", this.matchConfig()));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("SelectScene", { mode: this.result.mode }));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MenuScene"));
  }

  private matchConfig(): MatchConfig {
    if (this.result.mode === "arcade" && this.result.arcade) {
      return {
        mode: "arcade",
        p1Character: this.result.p1Character,
        p2Character: this.result.p2Character,
        stageId: this.result.stageId,
        aiDifficulty: this.result.aiDifficulty,
        arcade: {
          playerCharacter: this.result.arcade.playerCharacter,
          roundIndex: this.result.arcade.cleared ? 0 : this.result.arcade.roundIndex,
          wins: this.result.arcade.cleared ? 0 : this.result.arcade.wins,
        },
      };
    }
    return {
      mode: this.result.mode,
      p1Character: this.result.p1Character,
      p2Character: this.result.p2Character,
      stageId: this.result.stageId,
      aiDifficulty: this.result.aiDifficulty,
      training: this.result.training,
    };
  }

  private titleText(): string {
    if (this.result.arcade?.cleared) return "街機通關";
    return this.result.winner === "平手" ? "平手" : "勝利者";
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const panel = this.add.rectangle(0, 0, 250, 48, 0x202735, 0.95).setStrokeStyle(3, 0x88f2d0);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: "Arial Black, Arial",
        fontSize: "19px",
        color: "#f8f3df",
      })
      .setOrigin(0.5);
    const button = this.add.container(x, y, [panel, text]);
    button.setSize(250, 48).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => panel.setFillStyle(0x2d3b50));
    button.on("pointerout", () => panel.setFillStyle(0x202735));
    button.on("pointerup", onClick);
  }
}
