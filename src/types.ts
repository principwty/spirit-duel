import Phaser from "phaser";

export type FighterId = "p1" | "p2";
export type FighterState =
  | "idle"
  | "run"
  | "jump"
  | "dash"
  | "block"
  | "attack"
  | "hit"
  | "down"
  | "burst"
  | "victory";

export type AttackName = string;
export type AiDifficulty = "easy" | "normal" | "hard";
export type MatchMode = "ai" | "versus" | "arcade" | "training";
export type TrainingDummyMode = "stand" | "block" | "counter";
export type MovePhase = "none" | "startup" | "active" | "recovery";

export interface HitboxConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProjectileConfig {
  speed: number;
  lifetimeMs: number;
  width: number;
  height: number;
  color: number;
  pierce?: boolean;
}

export interface MoveConfig {
  name: AttackName;
  label: string;
  damage: number;
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
  hitstunMs: number;
  blockstunMs: number;
  knockback: number;
  lift: number;
  energyCost: number;
  energyGain: number;
  hitbox: HitboxConfig;
  cancelInto?: AttackName[];
  airborneOnly?: boolean;
  groundedOnly?: boolean;
  projectile?: ProjectileConfig;
  effectKey?: "slash" | "pulse" | "quake" | "spark" | "burst";
}

export interface PoseFrame {
  durationMs: number;
  torsoX?: number;
  torsoY?: number;
  torsoAngle?: number;
  headX?: number;
  headY?: number;
  armX?: number;
  armY?: number;
  armAngle?: number;
  weaponX?: number;
  weaponY?: number;
  weaponAngle?: number;
  effectX?: number;
  effectY?: number;
  effectAngle?: number;
  effectScale?: number;
  crouch?: number;
  lean?: number;
}

export type PoseKey =
  | "idle"
  | "run"
  | "jump"
  | "dash"
  | "block"
  | "light"
  | "medium"
  | "heavy"
  | "special"
  | "burst"
  | "hit"
  | "down"
  | "victory";

export interface AnimationProfile {
  idleBob: number;
  runBob: number;
  afterimageColor: number;
  weaponTrailColor: number;
  poses: Record<PoseKey, PoseFrame[]>;
}

export type PaletteRole = "outline" | "primary" | "secondary" | "accent" | "shadow" | "highlight";
export type PixelPartAnchor = "root" | "torso" | "head" | "arm" | "weapon";
export type PixelPartShape = "rect" | "ellipse" | "triangle";
export type MoveEffectShape = "slashArc" | "pulseRing" | "quakeShards" | "sparkStar" | "burstFlame";

export interface PaletteRamp {
  outline: number;
  shadow: number;
  primary: number;
  secondary: number;
  accent: number;
  highlight: number;
}

export interface PixelPartConfig {
  id: string;
  anchor: PixelPartAnchor;
  shape: PixelPartShape;
  x: number;
  y: number;
  width: number;
  height: number;
  color: PaletteRole;
  alpha?: number;
  angle?: number;
  depth?: number;
}

export interface WeaponArtProfile {
  shape: "blade" | "staff" | "hammer" | "orb";
  length: number;
  width: number;
  headSize?: number;
  glowSize: number;
}

export interface MoveEffectProfile {
  slash: MoveEffectShape;
  pulse: MoveEffectShape;
  quake: MoveEffectShape;
  spark: MoveEffectShape;
  burst: MoveEffectShape;
  projectileCore: PixelPartShape;
  trailColor: number;
}

export interface CharacterArtProfile {
  id: string;
  silhouette: "balanced" | "robed" | "heavy" | "swift";
  paletteRamp: PaletteRamp;
  costumeParts: PixelPartConfig[];
  weaponProfile: WeaponArtProfile;
  effectProfile: MoveEffectProfile;
}

export interface ImpactEffectConfig {
  label: string;
  color: number;
  flashColor: number;
  hitStopMs: number;
  shakeMs: number;
  shakeIntensity: number;
  ringScale: number;
}

export interface BurstConfig {
  durationMs: number;
  speedMultiplier: number;
  shockwave: MoveConfig;
}

export interface CharacterConfig {
  id: string;
  name: string;
  subtitle: string;
  archetype: string;
  moveList: string;
  palette: {
    primary: number;
    secondary: number;
    accent: number;
    shadow: number;
  };
  body: {
    width: number;
    height: number;
    weapon: "blade" | "staff" | "hammer" | "orb";
  };
  art: CharacterArtProfile;
  animation: AnimationProfile;
  maxHealth: number;
  maxEnergy: number;
  moveSpeed: number;
  dashSpeed: number;
  jumpVelocity: number;
  burst: BurstConfig;
  moves: Record<AttackName, MoveConfig>;
}

