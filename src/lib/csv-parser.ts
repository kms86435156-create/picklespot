// Lightweight CSV parser — no external dependencies
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0].trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || "").trim(); });
    rows.push(row);
  }
  return rows;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

// Generate a simple ID
export function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Generate slug from Korean/English text
export function genSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6);
}
