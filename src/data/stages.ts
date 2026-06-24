import type { StageConfig } from "../types";

export const stages: StageConfig[] = [
  {
    id: "moon-rail",
    name: "月影鐵道",
    groundY: 430,
    columns: 28,
    palette: {
      sky: 0x151923,
      far: 0x1e2635,
      mid: 0x243143,
      ground: 0x3d5368,
      trim: 0xf7c873,
      light: 0x88f2d0,
    },
    layers: [
      { kind: "lights", y: 132, count: 9, color: 0x88f2d0, alpha: 0.22, speed: 0.38 },
      { kind: "bars", y: 322, count: 28, color: 0x1e2635, alpha: 0.72, speed: 0.1 },
      { kind: "rails", y: 454, count: 42, color: 0xf7c873, alpha: 0.5, speed: 0.2 },
    ],
  },
  {
    id: "ember-dojo",
    name: "燼火道場",
    groundY: 430,
    columns: 18,
    palette: {
      sky: 0x1d1716,
      far: 0x38211e,
      mid: 0x51312a,
      ground: 0x705340,
      trim: 0xffb45c,
      light: 0x5bd6ff,
    },
    layers: [
      { kind: "embers", y: 156, count: 22, color: 0xffb45c, alpha: 0.36, speed: 0.55 },
      { kind: "bars", y: 330, count: 18, color: 0x38211e, alpha: 0.72, speed: 0.08 },
      { kind: "lights", y: 232, count: 7, color: 0x5bd6ff, alpha: 0.16, speed: 0.24 },
    ],
  },
];

export function getStage(id: string): StageConfig {
  return stages.find((stage) => stage.id === id) ?? stages[0];
}
