import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/services/api";

export type UserRole = "admin" | "doctor";

export interface User {
  id: string;
  role: UserRole;
  name?: string;
  speciality?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
  try {
    const res = await api.post("/auth/login", { username, password });

    const { token, role, name, speciality } = res.data;

    const userData: User = {
      id: username,
      role,
      name,
      speciality
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.message || "Login failed"
    };
  }
}, []);


  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
