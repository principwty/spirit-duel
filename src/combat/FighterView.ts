import Phaser from "phaser";
import type { CharacterConfig, FighterState, MoveConfig, PoseFrame, PoseKey } from "../types";

export class FighterView {
  readonly container: Phaser.GameObjects.Container;

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly torso: Phaser.GameObjects.Rectangle;
  private readonly head: Phaser.GameObjects.Rectangle;
  private readonly arm: Phaser.GameObjects.Rectangle;
  private readonly weapon: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse;
  private readonly effect: Phaser.GameObjects.Rectangle;
  private readonly effectRing: Phaser.GameObjects.Ellipse;
  private readonly burstAura: Phaser.GameObjects.Ellipse;
  private readonly character: CharacterConfig;
  private readonly scene: Phaser.Scene;
  private lastTrailAt = 0;

  constructor(scene: Phaser.Scene, character: CharacterConfig, x: number, y: number, facing: 1 | -1) {
    this.scene = scene;
    this.character = character;
    this.shadow = scene.add.ellipse(0, 0, 76, 16, 0x06080d, 0.36);
    this.bodyRect = scene.add.rectangle(0, -character.body.height / 2, character.body.width, character.body.height, 0xffffff, 0);
    this.burstAura = scene.add.ellipse(0, -52, 92, 124, character.palette.accent, 0);
    this.torso = scene.add.rectangle(0, -48, character.body.width - 8, character.body.height - 38, character.palette.primary);
    this.head = scene.add.rectangle(0, -character.body.height + 4, character.body.width - 12, 28, character.palette.secondary);
    this.arm = scene.add.rectangle(22, -52, 14, 42, character.palette.shadow);
    this.weapon = this.createWeapon(scene, character);
    this.effect = scene.add.rectangle(72, -62, 108, 30, character.palette.accent, 0);
    this.effectRing = scene.add.ellipse(70, -62, 70, 34, character.palette.accent, 0);
    this.container = scene.add.container(x, y, [
      this.shadow,
      this.burstAura,
      this.bodyRect,
      this.torso,
      this.head,
      this.arm,
      this.weapon,
      this.effect,
      this.effectRing,
    ]);
    this.container.setScale(facing, 1);
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
    const pulse = 1 + Math.sin(this.scene.time.now / 105) * 0.06;
    const flash = state === "hit" && Math.floor(this.scene.time.now / 55) % 2 === 0;
    const hitTint = flash ? 0xffffff : this.character.palette.primary;
    const attacking = Boolean(move && isMoveActive);
    const pose = this.currentPose(state, move);
    const crouch = pose.crouch ?? 0;
    const bob = this.poseBob(state, grounded);

    this.torso.setFillStyle(hitTint);
    this.head.setFillStyle(flash ? 0xffffff : this.character.palette.secondary);
    this.head.x = pose.headX ?? 0;
    this.head.y = -this.character.body.height + 4 + (pose.headY ?? 0) + bob + crouch;
    this.torso.x = pose.torsoX ?? 0;
    this.torso.y = -48 + (pose.torsoY ?? 0) + bob + crouch;
    this.torso.angle = pose.torsoAngle ?? 0;
    this.torso.width = state === "block" ? this.character.body.width : this.character.body.width - 8;
    this.torso.height = Math.max(24, this.character.body.height - 38 - crouch);
    this.arm.x = pose.armX ?? (attacking ? 40 : 22);
    this.arm.y = (pose.armY ?? -52) + bob + crouch;
    this.arm.angle = pose.armAngle ?? (attacking ? -70 : state === "block" ? -18 : 0);
    this.effect.x = pose.effectX ?? (move?.effectKey === "quake" ? 76 : 72);
    this.effect.y = (pose.effectY ?? -62) + bob;
    this.effect.angle = pose.effectAngle ?? (move?.effectKey === "quake" ? 0 : -8);
    this.effect.alpha = attacking ? this.effectAlpha(move) : state === "burst" ? 0.52 : 0;
    this.effect.width = (move?.effectKey === "burst" ? 190 * pulse : move?.effectKey === "quake" ? 152 : 104) * (pose.effectScale ?? 1);
    this.effect.height = move?.effectKey === "spark" || move?.effectKey === "pulse" ? 48 : 30;
    this.effect.setFillStyle(this.character.palette.accent);
    this.effectRing.setPosition(this.effect.x, this.effect.y);
    this.effectRing.setScale((pose.effectScale ?? 1) * pulse, 1 / pulse);
    this.effectRing.alpha = move?.effectKey === "pulse" && attacking ? 0.34 : state === "burst" ? 0.4 : 0;
    this.effectRing.setFillStyle(this.character.palette.accent);
    this.burstAura.alpha = burstActive || state === "burst" ? 0.18 + Math.sin(this.scene.time.now / 90) * 0.06 : 0;
    this.burstAura.scaleX = pulse;
    this.burstAura.scaleY = 1 / pulse;
    this.shadow.scaleX = grounded ? 1 : 0.72;
    this.weapon.alpha = state === "down" ? 0.35 : 1;
    this.positionWeapon(attacking, move, pose, bob + crouch);
    this.maybeSpawnTrail(state, attacking, burstActive);
  }

