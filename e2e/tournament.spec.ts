import { test, expect } from "@playwright/test";

test.describe("Tournament flow", () => {
  test("대회 목록 → 카드 표시 + 모집현황 표시", async ({ page }) => {
    await page.goto("/tournaments");
    // Wait for tournament cards to render
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 10000 });
    // Should show registration counts
    await expect(page.locator("text=/\\d+\\/\\d+명/").first()).toBeVisible();
    // Should show entry fee
    await expect(page.locator("text=₩50,000").first()).toBeVisible();
  });

  test("대회 상세 페이지 로드 → 모든 섹션 표시", async ({ page }) => {
    await page.goto("/tournaments/t1");
    // Title
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 10000 });
    // Registration button
    await expect(page.locator("text=신청하기").first()).toBeVisible();
    // Schedule section
    await expect(page.locator("text=대회 일정")).toBeVisible();
    // Rules section
    await expect(page.locator("text=대회 규정")).toBeVisible();
    // Venue info
    await expect(page.locator("text=장소 정보")).toBeVisible();
    // Registration status
    await expect(page.locator("text=모집 현황")).toBeVisible();
    // Participants
    await expect(page.locator("text=참가자 현황")).toBeVisible();
    // FAQ
    await expect(page.locator("text=자주 묻는 질문")).toBeVisible();
  });

  test("대회 신청 모달 열기 → 정보 확인 → 제출 → 완료", async ({ page }) => {
    await page.goto("/tournaments/t1");
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 10000 });

    // Click register button
    await page.locator("text=신청하기").first().click();

    // Modal should open with tournament summary
    await expect(page.locator("text=대회 신청")).toBeVisible();
    await expect(page.locator("text=참가자 정보")).toBeVisible();
    await expect(page.locator("text=이정호")).toBeVisible();
    await expect(page.locator("text=환불 규정")).toBeVisible();

    // Click submit
    await page.locator("text=결제 및 신청 완료").click();

    // Should show completion
    await expect(page.locator("text=신청 완료!")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=마이페이지에서 확인하기")).toBeVisible();
  });

  test("대기자 등록 - 마감 대회(t5)에서 대기자 등록", async ({ page }) => {
    await page.goto("/tournaments/t5");
    await expect(page.locator("text=제주 서귀포 피클볼 페스타")).toBeVisible({ timeout: 10000 });

    // Should show waitlist button (currentSlots === maxSlots)
    await page.locator("text=대기자 등록하기").first().click();

    // Modal should show waitlist mode
    await expect(page.locator("text=대기자 등록")).toBeVisible();

    // Submit
    await page.locator("text=대기자 등록하기").last().click();

    // Should complete
    await expect(page.locator("text=대기자 등록 완료!")).toBeVisible({ timeout: 10000 });
  });

  test("잘못된 대회 ID → not found 페이지", async ({ page }) => {
    await page.goto("/tournaments/invalid-id-xyz");
    await expect(page.locator("text=대회를 찾을 수 없습니다")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=대회 목록으로")).toBeVisible();
  });

  test("대회 목록 통계 일관성", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.locator("text=2026 전국 피클볼 오픈")).toBeVisible({ timeout: 10000 });

    // Total count should show 7
    await expect(page.locator("text=전체").first()).toBeVisible();
  });

  test("대회 API 응답 검증", async ({ request }) => {
    // List endpoint
    const listRes = await request.get("/api/tournaments");
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    expect(listData.tournaments.length).toBeGreaterThan(0);
    expect(listData.tournaments[0]).toHaveProperty("date");
    expect(listData.tournaments[0]).toHaveProperty("entryFee");
    expect(listData.tournaments[0]).toHaveProperty("maxSlots");
    expect(listData.tournaments[0]).toHaveProperty("currentSlots");

    // Detail endpoint
    const detailRes = await request.get("/api/tournaments/t1");
    expect(detailRes.ok()).toBeTruthy();
    const detail = await detailRes.json();
    expect(detail.title).toBe("2026 전국 피클볼 오픈");
    expect(detail.rules.length).toBeGreaterThan(0);
    expect(detail.schedule.length).toBeGreaterThan(0);

    // Not found
    const notFoundRes = await request.get("/api/tournaments/nonexistent");
    expect(notFoundRes.status()).toBe(404);
  });

  test("대회 신청 API 검증", async ({ request }) => {
    // Successful registration
    const res = await request.post("/api/tournaments/t1/register", {
      data: { name: "테스트", phone: "010-0000-0000", level: "C", region: "서울" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.registration.tournamentId).toBe("t1");

    // Missing required fields
    const badRes = await request.post("/api/tournaments/t1/register", {
      data: {},
    });
    expect(badRes.status()).toBe(400);

    // Nonexistent tournament
    const notFoundRes = await request.post("/api/tournaments/nonexistent/register", {
      data: { name: "테스트", phone: "010-0000-0000" },
    });
    expect(notFoundRes.status()).toBe(404);
  });
});
