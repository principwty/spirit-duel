import Phaser from "phaser";
import { FighterStateMachine } from "./FighterStateMachine";
import { FighterView } from "./FighterView";
import { MoveResolver } from "./MoveResolver";
import type {
  ActiveHitbox,
  AttackName,
  CharacterConfig,
  ComboState,
  FighterId,
  FighterSnapshot,
  HitboxConfig,
  InputState,
  MoveConfig,
} from "../types";

const GRAVITY = 1900;
const ARENA_MIN_X = 70;
const ARENA_MAX_X = 890;
const MAX_GUARD_PRESSURE = 100;

export class Fighter {
  readonly id: FighterId;
  readonly character: CharacterConfig;
  readonly stateMachine = new FighterStateMachine();
  readonly moves = new MoveResolver();

  health: number;
  energy = 24;
  facing: 1 | -1;
  vx = 0;
  vy = 0;
  combo: ComboState = {
    hits: 0,
    damage: 0,
    maxHits: 0,
    maxDamage: 0,
    timerMs: 0,
  };
  guardPressure = 0;
  lastGuardBroken = false;

  private readonly scene: Phaser.Scene;
  private readonly view: FighterView;
  private readonly spawn: Phaser.Math.Vector2;
  private readonly groundY: number;
  private attackHasHit = false;
  private burstMs = 0;

  constructor(
    scene: Phaser.Scene,
    id: FighterId,
    character: CharacterConfig,
    x: number,
    groundY: number,
    facing: 1 | -1,
  ) {
    this.scene = scene;
    this.id = id;
    this.character = character;
    this.health = character.maxHealth;
    this.facing = facing;
    this.groundY = groundY;
    this.spawn = new Phaser.Math.Vector2(x, groundY);
    this.view = new FighterView(scene, character, x, groundY, facing);
  }

  get x(): number {
    return this.view.container.x;
  }

  get y(): number {
    return this.view.container.y;
  }

  get state() {
    return this.stateMachine.state;
  }

  get isGrounded(): boolean {
    return this.view.container.y >= this.groundY - 1;
  }

  get isDefeated(): boolean {
    return this.health <= 0;
  }

  get burstActive(): boolean {
    return this.burstMs > 0;
  }

  reset(): void {
    this.health = this.character.maxHealth;
    this.energy = 24;
    this.stateMachine.set("idle");
    this.moves.clear();
    this.vx = 0;
    this.vy = 0;
    this.attackHasHit = false;
    this.burstMs = 0;
    this.guardPressure = 0;
    this.combo = { hits: 0, damage: 0, maxHits: 0, maxDamage: 0, timerMs: 0 };
    this.view.container.setPosition(this.spawn.x, this.spawn.y);
    this.render();
  }

  resetForTraining(x = this.spawn.x): void {
    this.reset();
    this.view.container.setPosition(x, this.groundY);
    this.render();
  }

  refillEnergy(): void {
    this.energy = this.character.maxEnergy;
  }

  wouldBlock(attacker: Fighter): boolean {
    const direction = attacker.x < this.x ? 1 : -1;
    return this.state === "block" && this.facing === -direction;
  }

  update(input: InputState, opponent: Fighter, deltaMs: number): void {
    if (this.state === "victory") {
      this.render();
      return;
    }

    this.faceOpponent(opponent);
    this.tickTimers(deltaMs);
    this.applyInput(input);
    this.integrate(deltaMs / 1000);
    this.render();
  }

  activeHitbox(): ActiveHitbox | undefined {
    if (!this.moves.current || this.attackHasHit || !this.moves.active) {
      return undefined;
    }

    return {
      ownerId: this.id,
      move: this.moves.current,
      rect: this.worldHitbox(this.moves.current.hitbox),
    };
  }

  consumeProjectileMove(): MoveConfig | undefined {
    if (!this.moves.current?.projectile || !this.moves.canSpawnProjectile) {
      return undefined;
    }
    this.moves.markProjectileSpawned();
    return this.moves.current;
  }

  hurtbox(): Phaser.Geom.Rectangle {
    return this.view.hurtbox();
  }

