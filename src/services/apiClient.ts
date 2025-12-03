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
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = getDefaultHeaders();

  // Remove JSON content-type OR any content-type if FormData
  if (isFormData && defaultHeaders["Content-Type"]) {
    delete defaultHeaders["Content-Type"];
  }

  if (isFormData && options.headers && options.headers["Content-Type"]) {
    delete options.headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Request failed: ${errText}`);
  }

  return response.json();
};


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
  async getBookingsByEventId(eventId: string, clubId: string, status?: string, date?: string) {
    let query = `eventId=${encodeURIComponent(eventId)}`;
    query += `&clubId=${encodeURIComponent(clubId)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (date) query += `&date=${encodeURIComponent(date)}`;

    return request(`/bookings/EventBookingDetails?${query}`, {
      method: "GET",
    });
  },

  async getBookingsByClubId(clubId: string, status?: string, date?: string) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (date) query += `&date=${encodeURIComponent(date)}`;

    return request(`/bookings/GeneralBookingDetailsByClubId?${query}`, {
      method: "GET",
    });
  },
  async getCustomersByClubId(clubId: string) {
    const query = `clubId=${encodeURIComponent(clubId)}`;
    return request(`/customers/CustomerDetailsByClubId?${query}`, {
      method: "GET",
    });
  },
  // ✅ Add inside apiClient
  async getStaffByClubId(
    clubId: string,
    role?: string,
    status?: string,
    eventId?: string
  ) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (role) query += `&role=${encodeURIComponent(role)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (eventId) query += `&eventId=${encodeURIComponent(eventId)}`;

    return request(`/staff/StaffByClubId?${query}`, {
      method: "GET",
    });
  },
  async deleteStaffById(staffId: string, eventId: string, userType: string) {
    return request("/staff/addStaffById", {
      method: "DELETE",
      body: JSON.stringify({ staffId, eventId, userType }),
    });
  },
  async getPromotersByClubId(
    clubId: string,
    eventId?: string,
    status?: string
  ) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (status) query += `&status=${encodeURIComponent(status)}`;
    if (eventId) query += `&eventId=${encodeURIComponent(eventId)}`;

    return request(`/promoter/getPromotersByFilters?${query}`, {
      method: "GET",
    });
  },
  async invitePromoterByEmail(email: string) {
    return request("/eventsorganizers/inviteByEmail", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async getMyClub() {
    return request("/club/getMyClub", { method: "GET" });
  },

  async toggleAutoRenewal(clubId: string, enabled: boolean) {
    return request("/stripe/toggleAutoRenewal", {
      method: "POST",
      body: JSON.stringify({ clubId, enabled }),
    });
  },

  async getAutoRenewalStatus(clubId: string) {
    return request(`/stripe/autoRenewal/${clubId}`, { method: "GET" });
  },
    // Toggle auto-renewal (example you gave)
  // async toggleAutoRenewal(clubId: string, enabled: boolean) {
  //   return request("/stripe/toggleAutoRenewal", {
  //     method: "POST",
  //     body: JSON.stringify({ clubId, enabled }),
  //   });
  // },

  // // Check auto-renewal status
  // async getAutoRenewalStatus(clubId: string) {
  //   return request(`/stripe/autoRenewal/${encodeURIComponent(clubId)}`, {
  //     method: "GET",
  //   });
  // },

  // Scheduled plan info
  async getScheduledPlan(clubId: string) {
    return request(`/stripe/scheduledPlan/${clubId}`, {
      method: "GET",
    });
  },

  // Change plan (downgrade scheduled)
  async changeAutoRenewalPlan(clubId: string, planId: string) {
    return request("/stripe/changeAutoRenewalPlan", {
      method: "POST",
      body: JSON.stringify({ clubId, planId }),
    });
  },

  // Release scheduled plan change
  async releaseSchedule(clubId: string) {
    return request("/stripe/releaseSchedule", {
      method: "POST",
      body: JSON.stringify({ clubId }),
    });
  },
  async getAllPlans() {
    return request("/clubPaymentPlans/getAll", {
      method: "GET",
    });
  },

async  getCurrentSubscription(clubId: string) {
  return request(`/stripe/subscription/${clubId}`, {
    method: "GET",
  });
},

async  changeSubscriptionPlan(clubId: string, newPlanId: string) {
  return request("/stripe/changePlan", {
    method: "POST",
    body: JSON.stringify({ clubId, newPlanId }),
  });
},

async cancelSubscription(clubId: string) {
  return request("/stripe/cancelSubscription", {
    method: "POST",
    body: JSON.stringify({ clubId }),
  });
},
// ----------------------------
// Compliance Documents APIs
// ----------------------------

// GET all compliance documents for a club
async getComplianceDocuments(clubId: string) {
  return request(`/compliance/documents?clubId=${clubId}`, {
    method: "GET",
  });
},

// CREATE / upload a compliance document
async createComplianceDocument(payload: any) {
  return request("/compliance/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
},

// DELETE a specific compliance document
async deleteComplianceDocument(documentId: string) {
  return request(`/compliance/documents/${documentId}`, {
    method: "DELETE",
  });
},

async uploadComplianceDocument(formData: FormData) {
  return request("/compliance/upload", {
    method: "POST",
    body: formData,   // <-- MUST NOT BE STRINGIFIED
  });
},
async reviewComplianceDocument(documentId: string, payload: any) {
  return request(`/compliance/documents/${documentId}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
},

async getReviews(clubId: string, eventId: string) {
        let query = `clubId=${encodeURIComponent(clubId)}`;
        if (eventId) query += `&eventId=${encodeURIComponent(eventId)}`;

    return request(`/reviews?${query}`, {
      method: "GET",
    });
  },
  async sendResponseForReview(reviewId: string, param: string) {
    return request(`/reviews/${reviewId}/response`, {
      method: "POST",
      body: JSON.stringify({ message: param }),
    });
  },
   async sendUpdatedResponseForReview(reviewId: string, param: string) {
    return request(`/reviews/${reviewId}/response`, {
      method: "PUT",
      body: JSON.stringify({ message: param }),
    });
  },
async getRefundBookingsList(clubId: string, eventId: string) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (eventId) query += `&eventId=${encodeURIComponent(eventId)}`;

    return request(`/bookings/getRefundedBookings?${query}`, {
      method: "GET",
    });
  },

  async getDashboardStats(
    clubId: string,
    eventId?: string,
    startDate?: string,
    endDate?: string
  ) {
    let query = `clubId=${encodeURIComponent(clubId)}`;
    if (eventId) query += `&eventId=${encodeURIComponent(eventId)}`;
    if (startDate) query += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) query += `&endDate=${encodeURIComponent(endDate)}`;

    return request(`/dashboard/getClubOwnerStats?${query}`, {
      method: "GET",
    });
  },
  async updateProfile(payload: { fullName: string; password?: string }) {
    return request("/users/editprofile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

};
