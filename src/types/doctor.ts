export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  experience: number;
  fee: number;
  rating: number;
  reviewCount: number;
  gender: "male" | "female";
  languages: string[];
  available: boolean;
  nextSlot: string;
  bio: string;
  avatar: string;
}
