import type { AssetManifest } from "../types";

export const assetManifest: AssetManifest = {
  generatedFallback: true,
  sprites: {
    kai: "generated:kai",
    mira: "generated:mira",
    bront: "generated:bront",
    nyx: "generated:nyx",
  },
  audio: {
    uiConfirm: "sfx-ui-confirm",
    uiCancel: "sfx-ui-cancel",
    hitLight: "sfx-hit-light",
    hitMedium: "sfx-hit-medium",
    hitHeavy: "sfx-hit-heavy",
    block: "sfx-block",
    projectile: "sfx-projectile",
    burst: "sfx-burst",
    ko: "sfx-ko",
    win: "sfx-win",
  },
  stages: {
    "moon-rail": "generated:moon-rail",
    "ember-dojo": "generated:ember-dojo",
  },
};
