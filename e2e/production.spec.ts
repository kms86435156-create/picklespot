import { test, expect } from "@playwright/test";

const PROD_URL = process.env.PROD_URL || "https://pickleball-platform-brown.vercel.app";

test.describe("Production site verification", () => {
  test.use({ baseURL: PROD_URL });

  test("홈페이지 로드 + 핵심 CTA 표시", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("피클볼");
    await expect(page.locator("text=전국 대회 일정")).toBeVisible();
    await expect(page.locator("text=내 근처 피클볼장")).toBeVisible();
    await expect(page.locator("text=동호회 찾기")).toBeVisible();
  });

  test("대회 목록 - 카드 렌더링", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.locator('a[href*="/tournaments/"]').first()).toBeVisible({ timeout: 15000 });
  });

  test("대회 상세 - 신청 버튼 표시", async ({ page }) => {
    await page.goto("/tournaments");
    await page.locator('a[href*="/tournaments/"]').first().click();
    await expect(page.locator("text=신청하기").first()).toBeVisible({ timeout: 15000 });
  });

  test("잘못된 대회 ID → not-found", async ({ page }) => {
    await page.goto("/tournaments/nonexistent");
    await expect(page.locator("text=대회를 찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=문제가 발생했습니다")).not.toBeVisible();
  });

  test("코트 목록 로드", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.locator("text=코트")).toBeVisible({ timeout: 10000 });
  });

  test("동호회 목록 로드", async ({ page }) => {
    await page.goto("/clubs");
    await expect(page.locator("text=동호회")).toBeVisible({ timeout: 10000 });
  });

  test("숨긴 페이지 → 홈으로 리다이렉트", async ({ page }) => {
    await page.goto("/play-together");
    await expect(page).toHaveURL(new RegExp(`^${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));

    await page.goto("/lessons");
    await expect(page).toHaveURL(new RegExp(`^${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));

    await page.goto("/community");
    await expect(page).toHaveURL(new RegExp(`^${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));

    await page.goto("/mypage");
    await expect(page).toHaveURL(new RegExp(`^${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
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
    expect(data.tournaments.length).toBeGreaterThan(0);
  });
});
