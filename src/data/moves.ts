import type { AttackName, BurstConfig, MoveConfig } from "../types";

type MovePatch = Partial<Omit<MoveConfig, "name" | "label">> & {
  label?: string;
};

const defaultCancel: Record<AttackName, AttackName[]> = {
  light: ["medium", "heavy", "special"],
  medium: ["heavy", "special"],
  heavy: ["special"],
  special: [],
};

const defaults: Record<AttackName, MoveConfig> = {
  light: {
    name: "light",
    label: "輕擊",
    damage: 6,
    startupMs: 70,
    activeMs: 100,
    recoveryMs: 170,
    hitstunMs: 260,
    blockstunMs: 150,
    knockback: 150,
    lift: 0,
    energyCost: 0,
    energyGain: 10,
    hitbox: { x: 36, y: -58, width: 46, height: 28 },
    cancelInto: defaultCancel.light,
    groundedOnly: false,
    effectKey: "slash",
  },
  medium: {
    name: "medium",
    label: "中擊",
    damage: 10,
    startupMs: 130,
    activeMs: 120,
    recoveryMs: 250,
    hitstunMs: 340,
    blockstunMs: 190,
    knockback: 230,
    lift: -70,
    energyCost: 0,
    energyGain: 14,
    hitbox: { x: 40, y: -64, width: 62, height: 36 },
    cancelInto: defaultCancel.medium,
    effectKey: "slash",
  },
  heavy: {
    name: "heavy",
    label: "重擊",
    damage: 16,
    startupMs: 220,
    activeMs: 150,
    recoveryMs: 360,
    hitstunMs: 440,
    blockstunMs: 260,
    knockback: 330,
    lift: -150,
    energyCost: 0,
    energyGain: 20,
    hitbox: { x: 38, y: -74, width: 78, height: 46 },
    cancelInto: defaultCancel.heavy,
    effectKey: "quake",
  },
  special: {
    name: "special",
    label: "必殺",
    damage: 25,
    startupMs: 270,
    activeMs: 180,
    recoveryMs: 470,
    hitstunMs: 560,
    blockstunMs: 330,
    knockback: 430,
    lift: -110,
    energyCost: 45,
    energyGain: 0,
    hitbox: { x: 34, y: -80, width: 146, height: 52 },
    cancelInto: [],
    effectKey: "pulse",
  },
};

export function move(name: AttackName, patch: MovePatch = {}): MoveConfig {
  const base = defaults[name] ?? defaults.light;
  return {
    ...base,
    ...patch,
    name,
    label: patch.label ?? base.label,
    hitbox: patch.hitbox ?? base.hitbox,
    projectile: patch.projectile ?? base.projectile,
    cancelInto: patch.cancelInto ?? base.cancelInto,
  };
}

export function burstConfig(accent: number): BurstConfig {
  return {
    durationMs: 5200,
    speedMultiplier: 1.22,
    shockwave: {
      name: "burst",
      label: "爆氣震擊",
      damage: 8,
      startupMs: 20,
      activeMs: 240,
      recoveryMs: 260,
      hitstunMs: 360,
      blockstunMs: 260,
      knockback: 390,
      lift: -80,
      energyCost: 100,
      energyGain: 0,
      hitbox: { x: -64, y: -92, width: 170, height: 96 },
      cancelInto: [],
      effectKey: "burst",
      projectile: undefined,
    },
  };
}
