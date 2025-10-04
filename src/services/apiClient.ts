// services/apiClient.ts
import { storeUserData, storeRememberMe } from "../utils/storage";
import { API_BASE_URL } from "../config";

// adjust according to your backend response shape
export const apiClient = {
  async login(credentials: { email: string; password: string; isRememberMe?: boolean }) {
    try {
      // TEMPORARY: skip Firebase token if not ready on web
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
      console.log("🔑 Login API Response:", data);

      const userData = data.payLoad;
      // store user in localStorage (or IndexedDB) for persistence
      storeUserData(userData);

      if (credentials.isRememberMe) {
        storeRememberMe(credentials.email);
      }

      return {
        user: userData,
        token: userData.token, // make sure backend sends this
      };
    } catch (err) {
      console.error("❌ Login error:", err);
      throw err;
    }
  },

   async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  async get(path: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Request failed: ${errText}`);
    }

    return response.json();
  },

  async getUpcomingEvents() {
    return this.get("/events/allUpcoming");
  },
  async getPastEvents() {
    return this.get("/events/past");
  },
  // services/apiClient.ts
  async createEvent(eventData: any) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ from useAuth
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create event: ${errText}`);
    }

    return response.json();
  },
  async deleteEvent(eventId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to delete event: ${errText}`);
    }

    return response.json();
  },
  async updateEvent(eventId: string, eventData: any) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update event: ${errText}`);
    }

    return response.json();
  },
  async getImageUploadUrl(eventId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/eventImage/${eventId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get signed URL: ${errText}`);
    }

    return response.json(); // could be { payLoad: { signedUrl } } OR { signedUrl }
  },
  async getTicketsByEvent(eventId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}/tickets/getAllByEvent?eventId=${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch tickets: ${errText}`);
    }

    return response.json(); // expected: { payLoad: [...] }
  },

  async deleteTicket(ticketId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tickets/delete`, {
      method: "DELETE", // ✅ keep DELETE
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ticketId }), // ✅ send JSON body
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to delete ticket: ${errText}`);
    }

    return response.json();
  },


  async updateTicket(ticketData: any) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tickets/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update ticket: ${errText}`);
    }

    return response.json();
  },
  async createTicket(ticketData: {
    name: string;
    price: number;
    count: number;
    description: string[];
    eventId: string;
  }) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tickets/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create ticket: ${errText}`);
    }

    return response.json(); // { status: "Success", payLoad: {...} }
  },

  async getTablesByEvent(eventId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}/tables/getAllByEvent?eventId=${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch tickets: ${errText}`);
    }

    return response.json(); // expected: { payLoad: [...] }
  },
  // ✅ Create Table
  async createTable(tableData: any) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tables/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tableData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create table: ${errText}`);
    }

    return response.json(); // { status, statusCode, payLoad }
  },

  // ✅ Update Table
  async updateTable(tableData: any) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tables/update`, {
      method: "POST",  // ⚠️ mobile also uses POST, not PUT
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tableData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update table: ${errText}`);
    }

    return response.json(); // { status, statusCode, payLoad }
  },

  // ✅ Delete Table
  async deleteTable(tableId: string) {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tables/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tableId }), // backend expects JSON
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to delete table: ${errText}`);
    }

    return response.json(); // { status, statusCode, ... }
  },
  async getEventSummary(eventId: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/bookings/generalSummary?eventId=${encodeURIComponent(eventId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch event summary: ${errText}`);
    }

    return response.json(); // expected: { payLoad: [...] }
  },
  
  async getBookingsSummary(eventId: string, userType: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/bookings/summary?eventId=${encodeURIComponent(eventId)}&userType=${encodeURIComponent(userType)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch bookings summary: ${errText}`);
    }

    return response.json(); // { payLoad: {...} }
  },

  async getBookingsSummaryByType(eventId: string, bookingType: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/bookings/summaryByType?eventId=${encodeURIComponent(eventId)}&bookingType=${encodeURIComponent(bookingType)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch bookings summary by type: ${errText}`);
    }

    return response.json(); // { payLoad: {...} }
  },
  async getAllEventsOrganizers(eventId: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/eventsorganizers/allByEventId/${encodeURIComponent(eventId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch events organizers: ${errText}`);
    }

    return response.json(); // { payLoad: {...} }
  },
  async getAllEventsOrganizersByEventAndUsertype(eventId: string, userType: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/eventsorganizers/allByEventId/${encodeURIComponent(eventId)}/${userType}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch events organizers: ${errText}`);
    }

    return response.json(); // { payLoad: {...} }
  },
  async addOrganizerInEvent(eventId: string, organizerId: string, userType: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/eventsorganizers/${encodeURIComponent(userType)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          organizerId,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to add organizer: ${errText}`);
    }

    return response.json(); // { payLoad: {...} }
  },
  async removeOrganizerFromEvent(eventId: string, organizerId: string, userType: string) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/eventsorganizers/${encodeURIComponent(userType)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, organizerId }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to remove organizer: ${errText}`);
    }

    return response.json();
  },
  async toggleArchive(eventId: string, memberId: string, moveToArchive: boolean) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${API_BASE_URL}/community/archive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId,
        memberId,
        moveToArchive,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to toggle archive: ${errText}`);
    }

    return response.json();
  },
  async getBookingsByStatus(eventId: string, status: string) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/bookings/getBookingsByStatus?eventId=${encodeURIComponent(eventId)}&status=${encodeURIComponent(status)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch bookings: ${errText}`);
  }

  return response.json(); // { payLoad: [...] }
}


};
