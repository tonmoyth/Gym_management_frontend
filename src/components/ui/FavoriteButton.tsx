'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';
import { favoriteApi } from '@/lib/api/favorite.api';
import { cn } from '@/lib/utils/cn';

export interface FavoriteButtonProps {
  businessId: string;
  businessName?: string;
  initialFavorited?: boolean;
  variant?: 'icon' | 'pill' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  businessId,
  businessName,
  initialFavorited = false,
  variant = 'icon',
  size = 'md',
  className,
  onToggle,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState<boolean>(initialFavorited);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?returnUrl=/businesses/${businessId}`);
      return;
    }

    if (user.role !== 'MEMBER') {
      alert('Only members can add fitness centers to their favorites list.');
      return;
    }

    if (isLoading) return;

    const previousState = isFavorited;
    const nextState = !previousState;

    // Optimistic UI update
    setIsFavorited(nextState);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setIsLoading(true);

    try {
      if (nextState) {
        await favoriteApi.add(businessId);
      } else {
        await favoriteApi.remove(businessId);
      }
      onToggle?.(nextState);
    } catch (error) {
      // Revert if API call fails
      setIsFavorited(previousState);
      console.error('Failed to update favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const heartSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        title={isFavorited ? 'Remove from Saved' : 'Save Gym'}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95',
          isFavorited
            ? 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-500',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin text-rose-500', heartSizes[size])} />
        ) : (
          <Heart
            className={cn(
              heartSizes[size],
              'transition-transform duration-200',
              isAnimating && 'scale-125',
              isFavorited
                ? 'fill-rose-500 text-rose-500'
                : 'text-slate-500 hover:text-rose-500'
            )}
          />
        )}
        <span>{isFavorited ? 'Saved' : 'Save Gym'}</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95',
          isFavorited
            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-600',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin text-rose-500', heartSizes[size])} />
        ) : (
          <Heart
            className={cn(
              heartSizes[size],
              'transition-transform duration-200',
              isAnimating && 'scale-125',
              isFavorited
                ? 'fill-rose-500 text-rose-500'
                : 'text-slate-500 hover:text-rose-500'
            )}
          />
        )}
        <span>{isFavorited ? 'Saved to Favorites' : 'Add to Favorites'}</span>
      </button>
    );
  }

  // Default 'icon' variant (ideal for card overlays)
  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorited ? `Remove ${businessName || 'gym'} from favorites` : `Add ${businessName || 'gym'} to favorites`}
      title={isFavorited ? 'Remove from favorites' : 'Bookmark gym'}
      className={cn(
        'group flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md active:scale-90',
        containerSizes[size],
        isFavorited
          ? 'bg-rose-500/90 hover:bg-rose-600 text-white border border-rose-400/50 shadow-rose-500/25'
          : 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-rose-400 border border-white/20',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn('animate-spin text-white', heartSizes[size])} />
      ) : (
        <Heart
          className={cn(
            heartSizes[size],
            'transition-all duration-200',
            isAnimating && 'scale-125',
            isFavorited ? 'fill-current text-white' : 'text-white/90 group-hover:text-rose-400'
          )}
        />
      )}
    </button>
  );
};
