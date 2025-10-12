// services/apiClient.ts
import { storeUserData, storeRememberMe } from "../utils/storage";
import { API_BASE_URL } from "../config";

const getDefaultHeaders = () => {
  const token = localStorage.getItem("authToken");
  console.log("Using token:", token);
  const appVersion = "1.0.0"; // could be read from package.json
  const platform = "web";

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    appVersion,
    platform,
  };
};

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Request failed: ${errText}`);
  }

  return response.json();
}

export const apiClient = {
  // ✅ login keeps custom handling
  async login(credentials: { email: string; password: string; isRememberMe?: boolean }) {
    const firebaseToken = "";

    const response = await fetch(`${API_BASE_URL}/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        firebaseToken,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Login failed: ${errText}`);
    }

    const data = await response.json();
    const userData = data.payLoad;

    storeUserData(userData);
    if (credentials.isRememberMe) {
      storeRememberMe(credentials.email);
    }

    return {
      user: userData,
      token: userData.token,
    };
  },

  async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  // 🔥 now all endpoints share same request() with headers
  async getClubEvents() {
    return request("/events", { method: "GET" });
  },
  async getUpcomingEvents() {
    return request("/events/allUpcoming", { method: "GET" });
  },
  async getPastEvents() {
    return request("/events/past", { method: "GET" });
  },
  async createEvent(eventData: any) {
    return request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },
  async deleteEvent(eventId: string) {
    return request(`/events/${eventId}`, { method: "DELETE" });
  },
  async updateEvent(eventId: string, eventData: any) {
    return request(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },
  async getImageUploadUrl(eventId: string) {
    return request(`/eventImage/${eventId}`, { method: "GET" });
  },
  async getTicketsByEvent(eventId: string) {
    return request(`/tickets/getAllByEvent?eventId=${eventId}`, { method: "GET" });
  },
  async deleteTicket(ticketId: string) {
    return request("/tickets/delete", {
      method: "DELETE",
      body: JSON.stringify({ ticketId }),
    });
  },
  async updateTicket(ticketData: any) {
    return request("/tickets/update", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  },
  async createTicket(ticketData: any) {
    return request("/tickets/create", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  },
  async getTablesByEvent(eventId: string) {
    return request(`/tables/getAllByEvent?eventId=${eventId}`, { method: "GET" });
  },
  async createTable(tableData: any) {
    return request("/tables/create", {
      method: "POST",
      body: JSON.stringify(tableData),
    });
  },
  async updateTable(tableData: any) {
    return request("/tables/update", {
      method: "POST",
      body: JSON.stringify(tableData),
    });
  },
  async deleteTable(tableId: string) {
    return request("/tables/delete", {
      method: "DELETE",
      body: JSON.stringify({ tableId }),
    });
  },
  async getEventSummary(eventId: string) {
    return request(`/bookings/generalSummary?eventId=${encodeURIComponent(eventId)}`, { method: "GET" });
  },
  // async getBookingsSummary(eventId: string, userType: string) {
  //   return request(
  //     `/bookings/summary?eventId=${encodeURIComponent(eventId)}&userType=${encodeURIComponent(userType)}`,
  //     { method: "GET" }
  //   );
  // },
  // async getBookingsSummaryByType(eventId: string, bookingType: string) {
  //   return request(
  //     `/bookings/summaryByType?eventId=${encodeURIComponent(eventId)}&bookingType=${encodeURIComponent(bookingType)}`,
  //     { method: "GET" }
  //   );
  // },
  async getAllEventsOrganizers(eventId: string) {
    return request(`/eventsorganizers/allByEventId/${encodeURIComponent(eventId)}`, { method: "GET" });
  },
  async getAllEventsOrganizersByEventAndUsertype(eventId: string, userType: string) {
    return request(
      `/eventsorganizers/allByEventId/${encodeURIComponent(eventId)}/${userType}`,
      { method: "GET" }
    );
  },
  async addOrganizerInEvent(eventId: string, organizerId: string, userType: string) {
    return request(`/eventsorganizers/${encodeURIComponent(userType)}`, {
      method: "POST",
      body: JSON.stringify({ eventId, organizerId }),
    });
  },
  async removeOrganizerFromEvent(eventId: string, organizerId: string, userType: string) {
    return request(`/eventsorganizers/${encodeURIComponent(userType)}`, {
      method: "POST",
      body: JSON.stringify({ eventId, organizerId }),
    });
  },
  async toggleArchive(eventId: string, memberId: string, moveToArchive: boolean) {
    return request("/community/archive", {
      method: "POST",
      body: JSON.stringify({ eventId, memberId, moveToArchive }),
    });
  },
  async getBookingsByStatus(eventId: string, status: string) {
    return request(
      `/bookings/getBookingsByStatus?eventId=${encodeURIComponent(eventId)}&status=${encodeURIComponent(status)}`,
      { method: "GET" }
    );
  },
  async getBookingsByEventId(eventId: string, status?: string, date?: string) {
    let query = `eventId=${encodeURIComponent(eventId)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (date) query += `&date=${encodeURIComponent(date)}`;

    return request(`/bookings/BookingDetailsByEventId?${query}`, {
      method: "GET",
    });
  },

  async getBookingsByClubId(clubId: string, status?: string, date?: string) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (date) query += `&date=${encodeURIComponent(date)}`;

    return request(`/bookings/BookingDetailsByClubId?${query}`, {
      method: "GET",
    });
  },
};
