import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("arya_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("arya_token");
    setUser(null);
  };

  const refreshMe = async () => {
    const token = localStorage.getItem("arya_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (_error) {
      localStorage.removeItem("arya_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshMe,
      isAuthenticated: Boolean(user),
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
