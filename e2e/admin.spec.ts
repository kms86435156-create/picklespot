import { test, expect } from "@playwright/test";

test.describe("관리자 API", () => {
  test("대시보드 API", async ({ request }) => { expect((await request.get("/api/admin/dashboard")).ok()).toBeTruthy(); });
  test("대회 관리 API", async ({ request }) => { expect((await request.get("/api/admin/tournaments")).ok()).toBeTruthy(); });
  test("장소 관리 API", async ({ request }) => { expect((await request.get("/api/admin/venues")).ok()).toBeTruthy(); });
  test("동호회 관리 API", async ({ request }) => { expect((await request.get("/api/admin/clubs")).ok()).toBeTruthy(); });
  test("접수 관리 API", async ({ request }) => { expect((await request.get("/api/admin/registrations")).ok()).toBeTruthy(); });
  test("번개모임 관리 API", async ({ request }) => { expect((await request.get("/api/admin/meetups")).ok()).toBeTruthy(); });
  test("예약 요청 관리 API", async ({ request }) => { expect((await request.get("/api/admin/booking-requests")).ok()).toBeTruthy(); });
  test("리드 생성 API", async ({ request }) => {
    const res = await request.post("/api/leads", { data: { contactName: "Admin", clubName: "Test", region: "서울", phone: "010-0000-0000" } });
    expect(res.ok()).toBeTruthy();
  });
});
