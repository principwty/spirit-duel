import Phaser from "phaser";
import type { CharacterConfig, FighterState, MoveConfig, PaletteRole, PixelPartAnchor, PixelPartConfig, PoseFrame, PoseKey } from "../types";

interface RenderPart {
  anchor: PixelPartAnchor;
  baseX: number;
  baseY: number;
  object: Phaser.GameObjects.Shape;
}

export class PixelFighterRenderer {
  readonly container: Phaser.GameObjects.Container;

  private readonly scene: Phaser.Scene;
  private readonly character: CharacterConfig;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly burstAura: Phaser.GameObjects.Ellipse;
  private readonly torsoOutline: Phaser.GameObjects.Rectangle;
  private readonly torso: Phaser.GameObjects.Rectangle;
  private readonly torsoShade: Phaser.GameObjects.Rectangle;
  private readonly headOutline: Phaser.GameObjects.Rectangle;
  private readonly head: Phaser.GameObjects.Rectangle;
  private readonly armOutline: Phaser.GameObjects.Rectangle;
  private readonly arm: Phaser.GameObjects.Rectangle;
  private readonly weaponParts: Phaser.GameObjects.Shape[];
  private readonly effectMain: Phaser.GameObjects.Shape;
  private readonly effectAlt: Phaser.GameObjects.Rectangle;
  private readonly costumeParts: RenderPart[];
  private lastTrailAt = 0;

