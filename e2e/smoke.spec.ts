import { test, expect } from "@playwright/test";

test.describe("핵심 페이지 로드", () => {
  test("홈", async ({ page }) => { await page.goto("/"); await expect(page.locator("h1")).toContainText("피클볼"); });
  test("대회 목록", async ({ page }) => { await page.goto("/tournaments"); await expect(page.locator("body")).toContainText("대회"); });
  test("코트 목록", async ({ page }) => { await page.goto("/courts"); await expect(page.locator("body")).toContainText("피클볼장"); });
  test("동호회 목록", async ({ page }) => { await page.goto("/clubs"); await expect(page.locator("body")).toContainText("동호회"); });
  test("같이치기", async ({ page }) => { await page.goto("/play-together"); await expect(page.locator("body")).toContainText("같이"); });
  test("배우기", async ({ page }) => { await page.goto("/learn"); await expect(page.locator("h1")).toContainText("배우기"); });
  test("운영자 등록", async ({ page }) => { await page.goto("/for-clubs"); await expect(page.locator("body")).toContainText("동호회"); });
  test("404", async ({ page }) => { await page.goto("/nonexistent-xyz"); await expect(page.locator("body")).toContainText("찾을 수 없습니다"); });
});

test.describe("숨긴 페이지 리다이렉트", () => {
  test("레슨 → 홈", async ({ page }) => { await page.goto("/lessons"); await expect(page).toHaveURL("/"); });
  test("커뮤니티 → 홈", async ({ page }) => { await page.goto("/community"); await expect(page).toHaveURL("/"); });
  test("마이페이지 → 홈", async ({ page }) => { await page.goto("/mypage"); await expect(page).toHaveURL("/"); });
});

test.describe("네비게이션", () => {
  test("홈 → 대회", async ({ page }) => { await page.goto("/"); await page.locator('a[href="/tournaments"]').first().click(); await expect(page).toHaveURL(/\/tournaments/); });
  test("홈 → 피클볼장", async ({ page }) => { await page.goto("/"); await page.locator('a[href="/courts"]').first().click(); await expect(page).toHaveURL(/\/courts/); });
  test("홈 → 동호회", async ({ page }) => { await page.goto("/"); await page.locator('a[href="/clubs"]').first().click(); await expect(page).toHaveURL(/\/clubs/); });
  test("같이치기 네비 링크 존재", async ({ page }) => { await page.goto("/"); await expect(page.locator('nav a[href="/play-together"]')).toBeVisible(); });
  test("Footer에 같이치기 링크", async ({ page }) => { await page.goto("/"); await expect(page.locator('footer a[href="/play-together"]')).toBeVisible(); });
});

test.describe("Mock 비노출 확인", () => {
  test("홈에 가짜 이름 없음", async ({ page }) => {
    await page.goto("/"); await page.waitForTimeout(1000);
    const t = await page.locator("body").textContent() || "";
    expect(t).not.toContain("김민수"); expect(t).not.toContain("이정호"); expect(t).not.toContain("박지현");
  });
  test("Server Error 없음", async ({ page }) => {
    for (const p of ["/", "/tournaments", "/courts", "/clubs", "/play-together", "/learn", "/for-clubs"]) {
      await page.goto(p); await page.waitForTimeout(500);
      expect(await page.locator("text=Server Error").isVisible(), `Error on ${p}`).toBe(false);
    }
  });
});
