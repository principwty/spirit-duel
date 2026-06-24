import Phaser from "phaser";
import { stages } from "../data/stages";
import { createBackdrop } from "./MenuScene";

export class HelpScene extends Phaser.Scene {
  constructor() {
    super("HelpScene");
  }

  create(): void {
    createBackdrop(this, stages[0]);
    this.add
      .text(480, 60, "操作說明", {
        fontFamily: "Arial Black, Arial",
        fontSize: "42px",
        color: "#f8f3df",
        stroke: "#141821",
        strokeThickness: 7,
      })
      .setOrigin(0.5);

    this.addPanel(250, 235, "玩家 1", [
      "移動：WASD",
      "輕 / 中 / 重：J / K / L",
      "必殺：U    爆氣：O",
      "格擋：I    衝刺：S + A/D",
    ]);
    this.addPanel(710, 235, "玩家 2", [
      "移動：方向鍵",
      "輕 / 中 / 重：1 / 2 / 3",
      "必殺：4    爆氣：6",
      "格擋：5    衝刺：下 + 左/右",
    ]);
    this.addPanel(480, 388, "戰鬥提示", [
      "基本連段：輕擊 → 中擊 → 重擊 → 必殺",
      "連續格擋會累積防禦壓力，壓力滿會破防。",
      "訓練模式：R 重置，T 切換假人行為。",
      "H 可顯示判定框，Esc 返回主選單。",
    ], 760, 118, 14);

    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MenuScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("MenuScene"));
  }

  private addPanel(x: number, y: number, title: string, lines: string[], width = 360, height = 190, bodySize = 16): void {
    const panel = this.add.rectangle(x, y, width, height, 0x202735, 0.96).setStrokeStyle(3, 0x88f2d0);
    this.add
      .text(x, y - height / 2 + 28, title, {
        fontFamily: "Arial Black, Arial",
        fontSize: "22px",
        color: "#f7c873",
      })
      .setOrigin(0.5);
    this.add
      .text(x - width / 2 + 30, y - height / 2 + 64, lines.join("\n"), {
        fontFamily: "Arial Black, Arial",
        fontSize: `${bodySize}px`,
        color: "#f8f3df",
        lineSpacing: 6,
      })
      .setOrigin(0, 0);
  }
}
