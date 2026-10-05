'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { favoriteApi } from '@/lib/api/favorite.api';
import { Favorite } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/EmptyState';
import {
  Heart,
  Trash2,
  ArrowRight,
  MapPin,
  Dumbbell,
  Search,
  Star,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function MemberFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await favoriteApi.getMyFavorites({ limit: 100 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setFavorites(res.data.data);
      }
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (businessId: string) => {
    setRemovingId(businessId);
    try {
      await favoriteApi.remove(businessId);
      setFavorites((prev) => prev.filter((f) => f.businessId !== businessId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      alert('Failed to remove gym from favorites. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const query = searchQuery.toLowerCase();
    return favorites.filter((fav) => {
      const nameMatch = fav.business?.name?.toLowerCase().includes(query);
      const addressMatch = fav.business?.address?.toLowerCase().includes(query);
      const amenityMatch = fav.business?.amenities?.some((a) =>
        a.toLowerCase().includes(query)
      );
      return nameMatch || addressMatch || amenityMatch;
    });
  }, [favorites, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-200 fill-current" />
            Wishlist & Bookmarks
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Saved Fitness Centers
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
            Quickly compare and access your favorite fitness clubs, check schedules, and manage memberships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-center">
            <span className="block text-2xl font-black">{favorites.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-100">
              Saved Gyms
            </span>
          </div>
          <Link href="/member/gyms">
            <Button
              variant="secondary"
              size="md"
              className="bg-white text-slate-900 hover:bg-rose-50 font-bold rounded-2xl shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-rose-600" />
              Discover More
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved gyms by name, location, or amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium self-center">
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredFavorites.length}</strong> of {favorites.length} saved gyms
          </p>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State: No favorites at all */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No Favorite Gyms Saved
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Explore fitness centers in your district, view amenities, and tap the heart icon to save your preferred clubs here.
            </p>
          </div>
          <Link href="/member/gyms">
            <Button variant="primary" size="md" className="rounded-2xl gap-2 shadow-md">
              <Dumbbell className="w-4 h-4" />
              Explore Gym Directory
            </Button>
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        /* Empty State: Search found nothing */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-md mx-auto space-y-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No saved gyms match &quot;{searchQuery}&quot;
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="rounded-xl"
          >
            Reset Search Filter
          </Button>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((fav) => {
            const biz = fav.business;
            const coverImage = biz?.photos?.[0] || biz?.logo;
            const isRemoving = removingId === fav.businessId;

            return (
              <div
                key={fav.id}
                className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-rose-500/40 transition-all duration-200 ${
                  isRemoving ? 'opacity-50 pointer-events-none scale-95' : ''
                }`}
              >
                {/* Gym Cover Photo Banner */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt={biz?.name || 'Gym'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Top Left: Verified Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600/90 text-white backdrop-blur-xs">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  {/* Top Right: Remove Action Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => handleRemove(fav.businessId)}
                      disabled={isRemoving}
                      title="Remove from favorites"
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer shadow-md active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Left Overlay: Rating */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      4.9
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {biz?.name || 'Premier Fitness Club'}
                    </h3>

                    {biz?.address && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span className="truncate">{biz.address}</span>
                      </p>
                    )}

                    {biz?.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    )}

                    {/* Amenities tags */}
                    {biz?.amenities && biz.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {biz.amenities.slice(0, 3).map((a, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {a}
                          </span>
                        ))}
                        {biz.amenities.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                            +{biz.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Link
                      href={`/businesses/${fav.businessId}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full rounded-xl gap-1 text-xs font-bold"
                      >
                        View Gym <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(fav.businessId)}
                      disabled={isRemoving}
                      title="Remove"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
