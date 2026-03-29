// Shared types for API responses — replaces mock data types

export interface VenueListItem {
  id: string;
  name: string;
  slug: string;
  addressRoad: string;
  regionDepth1: string;
  regionDepth2: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  isVerified: boolean;
  lastVerifiedAt: string | null;
  sourcePrimary: string;
  facility: {
    indoorOutdoor: string;
    parking: boolean;
    shower: boolean;
    lighting: boolean;
    rentalEquipment: boolean;
    courtCount: number;
    floorType: string;
  } | null;
  pricing: { amount: number; unit: string; note: string }[];
  rating?: number;
  reviewCount?: number;
}

export interface VenueDetail extends VenueListItem {
  description: string;
  website: string;
  category: string;
  hours: { dayOfWeek: number; openTime: string; closeTime: string }[];
  images: { imageUrl: string; source: string }[];
  sourceUrls: string[];
}

export interface TournamentListItem {
  id: string;
  title: string;
  organizer: string;
  region: string;
  venueName: string;
  startDate: string | null;
  endDate: string | null;
  registrationCloseAt: string | null;
  fee: number;
  feeText: string;
  divisions: string;
  level: string;
  status: string;
  detailUrl: string;
  sourcePrimary: string;
  lastVerifiedAt: string | null;
}

export interface CoachListItem {
  id: string;
  name: string;
  region: string;
  lessonType: string;
  specialties: string;
  priceText: string;
  bio: string;
  experience: string;
  sourcePrimary: string;
  lastVerifiedAt: string | null;
}