  constructor(scene: Phaser.Scene, character: CharacterConfig, x: number, y: number, facing: 1 | -1) {
    this.scene = scene;
    this.character = character;
    const ramp = character.art.paletteRamp;
    this.shadow = scene.add.ellipse(0, 0, 78, 16, 0x06080d, 0.38);
    this.burstAura = scene.add.ellipse(0, -52, 96, 132, ramp.accent, 0);
    this.torsoOutline = scene.add.rectangle(0, -48, character.body.width + 2, character.body.height - 34, ramp.outline);
    this.torso = scene.add.rectangle(0, -48, character.body.width - 8, character.body.height - 38, ramp.primary);
    this.torsoShade = scene.add.rectangle(-9, -42, Math.max(8, character.body.width / 3), character.body.height - 48, ramp.shadow, 0.38);
    this.headOutline = scene.add.rectangle(0, -character.body.height + 4, character.body.width - 8, 32, ramp.outline);
    this.head = scene.add.rectangle(0, -character.body.height + 4, character.body.width - 12, 28, ramp.secondary);
    this.armOutline = scene.add.rectangle(22, -52, 18, 46, ramp.outline);
    this.arm = scene.add.rectangle(22, -52, 14, 42, ramp.shadow);
    this.weaponParts = this.createWeaponParts();
    this.effectMain = scene.add.rectangle(72, -62, 108, 30, ramp.accent, 0);
    this.effectAlt = scene.add.rectangle(72, -62, 58, 12, ramp.highlight, 0);
    this.costumeParts = character.art.costumeParts.map((part) => this.createCostumePart(part));

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.burstAura,
      this.torsoOutline,
      this.torso,
      this.torsoShade,
      this.headOutline,
      this.head,
      ...this.costumeParts.map((part) => part.object),
      this.armOutline,
      this.arm,
      ...this.weaponParts,
      this.effectMain,
      this.effectAlt,
    ]);
    this.container.setScale(facing, 1);
  }

  render(state: FighterState, move: MoveConfig | undefined, isMoveActive: boolean, burstActive: boolean, grounded: boolean): void {
    const pulse = 1 + Math.sin(this.scene.time.now / 105) * 0.06;
    const flash = state === "hit" && Math.floor(this.scene.time.now / 55) % 2 === 0;
    const attacking = Boolean(move && isMoveActive);
    const pose = this.currentPose(state, move);
    const crouch = pose.crouch ?? 0;
    const bob = this.poseBob(state, grounded);
    const ramp = this.character.art.paletteRamp;

    this.torso.setFillStyle(flash ? ramp.highlight : ramp.primary);
    this.head.setFillStyle(flash ? ramp.highlight : ramp.secondary);
    this.torsoOutline.setPosition(pose.torsoX ?? 0, -48 + (pose.torsoY ?? 0) + bob + crouch);
    this.torsoOutline.setAngle(pose.torsoAngle ?? 0);
    this.torso.setPosition(pose.torsoX ?? 0, -48 + (pose.torsoY ?? 0) + bob + crouch);
    this.torso.setAngle(pose.torsoAngle ?? 0);
    this.torso.width = state === "block" ? this.character.body.width : this.character.body.width - 8;
    this.torso.height = Math.max(24, this.character.body.height - 38 - crouch);
    this.torsoShade.setPosition((pose.torsoX ?? 0) - 8, -42 + (pose.torsoY ?? 0) + bob + crouch);
    this.torsoShade.setAngle((pose.torsoAngle ?? 0) - 1);
    this.headOutline.setPosition(pose.headX ?? 0, -this.character.body.height + 4 + (pose.headY ?? 0) + bob + crouch);
    this.head.setPosition(pose.headX ?? 0, -this.character.body.height + 4 + (pose.headY ?? 0) + bob + crouch);
    this.armOutline.setPosition(pose.armX ?? (attacking ? 40 : 22), (pose.armY ?? -52) + bob + crouch);
    this.armOutline.setAngle(pose.armAngle ?? (attacking ? -70 : state === "block" ? -18 : 0));
    this.arm.setPosition(pose.armX ?? (attacking ? 40 : 22), (pose.armY ?? -52) + bob + crouch);
    this.arm.setAngle(pose.armAngle ?? (attacking ? -70 : state === "block" ? -18 : 0));
    this.updateCostumeParts(pose, bob + crouch);
    this.positionWeapon(attacking, move, pose, bob + crouch);
    this.renderEffect(state, move, attacking, pose, pulse, bob);
    this.burstAura.alpha = burstActive || state === "burst" ? 0.2 + Math.sin(this.scene.time.now / 90) * 0.07 : 0;
    this.burstAura.scaleX = pulse;
    this.burstAura.scaleY = 1 / pulse;
    this.shadow.scaleX = grounded ? 1 : 0.72;
    this.weaponParts.forEach((part) => part.setAlpha(state === "down" ? 0.35 : 1));
    this.maybeSpawnTrail(state, attacking, burstActive);
  }

  private createCostumePart(part: PixelPartConfig): RenderPart {
    const color = this.color(part.color);
    const alpha = part.alpha ?? 1;
    const object =
      part.shape === "ellipse"
        ? this.scene.add.ellipse(part.x, part.y, part.width, part.height, color, alpha)
        : part.shape === "triangle"
          ? this.scene.add.triangle(part.x, part.y, 0, part.height, part.width / 2, 0, part.width, part.height, color, alpha)
          : this.scene.add.rectangle(part.x, part.y, part.width, part.height, color, alpha);
    object.setAngle(part.angle ?? 0);
    object.setDepth(part.depth ?? 0);
    return { anchor: part.anchor, baseX: part.x, baseY: part.y, object };
  }

  private createWeaponParts(): Phaser.GameObjects.Shape[] {
    const profile = this.character.art.weaponProfile;
    const ramp = this.character.art.paletteRamp;
    if (profile.shape === "orb") {
      return [
        this.scene.add.ellipse(46, -58, profile.glowSize, profile.glowSize, ramp.accent, 0.28),
        this.scene.add.ellipse(46, -58, profile.width, profile.width, ramp.accent, 0.95),
        this.scene.add.rectangle(46, -58, profile.width + 12, 4, ramp.highlight, 0.85),
      ];
    }
    if (profile.shape === "hammer") {
      return [
        this.scene.add.rectangle(42, -58, profile.width, profile.length, ramp.outline),
        this.scene.add.rectangle(42, -58, Math.max(8, profile.width - 8), profile.length, ramp.accent),
        this.scene.add.rectangle(42, -96, profile.headSize ?? 38, 30, ramp.secondary),
        this.scene.add.rectangle(42, -96, (profile.headSize ?? 38) - 10, 14, ramp.highlight, 0.72),
      ];
    }
    if (profile.shape === "staff") {
      return [
        this.scene.add.rectangle(42, -58, profile.width + 4, profile.length, ramp.outline),
        this.scene.add.rectangle(42, -58, profile.width, profile.length, ramp.accent),
        this.scene.add.ellipse(42, -110, profile.headSize ?? 20, profile.headSize ?? 20, ramp.highlight, 0.88),
        this.scene.add.ellipse(42, -110, profile.glowSize, profile.glowSize, ramp.accent, 0.2),
      ];
    }
    return [
      this.scene.add.rectangle(42, -58, profile.width + 4, profile.length, ramp.outline),
      this.scene.add.rectangle(42, -58, profile.width, profile.length, ramp.accent),
      this.scene.add.rectangle(42, -88, profile.width + 10, 14, ramp.highlight, 0.76),
    ];
  }

  private updateCostumeParts(pose: PoseFrame, offsetY: number): void {
    for (const part of this.costumeParts) {
      const anchorOffset = this.anchorOffset(part.anchor, pose, offsetY);
      part.object.setPosition(part.baseX + anchorOffset.x, part.baseY + anchorOffset.y);
      if (part.anchor === "root" && part.object.type === "Ellipse") {
        part.object.setScale(1 + Math.sin(this.scene.time.now / 210 + part.baseX) * 0.08);
      }
    }
  }

  private anchorOffset(anchor: PixelPartAnchor, pose: PoseFrame, offsetY: number): Phaser.Math.Vector2 {
    if (anchor === "torso") return new Phaser.Math.Vector2(pose.torsoX ?? 0, (pose.torsoY ?? 0) + offsetY);
    if (anchor === "head") return new Phaser.Math.Vector2(pose.headX ?? 0, (pose.headY ?? 0) + offsetY);
    if (anchor === "arm") return new Phaser.Math.Vector2(pose.armX ?? 0, (pose.armY ?? 0) + offsetY);
    if (anchor === "weapon") return new Phaser.Math.Vector2(pose.weaponX ?? 0, (pose.weaponY ?? 0) + offsetY);
    return new Phaser.Math.Vector2(0, 0);
  }

  private positionWeapon(attacking: boolean, move: MoveConfig | undefined, pose: PoseFrame, offsetY: number): void {
    const x = pose.weaponX ?? (attacking ? 76 : 42);
    const y = (pose.weaponY ?? (move?.effectKey === "quake" && attacking ? -70 : -58)) + offsetY;
    const angle = pose.weaponAngle ?? (attacking ? (move?.effectKey === "quake" ? 72 : -18) : 0);
    this.weaponParts.forEach((part, index) => {
      part.setPosition(x, index >= 2 && this.character.art.weaponProfile.shape !== "orb" ? y - 38 : y);
      part.setAngle(angle);
    });
  }

  private renderEffect(state: FighterState, move: MoveConfig | undefined, attacking: boolean, pose: PoseFrame, pulse: number, bob: number): void {
    const ramp = this.character.art.paletteRamp;
    const profile = this.character.art.effectProfile;
    const shape = move?.effectKey ? profile[move.effectKey] : state === "burst" ? profile.burst : undefined;
    const x = pose.effectX ?? (move?.effectKey === "quake" ? 76 : 72);
    const y = (pose.effectY ?? -62) + bob;
    const scale = pose.effectScale ?? 1;
    this.effectMain.setVisible(Boolean(shape));
    this.effectAlt.setVisible(Boolean(shape));
    this.effectMain.setPosition(x, y);
    this.effectAlt.setPosition(x, y);
    this.effectMain.setAngle(pose.effectAngle ?? (move?.effectKey === "quake" ? 0 : -8));
    this.effectAlt.setAngle((pose.effectAngle ?? 0) + 18);
    const alpha = attacking ? this.effectAlpha(move) : state === "burst" ? 0.52 : 0;
    this.effectMain.setAlpha(alpha);
    this.effectAlt.setAlpha(alpha * 0.72);

    if (shape === "slashArc") {
      this.asRectangle(this.effectMain, 120 * scale, 18, ramp.highlight);
      this.asRectangle(this.effectAlt, 86 * scale, 8, ramp.accent);
    } else if (shape === "pulseRing") {
      this.asRectangle(this.effectMain, 92 * scale * pulse, 20 / pulse, ramp.accent);
      this.asRectangle(this.effectAlt, 46 * scale, 46 * scale, ramp.highlight);
      this.effectAlt.setAngle(this.scene.time.now / 9);
    } else if (shape === "quakeShards") {
      this.asRectangle(this.effectMain, 132 * scale, 20, ramp.accent);
      this.asRectangle(this.effectAlt, 74 * scale, 12 * scale, ramp.highlight);
      this.effectAlt.setAngle(-32);
    } else if (shape === "sparkStar") {
      this.asRectangle(this.effectMain, 70 * scale, 10 * scale, ramp.highlight);
      this.asRectangle(this.effectAlt, 92 * scale, 10, ramp.accent);
      this.effectAlt.setAngle(42);
    } else if (shape === "burstFlame") {
      this.asRectangle(this.effectMain, 184 * scale * pulse, 64 / pulse, ramp.accent);
      this.asRectangle(this.effectAlt, 98 * scale, 22 * scale, ramp.highlight);
      this.effectAlt.setAngle(-58);
    }
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
    if (state === "attack" && move?.name && this.character.animation.poses[move.name as PoseKey]) return move.name as PoseKey;
    if (state === "attack") return "idle";
    if (state === "burst") return "burst";
    return state;
  }

  private poseBob(state: FighterState, grounded: boolean): number {
    if (!grounded) return -4;
    if (state === "idle" || state === "block") return Math.sin(this.scene.time.now / 180) * this.character.animation.idleBob;
    if (state === "run" || state === "dash") return Math.sin(this.scene.time.now / 62) * this.character.animation.runBob;
    return 0;
  }

  private maybeSpawnTrail(state: FighterState, attacking: boolean, burstActive: boolean): void {
    if (!attacking && state !== "dash" && !burstActive) return;
    if (this.scene.time.now - this.lastTrailAt < 70) return;
    this.lastTrailAt = this.scene.time.now;
    const trail = this.scene.add.rectangle(
      this.container.x - this.container.scaleX * 18,
      this.container.y - this.character.body.height / 2,
      this.character.body.width + (attacking ? 18 : 0),
      this.character.body.height,
      attacking ? this.character.art.effectProfile.trailColor : this.character.animation.afterimageColor,
      attacking ? 0.3 : 0.16,
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

  private color(role: PaletteRole): number {
    return this.character.art.paletteRamp[role];
  }

  private effectAlpha(move: MoveConfig | undefined): number {
    if (!move) return 0;
    if (move.effectKey === "burst") return 0.72;
    if (move.effectKey === "pulse") return 0.58;
    if (move.effectKey === "quake") return 0.52;
    return 0.42;
  }

  private asRectangle(shape: Phaser.GameObjects.Shape, width: number, height: number, color: number): void {
    const rectangle = shape as Phaser.GameObjects.Rectangle;
    rectangle.setDisplaySize(width, height);
    rectangle.setFillStyle(color, rectangle.alpha);
  }

}
