import { test, expect } from "@playwright/test";

test.describe("대회 흐름", () => {
  test("대회 목록 → 카드 표시", async ({ page }) => {
    await page.goto("/tournaments");
    // 대회 카드가 최소 1개 있어야 함
    const cards = page.locator('[class*="card-grid-bg"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("대회 상세 페이지 접근", async ({ page }) => {
    await page.goto("/tournaments");
    // "자세히 보기" 링크 클릭
    const detailLink = page.locator('text=자세히 보기').first();
    await detailLink.click();
    await expect(page).toHaveURL(/\/tournaments\//);
    // 상세 페이지에 대회 제목이 표시되어야 함
    await expect(page.locator("h1")).toBeVisible();
  });

  test("존재하지 않는 대회 상세 → not found UI", async ({ page }) => {
    await page.goto("/tournaments/nonexistent-id");
    await expect(page.locator("body")).toContainText("찾을 수 없습니다");
  });

  test("대회 상세 → 신청하기 버튼 클릭 → 모달 표시", async ({ page }) => {
    await page.goto("/tournaments");
    const detailLink = page.locator('text=자세히 보기').first();
    await detailLink.click();
    await page.waitForURL(/\/tournaments\//);

    // "신청하기" 버튼 클릭
    const applyBtn = page.locator('button:has-text("신청하기")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      // 모달 또는 신청 화면이 표시되어야 함
      await expect(page.locator('text=참가자 정보').or(page.locator('text=대회 신청'))).toBeVisible({ timeout: 5000 });
    }
  });
});
