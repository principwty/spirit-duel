import Phaser from "phaser";
import { assetManifest } from "../data/assets";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    this.add.rectangle(480, 270, 960, 540, 0x11151c);
    this.add
      .text(480, 232, "靈鬥之刃", {
        fontFamily: "Arial Black, Arial",
        fontSize: "42px",
        color: "#f8f3df",
      })
      .setOrigin(0.5);
    this.add
      .text(480, 286, assetManifest.generatedFallback ? "生成素材管線就緒" : "素材載入完成", {
        fontFamily: "Arial Black, Arial",
        fontSize: "14px",
        color: "#88f2d0",
      })
      .setOrigin(0.5);

    this.time.delayedCall(250, () => this.scene.start("MenuScene"));
  }
}
