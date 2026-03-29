import { collectNaverLocal } from "./naver-local";
import { collectKakaoLocal } from "./kakao-local";
import { collectPublicData } from "./public-data";

export interface CollectorResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  logs: string[];
}

export async function runCollector(source: string, jobId: string): Promise<CollectorResult> {
  switch (source) {
    case "naver-local":
      return collectNaverLocal(jobId);
    case "kakao-local":
      return collectKakaoLocal(jobId);
    case "public-data":
      return collectPublicData(jobId);
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}
