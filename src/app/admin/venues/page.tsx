"use client";
import AdminDataManager from "@/components/admin/AdminDataManager";
import type { FieldDef } from "@/components/admin/AdminDataManager";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
].map(r => ({ value: r, label: r }));

const fields: FieldDef[] = [
  { key: "name", label: "장소명", required: true, listVisible: true, width: "180px", csvExample: "잠실 피클볼 아레나" },
  { key: "address", label: "주소", listVisible: true, placeholder: "OO시 OO구 OO동 123", csvExample: "서울시 송파구 잠실동 10" },
  { key: "roadAddress", label: "도로명주소", placeholder: "OO로 123", csvExample: "올림픽로 25" },
  { key: "region", label: "지역", type: "select", options: REGIONS, listVisible: true, sticky: true, csvExample: "서울" },
  { key: "phone", label: "전화번호", listVisible: true, placeholder: "02-000-0000", csvExample: "02-1234-5678" },
  { key: "operatingHours", label: "운영시간", placeholder: "06:00~22:00", listVisible: true, csvExample: "06:00~22:00" },
  { key: "courtCount", label: "코트 수", type: "number", listVisible: true, csvExample: "6" },
  { key: "indoorOutdoor", label: "실내/실외", type: "select", listVisible: true,
    options: [
      { value: "실내", label: "실내" },
      { value: "실외", label: "실외" },
      { value: "실내+실외", label: "실내+실외" },
    ], csvExample: "실내",
  },
  { key: "parkingAvailable", label: "주차 가능", type: "boolean", placeholder: "주차 가능", csvExample: "O" },
  { key: "description", label: "설명", type: "textarea", csvExample: "6면 코트 운영, 장비 대여 가능" },
  { key: "mapLink", label: "지도 링크", placeholder: "https://naver.me/...", csvExample: "" },
  { key: "isFeatured", label: "추천 노출", type: "boolean", placeholder: "메인 페이지에 노출" },
];

export default function AdminVenuesPage() {
  return (
    <AdminDataManager
      title="장소 관리"
      entityName="venues"
      apiPath="/api/admin/venues"
      csvTemplateHeaders="이름,주소,도로명주소,지역,전화,운영시간,코트수,실내외,주차,설명,지도링크,추천"
      fields={fields}
    />
  );
}
