import { test, expect } from "@playwright/test";

test.describe("예약 요청", () => {
  test("예약 요청 API 생성", async ({ request }) => {
    const res = await request.post("/api/booking-requests", {
      data: {
        venueId: "test-venue",
        venueName: "테스트 구장",
        requesterName: "테스트유저",
        requesterPhone: "010-1234-5678",
        bookingDate: "2026-04-10",
        bookingTime: "14:00",
        playerCount: 4,
        memo: "E2E 테스트",
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.bookingRequest.status).toBe("pending");
  });

  test("예약 요청 필수 필드 누락 → 400", async ({ request }) => {
    const res = await request.post("/api/booking-requests", { data: { venueId: "x" } });
    expect(res.status()).toBe(400);
  });

  test("관리자 예약 요청 목록", async ({ request }) => {
    const res = await request.get("/api/admin/booking-requests");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.bookingRequests).toBeDefined();
  });

  test("관리자 예약 상태 변경", async ({ request }) => {
    // 먼저 예약 생성
    const createRes = await request.post("/api/booking-requests", {
      data: { venueId: "v-test", venueName: "테스트", requesterName: "관리자테스트", requesterPhone: "010-9999-8888", bookingDate: "2026-04-15" },
    });
    const { bookingRequest } = await createRes.json();

    // 상태 변경
    const updateRes = await request.put(`/api/admin/booking-requests/${bookingRequest.id}`, {
      data: { status: "confirmed" },
    });
    expect(updateRes.ok()).toBeTruthy();
  });
});

test.describe("피클볼장 UI", () => {
  test("코트 목록 로드", async ({ page }) => {
    await page.goto("/courts");
    await page.waitForTimeout(1000);
    expect(await page.locator("body").textContent()).toContain("피클볼장");
  });

  test("피클볼장 API", async ({ request }) => {
    const res = await request.get("/api/venues");
    expect(res.ok()).toBeTruthy();
  });
});
