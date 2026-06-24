import Phaser from "phaser";
import { assetManifest } from "../data/assets";

type SoundKey = keyof typeof assetManifest.audio;

const soundProfiles: Record<SoundKey, { frequency: number; duration: number; type: OscillatorType; gain: number }> = {
  uiConfirm: { frequency: 660, duration: 0.07, type: "square", gain: 0.035 },
  uiCancel: { frequency: 220, duration: 0.08, type: "sawtooth", gain: 0.03 },
  hitLight: { frequency: 260, duration: 0.06, type: "square", gain: 0.045 },
  hitMedium: { frequency: 180, duration: 0.08, type: "sawtooth", gain: 0.05 },
  hitHeavy: { frequency: 100, duration: 0.12, type: "sawtooth", gain: 0.06 },
  block: { frequency: 420, duration: 0.05, type: "triangle", gain: 0.04 },
  projectile: { frequency: 760, duration: 0.09, type: "triangle", gain: 0.035 },
  burst: { frequency: 90, duration: 0.22, type: "sawtooth", gain: 0.055 },
  ko: { frequency: 70, duration: 0.28, type: "square", gain: 0.055 },
  win: { frequency: 880, duration: 0.22, type: "triangle", gain: 0.035 },
};

export class SoundManager {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(key: SoundKey): void {
    const context = (this.scene.sound as unknown as { context?: AudioContext }).context;
    if (!context) return;
    const profile = soundProfiles[key];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.frequency, context.currentTime);
    if (key === "burst" || key === "win") {
      oscillator.frequency.exponentialRampToValueAtTime(profile.frequency * 2.4, context.currentTime + profile.duration);
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, profile.frequency * 0.55), context.currentTime + profile.duration);
    }
    gain.gain.setValueAtTime(profile.gain, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + profile.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + profile.duration);
  }
}
