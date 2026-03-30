import { test, expect } from "@playwright/test";

test.describe("운영자 등록", () => {
  test("페이지 로드", async ({ page }) => { await page.goto("/for-clubs"); await expect(page.locator("body")).toContainText("동호회"); });
  test("리드 API", async ({ request }) => {
    const res = await request.post("/api/leads", { data: { contactName: "E2E", clubName: "Test", region: "서울", phone: "010-0000-0000" } });
    expect(res.ok()).toBeTruthy();
  });
});

test.describe("가이드", () => {
  test("대회 가이드", async ({ page }) => { await page.goto("/guides/tournament-guide"); await page.waitForTimeout(1000); expect((await page.locator("body").textContent())?.length).toBeGreaterThan(100); });
  test("장소 가이드", async ({ page }) => { await page.goto("/guides/venue-guide"); await page.waitForTimeout(1000); expect((await page.locator("body").textContent())?.length).toBeGreaterThan(100); });
  test("운영자 가이드", async ({ page }) => { await page.goto("/guides/organizer-guide"); await page.waitForTimeout(1000); expect((await page.locator("body").textContent())?.length).toBeGreaterThan(100); });
});

test.describe("관리자", () => {
  test("대시보드", async ({ page }) => { await page.goto("/admin"); await expect(page.locator("body")).toContainText("대시보드", { timeout: 10000 }); });
  test("대회 관리", async ({ page }) => { await page.goto("/admin/tournaments"); await expect(page.locator("body")).toContainText("대회", { timeout: 10000 }); });
  test("장소 관리", async ({ page }) => { await page.goto("/admin/venues"); await expect(page.locator("body")).toContainText("장소", { timeout: 10000 }); });
  test("동호회 관리", async ({ page }) => { await page.goto("/admin/clubs"); await expect(page.locator("body")).toContainText("동호회", { timeout: 10000 }); });
  test("번개모임 관리", async ({ page }) => { await page.goto("/admin/meetups"); await expect(page.locator("body")).toContainText("번개모임", { timeout: 10000 }); });
  test("예약 요청 관리", async ({ page }) => { await page.goto("/admin/booking-requests"); await expect(page.locator("body")).toContainText("예약", { timeout: 10000 }); });
  test("대시보드 API", async ({ request }) => { const res = await request.get("/api/admin/dashboard"); expect(res.ok()).toBeTruthy(); const d = await res.json(); expect(d.tournaments).toBeDefined(); expect(d.meetups).toBeDefined(); expect(d.bookingRequests).toBeDefined(); });
  test("번개모임 관리 API", async ({ request }) => { const res = await request.get("/api/admin/meetups"); expect(res.ok()).toBeTruthy(); });
});

test.describe("Health", () => {
  test("API 정상", async ({ request }) => { const res = await request.get("/api/health"); expect(res.ok()).toBeTruthy(); });
});