export interface StageConfig {
  id: string;
  name: string;
  groundY: number;
  palette: {
    sky: number;
    far: number;
    mid: number;
    ground: number;
    trim: number;
    light: number;
  };
  columns: number;
  layers: StageLayerConfig[];
}

export interface StageLayerConfig {
  kind: "bars" | "lights" | "embers" | "rails";
  y: number;
  count: number;
  color: number;
  alpha: number;
  speed: number;
}

export interface AssetManifest {
  generatedFallback: boolean;
  sprites: Record<string, string>;
  audio: {
    uiConfirm: string;
    uiCancel: string;
    hitLight: string;
    hitMedium: string;
    hitHeavy: string;
    block: string;
    projectile: string;
    burst: string;
    ko: string;
    win: string;
  };
  stages: Record<string, string>;
}

export interface AiDifficultyConfig {
  id: AiDifficulty;
  label: string;
  reactionMs: number;
  blockChance: number;
  attackChance: number;
  comboChance: number;
  burstChance: number;
}

export interface BalanceConfig {
  gravity: number;
  arenaMinX: number;
  arenaMaxX: number;
  initialEnergy: number;
  blockDamageRatio: number;
  guardPressureMax: number;
  guardPressureDecayPerMs: number;
  guardPressureNormalMultiplier: number;
  guardPressureQuakeMultiplier: number;
  guardBreakStunMs: number;
  guardBreakLift: number;
  comboTimerMs: number;
  dashDurationMs: number;
  dashFriction: number;
  groundedFriction: number;
  trainingP1X: number;
  trainingP2X: number;
}

export interface ComboState {
  hits: number;
  damage: number;
  maxHits: number;
  maxDamage: number;
  timerMs: number;
}

export interface ArcadeRoundConfig {
  opponentId: string;
  stageId: string;
  aiDifficulty: AiDifficulty;
}

export interface ArcadeRunConfig {
  playerCharacter: string;
  rounds: ArcadeRoundConfig[];
}

export interface ArcadeProgress {
  playerCharacter: string;
  roundIndex: number;
  wins: number;
}

export interface TrainingConfig {
  dummyMode: TrainingDummyMode;
  infiniteEnergy: boolean;
  infiniteHealth: boolean;
  autoReset: boolean;
  showHitboxes: boolean;
  showFrameData: boolean;
  showInputHistory: boolean;
  showMoveInfo: boolean;
}

export interface TrainingOptions extends TrainingConfig {
  debugOverlay: boolean;
  slowMotionScale: number;
  paused: boolean;
}

export interface InputHistoryEntry {
  timeMs: number;
  label: string;
}

export interface FrameStepConfig {
  paused: boolean;
  stepQueued: boolean;
  slowMotionScale: number;
}

export interface DebugFighterState {
  id: FighterId;
  state: FighterState;
  moveName?: AttackName;
  moveLabel?: string;
  movePhase: MovePhase;
  moveElapsedMs: number;
  moveRemainingMs: number;
  stateTimerMs: number;
  health: number;
  energy: number;
  guardPressure: number;
  burstMs: number;
  comboTimerMs: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface DebugCombatState {
  mode: MatchMode;
  roundMs: number;
  hitStopMs: number;
  debugOverlay: boolean;
  showHitboxes: boolean;
  frameStep: FrameStepConfig;
  p1: DebugFighterState;
  p2: DebugFighterState;
  inputHistory: InputHistoryEntry[];
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  block: boolean;
  light: boolean;
  medium: boolean;
  heavy: boolean;
  special: boolean;
  burst: boolean;
}

export interface MatchConfig {
  mode: MatchMode;
  p1Character: string;
  p2Character: string;
  stageId: string;
  aiDifficulty: AiDifficulty;
  arcade?: ArcadeProgress;
  training?: TrainingConfig;
}

export interface FighterSnapshot {
  id: FighterId;
  characterName: string;
  archetype: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  state: FighterState;
  moveName?: AttackName;
  combo: ComboState;
  guardPressure: number;
  burstActive: boolean;
  burstPercent: number;
  x: number;
  y: number;
}

export interface ActiveHitbox {
  ownerId: FighterId;
  move: MoveConfig;
  rect: Phaser.Geom.Rectangle;
}

export interface MatchResult {
  winner: string;
  mode: MatchMode;
  p1Character: string;
  p2Character: string;
  stageId: string;
  aiDifficulty: AiDifficulty;
  p1Health: number;
  p2Health: number;
  p1MaxCombo: number;
  p2MaxCombo: number;
  arcade?: ArcadeProgress & { cleared?: boolean };
  training?: TrainingConfig;
}
