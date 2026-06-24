import Phaser from "phaser";
import { aiDifficulties } from "../combat/SimpleAIController";
import { getArcadeRun } from "../data/arcade";
import { characters } from "../data/characters";
import { stages } from "../data/stages";
import { defaultTrainingConfig } from "../data/training";
import type { AiDifficulty, MatchConfig } from "../types";
import { createBackdrop } from "./MenuScene";

const difficultyOrder: AiDifficulty[] = ["easy", "normal", "hard"];

export class SelectScene extends Phaser.Scene {
  private mode: MatchConfig["mode"] = "ai";
  private p1Index = 0;
  private p2Index = 1;
  private stageIndex = 0;
  private difficultyIndex = 1;

  constructor() {
    super("SelectScene");
  }

  init(data: { mode?: MatchConfig["mode"] }): void {
    this.mode = data.mode ?? "ai";
  }

  create(): void {
    createBackdrop(this, stages[this.stageIndex]);
    this.add
      .text(480, 56, "選擇鬥士", {
        fontFamily: "Arial Black, Arial",
        fontSize: "38px",
        color: "#f8f3df",
        stroke: "#141821",
        strokeThickness: 7,
      })
      .setOrigin(0.5);

    this.renderCards();

    this.input.keyboard?.on("keydown-A", () => this.shiftP1(-1));
    this.input.keyboard?.on("keydown-D", () => this.shiftP1(1));
    this.input.keyboard?.on("keydown-LEFT", () => this.shiftP2(-1));
    this.input.keyboard?.on("keydown-RIGHT", () => this.shiftP2(1));
    this.input.keyboard?.on("keydown-Q", () => this.shiftStage(-1));
    this.input.keyboard?.on("keydown-E", () => this.shiftStage(1));
    this.input.keyboard?.on("keydown-Z", () => this.shiftDifficulty(-1));
    this.input.keyboard?.on("keydown-C", () => this.shiftDifficulty(1));
    this.input.keyboard?.on("keydown-ENTER", () => this.startMatch());
    this.input.keyboard?.on("keydown-SPACE", () => this.startMatch());
  }

  private renderCards(): void {
    this.children.list
      .filter((child) => child.getData("select-card"))
      .forEach((child) => child.destroy());

    const opponentLabel = this.mode === "arcade" ? "對手" : this.mode === "training" ? "假人" : this.mode === "ai" ? "電腦" : "P2";
    this.makeCard(250, 258, "P1", characters[this.p1Index].id);
    this.makeCard(710, 258, opponentLabel, this.previewOpponentId());

    const difficulty = difficultyOrder[this.difficultyIndex];
    this.add
      .text(
        480,
        448,
        this.statusText(difficulty),
        {
          fontFamily: "Arial Black, Arial",
          fontSize: "18px",
          color: "#f7c873",
        },
      )
      .setOrigin(0.5)
      .setData("select-card", true);
    this.add
      .text(480, 488, this.helpText(), {
        fontFamily: "Arial Black, Arial",
        fontSize: "15px",
        color: "#88f2d0",
      })
      .setOrigin(0.5)
      .setData("select-card", true);
  }

