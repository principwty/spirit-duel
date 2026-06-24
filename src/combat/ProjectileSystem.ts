import Phaser from "phaser";
import { Fighter } from "./Fighter";
import type { ActiveHitbox, FighterId, MoveConfig, ProjectileConfig } from "../types";

interface Projectile {
  ownerId: FighterId;
  move: MoveConfig;
  config: ProjectileConfig;
  rect: Phaser.GameObjects.Rectangle;
  vx: number;
  lifeMs: number;
  consumed: boolean;
}

export interface ProjectileImpact {
  move: MoveConfig;
  blocked: boolean;
  guardBroken: boolean;
  x: number;
  y: number;
}

export class ProjectileSystem {
  private readonly projectiles: Projectile[] = [];
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, private readonly onImpact?: (impact: ProjectileImpact) => void) {
    this.scene = scene;
  }

  spawn(owner: Fighter, move: MoveConfig): void {
    if (!move.projectile) return;
    const config = move.projectile;
    const x = owner.facing === 1 ? owner.x + 82 : owner.x - 82;
    const y = owner.y - 62;
    const rect = this.scene.add.rectangle(x, y, config.width, config.height, config.color, 0.95);
    rect.setDepth(12);
    this.projectiles.push({
      ownerId: owner.id,
      move,
      config,
      rect,
      vx: config.speed * owner.facing,
      lifeMs: config.lifetimeMs,
      consumed: false,
    });
  }

  update(deltaMs: number, fighters: Fighter[]): void {
    for (const projectile of this.projectiles) {
      projectile.lifeMs -= deltaMs;
      projectile.rect.x += projectile.vx * (deltaMs / 1000);
      projectile.rect.alpha = 0.75 + Math.sin(this.scene.time.now / 70) * 0.18;

      for (const fighter of fighters) {
        if (fighter.id === projectile.ownerId || fighter.isDefeated || projectile.consumed) continue;
        const active: ActiveHitbox = {
          ownerId: projectile.ownerId,
          move: projectile.move,
          rect: projectile.rect.getBounds(),
        };
        if (Phaser.Geom.Intersects.RectangleToRectangle(active.rect, fighter.hurtbox())) {
          const attacker = fighters.find((candidate) => candidate.id === projectile.ownerId);
          const blocked = attacker ? fighter.wouldBlock(attacker) : false;
          if (attacker && fighter.receiveHit(projectile.move, attacker)) {
            attacker.markAttackHit();
            this.onImpact?.({
              move: projectile.move,
              blocked,
              guardBroken: fighter.lastGuardBroken,
              x: projectile.rect.x,
              y: projectile.rect.y,
            });
            projectile.consumed = !projectile.config.pierce;
          }
        }
      }
    }

    this.clearExpired();
  }

  clear(): void {
    for (const projectile of this.projectiles) {
      projectile.rect.destroy();
    }
    this.projectiles.length = 0;
  }

  private clearExpired(): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index];
      if (projectile.lifeMs <= 0 || projectile.consumed || projectile.rect.x < -80 || projectile.rect.x > 1040) {
        projectile.rect.destroy();
        this.projectiles.splice(index, 1);
      }
    }
  }
}