  private createWeapon(scene: Phaser.Scene, character: CharacterConfig): Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse {
    if (character.body.weapon === "orb") {
      return scene.add.ellipse(46, -58, 28, 28, character.palette.accent);
    }
    const dimensions = {
      blade: [10, 76],
      staff: [10, 92],
      hammer: [28, 78],
    }[character.body.weapon] ?? [10, 76];
    return scene.add.rectangle(42, -58, dimensions[0], dimensions[1], character.palette.accent);
  }

  private positionWeapon(attacking: boolean, move: MoveConfig | undefined, pose: PoseFrame, offsetY: number): void {
    this.weapon.x = pose.weaponX ?? (attacking ? 76 : 42);
    this.weapon.y = (pose.weaponY ?? (move?.effectKey === "quake" && attacking ? -70 : -58)) + offsetY;
    this.weapon.angle = pose.weaponAngle ?? (attacking ? (move?.effectKey === "quake" ? 72 : -18) : 0);
  }

  private effectAlpha(move: MoveConfig | undefined): number {
    if (!move) return 0;
    if (move.effectKey === "burst") return 0.72;
    if (move.effectKey === "pulse") return 0.58;
    if (move.effectKey === "quake") return 0.52;
    return 0.4;
  }

  private currentPose(state: FighterState, move: MoveConfig | undefined): PoseFrame {
    const key = this.poseKey(state, move);
    const frames = this.character.animation.poses[key] ?? this.character.animation.poses.idle;
    const total = frames.reduce((sum, frame) => sum + frame.durationMs, 0);
    let cursor = this.scene.time.now % Math.max(1, total);
    for (const frame of frames) {
      cursor -= frame.durationMs;
      if (cursor <= 0) return frame;
    }
    return frames[0];
  }

  private poseKey(state: FighterState, move: MoveConfig | undefined): PoseKey {
    if (state === "attack" && move?.name && this.character.animation.poses[move.name as PoseKey]) {
      return move.name as PoseKey;
    }
    if (state === "attack") return "idle";
    if (state === "burst") return "burst";
    return state;
  }

  private poseBob(state: FighterState, grounded: boolean): number {
    if (!grounded) return -4;
    if (state === "idle" || state === "block") {
      return Math.sin(this.scene.time.now / 180) * this.character.animation.idleBob;
    }
    if (state === "run" || state === "dash") {
      return Math.sin(this.scene.time.now / 62) * this.character.animation.runBob;
    }
    return 0;
  }

  private maybeSpawnTrail(state: FighterState, attacking: boolean, burstActive: boolean): void {
    if (!attacking && state !== "dash" && !burstActive) return;
    if (this.scene.time.now - this.lastTrailAt < 70) return;
    this.lastTrailAt = this.scene.time.now;

    const alpha = attacking ? 0.28 : 0.16;
    const trail = this.scene.add.rectangle(
      this.container.x - this.container.scaleX * 18,
      this.container.y - this.character.body.height / 2,
      this.character.body.width,
      this.character.body.height,
      attacking ? this.character.animation.weaponTrailColor : this.character.animation.afterimageColor,
      alpha,
    );
    trail.setDepth(4);
    trail.setScale(this.container.scaleX, 1);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      x: trail.x - this.container.scaleX * 24,
      duration: attacking ? 180 : 230,
      onComplete: () => trail.destroy(),
    });
  }
}
