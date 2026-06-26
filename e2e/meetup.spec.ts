import { test, expect } from "@playwright/test";
import { createUserToken } from "./helpers";

test.describe("같이치기/번개모임", () => {
  test("번개 목록 로드", async ({ page }) => {
    await page.goto("/matches");
    await page.waitForTimeout(1000);
    const text = await page.locator("body").textContent() || "";
    expect(text.includes("번개") || text.includes("같이")).toBeTruthy();
  });

  test("번개 만들기 링크 존재", async ({ page }) => {
    await page.goto("/matches");
    await expect(page.locator('a[href="/matches/create"]').first()).toBeVisible({ timeout: 10000 });
  });

  test("번개 생성 API", async ({ page, context }) => {
    const token = await createUserToken();
    await context.addCookies([{ name: "user_token", value: token, domain: "localhost", path: "/" }]);
    const res = await page.request.post("/api/meetups", {
      data: {
        title: "E2E 테스트 번개",
        date: "2026-12-15",
        startTime: "09:00",
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

  test("번개 참가 API", async ({ page, context }) => {
    const token = await createUserToken();
    await context.addCookies([{ name: "user_token", value: token, domain: "localhost", path: "/" }]);

    // 먼저 번개 생성
    const createRes = await page.request.post("/api/meetups", {
      data: { title: "참가테스트", date: "2026-12-20", startTime: "10:00", region: "서울", maxPlayers: 4 },
    });
    expect(createRes.ok()).toBeTruthy();
    const { meetup } = await createRes.json();

    // 참가 신청 (호스트와 같은 유저이므로 참가 또는 중복 에러)
    const joinRes = await page.request.post(`/api/meetups/${meetup.id}/join`, {
      data: { participantName: "참가자1", participantPhone: "010-1111-1111" },
    });
    expect([200, 409]).toContain(joinRes.status());
  });

  test("중복 참가 차단", async ({ page, context }) => {
    const token = await createUserToken();
    await context.addCookies([{ name: "user_token", value: token, domain: "localhost", path: "/" }]);

    const createRes = await page.request.post("/api/meetups", {
      data: { title: "중복테스트", date: "2026-12-21", startTime: "10:00", region: "서울", maxPlayers: 4 },
    });
    expect(createRes.ok()).toBeTruthy();
    const { meetup } = await createRes.json();

    // 같은 유저가 두 번 참가 → 두 번째는 409
    await page.request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "A" } });
    const dup = await page.request.post(`/api/meetups/${meetup.id}/join`, { data: { participantName: "A" } });
    expect(dup.status()).toBe(409);
  });

  test("waitlist 동작", async ({ page, context }) => {
    const token = await createUserToken();
    await context.addCookies([{ name: "user_token", value: token, domain: "localhost", path: "/" }]);

    // maxPlayers=1 → 생성 시 currentPlayers=1 (호스트) → 다음 참가자는 waitlist
    const createRes = await page.request.post("/api/meetups", {
      data: { title: "대기테스트", date: "2026-12-22", startTime: "10:00", region: "서울", maxPlayers: 1 },
    });
    expect(createRes.ok()).toBeTruthy();
    const { meetup } = await createRes.json();

    const wait = await page.request.post(`/api/meetups/${meetup.id}/join`, {
      data: { participantName: "P1" },
    });
    // 정원 초과 → waitlisted 또는 호스트와 동일 유저면 409
    if (wait.ok()) {
      const data = await wait.json();
      expect(data.waitlisted).toBe(true);
    } else {
      expect(wait.status()).toBe(409);
    }
  });

  test("존재하지 않는 번개 상세 → 404", async ({ request }) => {
    const res = await request.get("/api/meetups/nonexistent");
    expect(res.status()).toBe(404);
  });
});
