import Phaser from "phaser";
import { PixelFighterRenderer } from "../render/PixelFighterRenderer";
import type { CharacterConfig, FighterState, MoveConfig } from "../types";

export class FighterView {
  readonly container: Phaser.GameObjects.Container;

  private readonly character: CharacterConfig;
  private readonly renderer: PixelFighterRenderer;

  constructor(scene: Phaser.Scene, character: CharacterConfig, x: number, y: number, facing: 1 | -1) {
    this.character = character;
    this.renderer = new PixelFighterRenderer(scene, character, x, y, facing);
    this.container = this.renderer.container;
  }

  setFacing(facing: 1 | -1): void {
    this.container.setScale(facing, 1);
  }

  hurtbox(): Phaser.Geom.Rectangle {
    const { width, height } = this.character.body;
    return new Phaser.Geom.Rectangle(
      this.container.x - width / 2,
      this.container.y - height,
      width,
      height,
    );
  }

  render(state: FighterState, move: MoveConfig | undefined, isMoveActive: boolean, burstActive: boolean, grounded: boolean): void {
    this.renderer.render(state, move, isMoveActive, burstActive, grounded);
  }
}
