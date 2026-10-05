'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { businessApi } from '@/lib/api/business.api';
import { favoriteApi } from '@/lib/api/favorite.api';
import { Business } from '@/types/api.types';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useAuth } from '@/lib/auth/useAuth';
import {
  Search,
  MapPin,
  Star,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Phone,
  Filter
} from 'lucide-react';

export default function MemberFindGymsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('ALL');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Load member favorites for instant heart-sync
  useEffect(() => {
    async function loadFavorites() {
      if (user?.role === 'MEMBER') {
        try {
          const res = await favoriteApi.getMyFavorites({ limit: 100 });
          if (res.data?.success && Array.isArray(res.data.data)) {
            const ids = new Set(res.data.data.map((fav) => fav.businessId));
            setFavoritedIds(ids);
          }
        } catch {
          // ignore
        }
      }
    }
    loadFavorites();
  }, [user]);

  const fetchBusinesses = async (query?: string) => {
    setIsLoading(true);
    try {
      const res = await businessApi.getAll({
        searchTerm: query || undefined,
        limit: 50,
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBusinesses(res.data.data);
      }
    } catch {
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses(searchTerm);
  };

  const amenityFilters = ['ALL', 'Cardio', 'Weights', 'Locker', 'Shower', 'Sauna', 'Trainer'];

  const filteredBusinesses = businesses.filter((b) => {
    if (selectedAmenity === 'ALL') return true;
    return b.amenities?.some((a) =>
      a.toLowerCase().includes(selectedAmenity.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            Verified Fitness Centers
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Find & Join Active Gyms
          </h1>
          <p className="text-rose-100 text-sm leading-relaxed">
            Browse premier fitness clubs, review facility amenities, choose membership packages, and train with top certified coaches.
          </p>

          {/* Search bar inside header */}
          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gyms by name, location, or facility type..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-slate-400 shadow-lg"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-6 font-bold shadow-md"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Filter Chips Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {amenityFilters.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => setSelectedAmenity(amenity)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedAmenity === amenity
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-900 dark:text-white font-bold">{filteredBusinesses.length}</span> active fitness centers
        </p>
      </div>

      {/* Gym Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No Gyms Found"
          description="We couldn't find any fitness centers matching your query. Try adjusting your search term or amenity filter."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedAmenity('ALL');
                fetchBusinesses();
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((gym) => (
            <div
              key={gym.id}
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-500/40 transition-all duration-200 justify-between"
            >
              <div>
                {/* Gym Cover Photo / Logo Header */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {gym.photos && gym.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gym.photos[0]}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : gym.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gym.logo}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                      <Dumbbell className="w-12 h-12 text-slate-600" />
                    </div>
                  )}

                  {/* Favorite Button */}
                  <div className="absolute top-3 left-3 z-10">
                    <FavoriteButton
                      businessId={gym.id}
                      businessName={gym.name}
                      initialFavorited={favoritedIds.has(gym.id)}
                      onToggle={(isFav) => {
                        setFavoritedIds((prev) => {
                          const updated = new Set(prev);
                          if (isFav) updated.add(gym.id);
                          else updated.delete(gym.id);
                          return updated;
                        });
                      }}
                    />
                  </div>

                  {/* Rating / Verified Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                      {gym.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                      <span className="truncate">{gym.address || 'Address pending'}</span>
                    </p>
                  </div>

                  {gym.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {gym.description}
                    </p>
                  )}

                  {/* Amenities Tags */}
                  {gym.amenities && gym.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {gym.amenities.slice(0, 3).map((a, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {a}
                        </span>
                      ))}
                      {gym.amenities.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                          +{gym.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {gym.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{gym.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Membership
                  </span>
                  <span className="text-xs font-bold text-emerald-500">
                    Instant Access
                  </span>
                </div>

                <Link href={`/businesses/${gym.id}`}>
                  <Button variant="primary" size="sm" className="rounded-xl gap-1.5 shadow-sm text-xs">
                    View Gym & Plans <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
