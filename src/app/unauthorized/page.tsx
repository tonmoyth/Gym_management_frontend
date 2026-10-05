'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase font-bold tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full mb-3">
        Access Denied (403)
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
        Restricted Area
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        You do not have permission to view this portal. Access is restricted according to your account role.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Switch Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
