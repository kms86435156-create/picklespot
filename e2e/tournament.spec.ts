import { test, expect } from "@playwright/test";

test.describe("대회", () => {
  test("대회 목록 로드 (empty state)", async ({ page }) => {
    await page.goto("/tournaments"); await page.waitForTimeout(1000);
    expect((await page.locator("body").textContent()) || "").toContain("대회");
  });
  test("잘못된 대회 ID", async ({ page }) => {
    const res = await page.goto("/tournaments/invalid-xyz");
    expect(res?.status() === 404 || res?.status() === 200).toBeTruthy();
  });
  test("대회 API (빈 배열)", async ({ request }) => {
    const res = await request.get("/api/tournaments");
    expect(res.ok()).toBeTruthy();
    const d = await res.json();
    expect(Array.isArray(d.tournaments)).toBeTruthy();
  });
  test("존재하지 않는 대회 → 404", async ({ request }) => {
    expect((await request.get("/api/tournaments/nonexistent")).status()).toBe(404);
  });
  test("존재하지 않는 대회 신청 → 404", async ({ request }) => {
    expect((await request.post("/api/tournaments/nonexistent/register", { data: { playerName: "t", playerPhone: "010-0000-0000", privacyAgreed: true } })).status()).toBe(404);
  });
});
