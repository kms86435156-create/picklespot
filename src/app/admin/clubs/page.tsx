"use client";
import AdminDataManager from "@/components/admin/AdminDataManager";
import type { FieldDef } from "@/components/admin/AdminDataManager";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
].map(r => ({ value: r, label: r }));

const fields: FieldDef[] = [
  { key: "name", label: "동호회명", required: true, listVisible: true, width: "150px", csvExample: "강남피클러스" },
  { key: "region", label: "지역", type: "select", options: REGIONS, listVisible: true, sticky: true, csvExample: "서울" },
  { key: "homeVenue", label: "활동 장소", listVisible: true, placeholder: "OO체육관", csvExample: "강남 피클볼 센터" },
  { key: "contactName", label: "담당자", listVisible: true, csvExample: "김회장" },
  { key: "contactPhoneOrKakao", label: "연락처 (전화/카톡)", listVisible: true, placeholder: "010-0000-0000 또는 카톡ID", csvExample: "010-9876-5432" },
  { key: "memberCount", label: "회원 수", type: "number", listVisible: true, csvExample: "35" },
  { key: "joinMethod", label: "가입 방법", placeholder: "카톡 문의 / 현장 방문 등", csvExample: "카카오톡 오픈채팅 문의" },
  { key: "externalLink", label: "외부 링크", placeholder: "카페/블로그/오픈채팅 URL", csvExample: "https://cafe.naver.com/pickle123" },
  { key: "description", label: "동호회 소개", type: "textarea", csvExample: "매주 토/일 오전 활동하는 피클볼 동호회입니다." },
  { key: "isFeatured", label: "추천 노출", type: "boolean", placeholder: "메인 페이지에 노출" },
];

export default function AdminClubsPage() {
  return (
    <AdminDataManager
      title="동호회 관리"
      entityName="clubs"
      apiPath="/api/admin/clubs"
      csvTemplateHeaders="동호회명,지역,활동장소,담당자,연락처,회원수,가입방법,외부링크,소개,추천"
      fields={fields}
    />
  );
}
