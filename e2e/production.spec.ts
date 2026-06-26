import { test, expect } from "@playwright/test";

const PROD_URL = process.env.PROD_URL || "https://pickleball-platform-brown.vercel.app";

test.describe("Production site verification", () => {
  test.use({ baseURL: PROD_URL });

  test("홈페이지 로드 + 핵심 UI 표시", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    // 핵심 네비게이션 링크 존재 확인
    await expect(page.locator('a[href="/courts"]').first()).toBeVisible();
    await expect(page.locator('a[href="/clubs"]').first()).toBeVisible();
  });

  test("대회 목록 - 카드 렌더링", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.locator('a[href*="/tournaments/"]').first()).toBeVisible({ timeout: 15000 });
  });

  test("대회 상세 - 페이지 렌더링", async ({ page }) => {
    await page.goto("/tournaments");
    const link = page.locator('a[href*="/tournaments/"]').first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    // 대회 상세 페이지가 에러 없이 렌더링되는지 확인
    await expect(page.locator("text=문제가 발생했습니다")).not.toBeVisible({ timeout: 10000 });
  });

  test("잘못된 대회 ID → not-found", async ({ page }) => {
    await page.goto("/tournaments/nonexistent");
    await expect(page.locator("text=대회를 찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=문제가 발생했습니다")).not.toBeVisible();
  });

  test("코트 목록 로드", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.locator("body")).toContainText("피클볼장", { timeout: 10000 });
  });

  test("동호회 목록 로드", async ({ page }) => {
    await page.goto("/clubs");
    await expect(page.locator("body")).toContainText("동호회", { timeout: 10000 });
  });

  test("play-together → 홈으로 리다이렉트", async ({ page }) => {
    await page.goto("/play-together");
    await expect(page).toHaveURL(new RegExp(`^${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`), { timeout: 10000 });
  });

  test("존재하지 않는 URL → 404", async ({ page }) => {
    await page.goto("/totally-invalid-route");
    await expect(page.locator("text=찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
  });

  test("'문제가 발생했습니다' 미노출 확인 - 주요 페이지 순회", async ({ page }) => {
    const pages = ["/", "/tournaments", "/courts", "/clubs", "/learn", "/for-clubs"];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForTimeout(2000);
      const hasError = await page.locator("text=문제가 발생했습니다").isVisible();
      expect(hasError, `"문제가 발생했습니다" found on ${p}`).toBe(false);
    }
  });

  test("API 검증", async ({ request }) => {
    const tournamentsRes = await request.get(`${PROD_URL}/api/tournaments`);
    expect(tournamentsRes.ok()).toBeTruthy();
    const data = await tournamentsRes.json();
    expect(data.tournaments).toBeDefined();
  });
});
