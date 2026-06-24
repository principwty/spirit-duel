import Phaser from "phaser";
import "./style.css";
import { CombatScene } from "./scenes/CombatScene";
import { HelpScene } from "./scenes/HelpScene";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { ResultScene } from "./scenes/ResultScene";
import { SelectScene } from "./scenes/SelectScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 960,
  height: 540,
  backgroundColor: "#11151c",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, MenuScene, HelpScene, SelectScene, CombatScene, ResultScene],
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  Object.assign(globalThis, { __SPIRIT_DUEL_GAME__: game });
}
