import type { CharacterArtProfile, PaletteRamp, PixelPartConfig } from "../types";

function ramp(primary: number, secondary: number, accent: number, shadow: number, highlight: number): PaletteRamp {
  return {
    outline: 0x07090e,
    shadow,
    primary,
    secondary,
    accent,
    highlight,
  };
}

const kaiParts: PixelPartConfig[] = [
  { id: "hair", anchor: "head", shape: "rect", x: -8, y: -18, width: 30, height: 10, color: "shadow", depth: 5 },
  { id: "left-shoulder", anchor: "torso", shape: "rect", x: -22, y: -25, width: 20, height: 14, color: "secondary", angle: -10, depth: 4 },
  { id: "right-shoulder", anchor: "torso", shape: "rect", x: 20, y: -24, width: 16, height: 12, color: "accent", angle: 12, depth: 4 },
  { id: "sash", anchor: "torso", shape: "rect", x: 0, y: 6, width: 46, height: 8, color: "highlight", angle: -7, depth: 5 },
  { id: "front-guard", anchor: "torso", shape: "rect", x: 10, y: -5, width: 9, height: 44, color: "shadow", alpha: 0.42, depth: 5 },
  { id: "left-leg", anchor: "root", shape: "rect", x: -12, y: -12, width: 14, height: 28, color: "shadow", depth: 2 },
  { id: "right-leg", anchor: "root", shape: "rect", x: 11, y: -12, width: 13, height: 28, color: "primary", depth: 2 },
];

const miraParts: PixelPartConfig[] = [
  { id: "hood", anchor: "head", shape: "rect", x: 0, y: -13, width: 42, height: 18, color: "accent", alpha: 0.58, depth: 5 },
  { id: "cape-left", anchor: "torso", shape: "triangle", x: -25, y: 0, width: 28, height: 70, color: "shadow", alpha: 0.75, depth: 1 },
  { id: "cape-right", anchor: "torso", shape: "triangle", x: 25, y: 0, width: 28, height: 70, color: "shadow", alpha: 0.58, angle: 180, depth: 1 },
  { id: "rune-a", anchor: "root", shape: "ellipse", x: -42, y: -78, width: 11, height: 11, color: "highlight", alpha: 0.85, depth: 6 },
  { id: "rune-b", anchor: "root", shape: "ellipse", x: 44, y: -68, width: 9, height: 9, color: "accent", alpha: 0.75, depth: 6 },
  { id: "belt", anchor: "torso", shape: "rect", x: 0, y: 12, width: 38, height: 7, color: "highlight", depth: 5 },
  { id: "robe-trim", anchor: "torso", shape: "rect", x: -14, y: -4, width: 6, height: 58, color: "secondary", alpha: 0.55, depth: 5 },
];

const brontParts: PixelPartConfig[] = [
  { id: "brow", anchor: "head", shape: "rect", x: 0, y: -10, width: 42, height: 8, color: "shadow", depth: 5 },
  { id: "left-pauldron", anchor: "torso", shape: "rect", x: -31, y: -28, width: 30, height: 18, color: "secondary", angle: -9, depth: 5 },
  { id: "right-pauldron", anchor: "torso", shape: "rect", x: 31, y: -28, width: 30, height: 18, color: "secondary", angle: 9, depth: 5 },
  { id: "chest-plate", anchor: "torso", shape: "rect", x: 0, y: -5, width: 42, height: 48, color: "shadow", alpha: 0.36, depth: 5 },
  { id: "forge-core", anchor: "torso", shape: "ellipse", x: 0, y: -8, width: 18, height: 18, color: "accent", alpha: 0.84, depth: 6 },
  { id: "left-boot", anchor: "root", shape: "rect", x: -17, y: -8, width: 20, height: 20, color: "shadow", depth: 2 },
  { id: "right-boot", anchor: "root", shape: "rect", x: 17, y: -8, width: 20, height: 20, color: "shadow", depth: 2 },
];

const nyxParts: PixelPartConfig[] = [
  { id: "visor", anchor: "head", shape: "rect", x: 0, y: -3, width: 32, height: 6, color: "accent", depth: 6 },
  { id: "scarf", anchor: "torso", shape: "rect", x: -24, y: -30, width: 36, height: 8, color: "highlight", angle: -22, depth: 5 },
  { id: "tail-scarf", anchor: "torso", shape: "triangle", x: -35, y: -15, width: 26, height: 46, color: "highlight", alpha: 0.7, angle: -18, depth: 1 },
  { id: "star-orbit-a", anchor: "root", shape: "ellipse", x: -38, y: -82, width: 8, height: 8, color: "accent", alpha: 0.85, depth: 6 },
  { id: "star-orbit-b", anchor: "root", shape: "ellipse", x: 40, y: -50, width: 7, height: 7, color: "highlight", alpha: 0.78, depth: 6 },
  { id: "left-greave", anchor: "root", shape: "rect", x: -10, y: -11, width: 10, height: 28, color: "shadow", depth: 2 },
  { id: "right-greave", anchor: "root", shape: "rect", x: 12, y: -12, width: 10, height: 30, color: "primary", depth: 2 },
];

export const artProfiles: Record<string, CharacterArtProfile> = {
  kai: {
    id: "kai",
    silhouette: "balanced",
    paletteRamp: ramp(0xd94735, 0xf7c873, 0x5bd6ff, 0x271a20, 0xfff0a6),
    costumeParts: kaiParts,
    weaponProfile: { shape: "blade", length: 92, width: 10, glowSize: 16 },
    effectProfile: { slash: "slashArc", pulse: "slashArc", quake: "sparkStar", spark: "sparkStar", burst: "burstFlame", projectileCore: "rect", trailColor: 0xfff0a6 },
  },
  mira: {
    id: "mira",
    silhouette: "robed",
    paletteRamp: ramp(0x3f7fea, 0x88f2d0, 0xffdf5a, 0x152033, 0xd8fff3),
    costumeParts: miraParts,
    weaponProfile: { shape: "staff", length: 104, width: 8, headSize: 22, glowSize: 28 },
    effectProfile: { slash: "pulseRing", pulse: "pulseRing", quake: "sparkStar", spark: "sparkStar", burst: "burstFlame", projectileCore: "ellipse", trailColor: 0x88f2d0 },
  },
  bront: {
    id: "bront",
    silhouette: "heavy",
    paletteRamp: ramp(0x8b5a3c, 0xd8c2a0, 0xff6b35, 0x2b201c, 0xffb45c),
    costumeParts: brontParts,
    weaponProfile: { shape: "hammer", length: 86, width: 18, headSize: 42, glowSize: 24 },
    effectProfile: { slash: "quakeShards", pulse: "quakeShards", quake: "quakeShards", spark: "sparkStar", burst: "burstFlame", projectileCore: "rect", trailColor: 0xffb45c },
  },
  nyx: {
    id: "nyx",
    silhouette: "swift",
    paletteRamp: ramp(0x7657d9, 0xf4ecff, 0x52ffaa, 0x1b1733, 0xc8ffe8),
    costumeParts: nyxParts,
    weaponProfile: { shape: "orb", length: 34, width: 34, headSize: 34, glowSize: 30 },
    effectProfile: { slash: "sparkStar", pulse: "pulseRing", quake: "sparkStar", spark: "slashArc", burst: "burstFlame", projectileCore: "ellipse", trailColor: 0x52ffaa },
  },
};

export function getArtProfile(id: string): CharacterArtProfile {
  return artProfiles[id] ?? artProfiles.kai;
}
