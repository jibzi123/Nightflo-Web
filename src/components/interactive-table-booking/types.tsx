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

export interface UnsavedChanges {
  pointsOfInterest: PointOfInterest[];
  boundaryWalls: Wall[];
}
export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  color: string;
  style?: "solid" | "dotted" | "dashed";
}
export interface PointOfInterest {
  id: string;
  name: string;
  type:
    | "main-bar"
    | "mini-bar"
    | "circular-bar"
    | "dj-booth"
    | "dancing-floor"
    | "front-desk"
    | "double-sofa"
    | "single-sofa"
    | "triple-sofa";
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
  payLoad: Floor;
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
  _id?: string; // optional until saved
  club?: string;
  tableNumber: string;
  tableType: string;
  description: string[] | any;
  price: number | string;
  tableCount: number;
  capacity: number | string;
  status?: string;
  floor?: Floor | null;
  createdAt?: string;
  updatedAt?: string;
  bookingType?: string;
  xAxis: string | number;
  yAxis: string | number;
  width: string | number;
  height: string | number;
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

export interface CardItem {
  type: string;
  label: string;
  width: number;
  height: number;
  icon: any;
}
export interface NewPoiData {
  name: string;
  type: PointOfInterest["type"];
  width: number | string;
  height: number | string;
}
