import Phaser from "phaser";
import type { InputState } from "../types";

export const playerOneKeys: Record<keyof InputState, number | number[]> = {
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
  up: Phaser.Input.Keyboard.KeyCodes.W,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  block: Phaser.Input.Keyboard.KeyCodes.I,
  light: Phaser.Input.Keyboard.KeyCodes.J,
  medium: Phaser.Input.Keyboard.KeyCodes.K,
  heavy: Phaser.Input.Keyboard.KeyCodes.L,
  special: Phaser.Input.Keyboard.KeyCodes.U,
  burst: Phaser.Input.Keyboard.KeyCodes.O,
};

export const playerTwoKeys: Record<keyof InputState, number | number[]> = {
  left: Phaser.Input.Keyboard.KeyCodes.LEFT,
  right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  up: Phaser.Input.Keyboard.KeyCodes.UP,
  down: Phaser.Input.Keyboard.KeyCodes.DOWN,
  block: [Phaser.Input.Keyboard.KeyCodes.FIVE, Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE],
  light: [Phaser.Input.Keyboard.KeyCodes.ONE, Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE],
  medium: [Phaser.Input.Keyboard.KeyCodes.TWO, Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO],
  heavy: [Phaser.Input.Keyboard.KeyCodes.THREE, Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE],
  special: [Phaser.Input.Keyboard.KeyCodes.FOUR, Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR],
  burst: [Phaser.Input.Keyboard.KeyCodes.SIX, Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX],
};