  receiveHit(move: MoveConfig, attacker: Fighter): boolean {
    if (this.state === "down" || this.state === "victory") return false;
    this.lastGuardBroken = false;

    const direction = attacker.x < this.x ? 1 : -1;
    const blocked = this.wouldBlock(attacker);
    const damage = blocked ? Math.ceil(move.damage * 0.25) : move.damage;
    this.health = Math.max(0, this.health - damage);

    if (!this.burstActive) {
      this.energy = Phaser.Math.Clamp(this.energy + (blocked ? 10 : 6), 0, this.character.maxEnergy);
    }

    if (blocked) {
      this.guardPressure = Phaser.Math.Clamp(
        this.guardPressure + move.damage * (move.effectKey === "quake" ? 4.2 : 3.1),
        0,
        MAX_GUARD_PRESSURE,
      );
      this.vx = direction * move.knockback * 0.34;
      if (this.guardPressure >= MAX_GUARD_PRESSURE) {
        this.guardPressure = 0;
        this.lastGuardBroken = true;
        this.stateMachine.set("hit", 520);
        this.vx = direction * move.knockback * 0.72;
        this.vy = Math.min(this.vy, -90);
      } else {
        this.stateMachine.set("block", move.blockstunMs);
      }
      this.scene.cameras.main.shake(45, 0.002);
      attacker.registerComboHit(damage);
      return true;
    }

    this.guardPressure = Math.max(0, this.guardPressure - 18);
    this.moves.clear();
    this.attackHasHit = false;
    this.stateMachine.set(this.health <= 0 ? "down" : "hit", this.health <= 0 ? 1200 : move.hitstunMs);
    this.vx = direction * move.knockback;
    this.vy = Math.min(this.vy, move.lift);
    attacker.registerComboHit(damage);
    this.scene.cameras.main.shake(move.name === "special" ? 140 : 70, move.name === "special" ? 0.006 : 0.003);
    return true;
  }

  markAttackHit(): void {
    this.attackHasHit = true;
    this.moves.markConnected();
    if (this.moves.current && !this.burstActive) {
      this.energy = Phaser.Math.Clamp(
        this.energy + this.moves.current.energyGain,
        0,
        this.character.maxEnergy,
      );
    }
  }

  snapshot(): FighterSnapshot {
    return {
      id: this.id,
      characterName: this.character.name,
      archetype: this.character.archetype,
      health: this.health,
      maxHealth: this.character.maxHealth,
      energy: this.energy,
      maxEnergy: this.character.maxEnergy,
      state: this.state,
      moveName: this.moves.current?.name,
      combo: { ...this.combo },
      guardPressure: this.guardPressure / MAX_GUARD_PRESSURE,
      burstActive: this.burstActive,
      burstPercent: this.burstMs / this.character.burst.durationMs,
      x: this.x,
      y: this.y,
    };
  }

  setVictory(): void {
    this.stateMachine.set("victory");
    this.moves.clear();
    this.vx = 0;
    this.vy = 0;
  }

  private tickTimers(deltaMs: number): void {
    this.stateMachine.tick(deltaMs);
    this.moves.tick(deltaMs);

    if (this.burstMs > 0) {
      this.burstMs = Math.max(0, this.burstMs - deltaMs);
    }
    if (this.state !== "block" && this.guardPressure > 0) {
      this.guardPressure = Math.max(0, this.guardPressure - deltaMs * 0.018);
    }

    if (this.combo.timerMs > 0) {
      this.combo.timerMs = Math.max(0, this.combo.timerMs - deltaMs);
      if (this.combo.timerMs === 0) {
        this.combo.hits = 0;
        this.combo.damage = 0;
      }
    }

    if (this.moves.expired) {
      this.moves.clear();
      this.attackHasHit = false;
      this.stateMachine.set(this.isGrounded ? "idle" : "jump");
    }

    if ((this.state === "hit" || this.state === "down" || this.state === "dash" || this.state === "burst") && this.stateMachine.expired) {
      this.stateMachine.set(this.health <= 0 ? "down" : this.isGrounded ? "idle" : "jump");
    }
  }

  private applyInput(input: InputState): void {
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    if (this.canBurst(input)) {
      this.startBurst();
      return;
    }

    const attack = this.nextAttack(input);
    if (attack && this.canStartAttack(attack)) {
      this.startAttack(attack);
      return;
    }

    if (!this.stateMachine.locked && input.block && this.isGrounded) {
      this.stateMachine.set("block");
      this.vx *= 0.6;
      return;
    }

    if (this.state === "block" && (!input.block || this.stateMachine.expired)) {
      this.stateMachine.set("idle");
    }

    if (!this.stateMachine.locked && input.up && this.isGrounded) {
      this.vy = -this.character.jumpVelocity;
      this.stateMachine.set("jump");
    }

    if (!this.stateMachine.locked && input.down && direction !== 0 && this.isGrounded) {
      this.stateMachine.set("dash", 170);
      this.vx = direction * this.character.dashSpeed * this.speedMultiplier();
      return;
    }

    if (!this.stateMachine.locked && this.state !== "block") {
      this.vx = direction * this.character.moveSpeed * this.speedMultiplier();
      this.stateMachine.set(
        direction === 0 ? (this.isGrounded ? "idle" : "jump") : this.isGrounded ? "run" : "jump",
      );
    }

    if (this.state === "dash") {
      this.vx *= 0.96;
    }
  }

