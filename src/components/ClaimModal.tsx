import React, { useState } from 'react';
import { IListing, IClaim } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { X, Send, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface ClaimModalProps {
  listing: IListing;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: (claim: IClaim) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  listing,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const { user, openAuthModal } = useAuth();
  const [message, setMessage] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFound = listing.type === 'found';
  const actionTitle = isFound ? 'Claim This Found Item' : 'Report: "This is Mine / I Found It"';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!message.trim()) {
      setError('Please provide a message explaining your claim or where the item can be retrieved.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const claim = await api.submitClaim({
        listingId: listing._id,
        message: message.trim(),
        proofDetails: proofDetails.trim(),
        claimantPhone: phone.trim(),
      });
      onClaimSuccess(claim);
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="claim-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{actionTitle}</h2>
              <p className="text-xs text-slate-500">Direct message to original poster</p>
            </div>
          </div>
          <button
            id="claim-modal-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Summary Box */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start gap-3">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                {listing.type === 'found' ? 'Found Report' : 'Lost Report'}
              </span>
              <h4 className="text-sm font-semibold text-slate-900 truncate">{listing.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Posted by {listing.userName} ({listing.location})</p>
            </div>
          </div>

          {!user ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
              <p className="text-xs text-amber-800 font-medium">
                You need to log in to submit a claim request.
              </p>
              <button
                id="claim-modal-login-btn"
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                Log In or Sign Up
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isFound ? 'Message / Verification Note' : 'Message to Owner'} *
                </label>
                <textarea
                  id="claim-message-input"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isFound
                      ? 'e.g. This is my ID card/water bottle. I lost it during morning study hours on floor 2...'
                      : 'e.g. I found this item and left it safely at the departmental office / front desk...'
                  }
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Proof of Ownership / Identifying Marks (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Helps verify ownership</span>
                </label>
                <input
                  id="claim-proof-input"
                  type="text"
                  value={proofDetails}
                  onChange={(e) => setProofDetails(e.target.value)}
                  placeholder="e.g. Engraved initials 'MK', national park stickers, blue keychain ring"
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Phone / Preferred Contact (Optional)
                </label>
                <input
                  id="claim-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  id="claim-cancel-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="claim-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={13} />
                      Submit Claim Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
