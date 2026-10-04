'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Role, StaffPermissionRole } from '@/types/api.types';
import axios from 'axios';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  profileImage?: string | null;
  isVerified?: boolean;
  isOnboarded?: boolean;
  hasBusiness?: boolean;
  isPlatformStaff?: boolean;
  staffRole?: StaffPermissionRole | null;
  staffBusiness?: { id: string; name: string } | null;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/proxy/user/me', { withCredentials: true });
      if (res.data?.success && res.data?.data?.user) {
        const u = res.data.data.user;
        setUser({
          id: u.id,
          fullName: u.fullName || u.name || 'User',
          email: u.email,
          role: u.role,
          profileImage: u.profileImage,
          isVerified: u.isVerified,
          hasBusiness: Boolean(u.hasBusiness ?? (u.ownedBusinesses && u.ownedBusinesses.length > 0)),
          isOnboarded: Boolean(u.isOnboarded ?? u.memberProfile),
          isPlatformStaff: Boolean(
            u.isPlatformStaff ??
            ((u.role === 'STAFF' || u.role === 'ADMIN') && !u.staffBusiness && (!u.staffRoles || u.staffRoles.length === 0))
          ),
          staffRole: u.staffRole || null,
          staffBusiness: u.staffBusiness || null,
          permissions: u.permissions || [],
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser, refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await axios.post('/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data?.success && res.data?.data?.user) {
        const u = res.data.data.user;
        const mappedUser: AuthUser = {
          id: u.id,
          fullName: u.fullName || u.name || 'User',
          email: u.email,
          role: u.role,
          profileImage: u.profileImage,
          isVerified: u.isVerified,
          hasBusiness: Boolean(u.hasBusiness ?? (u.ownedBusinesses && u.ownedBusinesses.length > 0)),
          isOnboarded: Boolean(u.isOnboarded ?? u.memberProfile),
          isPlatformStaff: Boolean(
            u.isPlatformStaff ??
            ((u.role === 'STAFF' || u.role === 'ADMIN') && !u.staffBusiness && (!u.staffRoles || u.staffRoles.length === 0))
          ),
          staffRole: u.staffRole || null,
          staffBusiness: u.staffBusiness || null,
          permissions: u.permissions || [],
        };
        setUser(mappedUser);
        return { success: true, user: mappedUser };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        refreshUser,
        setUser,
      }}
    >
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
