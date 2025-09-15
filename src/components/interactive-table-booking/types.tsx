// export interface Table {
//   id: string;
//   tableNumber: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   price: number;
//   capacity: number;
//   status: "available" | "reserved" | "occupied";
//   rotation: number;
//   tableType: "standard" | "vip" | "premium";
//   description: string;
// }

export interface PointOfInterest {
  id: string;
  name: string;
  type: "bar" | "stage" | "dj" | "entry" | "vip" | "restroom";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// export interface Floor {
//   id: string;
//   name: string;
//   // old
//   backgroundImage?: string;
//   tables?: Table[];
//   pointsOfInterest?: PointOfInterest[];
//   // from api
//   club?: Club;
//   status?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

export interface ClubHours {
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Reservation {
  id: string;
  customerName: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
}

///
// export interface Club {
//   id: string;
//   name: string;
//   // add more fields if needed
// }

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  club: Club;
  token: string;
  // add other properties from your JSON if needed
}

// Get Floor Response by club
export interface FloorsResponse {
  status: string;
  statusCode: number;
  payLoad: Floor[];
}

export interface Floor {
  name: string;
  club: Club | {};
  tables?: Table[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  backgroundImage?: string;
}

export interface Table {
  id?: string; // optional until saved
  club?: string;
  tableNumber: string;
  tableType: string;
  description: string[] | any;
  price: number;
  tableCount: number;
  capacity: number;
  status?: string;
  floor?: Floor | null;
  createdAt?: string;
  updatedAt?: string;
  bookingType?: string;

  // frontend-only fields
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  floorId?: string;
  clubId?: string;
}
interface Club {
  name: string;
  location: string;
  city: string;
  imageUrl: string;
  owner: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  subscribedPlan: string;
  currentTransactionId: string;
  subscriptionExpiryDate: string;
  subscriptionStartDate: string;
  closeTime: string;
  clubPhone: string;
  email: string;
  gallery: [string];
  officialPhone: string;
  openTime: string;
  id: string;
  isSubscriptionExpired: boolean;
  isPlanSubscribed: boolean;
  subscriptionDaysRemaining: number;
}
export interface ApiResponse<T> {
  statusCode: number;
  payLoad: T;
}
