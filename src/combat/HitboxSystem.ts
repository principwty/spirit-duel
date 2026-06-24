import Phaser from "phaser";
import { Fighter } from "./Fighter";
import type { MoveConfig } from "../types";

export interface HitResult {
  accepted: boolean;
  blocked: boolean;
  guardBroken: boolean;
  move: MoveConfig;
}

export class HitboxSystem {
  private readonly debugGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.debugGraphics = scene.add.graphics();
    this.debugGraphics.setDepth(20);
  }

  resolve(attacker: Fighter, defender: Fighter): HitResult | undefined {
    const hitbox = attacker.activeHitbox();
    if (!hitbox) {
      return undefined;
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox.rect, defender.hurtbox())) {
      const blocked = defender.wouldBlock(attacker);
      const accepted = defender.receiveHit(hitbox.move, attacker);
      if (accepted) {
        attacker.markAttackHit();
      }
      return { accepted, blocked, guardBroken: defender.lastGuardBroken, move: hitbox.move };
    }
    return undefined;
  }

  drawDebug(fighters: Fighter[], enabled: boolean): void {
    this.debugGraphics.clear();
    if (!enabled) return;

    for (const fighter of fighters) {
      this.debugGraphics.lineStyle(1, 0x8fffd2, 0.9);
      this.debugGraphics.strokeRectShape(fighter.hurtbox());
      const hitbox = fighter.activeHitbox();
      if (hitbox) {
        this.debugGraphics.lineStyle(2, 0xffe66d, 0.95);
        this.debugGraphics.strokeRectShape(hitbox.rect);
      }
    }
  }
}
