import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function getPublishedContents(): any[] {
  try {
    const p = path.join(DATA_DIR, "contents.json");
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8")).filter((c: any) => c.isPublished);
  } catch { return []; }
}

export function getContentBySlug(slug: string): any | null {
  return getPublishedContents().find((c: any) => c.slug === slug) || null;
}
