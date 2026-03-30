import { test, expect } from "@playwright/test";

test.describe("같이치기/번개모임", () => {
  test("같이치기 목록 로드 (빈 데이터 = empty state)", async ({ page }) => {
    await page.goto("/play-together");
    await page.waitForTimeout(1000);
    const text = await page.locator("body").textContent() || "";
    expect(text.includes("같이") || text.includes("번개")).toBeTruthy();
  });

  test("번개 만들기 버튼 → 모달 열림", async ({ page }) => {
    await page.goto("/play-together");
    await page.waitForTimeout(1000);
    // 버튼 클릭 (모바일에서는 "만들기", 데스크톱에서는 "번개 만들기")
    const btn = page.locator('button:has-text("만들기")').first();
    await btn.click();
    await expect(page.locator('input[type="date"]')).toBeVisible({ timeout: 5000 });
  });

  test("번개 생성 API", async ({ request }) => {
    const res = await request.post("/api/meetups", {
      data: {
        title: "E2E 테스트 번개",
        hostName: "테스트주최자",
        hostPhone: "010-1111-2222",
        meetupDate: "2026-04-15",
        meetupTime: "09:00",
        region: "서울",
        maxPlayers: 4,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.meetup.id).toBeTruthy();
  });

  test("번개 목록 API", async ({ request }) => {
    const res = await request.get("/api/meetups");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.meetups).toBeDefined();
  });

  test("번개 참가 API", async ({ request }) => {
    // 먼저 번개 생성
    const createRes = await request.post("/api/meetups", {
      data: { title: "참가테스트", hostName: "호스트", hostPhone: "010-0000-0000", meetupDate: "2026-04-20", meetupTime: "10:00", maxPlayers: 4 },
    });
    const { meetup } = await createRes.json();

    // 참가 신청
    const joinRes = await request.post(`/api/meetups/${meetup.id}/join`, {
      data: { participantName: "참가자1", participantPhone: "010-1111-1111" },
    });
    expect(joinRes.ok()).toBeTruthy();
    const joinData = await joinRes.json();
    expect(joinData.success).toBe(true);
    expect(joinData.participant.status).toBe("joined");
  });

  test("중복 참가 차단", async ({ request }) => {
    const createRes = await request.post("/api/meetups", {
      data: { title: "중복테스트", hostName: "호스트", hostPhone: "010-0000-0000", meetupDate: "2026-04-21", meetupTime: "10:00", maxPlayers: 4 },
    });
    const { meetup } = await createRes.json();
    const phone = `010-${Date.now() % 10000000}`;

    await request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "A", participantPhone: phone } });
    const dup = await request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "A", participantPhone: phone } });
    expect(dup.status()).toBe(409);
  });

  test("waitlist 동작", async ({ request }) => {
    const createRes = await request.post("/api/meetups", {
      data: { title: "대기테스트", hostName: "호스트", hostPhone: "010-0000-0000", meetupDate: "2026-04-22", meetupTime: "10:00", maxPlayers: 2 },
    });
    const { meetup } = await createRes.json();

    await request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "P1", participantPhone: "010-1111-0001" } });
    await request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "P2", participantPhone: "010-1111-0002" } });
    const wait = await request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "P3", participantPhone: "010-1111-0003" } });
    expect(wait.ok()).toBeTruthy();
    const data = await wait.json();
    expect(data.waitlisted).toBe(true);
  });

  test("존재하지 않는 번개 상세 → 404", async ({ request }) => {
    const res = await request.get("/api/meetups/nonexistent");
    expect(res.status()).toBe(404);
  });
});
