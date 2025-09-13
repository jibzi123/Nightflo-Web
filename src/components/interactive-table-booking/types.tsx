export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  capacity: number;
  status: "available" | "reserved" | "occupied";
  rotation: number;
  category: "standard" | "vip" | "premium";
  specialFeatures: string;
}

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

export interface Floor {
  id: string;
  name: string;
  // old
  backgroundImage?: string;
  tables?: Table[];
  pointsOfInterest?: PointOfInterest[];
  // from api
  club?: Club;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
export interface Club {
  id: string;
  name: string;
  // add more fields if needed
}

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
