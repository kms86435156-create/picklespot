/**
 * CSV 업로드 validation — 행별 오류/경고 반환
 */

interface ValidationResult {
  valid: any[];
  errors: { row: number; field: string; message: string }[];
  warnings: { row: number; field: string; message: string }[];
  duplicates: { row: number; field: string; value: string }[];
}

interface FieldRule {
  csvKeys: string[];      // CSV 헤더에서 매칭할 키들 (한글/영문)
  jsonKey: string;        // 내부 필드명
  required?: boolean;
  type?: "string" | "number" | "boolean";
  transform?: (v: string) => any;
}

export function validateCSVRows(
  rows: Record<string, string>[],
  rules: FieldRule[],
  existingItems: any[],
  dedupeField?: string,   // 중복 체크 필드 (e.g., "name")
): ValidationResult {
  const result: ValidationResult = { valid: [], errors: [], warnings: [], duplicates: [] };
  const seenValues = new Set<string>();

  // 기존 데이터에서 중복 체크용 값 수집
  const existingValues = new Set<string>();
  if (dedupeField) {
    existingItems.forEach(item => {
      const v = item[dedupeField];
      if (v) existingValues.add(String(v).toLowerCase().trim());
    });
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 헤더가 1행이므로 데이터는 2행부터
    const parsed: any = {};
    let hasError = false;

    rules.forEach(rule => {
      // CSV에서 값 찾기
      let value = "";
      for (const key of rule.csvKeys) {
        if (row[key] !== undefined && row[key] !== "") { value = row[key]; break; }
      }

      // 필수 필드 체크
      if (rule.required && !value.trim()) {
        result.errors.push({ row: rowNum, field: rule.jsonKey, message: `${rule.csvKeys[0]} 필드가 비어있습니다` });
        hasError = true;
        return;
      }

      // 타입 변환
      if (rule.transform) {
        parsed[rule.jsonKey] = rule.transform(value);
      } else if (rule.type === "number") {
        parsed[rule.jsonKey] = Number(value) || 0;
      } else if (rule.type === "boolean") {
        parsed[rule.jsonKey] = value.toLowerCase() === "true" || value === "O" || value === "o";
      } else {
        parsed[rule.jsonKey] = value.trim();
      }
    });

    // 중복 체크 (CSV 내부)
    if (dedupeField && parsed[dedupeField]) {
      const val = String(parsed[dedupeField]).toLowerCase().trim();
      if (seenValues.has(val)) {
        result.duplicates.push({ row: rowNum, field: dedupeField, value: parsed[dedupeField] });
      } else if (existingValues.has(val)) {
        result.duplicates.push({ row: rowNum, field: dedupeField, value: `${parsed[dedupeField]} (기존 데이터와 중복)` });
      }
      seenValues.add(val);
    }

    // 빈 행 경고
    const nonEmpty = Object.values(parsed).filter(v => v !== "" && v !== 0 && v !== false);
    if (nonEmpty.length <= 1) {
      result.warnings.push({ row: rowNum, field: "-", message: "대부분의 필드가 비어있습니다" });
    }

    if (!hasError) {
      result.valid.push(parsed);
    }
  });

  return result;
}
