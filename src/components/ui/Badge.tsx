import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    info:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
    purple:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60',
    neutral:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Green / Success
  if (
    [
      'ACTIVE',
      'APPROVED',
      'VERIFIED',
      'PAID',
      'CREDITED',
      'CONFIRMED',
      'SUCCESS',
      'ONLINE',
      'GOOD',
    ].includes(normalized)
  ) {
    return (
      <Badge variant="success" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  }

  // Amber / Warning
  if (
    [
      'PENDING',
      'PENDING_APPROVAL',
      'IN_REVIEW',
      'OPEN',
      'NEEDS_REPAIR',
    ].includes(normalized)
  ) {
    return (
      <Badge variant="warning" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  }

  // Red / Danger
  if (
    [
      'REJECTED',
      'FAILED',
      'SUSPENDED',
      'OVERDUE',
      'OUT_OF_SERVICE',
      'DISMISSED',
      'ERROR',
    ].includes(normalized)
  ) {
    return (
      <Badge variant="danger" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  }

  // Neutral / Slate
  return (
    <Badge variant="neutral" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
