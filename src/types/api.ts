export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Club {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface Event {
  id: string;
  clubId: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  ticketTiers: TicketTier[];
  status: 'draft' | 'published' | 'cancelled';
  totalSales: number;
  attendees: number;
  tableBookings?: TableBooking[];
}

export interface TableBooking {
  id: string;
  tableNumber: string;
  capacity: number;
  price: number;
  booked: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  specialRequests?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  count: number;
  sold: number;
  description: string[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalEvents: number;
  totalCustomers: number;
  totalStaff: number;
  revenueGrowth: number;
  eventGrowth: number;
  recentEvents: Event[];
  topPerformingClubs: Club[];
}