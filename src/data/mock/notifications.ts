export type NotificationType =
  | "tournament_registered"   // 대회 신청 완료
  | "court_reserved"          // 코트 예약 완료
  | "schedule_reminder"       // 일정 하루 전 리마인드
  | "deadline_approaching"    // 마감 임박
  | "partner_accepted"        // 파트너 수락
  | "location_changed"        // 장소 변경
  | "cancellation"            // 취소 완료
  | "refund_processed"        // 환불 처리 결과
  | "flash_filled"            // 번개 모집 완료
  | "flash_joined"            // 번개 참가 확정
  | "result_recorded";        // 경기 결과 기록

export type NotificationPriority = "high" | "normal" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
  meta?: Record<string, string>;
}

export interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  types: NotificationType[];
  enabled: boolean;
  channel: "kakao" | "push" | "both";
}

// 알림 설정 카테고리 (유형별 수신 제어)
export const notificationCategories: NotificationCategory[] = [
  {
    id: "booking",
    label: "예약 · 신청",
    description: "대회 신청, 코트 예약, 번개 참가 확정 알림",
    types: ["tournament_registered", "court_reserved", "flash_joined"],
    enabled: true,
    channel: "both",
  },
  {
    id: "reminder",
    label: "일정 리마인드",
    description: "대회, 예약, 번개 하루 전 알림",
    types: ["schedule_reminder"],
    enabled: true,
    channel: "both",
  },
  {
    id: "deadline",
    label: "마감 임박",
    description: "관심 대회 마감 임박 시 알림",
    types: ["deadline_approaching"],
    enabled: true,
    channel: "kakao",
  },
  {
    id: "partner",
    label: "파트너 · 매칭",
    description: "파트너 초대 수락, 번개 모집 완료 알림",
    types: ["partner_accepted", "flash_filled"],
    enabled: true,
    channel: "push",
  },
  {
    id: "changes",
    label: "변경 · 취소",
    description: "장소 변경, 취소, 환불 처리 결과 알림",
    types: ["location_changed", "cancellation", "refund_processed"],
    enabled: true,
    channel: "both",
  },
  {
    id: "activity",
    label: "활동 기록",
    description: "경기 결과 기록 알림",
    types: ["result_recorded"],
    enabled: false,
    channel: "push",
  },
];

// 알림 타입별 메타 정보
export const notificationMeta: Record<NotificationType, { icon: string; color: string; categoryLabel: string }> = {
  tournament_registered: { icon: "🏆", color: "text-brand-cyan", categoryLabel: "대회" },
  court_reserved:        { icon: "📍", color: "text-brand-cyan", categoryLabel: "코트" },
  schedule_reminder:     { icon: "⏰", color: "text-yellow-400", categoryLabel: "리마인드" },
  deadline_approaching:  { icon: "🔥", color: "text-brand-red", categoryLabel: "마감임박" },
  partner_accepted:      { icon: "🤝", color: "text-green-400", categoryLabel: "파트너" },
  location_changed:      { icon: "📢", color: "text-yellow-400", categoryLabel: "변경" },
  cancellation:          { icon: "❌", color: "text-brand-red", categoryLabel: "취소" },
  refund_processed:      { icon: "💰", color: "text-brand-cyan", categoryLabel: "환불" },
  flash_filled:          { icon: "⚡", color: "text-brand-cyan", categoryLabel: "번개" },
  flash_joined:          { icon: "✅", color: "text-green-400", categoryLabel: "번개" },
  result_recorded:       { icon: "📊", color: "text-brand-cyan", categoryLabel: "기록" },
};

