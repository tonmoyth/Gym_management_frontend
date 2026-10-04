'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { Role } from '@/types/api.types';

export interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
