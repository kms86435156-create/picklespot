import { test, expect } from "@playwright/test";

test.describe("코트 예약 흐름", () => {
  test("코트 목록 → 상세 이동", async ({ page }) => {
    await page.goto("/courts");
    const courtLink = page.locator('a[href*="/courts/v"]').first();
    await courtLink.click();
    await expect(page).toHaveURL(/\/courts\/v/);
  });

  test("native_auto_confirm 코트 → 예약하기 버튼 존재", async ({ page }) => {
    await page.goto("/courts/v1"); // 잠실 = native_auto_confirm
    await expect(page.locator('text=코트 예약')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=실시간 확정')).toBeVisible();
  });

  test("outbound_link 코트 → 외부 예약 안내 표시", async ({ page }) => {
    await page.goto("/courts/v2"); // 판교 = outbound_link
    await expect(page.locator('text=외부 예약')).toBeVisible({ timeout: 10000 });
  });

  test("native 코트 → 날짜 선택 가능", async ({ page }) => {
    await page.goto("/courts/v1");
    // 날짜 버튼이 표시되어야 함
    const dateButtons = page.locator('button[class*="font-mono"]').filter({ hasText: /\d+일/ });
    await expect(dateButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test("native 코트 → 슬롯 선택 → 예약하기 활성화", async ({ page }) => {
    await page.goto("/courts/v1");
    // 슬롯 로드 대기
    await page.waitForTimeout(2000);

    // 사용 가능한 슬롯 클릭
    const availableSlot = page.locator('button:has-text(":00")').filter({ hasNotText: /마감/ }).first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
      // 예약하기 버튼이 활성화되어야 함
      const bookBtn = page.locator('button:has-text("예약하기")');
      await expect(bookBtn).toBeVisible();
    }
  });

  test("존재하지 않는 코트 → not found UI", async ({ page }) => {
    await page.goto("/courts/nonexistent-id");
    await expect(page.locator("body")).toContainText("찾을 수 없습니다");
  });

  test("approval_required 코트 → 운영진 승인 필요 배지", async ({ page }) => {
    await page.goto("/courts/v6"); // 강남 = native_approval_required
    await expect(page.locator('text=운영진 승인 필요')).toBeVisible({ timeout: 10000 });
  });
});

test.describe("API 예약 테스트", () => {
  test("availability API 정상 응답", async ({ request }) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await request.get(`/api/venues/v1/availability?date=${today}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.bookingMode).toBe("native_auto_confirm");
    expect(data.availability).toBeDefined();
  });

  test("outbound_link venue → availability에 빈 배열", async ({ request }) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await request.get(`/api/venues/v2/availability?date=${today}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.availability).toEqual([]);
  });

  test("hold → checkout → confirm 전체 흐름", async ({ request }) => {
    // 1. Availability 조회
    const today = new Date().toISOString().split("T")[0];
    const availRes = await request.get(`/api/venues/v1/availability?date=${today}`);
    const availData = await availRes.json();

    if (availData.availability?.length > 0) {
      const slots = availData.availability[0].slots;
      const availableSlot = slots.find((s: any) => s.status === "available");

      if (availableSlot) {
        // 2. Hold
        const holdRes = await request.post("/api/bookings/hold", {
          data: { slotId: availableSlot.id, userId: "test-user" },
        });
        expect(holdRes.ok()).toBeTruthy();
        const holdData = await holdRes.json();
        expect(holdData.holdToken).toBeDefined();

        // 3. Checkout
        const checkoutRes = await request.post("/api/bookings/checkout", {
          data: { holdToken: holdData.holdToken, userId: "test-user", userName: "테스트", userPhone: "010-0000-0000" },
        });
        expect(checkoutRes.ok()).toBeTruthy();
        const checkoutData = await checkoutRes.json();
        expect(checkoutData.booking.id).toBeDefined();
        expect(checkoutData.booking.bookingCode).toBeDefined();

        // 4. Confirm
        const confirmRes = await request.post("/api/bookings/confirm", {
          data: { bookingId: checkoutData.booking.id },
        });
        expect(confirmRes.ok()).toBeTruthy();
        const confirmData = await confirmRes.json();
        expect(confirmData.booking.status).toBe("confirmed");
      }
    }
  });

  test("이미 held 슬롯 → 중복 hold 실패", async ({ request }) => {
    const today = new Date().toISOString().split("T")[0];
    const availRes = await request.get(`/api/venues/v1/availability?date=${today}`);
    const availData = await availRes.json();

    if (availData.availability?.length > 0) {
      const slots = availData.availability[0].slots;
      const availableSlot = slots.find((s: any) => s.status === "available");

      if (availableSlot) {
        // 첫 번째 hold
        const hold1 = await request.post("/api/bookings/hold", {
          data: { slotId: availableSlot.id, userId: "user-a" },
        });
        expect(hold1.ok()).toBeTruthy();

        // 두 번째 hold → 실패해야 함
        const hold2 = await request.post("/api/bookings/hold", {
          data: { slotId: availableSlot.id, userId: "user-b" },
        });
        expect(hold2.ok()).toBeFalsy();
        expect(hold2.status()).toBe(409);
      }
    }
  });
});
