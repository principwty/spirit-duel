import Phaser from "phaser";
import type { DebugCombatState } from "../types";

export class DebugOverlay {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.panel = scene.add.rectangle(754, 168, 370, 208, 0x071019, 0.78).setDepth(40);
    this.panel.setStrokeStyle(2, 0x88f2d0, 0.72);
    this.text = scene.add
      .text(586, 72, "", {
        fontFamily: "Arial Black, Arial",
        fontSize: "11px",
        color: "#dffcf2",
        stroke: "#071019",
        strokeThickness: 2,
        lineSpacing: 3,
      })
      .setDepth(41);
    this.setVisible(false);
  }

  render(state: DebugCombatState): void {
    this.setVisible(state.debugOverlay);
    if (!state.debugOverlay) return;

    this.text.setText([
      `DEV 調校  slow x${state.frameStep.slowMotionScale.toFixed(2)}  ${state.frameStep.paused ? "PAUSE" : "RUN"}`,
      `round ${Math.ceil(state.roundMs / 1000)}s  hitstop ${Math.round(state.hitStopMs)}ms  hitbox ${state.showHitboxes ? "ON" : "OFF"}`,
      this.fighterLine("P1", state.p1),
      this.fighterLine("P2", state.p2),
      "按鍵：F overlay  H hitbox  P 暫停  N 單幀  M 慢速",
    ].join("\n"));
  }

  destroy(): void {
    this.panel.destroy();
    this.text.destroy();
  }

  private setVisible(visible: boolean): void {
    this.panel.setVisible(visible);
    this.text.setVisible(visible);
  }

  private fighterLine(label: string, fighter: DebugCombatState["p1"]): string {
    const move = fighter.moveLabel ? `${fighter.moveLabel}/${fighter.movePhase}` : "無招式";
    return `${label} ${fighter.state} ${move} rem ${fighter.moveRemainingMs} hp ${fighter.health} en ${fighter.energy} gp ${fighter.guardPressure} b ${fighter.burstMs} xy ${fighter.x},${fighter.y} v ${fighter.vx},${fighter.vy}`;
  }
}
