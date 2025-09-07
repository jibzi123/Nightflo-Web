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
  }


};
