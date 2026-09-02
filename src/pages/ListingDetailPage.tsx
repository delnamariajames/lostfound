import React, { useState, useEffect } from 'react';
import { IListing, IClaim } from '../../server/models/types.js';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CategoryBadge } from '../components/CategoryBadge.tsx';
import { ClaimModal } from '../components/ClaimModal.tsx';
import { EditListingModal } from '../components/EditListingModal.tsx';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Search, 
  CheckCheck,
  Clock,
  MessageSquare
} from 'lucide-react';

interface ListingDetailPageProps {
  listingId: string;
  onBack: () => void;
  onListingDeleted: () => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listingId,
  onBack,
  onListingDeleted,
}) => {
  const { user } = useAuth();
  const [listing, setListing] = useState<IListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getListingById(listingId);
      setListing(data);
    } catch (err: any) {
      setError(err.message || 'Could not load listing details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const handleDelete = async () => {
    if (!listing) return;
    if (confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await api.deleteListing(listing._id);
        onListingDeleted();
      } catch (err: any) {
        alert(err.message || 'Failed to delete listing');
      }
    }
  };

  const handleStatusQuickChange = async (newStatus: 'Open' | 'Claimed' | 'Resolved') => {
    if (!listing) return;
    try {
      const updated = await api.updateListingStatus(listing._id, newStatus);
      setListing(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <p className="text-sm font-semibold text-rose-600">{error || 'Item not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const isOwner = user && user._id === listing.userId;
  const isAdmin = user && user.role === 'admin';
  const canManage = isOwner || isAdmin;
  const isFound = listing.type === 'found';

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings Feed
        </button>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              id="detail-edit-btn"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Edit3 size={13} />
              Edit Post
            </button>
            <button
              id="detail-delete-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      {claimSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
          <CheckCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{claimSuccessMessage}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              The poster will review your details and contact you via your email/phone.
            </p>
          </div>
        </div>
      )}

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Photo Column */}
          <div className="relative bg-slate-100 min-h-[320px] md:min-h-[420px] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
                <Search size={48} className="opacity-30" />
                <span className="text-xs font-medium text-slate-500">No photo uploaded</span>
              </div>
            )}

            {/* Type Overlay */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wide shadow-xs ${
                  isFound
                    ? 'bg-teal-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {isFound ? (
                  <>
                    <Sparkles size={13} />
                    FOUND ITEM
                  </>
                ) : (
                  <>
                    <Search size={13} />
                    LOST ITEM
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Top Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CategoryBadge category={listing.category} />
                <StatusBadge status={listing.status} size="lg" />
              </div>

              {/* Title & Time */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    Reported date: {listing.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
                <MapPin size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Location Reported:</span>
                  <span>{listing.location}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Description &amp; Identifying Details
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  {listing.description}
                </p>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2 text-xs">
                <span className="font-bold text-teal-900 block flex items-center gap-1.5">
                  <User size={13} className="text-teal-700" />
                  Poster Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Name:</span>
                    <span className="font-medium text-slate-900">{listing.contactInfo?.name || listing.userName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Email:</span>
                    <a href={`mailto:${listing.contactInfo?.email}`} className="text-teal-700 hover:underline font-medium">
                      {listing.contactInfo?.email || listing.userEmail}
                    </a>
                  </div>
                  {listing.contactInfo?.phone && (
                    <div className="col-span-2">
                      <span className="text-[11px] text-slate-500 block">Phone:</span>
                      <span className="font-medium text-slate-900">{listing.contactInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {canManage ? (
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Quick Status Update (Owner / Admin Control):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusQuickChange('Open')}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        listing.status === 'Open'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      🟢 Open
                    </button>
                    <button
                      onClick={() => handleStatusQuickChange('Claimed')}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        listing.status === 'Claimed'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      🟠 Claimed
                    </button>
                    <button
                      onClick={() => handleStatusQuickChange('Resolved')}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        listing.status === 'Resolved'
                          ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ⚪ Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {listing.status === 'Resolved' ? (
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5">
                      <CheckCheck size={16} />
                      This item has been successfully resolved and returned to its owner.
                    </div>
                  ) : (
                    <button
                      id="detail-claim-action-btn"
                      onClick={() => setIsClaimModalOpen(true)}
                      className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 ${
                        isFound
                          ? 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white'
                      }`}
                    >
                      <ShieldCheck size={18} />
                      {isFound ? 'Claim This Found Item' : 'This is Mine / I Have Found It'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <ClaimModal
          listing={listing}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onClaimSuccess={(claim) => {
            setIsClaimModalOpen(false);
            setClaimSuccessMessage(`Claim request sent to ${listing.userName}!`);
            fetchListing();
          }}
        />
      )}

      {/* Edit Listing Modal */}
      {isEditModalOpen && (
        <EditListingModal
          listing={listing}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updated) => {
            setListing(updated);
          }}
        />
      )}
    </div>
  );
};
