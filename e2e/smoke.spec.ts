import { test, expect } from "@playwright/test";

// ═══ 페이지 접근 smoke tests ═══

test.describe("Page smoke tests", () => {
  test("홈 페이지 로드", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("피클볼");
  });

  test("대회 목록 로드", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.locator("h1")).toContainText("대회");
  });

  test("코트 목록 로드", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.locator("h1")).toContainText("코트");
  });

  test("같이치기 로드", async ({ page }) => {
    await page.goto("/play-together");
    await expect(page.locator("h1")).toContainText("같이");
  });

  test("레슨 로드", async ({ page }) => {
    await page.goto("/lessons");
    await expect(page.locator("h1")).toContainText("코치");
  });

  test("커뮤니티 로드", async ({ page }) => {
    await page.goto("/community");
    await expect(page.locator("h1")).toContainText("커뮤니티");
  });

  test("배우기 로드", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.locator("h1")).toContainText("배우기");
  });

  test("마이페이지 로드", async ({ page }) => {
    await page.goto("/mypage");
    // Either shows user dashboard or login prompt
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("관리자 대시보드 로드", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("대시보드");
  });

  test("관리자 예약 관리 로드", async ({ page }) => {
    await page.goto("/admin/bookings");
    await expect(page.locator("h1")).toContainText("예약 관리");
  });

  test("404 페이지", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.locator("body")).toContainText("찾을 수 없습니다");
  });
});

// ═══ 홈 → 핵심 기능 이동 ═══

test.describe("Navigation", () => {
  test("홈 → 코트 찾기 CTA 클릭 → 코트 페이지 이동", async ({ page }) => {
    await page.goto("/");
    await page.click('text=코트 찾기');
    await expect(page).toHaveURL(/\/courts/);
  });

  test("홈 → 대회 신청 CTA 클릭 → 대회 페이지 이동", async ({ page }) => {
    await page.goto("/");
    await page.click('text=대회 신청');
    await expect(page).toHaveURL(/\/tournaments/);
  });

  test("홈 → 같이 치기 CTA 클릭 → 같이치기 페이지 이동", async ({ page }) => {
    await page.goto("/");
    await page.click('text=같이 치기');
    await expect(page).toHaveURL(/\/play-together/);
  });
});
