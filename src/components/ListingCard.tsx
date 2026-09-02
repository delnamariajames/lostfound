import React from 'react';
import { IListing } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { CategoryBadge } from './CategoryBadge.tsx';
import { MapPin, Calendar, ArrowRight, UserCheck, Search, Sparkles } from 'lucide-react';

interface ListingCardProps {
  listing: IListing;
  onSelect: (listing: IListing) => void;
  id?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect, id }) => {
  const isFound = listing.type === 'found';

  // Clean formatted date
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(listing.date);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return listing.date;
    }
  }, [listing.date]);

  return (
    <div
      id={id || `listing-card-${listing._id}`}
      onClick={() => onSelect(listing)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Top Banner Image / Media */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // fallback image if broken url
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
            <Search size={32} className="opacity-40 mb-1" />
            <span className="text-xs font-medium text-slate-500">Photo not provided</span>
          </div>
        )}

        {/* Type Tag (Lost vs Found) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide shadow-xs ${
              isFound
                ? 'bg-teal-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isFound ? (
              <>
                <Sparkles size={12} />
                FOUND ITEM
              </>
            ) : (
              <>
                <Search size={12} />
                LOST ITEM
              </>
            )}
          </span>
        </div>

        {/* Status Badge in top right */}
        <div className="absolute top-3 right-3 shadow-xs">
          <StatusBadge status={listing.status} size="sm" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CategoryBadge category={listing.category} />
          {listing.claimsCount && listing.claimsCount > 0 ? (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <UserCheck size={12} />
              {listing.claimsCount} {listing.claimsCount === 1 ? 'claim' : 'claims'}
            </span>
          ) : null}
        </div>

        <h3 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
          {listing.title}
        </h3>

        <p className="mt-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>

        <div className="mt-auto pt-4 space-y-2 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500 gap-1.5">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{listing.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <span className="inline-flex items-center text-teal-600 font-semibold group-hover:translate-x-0.5 transition-transform gap-1">
              View
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
