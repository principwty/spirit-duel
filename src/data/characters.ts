import type { AnimationProfile, CharacterConfig, PoseFrame, PoseKey } from "../types";
import { getArtProfile } from "./artProfiles";
import { burstConfig, move } from "./moves";

const basePoses: Record<PoseKey, PoseFrame[]> = {
  idle: [
    { durationMs: 260, headY: 0, armAngle: 2, weaponAngle: 0 },
    { durationMs: 260, headY: 2, armAngle: -4, weaponAngle: 3 },
  ],
  run: [
    { durationMs: 120, torsoX: -2, torsoAngle: -4, headY: 1, armX: 27, armAngle: -32, weaponAngle: -18 },
    { durationMs: 120, torsoX: 2, torsoAngle: 5, headY: -1, armX: 18, armAngle: 28, weaponAngle: 16 },
  ],
  jump: [{ durationMs: 220, torsoY: -7, torsoAngle: -6, headY: -4, armX: 32, armAngle: -38, weaponAngle: -26 }],
  dash: [
    { durationMs: 110, torsoX: 10, torsoAngle: -12, headX: 4, armX: 38, armAngle: -64, weaponX: 64, weaponAngle: -52 },
    { durationMs: 90, torsoX: 14, torsoAngle: -16, headX: 6, armX: 44, armAngle: -76, weaponX: 74, weaponAngle: -62 },
  ],
  block: [{ durationMs: 260, torsoX: -7, torsoAngle: 5, headX: -4, armX: 12, armY: -58, armAngle: -78, weaponX: 22, weaponAngle: -88 }],
  light: [
    { durationMs: 70, torsoX: 3, armX: 36, armAngle: -48, weaponX: 62, weaponAngle: -28, effectX: 58, effectScale: 0.75 },
    { durationMs: 90, torsoX: 7, armX: 48, armAngle: -70, weaponX: 80, weaponAngle: -44, effectX: 78, effectScale: 0.95 },
  ],
  medium: [
    { durationMs: 90, torsoX: -2, torsoAngle: 6, armX: 22, armAngle: 28, weaponX: 42, weaponAngle: 34 },
    { durationMs: 120, torsoX: 10, torsoAngle: -8, armX: 56, armAngle: -86, weaponX: 92, weaponAngle: -62, effectX: 86, effectScale: 1.1 },
  ],
  heavy: [
    { durationMs: 130, torsoX: -8, torsoAngle: 10, headX: -3, armX: 16, armAngle: 58, weaponX: 28, weaponAngle: 68, crouch: 4 },
    { durationMs: 150, torsoX: 13, torsoAngle: -14, headX: 5, armX: 60, armAngle: -96, weaponX: 96, weaponAngle: -78, effectX: 90, effectScale: 1.28 },
  ],
  special: [
    { durationMs: 140, torsoX: -10, torsoAngle: 12, headX: -5, armX: 12, armAngle: 72, weaponX: 24, weaponAngle: 76, effectScale: 0.6 },
    { durationMs: 160, torsoX: 17, torsoAngle: -16, headX: 7, armX: 68, armAngle: -104, weaponX: 112, weaponAngle: -82, effectX: 104, effectScale: 1.55 },
  ],
  burst: [
    { durationMs: 120, torsoY: -5, armX: 28, armAngle: -12, weaponAngle: -10, effectScale: 1.4 },
    { durationMs: 120, torsoY: -10, armX: 34, armAngle: -42, weaponAngle: -36, effectScale: 1.75 },
  ],
  hit: [
    { durationMs: 110, torsoX: -10, torsoAngle: 13, headX: -5, armX: 8, armAngle: 38, weaponX: 24, weaponAngle: 42 },
    { durationMs: 110, torsoX: -6, torsoAngle: -8, headX: -3, armX: 14, armAngle: -20, weaponX: 30, weaponAngle: -10 },
  ],
  down: [{ durationMs: 400, torsoY: 24, torsoAngle: 86, headX: -24, headY: 44, armX: -6, armY: -28, armAngle: 80, weaponX: 34, weaponY: -20, weaponAngle: 88 }],
  victory: [
    { durationMs: 260, torsoY: -3, armX: 34, armY: -72, armAngle: -128, weaponX: 42, weaponY: -92, weaponAngle: -8 },
    { durationMs: 260, torsoY: -5, armX: 38, armY: -76, armAngle: -138, weaponX: 46, weaponY: -98, weaponAngle: 2 },
  ],
};

function animationProfile(
  afterimageColor: number,
  weaponTrailColor: number,
  overrides: Partial<Record<PoseKey, PoseFrame[]>> = {},
): AnimationProfile {
  return {
    idleBob: 2,
    runBob: 5,
    afterimageColor,
    weaponTrailColor,
    poses: { ...basePoses, ...overrides },
  };
}

