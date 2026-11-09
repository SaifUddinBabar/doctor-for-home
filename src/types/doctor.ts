export interface Doctor {
  id: string | number;
  userId?: string;
  name: string;
  specialty: string;
  qualifications?: string;
  bmdcNumber?: string;
  location: string;
  hospital?: string;
  experience: number;
  fee: number;
  homeVisitFee?: number;
  rating: number;
  reviewCount: number;
  gender?: "male" | "female";
  languages?: string[];
  available?: boolean;
  nextSlot?: string;
  bio: string;
  avatar: string;
  verificationStatus?: string;
  availableDays?: string[];
  availableTimeSlots?: string[];
  slotDurationMinutes?: number;
  blockedDates?: string[];
  bookedSlots?: Record<string, string[]>;
}
