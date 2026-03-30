"use client";
import AdminDataManager from "@/components/admin/AdminDataManager";
import type { FieldDef } from "@/components/admin/AdminDataManager";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
].map(r => ({ value: r, label: r }));

const fields: FieldDef[] = [
  { key: "title", label: "대회명", required: true, listVisible: true, width: "200px", csvExample: "제1회 서울 오픈 피클볼 대회" },
  { key: "startDate", label: "시작일", type: "date", listVisible: true, csvExample: "2026-05-10" },
  { key: "endDate", label: "종료일", type: "date", csvExample: "2026-05-11" },
  { key: "registrationDeadline", label: "접수마감", type: "date", listVisible: true, csvExample: "2026-05-03" },
  { key: "venueName", label: "장소", listVisible: true, placeholder: "OO체육관", csvExample: "잠실실내체육관" },
  { key: "region", label: "지역", type: "select", options: REGIONS, listVisible: true, sticky: true, csvExample: "서울" },
  { key: "organizerName", label: "주최/주관", listVisible: true, sticky: true, placeholder: "OO피클볼협회", csvExample: "서울시피클볼연합" },
  { key: "organizerContact", label: "주최 연락처", placeholder: "010-0000-0000", csvExample: "010-1234-5678" },
  { key: "entryFee", label: "참가비 (원)", type: "number", placeholder: "30000", csvExample: "30000" },
  { key: "eventTypes", label: "종별", placeholder: "남복, 여복, 혼복", listVisible: true, csvExample: "남복, 여복, 혼복" },
  { key: "maxParticipants", label: "정원", type: "number", placeholder: "64", csvExample: "64" },
  { key: "currentParticipants", label: "현재 인원", type: "number", defaultValue: "0" },
  { key: "status", label: "상태", type: "select", listVisible: true, defaultValue: "draft",
    options: [
      { value: "draft", label: "임시저장" },
      { value: "open", label: "접수중" },
      { value: "closed", label: "접수마감" },
      { value: "cancelled", label: "취소" },
    ], csvExample: "open",
  },
  { key: "description", label: "상세 설명", type: "textarea", csvExample: "전국 피클볼 동호인 대상 오픈 대회입니다." },
  { key: "sourceUrl", label: "출처 URL", placeholder: "https://...", csvExample: "" },
  { key: "isFeatured", label: "추천 노출", type: "boolean", placeholder: "메인 페이지에 노출", defaultValue: "" },
];

export default function AdminTournamentsPage() {
  return (
    <AdminDataManager
      title="대회 관리"
      entityName="tournaments"
      apiPath="/api/admin/tournaments"
      csvTemplateHeaders="대회명,시작일,종료일,접수마감,장소,지역,주최,주최연락처,참가비,종별,정원,현재인원,상태,설명,출처URL,추천"
      fields={fields}
    />
  );
}
