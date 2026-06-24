import type { FighterState } from "../types";

const lockedStates = new Set<FighterState>(["attack", "hit", "down", "dash", "burst", "victory"]);

export class FighterStateMachine {
  state: FighterState = "idle";
  timerMs = 0;

  set(state: FighterState, timerMs = 0): void {
    this.state = state;
    this.timerMs = timerMs;
  }

  tick(deltaMs: number): void {
    if (this.timerMs > 0) {
      this.timerMs = Math.max(0, this.timerMs - deltaMs);
    }
  }

  get locked(): boolean {
    return lockedStates.has(this.state);
  }

  get expired(): boolean {
    return this.timerMs <= 0;
  }
}
