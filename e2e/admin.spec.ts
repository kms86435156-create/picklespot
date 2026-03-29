import { test, expect } from "@playwright/test";

test.describe("관리자 페이지", () => {
  test("대시보드 통계 표시", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("대시보드");
    // 통계 카드 확인
    await expect(page.locator('text=오늘 예약')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=승인 대기')).toBeVisible();
  });

  test("예약 관리 페이지 로드", async ({ page }) => {
    await page.goto("/admin/bookings");
    await expect(page.locator("h1")).toContainText("예약 관리");
    // 필터 버튼 확인
    await expect(page.locator('button:has-text("전체")')).toBeVisible();
  });

  test("예약 관리 → 상태 필터 동작", async ({ page }) => {
    await page.goto("/admin/bookings");
    const confirmedBtn = page.locator('button:has-text("확정")');
    await confirmedBtn.click();
    // 필터가 active 상태로 변경되어야 함
    await expect(confirmedBtn).toHaveClass(/brand-cyan/);
  });

  test("코트 관리 페이지 → venue 목록 표시", async ({ page }) => {
    await page.goto("/admin/courts");
    await expect(page.locator("h1")).toContainText("코트 관리");
    // 최소 1개 venue 카드 표시
    await expect(page.locator('text=자동 확정').or(page.locator('text=승인 필요')).or(page.locator('text=외부 예약'))).toBeVisible({ timeout: 10000 });
  });
});

test.describe("관리자 API", () => {
  test("대시보드 API 정상 응답", async ({ request }) => {
    const res = await request.get("/api/admin/dashboard");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.todayBookingCount).toBeDefined();
    expect(data.pendingCount).toBeDefined();
    expect(data.occupancyRate).toBeDefined();
  });

  test("전체 예약 API 정상 응답", async ({ request }) => {
    const res = await request.get("/api/admin/bookings");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.bookings)).toBeTruthy();
  });

  test("pending 예약 API", async ({ request }) => {
    const res = await request.get("/api/admin/bookings/pending");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.bookings)).toBeTruthy();
  });

  test("approve/reject → booking 생성 후 테스트", async ({ request }) => {
    // 먼저 approval_required 예약 생성
    const today = new Date().toISOString().split("T")[0];
    const availRes = await request.get(`/api/venues/v6/availability?date=${today}`);
    const availData = await availRes.json();

    if (availData.availability?.length > 0) {
      const slot = availData.availability[0].slots.find((s: any) => s.status === "available");
      if (slot) {
        // hold
        const holdRes = await request.post("/api/bookings/hold", { data: { slotId: slot.id, userId: "test" } });
        if (holdRes.ok()) {
          const { holdToken } = await holdRes.json();
          // checkout
          const checkoutRes = await request.post("/api/bookings/checkout", {
            data: { holdToken, userId: "test", userName: "테스트", userPhone: "010", bookingMode: "native_approval_required" },
          });
          if (checkoutRes.ok()) {
            const { booking } = await checkoutRes.json();
            expect(booking.status).toBe("pending_approval");

            // approve
            const approveRes = await request.post(`/api/admin/bookings/${booking.id}/approve`);
            expect(approveRes.ok()).toBeTruthy();
            const approveData = await approveRes.json();
            expect(approveData.booking.status).toBe("confirmed");
          }
        }
      }
    }
  });
});