export const characters: CharacterConfig[] = [
  {
    id: "kai",
    name: "凱．刃",
    subtitle: "赤鋒劍士",
    archetype: "均衡近戰",
    moveList: "快速確認，輕擊 > 中擊 > 重擊 > 必殺銜接穩定。",
    palette: {
      primary: 0xd94735,
      secondary: 0xf7c873,
      accent: 0x5bd6ff,
      shadow: 0x271a20,
    },
    body: { width: 42, height: 92, weapon: "blade" },
    art: getArtProfile("kai"),
    animation: animationProfile(0x5bd6ff, 0xfff0a6, {
      special: [
        { durationMs: 110, torsoX: -12, torsoAngle: 10, armX: 10, armAngle: 72, weaponX: 18, weaponAngle: 82 },
        { durationMs: 105, torsoX: 22, torsoAngle: -18, armX: 78, armAngle: -112, weaponX: 132, weaponAngle: -84, effectX: 124, effectScale: 1.85 },
        { durationMs: 80, torsoX: 12, torsoAngle: -8, armX: 52, armAngle: -72, weaponX: 92, weaponAngle: -56, effectX: 86, effectScale: 1.25 },
      ],
    }),
    maxHealth: 120,
    maxEnergy: 100,
    moveSpeed: 225,
    dashSpeed: 540,
    jumpVelocity: 620,
    burst: burstConfig(0x5bd6ff),
    moves: {
      light: move("light", { damage: 7, knockback: 138 }),
      medium: move("medium", { knockback: 190 }),
      heavy: move("heavy", { damage: 17, knockback: 265 }),
      special: move("special", {
        label: "裂隙斬",
        damage: 30,
        knockback: 320,
        hitbox: { x: 36, y: -78, width: 164, height: 56 },
      }),
    },
  },
  {
    id: "mira",
    name: "米拉．維爾",
    subtitle: "蒼脈術士",
    archetype: "速度牽制",
    moveList: "出手快，能用脈衝彈必殺進行遠距壓制。",
    palette: {
      primary: 0x3f7fea,
      secondary: 0x88f2d0,
      accent: 0xffdf5a,
      shadow: 0x152033,
    },
    body: { width: 38, height: 88, weapon: "staff" },
    art: getArtProfile("mira"),
    animation: animationProfile(0xffdf5a, 0x88f2d0, {
      idle: [
        { durationMs: 250, headY: -1, armX: 28, armAngle: -18, weaponAngle: -10 },
        { durationMs: 250, headY: 2, armX: 31, armAngle: -28, weaponAngle: -16 },
      ],
      special: [
        { durationMs: 150, torsoX: -6, armX: 34, armAngle: -36, weaponX: 58, weaponAngle: -72, effectX: 62, effectScale: 0.95 },
        { durationMs: 150, torsoX: 6, armX: 54, armAngle: -78, weaponX: 86, weaponAngle: -92, effectX: 92, effectScale: 1.45 },
      ],
    }),
    maxHealth: 112,
    maxEnergy: 110,
    moveSpeed: 255,
    dashSpeed: 575,
    jumpVelocity: 650,
    burst: burstConfig(0xffdf5a),
    moves: {
      light: move("light", { damage: 5, startupMs: 60, recoveryMs: 145 }),
      medium: move("medium", { damage: 9, knockback: 210 }),
      heavy: move("heavy", { startupMs: 195, damage: 14, effectKey: "spark" }),
      special: move("special", {
        label: "脈衝彗星",
        damage: 21,
        energyCost: 42,
        blockstunMs: 380,
        hitbox: { x: 32, y: -72, width: 72, height: 42 },
        projectile: {
          speed: 520,
          lifetimeMs: 1200,
          width: 48,
          height: 24,
          color: 0xffdf5a,
        },
      }),
    },
  },
  {
    id: "bront",
    name: "布朗特．海爾",
    subtitle: "鐵鎚破陣者",
    archetype: "重擊壓制",
    moveList: "出手較慢，但重擊威力高，近距離爆發強。",
    palette: {
      primary: 0x8b5a3c,
      secondary: 0xd8c2a0,
      accent: 0xff6b35,
      shadow: 0x2b201c,
    },
    body: { width: 54, height: 98, weapon: "hammer" },
    art: getArtProfile("bront"),
    animation: animationProfile(0xff6b35, 0xffb45c, {
      run: [
        { durationMs: 145, torsoX: -2, torsoAngle: -2, headY: 2, armX: 26, armAngle: -20, weaponAngle: -8, crouch: 3 },
        { durationMs: 145, torsoX: 2, torsoAngle: 3, headY: -1, armX: 20, armAngle: 24, weaponAngle: 20, crouch: 1 },
      ],
      heavy: [
        { durationMs: 170, torsoX: -14, torsoAngle: 16, headX: -5, armX: 4, armAngle: 82, weaponX: 10, weaponAngle: 96, crouch: 8 },
        { durationMs: 140, torsoX: 14, torsoAngle: -18, headX: 4, armX: 58, armAngle: -108, weaponX: 86, weaponAngle: -92, effectX: 82, effectScale: 1.5 },
      ],
      special: [
        { durationMs: 190, torsoX: -16, torsoAngle: 14, armX: 6, armAngle: 92, weaponX: 8, weaponAngle: 108, crouch: 10 },
        { durationMs: 160, torsoX: 18, torsoAngle: -20, armX: 66, armAngle: -116, weaponX: 100, weaponAngle: -104, effectX: 80, effectY: -34, effectScale: 1.85 },
      ],
    }),
    maxHealth: 145,
    maxEnergy: 95,
    moveSpeed: 190,
    dashSpeed: 470,
    jumpVelocity: 560,
    burst: burstConfig(0xff6b35),
    moves: {
      light: move("light", { startupMs: 90, damage: 8, knockback: 150 }),
      medium: move("medium", { startupMs: 170, damage: 12, knockback: 220 }),
      heavy: move("heavy", {
        label: "破甲重鎚",
        startupMs: 285,
        damage: 24,
        hitstunMs: 560,
        blockstunMs: 430,
        knockback: 330,
        lift: -210,
        effectKey: "quake",
        hitbox: { x: 38, y: -82, width: 92, height: 56 },
      }),
      special: move("special", {
        label: "熔爐崩擊",
        damage: 34,
        startupMs: 330,
        energyCost: 50,
        blockstunMs: 460,
        knockback: 390,
        hitbox: { x: 28, y: -92, width: 128, height: 70 },
        effectKey: "quake",
      }),
    },
  },
  {
    id: "nyx",
    name: "尼克絲．索爾",
    subtitle: "星軌疾行者",
    archetype: "機動遠攻",
    moveList: "遠距星球必殺與高速衝刺，但體力較低。",
    palette: {
      primary: 0x7657d9,
      secondary: 0xf4ecff,
      accent: 0x52ffaa,
      shadow: 0x1b1733,
    },
    body: { width: 36, height: 86, weapon: "orb" },
    art: getArtProfile("nyx"),
    animation: animationProfile(0x52ffaa, 0xf4ecff, {
      dash: [
        { durationMs: 80, torsoX: 15, torsoAngle: -18, headX: 5, armX: 46, armAngle: -78, weaponX: 74, weaponY: -54, weaponAngle: -40 },
        { durationMs: 80, torsoX: 20, torsoAngle: -22, headX: 7, armX: 54, armAngle: -92, weaponX: 90, weaponY: -48, weaponAngle: -52 },
      ],
      heavy: [
        { durationMs: 80, torsoY: -8, torsoAngle: -10, armX: 36, armAngle: -54, weaponX: 70, weaponY: -74, effectScale: 0.9 },
        { durationMs: 120, torsoX: 16, torsoY: -12, torsoAngle: -24, armX: 68, armAngle: -106, weaponX: 104, weaponY: -70, effectX: 94, effectScale: 1.35 },
      ],
      special: [
        { durationMs: 110, torsoX: -4, torsoY: -7, armX: 38, armAngle: -60, weaponX: 62, weaponY: -80, effectScale: 1.1 },
        { durationMs: 130, torsoX: 10, torsoY: -12, armX: 66, armAngle: -96, weaponX: 108, weaponY: -72, effectX: 110, effectScale: 1.55 },
      ],
    }),
    maxHealth: 104,
    maxEnergy: 120,
    moveSpeed: 270,
    dashSpeed: 610,
    jumpVelocity: 690,
    burst: burstConfig(0x52ffaa),
    moves: {
      light: move("light", { startupMs: 55, damage: 5, hitbox: { x: 34, y: -56, width: 42, height: 26 } }),
      medium: move("medium", { startupMs: 115, damage: 8, knockback: 180, effectKey: "spark" }),
      heavy: move("heavy", {
        label: "星軌踢",
        startupMs: 180,
        damage: 13,
        knockback: 230,
        lift: -230,
        hitbox: { x: 34, y: -86, width: 72, height: 52 },
        effectKey: "spark",
      }),
      special: move("special", {
        label: "新星球",
        damage: 23,
        energyCost: 48,
        recoveryMs: 420,
        hitbox: { x: 32, y: -68, width: 60, height: 40 },
        projectile: {
          speed: 610,
          lifetimeMs: 1050,
          width: 34,
          height: 34,
          color: 0x52ffaa,
          pierce: false,
        },
        effectKey: "pulse",
      }),
    },
  },
];

export function getCharacter(id: string): CharacterConfig {
  return characters.find((character) => character.id === id) ?? characters[0];
}
