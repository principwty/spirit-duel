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
    const game = (globalThis as unknown as { __SPIRIT_DUEL_GAME__?: { scene: { start: (key: string, data?: unknown) => void } } }).__SPIRIT_DUEL_GAME__;
    if (!game) return false;
    game.scene.start("CombatScene", {
      mode: "training",
      p1Character: "mira",
      p2Character: "kai",
      stageId: "moon-rail",
      aiDifficulty: "normal",
      training: { dummyMode: "stand", infiniteEnergy: true, showMoveInfo: true },
    });
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
