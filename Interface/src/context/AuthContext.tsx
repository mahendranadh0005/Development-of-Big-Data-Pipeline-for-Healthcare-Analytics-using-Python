import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '@/types/hospital';

interface AuthContextType {
  user: User | null;
  login: (userId: string, password: string, portal: 'admin' | 'doctor') => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_USERS: User[] = [
  { userId: 'admin_hospital', password: 'admin123', role: 'admin', name: 'Hospital Administrator' },
  { userId: 'dr_cardiology', password: 'doctor123', role: 'doctor', name: 'Dr. Sarah Chen', speciality: 'Cardiology' },
  { userId: 'dr_neuro', password: 'doctor123', role: 'doctor', name: 'Dr. Michael Roberts', speciality: 'Neurology' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dynamicDoctors, setDynamicDoctors] = useState<User[]>([]);

  const login = useCallback((userId: string, password: string, portal: 'admin' | 'doctor') => {
    const allUsers = [...DEMO_USERS, ...dynamicDoctors];
    const foundUser = allUsers.find(u => u.userId === userId && u.password === password);
    
    if (!foundUser) {
      return { success: false, error: 'Invalid credentials. Please check your User ID and Password.' };
    }

    if (portal === 'admin' && foundUser.role !== 'admin') {
      return { success: false, error: 'Access denied. This portal is for Hospital Administrators only.' };
    }

    if (portal === 'doctor' && foundUser.role !== 'doctor') {
      return { success: false, error: 'Access denied. This portal is for Doctors only.' };
    }

    setUser(foundUser);
    return { success: true };
  }, [dynamicDoctors]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Expose a way to add dynamic doctors
  (window as any).__addDynamicDoctor = (doctor: User) => {
    setDynamicDoctors(prev => [...prev, doctor]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
