import React, { useState } from 'react';
import { IListing, ItemCategory, ListingStatus, ListingType } from '../types.ts';
import { api } from '../services/api.ts';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditListingModalProps {
  listing: IListing;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedListing: IListing) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [type, setType] = useState<ListingType>(listing.type);
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState<ItemCategory>(listing.category);
  const [location, setLocation] = useState(listing.location);
  const [date, setDate] = useState(listing.date);
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  const [imageUrl, setImageUrl] = useState(listing.imageUrl || '');
  const [contactName, setContactName] = useState(listing.contactInfo?.name || '');
  const [contactEmail, setContactEmail] = useState(listing.contactInfo?.email || '');
  const [contactPhone, setContactPhone] = useState(listing.contactInfo?.phone || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await api.updateListing(listing._id, {
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        date,
        status,
        imageUrl: imageUrl.trim(),
        contactInfo: {
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
        },
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="edit-listing-modal"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-base font-semibold text-slate-900">Edit Listing</h2>
          <button
            id="edit-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                id="edit-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as ListingType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                id="edit-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Open">Open</option>
                <option value="Claimed">Claimed</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              id="edit-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                id="edit-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="ID Card">ID Card</option>
                <option value="Electronics">Electronics</option>
                <option value="Bottle">Bottle</option>
                <option value="Book">Book</option>
                <option value="Stationery">Stationery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                id="edit-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location *</label>
            <input
              id="edit-location-input"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              id="edit-description-input"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              id="edit-image-input"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              id="edit-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="edit-save-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              <Save size={14} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
