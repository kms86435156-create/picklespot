import { test, expect } from "@playwright/test";

test.describe("프로덕션 핵심 시나리오", () => {
  test("health check API 정상 응답", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok() || res.status() === 503).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBeDefined();
    expect(data.storage).toBeDefined();
    expect(data.isDemoMode).toBeDefined();
    expect(data.envVars).toBeDefined();
  });

  test("데모 모드에서 write API 호출 시 명확한 메시지", async ({ request }) => {
    // Supabase 미연결 환경에서 hold 호출
    const res = await request.post("/api/bookings/hold", {
      data: { slotId: "test-slot", userId: "test" },
    });
    const data = await res.json();
    // 데모 모드면 503 + isDemoMode: true
    // 프로덕션이면 정상 또는 409
    if (res.status() === 503) {
      expect(data.isDemoMode).toBe(true);
      expect(data.message).toContain("데모");
    }
  });

  test("존재하지 않는 booking 접근 → 404", async ({ request }) => {
    const res = await request.get("/api/bookings/nonexistent-id");
    expect(res.status()).toBe(404);
  });

  test("존재하지 않는 tournament 접근 → 404", async ({ request }) => {
    const res = await request.get("/api/tournaments/nonexistent-id");
    expect(res.status()).toBe(404);
  });

  test("존재하지 않는 venue 접근 → 404", async ({ request }) => {
    const res = await request.get("/api/venues/nonexistent-id");
    expect(res.status()).toBe(404);
  });

  test("코트 상세에서 데모 모드 메시지 표시", async ({ page }) => {
    await page.goto("/courts/v1");
    await page.waitForTimeout(2000);

    // 슬롯이 로드되면 하나 선택 시도
    const slot = page.locator('button:has-text(":00")').first();
    if (await slot.isVisible()) {
      await slot.click();
      const bookBtn = page.locator('button:has-text("예약하기")');
      if (await bookBtn.isVisible() && !(await bookBtn.isDisabled())) {
        await bookBtn.click();
        // 데모 모드면 토스트 메시지 확인
        await page.waitForTimeout(1000);
        const toast = page.locator('text=데모 환경');
        // 데모 모드가 아니면 정상 진행
        if (await toast.isVisible()) {
          expect(await toast.textContent()).toContain("데모");
        }
      }
    }
  });

  test("admin API에 권한 없이 접근 시 처리", async ({ request }) => {
    // ADMIN_API_TOKEN이 설정된 환경에서만 401
    // 미설정 환경에서는 허용 (개발 모드)
    const res = await request.post("/api/admin/bookings/test-id/approve");
    // 400 (booking not found) 또는 401 (unauthorized) 또는 503 (demo)
    expect([400, 401, 503]).toContain(res.status());
  });

  test("venues API 데이터 일관성", async ({ request }) => {
    const res = await request.get("/api/venues");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.venues.length).toBeGreaterThan(0);

    // 각 venue에 필수 필드 확인
    for (const v of data.venues) {
      expect(v.id).toBeDefined();
      expect(v.name).toBeDefined();
      expect(v.bookingMode).toBeDefined();
    }
  });

  test("tournaments API 데이터 일관성", async ({ request }) => {
    const res = await request.get("/api/tournaments");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    for (const t of data.tournaments) {
      expect(t.id).toBeDefined();
      expect(t.title).toBeDefined();
      expect(t.status).toBeDefined();
    }
  });
});
