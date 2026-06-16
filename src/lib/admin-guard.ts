import "server-only";
import { getSession, AuthPayload } from "./auth";

/**
 * 관리자 권한 확인 — API Route / Server Action에서 사용
 * middleware가 1차 방어, 이 함수가 2차 방어
 */
export async function requireAdmin(): Promise<AuthPayload> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new AdminAuthError("관리자 권한이 필요합니다.");
  }
  return session;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * API Route에서 사용하는 래퍼 — 인증 실패 시 JSON 401 반환
 */
export async function withAdminGuard<T>(
  handler: (admin: AuthPayload) => Promise<T>
): Promise<T | Response> {
  try {
    const admin = await requireAdmin();
    return await handler(admin);
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return Response.json(
        { error: "unauthorized", message: err.message },
        { status: 401 }
      );
    }
    throw err;
  }
}
