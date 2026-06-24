import type { AttackName, MoveConfig, MovePhase } from "../types";

export class MoveResolver {
  current?: MoveConfig;
  hasConnected = false;
  projectileSpawned = false;
  private remainingMs = 0;

  start(move: MoveConfig): void {
    this.current = move;
    this.hasConnected = false;
    this.projectileSpawned = false;
    this.remainingMs = this.totalMs(move);
  }

  tick(deltaMs: number): void {
    if (this.current) {
      this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
    }
  }

  clear(): void {
    this.current = undefined;
    this.hasConnected = false;
    this.projectileSpawned = false;
    this.remainingMs = 0;
  }

  get expired(): boolean {
    return Boolean(this.current) && this.remainingMs <= 0;
  }

  get elapsedMs(): number {
    if (!this.current) return 0;
    return this.totalMs(this.current) - this.remainingMs;
  }

  get active(): boolean {
    if (!this.current) return false;
    return (
      this.elapsedMs >= this.current.startupMs &&
      this.elapsedMs <= this.current.startupMs + this.current.activeMs
    );
  }

  get canSpawnProjectile(): boolean {
    return Boolean(
      this.current?.projectile &&
        !this.projectileSpawned &&
        this.elapsedMs >= this.current.startupMs,
    );
  }

  get remaining(): number {
    return this.remainingMs;
  }

  get phase(): MovePhase {
    if (!this.current) return "none";
    if (this.elapsedMs < this.current.startupMs) return "startup";
    if (this.active) return "active";
    return "recovery";
  }

  canCancelInto(next: AttackName, burstActive: boolean): boolean {
    if (!this.current) return false;
    const chainAllowed = this.current.cancelInto?.includes(next) ?? false;
    return this.hasConnected && (chainAllowed || (burstActive && next === "special"));
  }

  markConnected(): void {
    this.hasConnected = true;
  }

  markProjectileSpawned(): void {
    this.projectileSpawned = true;
  }

  private totalMs(move: MoveConfig): number {
    return move.startupMs + move.activeMs + move.recoveryMs;
  }
}
