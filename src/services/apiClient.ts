// services/apiClient.ts
import { storeUserData, storeRememberMe } from "../utils/storage";

// adjust according to your backend response shape
export const apiClient = {
  async login(credentials: { email: string; password: string; isRememberMe?: boolean }) {
    try {
      // TEMPORARY: skip Firebase token if not ready on web
      const firebaseToken = "";

      const response = await fetch("http://34.229.148.155:4000/api/users/signin", {
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
      debugger
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
    // clear storage if needed
    localStorage.removeItem("userData");
  },
};
