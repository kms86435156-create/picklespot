export interface Coach {
  id: string;
  name: string;
  region: string;
  level: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  pricePerSession: number;
  sessionDuration: string;
  lessonType: string[];
  bio: string;
  experience: string;
}

export const coaches: Coach[] = [
  {
    id: "co1",
    name: "김태완 코치",
    region: "서울 강남",
    level: "Pro",
    specialties: ["서브", "드롭샷", "전략"],
    rating: 4.9,
    reviewCount: 67,
    pricePerSession: 80000,
    sessionDuration: "60분",
    lessonType: ["개인", "그룹(2~4인)"],
    bio: "전 국가대표 선수 출신. 초보부터 대회 준비까지 체계적으로 지도합니다.",
    experience: "지도 경력 8년",
  },
  {
    id: "co2",
    name: "박지은 코치",
    region: "경기 분당",
    level: "A+",
    specialties: ["기초", "풋워크", "초보 지도"],
    rating: 4.8,
    reviewCount: 45,
    pricePerSession: 60000,
    sessionDuration: "60분",
    lessonType: ["개인", "그룹(2~6인)"],
    bio: "처음 시작하는 분들도 편안하게 배울 수 있도록 도와드립니다.",
    experience: "지도 경력 5년",
  },
  {
    id: "co3",
    name: "이성민 코치",
    region: "부산 해운대",
    level: "Pro",
    specialties: ["복식 전략", "파워 플레이", "멘탈"],
    rating: 4.7,
    reviewCount: 38,
    pricePerSession: 70000,
    sessionDuration: "90분",
    lessonType: ["개인", "그룹(2~4인)"],
    bio: "복식 전문 코치. 대회 입상을 목표로 하는 분들에게 추천합니다.",
    experience: "지도 경력 6년",
  },
  {
    id: "co4",
    name: "정수현 코치",
    region: "인천 청라",
    level: "A",
    specialties: ["기초", "체력", "시니어 지도"],
    rating: 4.6,
    reviewCount: 29,
    pricePerSession: 50000,
    sessionDuration: "60분",
    lessonType: ["개인", "그룹(3~6인)"],
    bio: "50~60대 시니어 전문 레슨. 부상 예방과 즐거운 운동을 동시에.",
    experience: "지도 경력 4년",
  },
  {
    id: "co5",
    name: "최민호 코치",
    region: "대전 유성",
    level: "A+",
    specialties: ["서브", "리턴", "중급 레벨업"],
    rating: 4.5,
    reviewCount: 22,
    pricePerSession: 55000,
    sessionDuration: "60분",
    lessonType: ["개인"],
    bio: "C에서 B로 올라가고 싶은 분들을 위한 맞춤 레슨.",
    experience: "지도 경력 3년",
  },
];
