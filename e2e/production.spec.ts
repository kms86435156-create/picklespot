import { test, expect } from "@playwright/test";

const PROD_URL = process.env.PROD_URL || "https://pickleball-platform-brown.vercel.app";

test.describe("Production site verification", () => {
  test.use({ baseURL: PROD_URL });

  test("홈페이지 로드 + CTA 표시", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("피클볼");
    await expect(page.locator("text=코트 찾기")).toBeVisible();
    await expect(page.locator("text=대회 신청")).toBeVisible();
    await expect(page.locator("text=같이 치기")).toBeVisible();
  });

  test("대회 목록 - 카드 렌더링 (로딩만 돌지 않음)", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=/\\d+\\/\\d+명/").first()).toBeVisible();
  });

  test("대회 상세 - 전체 렌더링", async ({ page }) => {
    await page.goto("/tournaments/t1");
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=신청하기").first()).toBeVisible();
    await expect(page.locator("text=모집 현황")).toBeVisible();
  });

  test("대회 신청 완주 가능", async ({ page }) => {
    await page.goto("/tournaments/t1");
    await expect(page.locator("text=신청하기").first()).toBeVisible({ timeout: 15000 });
    await page.locator("text=신청하기").first().click();
    await expect(page.locator("text=대회 신청")).toBeVisible();
    await page.locator("text=결제 및 신청 완료").click();
    await expect(page.locator("text=신청 완료!")).toBeVisible({ timeout: 15000 });
  });

  test("잘못된 대회 ID → not-found (에러 아님)", async ({ page }) => {
    await page.goto("/tournaments/nonexistent");
    await expect(page.locator("text=대회를 찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=문제가 발생했습니다")).not.toBeVisible();
  });

  test("코트 목록 로드", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.locator("text=코트")).toBeVisible({ timeout: 10000 });
  });

  test("잘못된 코트 ID → not-found", async ({ page }) => {
    await page.goto("/courts/nonexistent");
    await expect(page.locator("text=피클볼장을 찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
  });

  test("마이페이지 로드", async ({ page }) => {
    await page.goto("/mypage");
    await expect(page.locator("text=이정호").or(page.locator("text=로그인"))).toBeVisible({ timeout: 10000 });
  });

  test("관리자 대시보드 로드", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("text=대시보드")).toBeVisible({ timeout: 10000 });
  });

  test("존재하지 않는 URL → 404", async ({ page }) => {
    await page.goto("/totally-invalid-route");
    await expect(page.locator("text=찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
  });

  test("'문제가 발생했습니다' 재발 확인 - 주요 페이지 순회", async ({ page }) => {
    const pages = ["/", "/tournaments", "/tournaments/t1", "/courts", "/play-together", "/lessons", "/mypage", "/admin"];
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
    expect(data.tournaments.length).toBe(7);

    const detailRes = await request.get(`${PROD_URL}/api/tournaments/t1`);
    expect(detailRes.ok()).toBeTruthy();
    const detail = await detailRes.json();
    expect(detail.maxSlots).toBe(64);
    expect(detail.currentSlots).toBe(41);

    const regRes = await request.post(`${PROD_URL}/api/tournaments/t1/register`, {
      data: { name: "테스트", phone: "010-0000-0000" },
    });
    expect(regRes.ok()).toBeTruthy();
  });
});
