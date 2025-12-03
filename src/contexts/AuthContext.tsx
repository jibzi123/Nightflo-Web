import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // for login/logout actions
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); //To check initial load

  // ✅ check if we have saved token on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("userData");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsCheckingAuth(false);
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
    isRememberMe?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      setToken(response.token);

      // persist for refresh
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("activeFloorId");
  };

  const isAuthenticated = !!user;

  return (
  <AuthContext.Provider
    value={{
      user,
      setUser,      // ⭐ ADD THIS
      token,
      setToken,     // ⭐ OPTIONAL BUT RECOMMENDED
      login,
      logout,
      isLoading,
      isAuthenticated,
      isCheckingAuth,
    }}
  >
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = () => useContext(AuthContext);
