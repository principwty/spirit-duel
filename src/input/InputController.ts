import Phaser from "phaser";
import type { InputState } from "../types";

const emptyInput: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  block: false,
  light: false,
  medium: false,
  heavy: false,
  special: false,
  burst: false,
};

export function createEmptyInput(): InputState {
  return { ...emptyInput };
}

export class KeyboardController {
  private keys: Record<keyof InputState, Phaser.Input.Keyboard.Key[]>;

  constructor(
    scene: Phaser.Scene,
    mapping: Record<keyof InputState, number | number[]>,
  ) {
    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.keys = Object.fromEntries(
      Object.entries(mapping).map(([action, keyCodes]) => [
        action,
        (Array.isArray(keyCodes) ? keyCodes : [keyCodes]).map((keyCode) =>
          scene.input.keyboard!.addKey(keyCode),
        ),
      ]),
    ) as Record<keyof InputState, Phaser.Input.Keyboard.Key[]>;
  }

  read(): InputState {
    return {
      left: this.isDown("left"),
      right: this.isDown("right"),
      up: this.justDown("up"),
      down: this.isDown("down"),
      block: this.isDown("block"),
      light: this.justDown("light"),
      medium: this.justDown("medium"),
      heavy: this.justDown("heavy"),
      special: this.justDown("special"),
      burst: this.justDown("burst"),
    };
  }

  private isDown(action: keyof InputState): boolean {
    return this.keys[action].some((key) => key.isDown);
  }

  private justDown(action: keyof InputState): boolean {
    return this.keys[action].some((key) => Phaser.Input.Keyboard.JustDown(key));
  }
}