  private canBurst(input: InputState): boolean {
    return (
      input.burst &&
      this.energy >= this.character.maxEnergy &&
      this.state !== "burst" &&
      this.state !== "down" &&
      this.state !== "victory"
    );
  }

  private startBurst(): void {
    this.energy = 0;
    this.burstMs = this.character.burst.durationMs;
    this.moves.start(this.character.burst.shockwave);
    this.attackHasHit = false;
    this.stateMachine.set("burst", this.character.burst.shockwave.startupMs + this.character.burst.shockwave.activeMs + this.character.burst.shockwave.recoveryMs);
    this.vx = 0;
    this.vy = Math.min(this.vy, -120);
    this.scene.cameras.main.shake(180, 0.006);
  }

  private nextAttack(input: InputState): AttackName | undefined {
    if (input.special && this.energy >= (this.character.moves.special?.energyCost ?? 0)) return "special";
    if (input.heavy) return "heavy";
    if (input.medium) return "medium";
    if (input.light) return "light";
    return undefined;
  }

  private canStartAttack(name: AttackName): boolean {
    const move = this.character.moves[name];
    if (!move) return false;
    if (move.groundedOnly && !this.isGrounded) return false;
    if (move.airborneOnly && this.isGrounded) return false;
    if (this.state === "attack" || this.state === "burst") {
      return this.moves.canCancelInto(name, this.burstActive);
    }
    return !this.stateMachine.locked && this.state !== "block";
  }

  private startAttack(name: AttackName): void {
    const move = this.character.moves[name];
    this.moves.start(move);
    this.attackHasHit = false;
    this.stateMachine.set("attack", move.startupMs + move.activeMs + move.recoveryMs);
    this.energy = Phaser.Math.Clamp(this.energy - move.energyCost, 0, this.character.maxEnergy);
    this.vx *= name === "special" ? 0.2 : 0.45;
  }

  private integrate(deltaSeconds: number): void {
    if (!this.isGrounded || this.vy < 0) {
      this.vy += GRAVITY * deltaSeconds;
    }

    this.view.container.x = Phaser.Math.Clamp(
      this.view.container.x + this.vx * deltaSeconds,
      ARENA_MIN_X,
      ARENA_MAX_X,
    );
    this.view.container.y += this.vy * deltaSeconds;

    if (this.view.container.y >= this.groundY) {
      this.view.container.y = this.groundY;
      this.vy = 0;
    }

    if (this.isGrounded && !this.stateMachine.locked && Math.abs(this.vx) > 0) {
      this.vx *= 0.84;
    }
  }

  private worldHitbox(config: HitboxConfig): Phaser.Geom.Rectangle {
    if (this.moves.current?.name === "burst") {
      return new Phaser.Geom.Rectangle(
        this.x + config.x,
        this.y + config.y,
        config.width,
        config.height,
      );
    }
    const x = this.facing === 1 ? this.x + config.x : this.x - config.x - config.width;
    return new Phaser.Geom.Rectangle(x, this.y + config.y, config.width, config.height);
  }

  private faceOpponent(opponent: Fighter): void {
    if (this.state === "down" || this.state === "victory") return;
    this.facing = this.x <= opponent.x ? 1 : -1;
    this.view.setFacing(this.facing);
  }

  private render(): void {
    this.view.render(this.state, this.moves.current, this.moves.active, this.burstActive, this.isGrounded);
  }

  private registerComboHit(damage: number): void {
    this.combo.hits += 1;
    this.combo.damage += damage;
    this.combo.maxHits = Math.max(this.combo.maxHits, this.combo.hits);
    this.combo.maxDamage = Math.max(this.combo.maxDamage, this.combo.damage);
    this.combo.timerMs = 1500;
  }

  private speedMultiplier(): number {
    return this.burstActive ? this.character.burst.speedMultiplier : 1;
  }
}