  private makeCard(x: number, y: number, tag: string, id: string): void {
    const character = characters.find((entry) => entry.id === id) ?? characters[0];
    const container = this.add.container(x, y).setData("select-card", true);
    const panel = this.add.rectangle(0, 0, 320, 284, 0x202735, 0.96).setStrokeStyle(3, character.palette.accent);
    const tagText = this.add
      .text(0, -120, tag, {
        fontFamily: "Arial Black, Arial",
        fontSize: "22px",
        color: "#f7c873",
      })
      .setOrigin(0.5);
    const aura = this.add.ellipse(0, -12, 112, 132, character.palette.accent, 0.1);
    const head = this.add.rectangle(0, -54, character.body.width + 8, 42, character.palette.secondary);
    const body = this.add.rectangle(0, 18, character.body.width + 36, character.body.height, character.palette.primary);
    const weapon = this.add.rectangle(76, 2, character.body.weapon === "hammer" ? 30 : 16, 122, character.palette.accent);
    const name = this.add
      .text(0, 78, character.name, {
        fontFamily: "Arial Black, Arial",
        fontSize: "23px",
        color: "#f8f3df",
      })
      .setOrigin(0.5);
    const type = this.add
      .text(0, 104, character.archetype.toUpperCase(), {
        fontFamily: "Arial Black, Arial",
        fontSize: "13px",
        color: "#88f2d0",
      })
      .setOrigin(0.5);
    const moves = this.add
      .text(0, 126, character.moveList, {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#d2d8e4",
        align: "center",
        wordWrap: { width: 230 },
      })
      .setOrigin(0.5);
    container.add([panel, aura, tagText, head, body, weapon, name, type, moves]);
  }

  private shiftP1(delta: number): void {
    this.p1Index = Phaser.Math.Wrap(this.p1Index + delta, 0, characters.length);
    this.renderCards();
  }

  private shiftP2(delta: number): void {
    if (this.mode === "arcade") return;
    this.p2Index = Phaser.Math.Wrap(this.p2Index + delta, 0, characters.length);
    this.renderCards();
  }

  private shiftStage(delta: number): void {
    if (this.mode === "arcade") return;
    this.stageIndex = Phaser.Math.Wrap(this.stageIndex + delta, 0, stages.length);
    this.scene.restart({ mode: this.mode });
  }

  private shiftDifficulty(delta: number): void {
    this.difficultyIndex = Phaser.Math.Wrap(this.difficultyIndex + delta, 0, difficultyOrder.length);
    this.renderCards();
  }

  private startMatch(): void {
    const p1Character = characters[this.p1Index].id;
    const arcadeRun = getArcadeRun(p1Character);
    const firstArcadeRound = arcadeRun.rounds[0];
    const difficulty = difficultyOrder[this.difficultyIndex];
    const config: MatchConfig = {
      mode: this.mode,
      p1Character,
      p2Character: this.mode === "arcade" ? firstArcadeRound.opponentId : characters[this.p2Index].id,
      stageId: this.mode === "arcade" ? firstArcadeRound.stageId : stages[this.stageIndex].id,
      aiDifficulty: this.mode === "arcade" ? firstArcadeRound.aiDifficulty : difficulty,
      arcade:
        this.mode === "arcade"
          ? { playerCharacter: p1Character, roundIndex: 0, wins: 0 }
          : undefined,
      training: this.mode === "training" ? { ...defaultTrainingConfig } : undefined,
    };
    this.scene.start("CombatScene", config);
  }

  private previewOpponentId(): string {
    if (this.mode === "arcade") {
      return getArcadeRun(characters[this.p1Index].id).rounds[0].opponentId;
    }
    return characters[this.p2Index].id;
  }

  private statusText(difficulty: AiDifficulty): string {
    if (this.mode === "arcade") {
      const firstRound = getArcadeRun(characters[this.p1Index].id).rounds[0];
      return `街機 第 1/3 戰    場地：${stages.find((stage) => stage.id === firstRound.stageId)?.name ?? firstRound.stageId}    AI：${aiDifficulties[firstRound.aiDifficulty].label}`;
    }
    if (this.mode === "training") {
      return `訓練模式    場地：${stages[this.stageIndex].name}    假人：站立`;
    }
    return `場地：${stages[this.stageIndex].name}    ${this.mode === "ai" ? `AI：${aiDifficulties[difficulty].label}` : "本機雙人"}`;
  }

  private helpText(): string {
    if (this.mode === "arcade") return "A/D 選玩家   ENTER 開始街機";
    if (this.mode === "training") return "A/D 選玩家   ←/→ 選假人   Q/E 場地   ENTER 開始訓練";
    return "A/D 玩家1   ←/→ 玩家2   Q/E 場地   Z/C AI   ENTER";
  }
}
