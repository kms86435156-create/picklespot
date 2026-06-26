/**
 * 한국 이름 마스킹 — 개인정보 보호
 * 3글자: 송*헌, 2글자: 김*, 4글자+: 송**헌
 * 영문/닉네임: 첫 2글자 + **
 */
export function maskName(name: string | null | undefined): string {
  if (!name || name.trim() === "") return "익명";

  const trimmed = name.trim();

  // 한글 이름 (2~4글자)
  if (/^[가-힣]{2,4}$/.test(trimmed)) {
    if (trimmed.length === 2) {
      return trimmed[0] + "*";
    }
    if (trimmed.length === 3) {
      return trimmed[0] + "*" + trimmed[2];
    }
    // 4글자
    return trimmed[0] + "**" + trimmed[trimmed.length - 1];
  }

  // 그 외 (영문, 닉네임 등)
  if (trimmed.length <= 2) return trimmed[0] + "*";
  return trimmed.slice(0, 2) + "*".repeat(Math.min(trimmed.length - 2, 3));
}
