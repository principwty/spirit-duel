import Phaser from "phaser";
import { SoundManager } from "../audio/SoundManager";
import { stages } from "../data/stages";
import type { StageConfig } from "../types";

export class MenuScene extends Phaser.Scene {
  private sfx!: SoundManager;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.sfx = new SoundManager(this);
    createBackdrop(this, stages[0]);
    this.add
      .text(480, 96, "靈鬥之刃", {
        fontFamily: "Arial Black, Arial",
        fontSize: "62px",
        color: "#f8f3df",
        stroke: "#141821",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 150, "正式試玩版", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#88f2d0",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const arcade = this.makeButton(480, 218, "街機模式", () => this.goSelect("arcade"));
    this.makeButton(480, 272, "訓練模式", () => this.goSelect("training"));
    this.makeButton(480, 326, "對戰 AI", () => this.goSelect("ai"));
    this.makeButton(480, 380, "本機雙人", () => this.goSelect("versus"));
    this.makeButton(480, 434, "操作說明", () => this.goHelp());

    this.input.keyboard?.once("keydown-ENTER", () => arcade.emit("pointerup"));
    this.input.keyboard?.once("keydown-A", () => this.goSelect("arcade"));
    this.input.keyboard?.once("keydown-T", () => this.goSelect("training"));
    this.input.keyboard?.once("keydown-V", () => this.goSelect("ai"));
    this.input.keyboard?.once("keydown-L", () => this.goSelect("versus"));
    this.input.keyboard?.once("keydown-C", () => this.goHelp());
  }

  private goSelect(mode: "arcade" | "training" | "ai" | "versus"): void {
    this.sfx.play("uiConfirm");
    this.cameras.main.fadeOut(180, 17, 21, 28);
    this.time.delayedCall(180, () => this.scene.start("SelectScene", { mode }));
  }

  private goHelp(): void {
    this.sfx.play("uiConfirm");
    this.cameras.main.fadeOut(180, 17, 21, 28);
    this.time.delayedCall(180, () => this.scene.start("HelpScene"));
  }

  private makeButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const panel = this.add.rectangle(0, 0, 280, 42, 0x202735, 0.95).setStrokeStyle(3, 0xf7c873);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: "Arial Black, Arial",
        fontSize: "19px",
        color: "#f8f3df",
      })
      .setOrigin(0.5);
    const button = this.add.container(x, y, [panel, text]);
    button.setSize(280, 46).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => panel.setFillStyle(0x2d3b50));
    button.on("pointerout", () => panel.setFillStyle(0x202735));
    button.on("pointerup", onClick);
    return button;
  }
}

export function createBackdrop(scene: Phaser.Scene, stage: StageConfig): void {
  scene.add.rectangle(480, 270, 960, 540, stage.palette.sky);
  scene.add.rectangle(480, 190, 960, 240, stage.palette.far, 0.55);
  scene.add.rectangle(480, 410, 960, 148, stage.palette.mid);
  scene.add.rectangle(480, 438, 960, 20, stage.palette.ground);

  for (const layer of stage.layers) {
    if (layer.kind === "lights") {
      for (let i = 0; i < layer.count; i += 1) {
        const x = 50 + i * (860 / Math.max(1, layer.count - 1));
        const beam = scene.add.rectangle(x, layer.y, 8, 170, layer.color, layer.alpha).setAngle(i % 2 === 0 ? -10 : 10);
        scene.tweens.add({
          targets: beam,
          alpha: layer.alpha * 0.45,
          duration: 900 + i * 70,
          yoyo: true,
          repeat: -1,
        });
      }
    }
    if (layer.kind === "embers") {
      for (let i = 0; i < layer.count; i += 1) {
        const ember = scene.add.rectangle(40 + i * (880 / layer.count), layer.y + (i % 5) * 18, 5, 5, layer.color, layer.alpha);
        scene.tweens.add({
          targets: ember,
          y: ember.y - 42,
          x: ember.x + (i % 2 === 0 ? 12 : -12),
          alpha: 0,
          duration: 1300 + i * 28,
          repeat: -1,
          delay: i * 35,
        });
      }
    }
    if (layer.kind === "rails") {
      for (let i = 0; i < layer.count; i += 1) {
        scene.add.rectangle(i * 24, layer.y, 14, 5, layer.color, layer.alpha);
      }
    }
  }

  for (let i = 0; i < stage.columns; i += 1) {
    const x = i * (960 / stage.columns);
    const color = i % 2 === 0 ? stage.palette.far : stage.palette.mid;
    const columnHeight = 100 + (i % 4) * 16;
    scene.add.rectangle(x, 348, 24, columnHeight, color, 0.76).setOrigin(0, 1);
  }
  for (let i = 0; i < 48; i += 1) {
    scene.add.rectangle(i * 22, 452, 12, 5, stage.palette.trim, 0.48);
  }
  scene.add.rectangle(480, stage.groundY + 8, 860, 12, stage.palette.light, 0.18);
  scene.add.rectangle(480, stage.groundY + 34, 960, 58, 0x07090e, 0.28);
}
