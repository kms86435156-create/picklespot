import fs from "fs";
import path from "path";

const D = path.join(process.cwd(), "data");

// Court Resources — native 예약 가능한 코트만
const courtResources = [
  // 잠실 피클볼 파크 (v1) — 8면
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `cr-v1-${i + 1}`,
    venueId: "v1",
    name: `코트 ${i + 1}`,
    sportType: "pickleball",
    indoorOutdoor: "indoor",
    capacity: 4,
    surfaceType: "폴리우레탄",
    isActive: true,
  })),
  // 강남 피클볼 아레나 (v6) — 6면
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `cr-v6-${i + 1}`,
    venueId: "v6",
    name: `코트 ${i + 1}`,
    sportType: "pickleball",
    indoorOutdoor: "indoor",
    capacity: 4,
    surfaceType: "폴리우레탄",
    isActive: true,
  })),
];

// Business Hours — native venues only
const businessHours = [
  // 잠실 (v1): 06:00~22:00
  ...Array.from({ length: 7 }, (_, day) => ({
    id: `bh-v1-${day}`,
    venueId: "v1",
    dayOfWeek: day,
    openTime: "06:00",
    closeTime: "22:00",
    breakStart: null,
    breakEnd: null,
  })),
  // 강남 (v6): 06:00~23:00
  ...Array.from({ length: 7 }, (_, day) => ({
    id: `bh-v6-${day}`,
    venueId: "v6",
    dayOfWeek: day,
    openTime: "06:00",
    closeTime: "23:00",
    breakStart: null,
    breakEnd: null,
  })),
];

// Slot Inventory — generate for today + 7 days for native venues
function generateSlots(venueId: string, resources: any[], startHour: number, endHour: number, price: number) {
  const slots: any[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    for (const resource of resources.filter(r => r.venueId === venueId)) {
      for (let hour = startHour; hour < endHour; hour++) {
        const startAt = `${dateStr}T${String(hour).padStart(2, "0")}:00:00`;
        const endAt = `${dateStr}T${String(hour + 1).padStart(2, "0")}:00:00`;

        // 일부 슬롯을 booked로 (데모용)
        const isBooked = Math.random() < 0.2;

        slots.push({
          id: `slot-${resource.id}-${dateStr}-${hour}`,
          resourceId: resource.id,
          venueId,
          startAt,
          endAt,
          status: isBooked ? "booked" : "available",
          price,
          currency: "KRW",
          heldUntil: null,
          bookingId: isBooked ? `demo-booking-${Math.random().toString(36).slice(2, 6)}` : null,
        });
      }
    }
  }
  return slots;
}

const slotInventory = [
  ...generateSlots("v1", courtResources, 6, 22, 20000),
  ...generateSlots("v6", courtResources, 6, 23, 25000),
];

// Cancellation Policies
const cancellationPolicies = [
  { id: "cp-v1", venueId: "v1", freeHoursBefore: 24, partialRefundHoursBefore: 6, partialRefundPercent: 50, description: "24시간 전 무료 취소, 6시간 전까지 50% 환불, 이후 환불 불가" },
  { id: "cp-v6", venueId: "v6", freeHoursBefore: 12, partialRefundHoursBefore: 3, partialRefundPercent: 50, description: "12시간 전 무료 취소, 3시간 전까지 50% 환불, 이후 환불 불가" },
];

// Empty booking tables
const bookings: any[] = [];
const payments: any[] = [];
const bookingEvents: any[] = [];

fs.writeFileSync(path.join(D, "court-resources.json"), JSON.stringify(courtResources, null, 2));
fs.writeFileSync(path.join(D, "business-hours.json"), JSON.stringify(businessHours, null, 2));
fs.writeFileSync(path.join(D, "slot-inventory.json"), JSON.stringify(slotInventory, null, 2));
fs.writeFileSync(path.join(D, "cancellation-policies.json"), JSON.stringify(cancellationPolicies, null, 2));
fs.writeFileSync(path.join(D, "bookings.json"), JSON.stringify(bookings, null, 2));
fs.writeFileSync(path.join(D, "payments.json"), JSON.stringify(payments, null, 2));
fs.writeFileSync(path.join(D, "booking-events.json"), JSON.stringify(bookingEvents, null, 2));

console.log("Booking seed complete!");
console.log(`  court-resources: ${courtResources.length}`);
console.log(`  business-hours: ${businessHours.length}`);
console.log(`  slot-inventory: ${slotInventory.length}`);
console.log(`  cancellation-policies: ${cancellationPolicies.length}`);