// Mock 알림 히스토리
export const mockNotifications: Notification[] = [
  {
    id: "noti-1",
    type: "schedule_reminder",
    priority: "high",
    title: "내일 번개 모임이 있습니다",
    message: "잠실 주말 오전 가볍게 한 판 · 내일 09:00 · 잠실 피클볼 파크",
    timestamp: "2026-03-29T18:00",
    read: false,
    actionUrl: "/play-together/fg1",
    actionLabel: "상세 보기",
    relatedId: "fg1",
    meta: { time: "2026-03-30 09:00", location: "잠실 피클볼 파크" },
  },
  {
    id: "noti-2",
    type: "tournament_registered",
    priority: "normal",
    title: "대회 신청이 완료되었습니다",
    message: "2026 전국 피클볼 오픈 · 2026-04-19 · 서울 올림픽공원 체육관 · 참가비 ₩50,000 결제 완료",
    timestamp: "2026-03-28T14:30",
    read: false,
    actionUrl: "/tournaments/t1",
    actionLabel: "대회 상세",
    relatedId: "t1",
    meta: { fee: "₩50,000", date: "2026-04-19" },
  },
  {
    id: "noti-3",
    type: "court_reserved",
    priority: "normal",
    title: "코트 예약이 확정되었습니다",
    message: "청라 피클볼 센터 · 2026-03-31 18:00~19:00 · ₩16,000 결제 완료",
    timestamp: "2026-03-28T10:15",
    read: true,
    actionUrl: "/courts/c4",
    actionLabel: "예약 확인",
    relatedId: "c4",
    meta: { time: "18:00~19:00", fee: "₩16,000" },
  },
  {
    id: "noti-4",
    type: "deadline_approaching",
    priority: "high",
    title: "부산 해운대컵 마감 임박!",
    message: "잔여 2자리 · 신청 마감 2026-04-23 · 서둘러 신청하세요",
    timestamp: "2026-03-27T09:00",
    read: true,
    actionUrl: "/tournaments/t2",
    actionLabel: "신청하기",
    relatedId: "t2",
  },
  {
    id: "noti-5",
    type: "partner_accepted",
    priority: "normal",
    title: "파트너 초대가 수락되었습니다",
    message: "김민수님이 '2026 전국 피클볼 오픈' 복식 파트너 초대를 수락했습니다",
    timestamp: "2026-03-26T16:45",
    read: true,
    actionUrl: "/tournaments/t1",
    actionLabel: "대회 상세",
  },
  {
    id: "noti-6",
    type: "flash_filled",
    priority: "normal",
    title: "번개 모집이 완료되었습니다",
    message: "일산 호수공원 아침 운동 · 4/4명 모집 완료 · 2026-03-30 07:00",
    timestamp: "2026-03-27T20:30",
    read: true,
    actionUrl: "/play-together/fg4",
    actionLabel: "상세 보기",
    relatedId: "fg4",
  },
  {
    id: "noti-7",
    type: "location_changed",
    priority: "high",
    title: "모임 장소가 변경되었습니다",
    message: "강남 금요 퇴근 후 번개 · 장소: 강남 피클볼 아레나 → 판교 스포츠센터 (주최자 변경)",
    timestamp: "2026-03-25T11:00",
    read: true,
    actionUrl: "/play-together/fg7",
    actionLabel: "확인하기",
  },
  {
    id: "noti-8",
    type: "refund_processed",
    priority: "normal",
    title: "환불이 완료되었습니다",
    message: "수원 광교 스프링 오픈 · ₩45,000 전액 환불 · 3~5영업일 내 입금 예정",
    timestamp: "2026-03-24T15:20",
    read: true,
    actionUrl: "/mypage",
    actionLabel: "내역 확인",
    meta: { refundAmount: "₩45,000" },
  },
  {
    id: "noti-9",
    type: "schedule_reminder",
    priority: "high",
    title: "내일 코트 예약이 있습니다",
    message: "청라 피클볼 센터 · 내일 18:00~19:00",
    timestamp: "2026-03-30T18:00",
    read: false,
    actionUrl: "/courts/c4",
    actionLabel: "확인하기",
  },
  {
    id: "noti-10",
    type: "cancellation",
    priority: "normal",
    title: "대회 신청이 취소되었습니다",
    message: "수원 광교 스프링 오픈 · 본인 요청으로 취소 · 환불 진행 예정",
    timestamp: "2026-03-23T09:00",
    read: true,
    actionUrl: "/mypage",
    actionLabel: "내역 확인",
  },
];
