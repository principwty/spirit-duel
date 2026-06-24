import { expect, test, type Page } from "@playwright/test";

async function expectCanvas(page: Page) {
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveCount(1);
  const box = await canvas.boundingBox();
  expect(box?.width).toBeGreaterThan(200);
  expect(box?.height).toBeGreaterThan(100);
}

test("menu, arcade start, and training route render", async ({ page }) => {
  await page.goto("/");
  await expectCanvas(page);

  await page.keyboard.press("C");
  await page.waitForTimeout(350);
  await expectCanvas(page);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(350);
  await expectCanvas(page);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  await expectCanvas(page);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  await page.goto("/");
  await page.keyboard.press("T");
  await page.waitForTimeout(350);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(450);
  await expectCanvas(page);
  await page.keyboard.press("T");
  await page.waitForTimeout(150);
  await page.keyboard.press("R");
  await page.waitForTimeout(150);
  await expectCanvas(page);
});

test("debug hooks can verify arcade clear result scene", async ({ page }) => {
  await page.goto("/");
  const switched = await page.evaluate(() => {
    const game = (globalThis as unknown as { __SPIRIT_DUEL_GAME__?: { scene: { start: (key: string, data?: unknown) => void } } }).__SPIRIT_DUEL_GAME__;
    if (!game) return false;
    game.scene.start("ResultScene", {
      winner: "凱．刃",
      mode: "arcade",
      p1Character: "kai",
      p2Character: "bront",
      stageId: "moon-rail",
      aiDifficulty: "hard",
      p1Health: 28,
      p2Health: 0,
      p1MaxCombo: 6,
      p2MaxCombo: 2,
      arcade: { playerCharacter: "kai", roundIndex: 2, wins: 3, cleared: true },
    });
    return true;
  });
  expect(switched).toBe(true);
  await page.waitForTimeout(350);
  await expectCanvas(page);
});

test("training debug route survives melee, projectile, and burst inputs", async ({ page }) => {
  await page.goto("/");
  const switched = await page.evaluate(() => {
    const game = (globalThis as unknown as { __SPIRIT_DUEL_GAME__?: { spiritDuel?: { startTraining: (config?: unknown) => void } } }).__SPIRIT_DUEL_GAME__;
    if (!game?.spiritDuel) return false;
    game.spiritDuel.startTraining({ p1Character: "mira", p2Character: "kai" });
    return true;
  });
  expect(switched).toBe(true);
  await page.waitForTimeout(500);
  await expectCanvas(page);

  await page.keyboard.down("D");
  await page.waitForTimeout(900);
  await page.keyboard.up("D");
  await page.keyboard.press("J");
  await page.waitForTimeout(160);
  await page.keyboard.press("K");
  await page.waitForTimeout(160);
  await page.keyboard.press("U");
  await page.waitForTimeout(500);
  await page.keyboard.press("O");
  await page.waitForTimeout(450);
  await page.keyboard.press("R");
  await page.waitForTimeout(180);
  await expectCanvas(page);
});

test("developer tuning hooks expose deterministic combat state", async ({ page }) => {
  await page.goto("/");
  const started = await page.evaluate(() => {
    const game = (globalThis as unknown as {
      __SPIRIT_DUEL_GAME__?: {
        spiritDuel?: {
          startTraining: (config?: unknown) => void;
          setupCombat: (setup: unknown) => boolean;
          snapshot: () => unknown;
        };
      };
    }).__SPIRIT_DUEL_GAME__;
    game?.spiritDuel?.startTraining({ p1Character: "kai", p2Character: "mira" });
    return Boolean(game?.spiritDuel);
  });
  expect(started).toBe(true);
  await page.waitForTimeout(450);

  const configured = await page.evaluate(() => {
    const api = (globalThis as unknown as {
      __SPIRIT_DUEL_GAME__: {
        spiritDuel: {
          setupCombat: (setup: unknown) => boolean;
          snapshot: () => { showHitboxes: boolean; debugOverlay: boolean; frameStep: { paused: boolean } };
        };
      };
    }).__SPIRIT_DUEL_GAME__.spiritDuel;
    const ok = api.setupCombat({
      p1X: 430,
      p2X: 515,
      p1Energy: 100,
      p2Energy: 100,
      debugOverlay: true,
      showHitboxes: true,
      paused: true,
      training: { dummyMode: "block", showInputHistory: true, showFrameData: true },
    });
    const snapshot = api.snapshot();
    return ok && snapshot.showHitboxes && snapshot.debugOverlay && snapshot.frameStep.paused;
  });
  expect(configured).toBe(true);
  await expectCanvas(page);

  await page.keyboard.press("N");
  await page.waitForTimeout(120);
  const stepped = await page.evaluate(() => {
    const snapshot = (globalThis as unknown as {
      __SPIRIT_DUEL_GAME__: {
        spiritDuel: {
          snapshot: () => { frameStep: { paused: boolean }; p1: { x: number }; p2: { x: number } };
        };
      };
    }).__SPIRIT_DUEL_GAME__.spiritDuel.snapshot();
    return snapshot.frameStep.paused && snapshot.p1.x === 430 && snapshot.p2.x === 515;
  });
  expect(stepped).toBe(true);
});
