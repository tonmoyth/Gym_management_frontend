import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/getSession';
import { AuthProvider } from '@/lib/auth/AuthContext';

export default async function MemberRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'MEMBER') {
    redirect('/unauthorized');
  }

  return (
    <AuthProvider initialUser={session}>
      {children}
    </AuthProvider>
  );
}
