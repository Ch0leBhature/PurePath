import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "purepath_auth_user";

const getStoredUser = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  console.log("localStorage: ", stored);
  return stored ? JSON.parse(stored) : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storeUser = (userData) => {
    console.log("AuthContext storeUser:", userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(userData);
  };

  const login = async (credentials) => {
    console.log("AuthContext credentials:", credentials);
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      storeUser(data?.user || null);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(payload);
      storeUser(data?.user || null);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      storeUser(null);
    }
  };

  const authState = useMemo(
    () => ({ user, loading, error, login, register, logout, setError }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
