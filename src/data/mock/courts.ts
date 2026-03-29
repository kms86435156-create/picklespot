export interface Court {
  id: string;
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  type: "indoor" | "outdoor" | "both";
  courtCount: number;
  surface: string;
  pricePerHour: number;
  priceWeekend?: number;
  amenities: string[];
  hasParking: boolean;
  hasShower: boolean;
  hasLighting: boolean;
  hasEquipmentRental: boolean;
  operatingHours: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  peakHours: string;
  description: string;
  photos: string[];
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  status: "available" | "booked" | "popular";
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export const courts: Court[] = [
  {
    id: "c1",
    name: "잠실 피클볼 파크",
    address: "서울 송파구 올림픽로 424",
    region: "서울",
    lat: 37.5145,
    lng: 127.0729,
    type: "indoor",
    courtCount: 8,
    surface: "폴리우레탄",
    pricePerHour: 20000,
    priceWeekend: 25000,
    amenities: ["주차", "샤워실", "장비대여", "음수대", "탈의실", "카페"],
    hasParking: true,
    hasShower: true,
    hasLighting: true,
    hasEquipmentRental: true,
    operatingHours: "06:00~22:00",
    rating: 4.6,
    reviewCount: 124,
    reviews: [
      { author: "김민수", rating: 5, text: "코트 상태 최고입니다. 바닥도 깨끗하고 넓어요.", date: "2026-03-20" },
      { author: "박서연", rating: 4, text: "위치가 좋고 시설 관리가 잘 되어있어요. 주차가 좀 혼잡합니다.", date: "2026-03-15" },
      { author: "이준혁", rating: 5, text: "패들 대여도 되고 샤워 시설도 깔끔. 자주 옵니다.", date: "2026-03-10" },
    ],
    peakHours: "08~10시, 17~20시",
    description: "올림픽공원 내 위치한 서울 최대 규모 실내 피클볼장. 8면 전용 코트와 프로숍을 갖추고 있습니다. 초보자 레슨 프로그램 상시 운영.",
    photos: [],
    availableSlots: [
      { time: "06:00", status: "available" }, { time: "07:00", status: "available" },
      { time: "08:00", status: "popular" }, { time: "09:00", status: "booked" },
      { time: "10:00", status: "booked" }, { time: "11:00", status: "available" },
      { time: "12:00", status: "available" }, { time: "13:00", status: "popular" },
      { time: "14:00", status: "booked" }, { time: "15:00", status: "available" },
      { time: "16:00", status: "available" }, { time: "17:00", status: "popular" },
      { time: "18:00", status: "booked" }, { time: "19:00", status: "booked" },
      { time: "20:00", status: "booked" }, { time: "21:00", status: "available" },
    ],
  },
  {
    id: "c2",
    name: "판교 스포츠센터 피클볼장",
    address: "경기 성남시 분당구 판교역로 235",
    region: "경기",
    lat: 37.3947,
    lng: 127.1112,
    type: "indoor",
    courtCount: 6,
    surface: "아크릴",
    pricePerHour: 18000,
    priceWeekend: 22000,
    amenities: ["주차", "샤워실", "카페", "장비대여", "탈의실"],
    hasParking: true,
    hasShower: true,
    hasLighting: true,
    hasEquipmentRental: true,
    operatingHours: "07:00~22:00",
    rating: 4.4,
    reviewCount: 89,
    reviews: [
      { author: "최영진", rating: 4, text: "판교역에서 가까워서 퇴근 후 이용하기 좋아요.", date: "2026-03-18" },
      { author: "한소희", rating: 5, text: "카페도 있고 분위기 좋습니다. 코트 관리 잘 되어있어요.", date: "2026-03-12" },
    ],
    peakHours: "12~13시, 18~20시",
    description: "판교 테크노밸리 인근 실내 피클볼장. 직장인 퇴근 후 이용 많음. 1층 카페에서 대기 가능.",
    photos: [],
    availableSlots: [
      { time: "07:00", status: "available" }, { time: "08:00", status: "booked" },
      { time: "09:00", status: "booked" }, { time: "10:00", status: "available" },
      { time: "11:00", status: "available" }, { time: "12:00", status: "popular" },
      { time: "13:00", status: "available" }, { time: "14:00", status: "available" },
      { time: "15:00", status: "booked" }, { time: "16:00", status: "available" },
      { time: "17:00", status: "popular" }, { time: "18:00", status: "booked" },
      { time: "19:00", status: "booked" }, { time: "20:00", status: "available" },
      { time: "21:00", status: "available" },
    ],
  },
  {
    id: "c3",
    name: "해운대 피클볼 아레나",
    address: "부산 해운대구 해운대해변로 264",
    region: "부산",
    lat: 35.1587,
    lng: 129.1604,
    type: "both",
    courtCount: 10,
    surface: "콘크리트(실외) / 폴리우레탄(실내)",
    pricePerHour: 15000,
    amenities: ["주차", "샤워실", "조명", "음수대", "탈의실"],
    hasParking: true,
    hasShower: true,
    hasLighting: true,
    hasEquipmentRental: false,
    operatingHours: "06:00~21:00",
    rating: 4.7,
    reviewCount: 201,
    reviews: [
      { author: "정수현", rating: 5, text: "해변 근처라 분위기가 너무 좋아요. 실외 코트에서 바다바람 맞으며 치는 재미!", date: "2026-03-22" },
      { author: "오성호", rating: 5, text: "코트 10면이라 대기 없이 바로 칠 수 있어요.", date: "2026-03-17" },
      { author: "김영숙", rating: 4, text: "장비 대여가 안 되는 게 아쉽지만 시설은 최고.", date: "2026-03-05" },
    ],
    peakHours: "07~09시, 14~16시, 19~20시",
    description: "부산 최대 규모 피클볼장. 실내 6면 + 실외 4면. 해변 근처에 위치하여 관광과 운동을 동시에 즐길 수 있습니다.",
    photos: [],
    availableSlots: [
      { time: "06:00", status: "available" }, { time: "07:00", status: "popular" },
      { time: "08:00", status: "booked" }, { time: "09:00", status: "available" },
      { time: "10:00", status: "available" }, { time: "11:00", status: "available" },
      { time: "14:00", status: "popular" }, { time: "15:00", status: "available" },
      { time: "16:00", status: "booked" }, { time: "17:00", status: "booked" },
      { time: "18:00", status: "available" }, { time: "19:00", status: "popular" },
      { time: "20:00", status: "available" },
    ],
  },
  {
    id: "c4",
    name: "청라 피클볼 센터",
    address: "인천 서구 청라커낼로 102",
    region: "인천",
    lat: 37.5345,
    lng: 126.6408,
    type: "indoor",
    courtCount: 4,
    surface: "폴리우레탄",
    pricePerHour: 16000,
    amenities: ["주차", "장비대여", "탈의실"],
    hasParking: true,
    hasShower: false,
    hasLighting: true,
    hasEquipmentRental: true,
    operatingHours: "08:00~22:00",
    rating: 4.3,
    reviewCount: 56,
    reviews: [
      { author: "이정호", rating: 4, text: "동호회에서 정기적으로 이용 중. 가격이 합리적입니다.", date: "2026-03-19" },
    ],
    peakHours: "10~11시, 18~20시",
    description: "청라 국제도시 내 위치한 아담한 피클볼 센터. 4면이지만 관리가 잘 되어있고 가격이 합리적입니다.",
    photos: [],
    availableSlots: [
      { time: "08:00", status: "available" }, { time: "09:00", status: "available" },
      { time: "10:00", status: "popular" }, { time: "11:00", status: "available" },
      { time: "14:00", status: "available" }, { time: "15:00", status: "booked" },
      { time: "16:00", status: "booked" }, { time: "17:00", status: "available" },
      { time: "18:00", status: "popular" }, { time: "19:00", status: "booked" },
      { time: "20:00", status: "available" }, { time: "21:00", status: "available" },
    ],
  },
  {
    id: "c5",
    name: "광교 피클볼장",
    address: "경기 수원시 영통구 광교중앙로 145",
    region: "경기",
    lat: 37.2866,
    lng: 127.0551,
    type: "outdoor",
    courtCount: 4,
    surface: "아크릴",
    pricePerHour: 12000,
    amenities: ["주차", "조명", "음수대"],
    hasParking: true,
    hasShower: false,
    hasLighting: true,
    hasEquipmentRental: false,
    operatingHours: "06:00~21:00",
    rating: 4.1,
    reviewCount: 43,
    reviews: [
      { author: "한소희", rating: 4, text: "야외라 날씨 좋은 날 최고예요. 가격도 저렴합니다.", date: "2026-03-14" },
      { author: "윤정민", rating: 3, text: "비 오면 못 치는 게 아쉬워요. 조명은 밝습니다.", date: "2026-03-08" },
    ],
    peakHours: "08~10시, 15~18시",
    description: "광교호수공원 인근 야외 피클볼장. 자연 속에서 운동할 수 있는 분위기. 가격이 저렴해 부담 없이 이용 가능.",
    photos: [],
    availableSlots: [
      { time: "06:00", status: "available" }, { time: "07:00", status: "available" },
      { time: "08:00", status: "popular" }, { time: "09:00", status: "available" },
      { time: "10:00", status: "available" }, { time: "14:00", status: "available" },
      { time: "15:00", status: "popular" }, { time: "16:00", status: "booked" },
      { time: "17:00", status: "booked" }, { time: "18:00", status: "popular" },
      { time: "19:00", status: "available" }, { time: "20:00", status: "available" },
    ],
  },
  {
    id: "c6",
    name: "강남 피클볼 아레나",
    address: "서울 강남구 테헤란로 152",
    region: "서울",
    lat: 37.5005,
    lng: 127.0365,
    type: "indoor",
    courtCount: 6,
    surface: "폴리우레탄",
    pricePerHour: 25000,
    priceWeekend: 30000,
    amenities: ["주차", "샤워실", "장비대여", "탈의실", "카페", "프로숍"],
    hasParking: true,
    hasShower: true,
    hasLighting: true,
    hasEquipmentRental: true,
    operatingHours: "06:00~23:00",
    rating: 4.8,
    reviewCount: 187,
    reviews: [
      { author: "윤정민", rating: 5, text: "강남 한복판에서 이런 시설을 만나다니. 프로숍도 있어서 장비 구경도 가능.", date: "2026-03-25" },
      { author: "강태호", rating: 5, text: "코트 바닥 상태 최상급. 대회 연습하기 딱 좋습니다.", date: "2026-03-20" },
    ],
    peakHours: "07~09시, 19~22시",
    description: "강남역 도보 5분 거리 프리미엄 실내 피클볼장. 프로숍, 카페 병설. 야간 영업(~23시)으로 직장인에게 인기.",
    photos: [],
    availableSlots: [
      { time: "06:00", status: "available" }, { time: "07:00", status: "popular" },
      { time: "08:00", status: "booked" }, { time: "09:00", status: "booked" },
      { time: "10:00", status: "available" }, { time: "11:00", status: "available" },
      { time: "12:00", status: "available" }, { time: "13:00", status: "available" },
      { time: "14:00", status: "available" }, { time: "15:00", status: "available" },
      { time: "16:00", status: "popular" }, { time: "17:00", status: "popular" },
      { time: "18:00", status: "booked" }, { time: "19:00", status: "booked" },
      { time: "20:00", status: "booked" }, { time: "21:00", status: "popular" },
      { time: "22:00", status: "available" },
    ],
  },
];
