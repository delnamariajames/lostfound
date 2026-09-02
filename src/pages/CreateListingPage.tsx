import React, { useState } from 'react';
import { ItemCategory, ListingType } from '../../server/models/types.js';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  X
} from 'lucide-react';

interface CreateListingPageProps {
  onCreated: (listingId: string) => void;
  onCancel: () => void;
}

const PRESET_SAMPLE_PHOTOS: { label: string; url: string }[] = [
  {
    label: 'Student ID Card',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'AirPods / Earbuds',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hydro Water Bottle',
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Textbook / Notebook',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Keys & Lanyard',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Calculator / Device',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
  },
];

export const CreateListingPage: React.FC<CreateListingPageProps> = ({ onCreated, onCancel }) => {
  const { user, openAuthModal } = useAuth();

  const [type, setType] = useState<ListingType>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Contact Info
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync contact info when user logs in
  React.useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name);
      if (!contactEmail) setContactEmail(user.email);
      if (!contactPhone && user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);
      const uploadedUrl = await api.uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'Image upload failed. You can provide an image URL instead.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const listing = await api.createListing({
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        date,
        imageUrl: imageUrl.trim(),
        contactInfo: {
          name: contactName.trim() || user.name,
          email: contactEmail.trim() || user.email,
          phone: contactPhone.trim(),
        },
      });

      onCreated(listing._id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories: ItemCategory[] = ['ID Card', 'Electronics', 'Bottle', 'Book', 'Stationery', 'Other'];

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create a Lost &amp; Found Post</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit an accurate report to help reunite lost property with campus owners.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      {!user && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <User size={18} className="text-teal-700 shrink-0" />
            <span className="text-xs font-medium text-teal-900">
              You must sign in to publish a post and receive claims from other students.
            </span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Sign In
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Report Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Report Category *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="report-type-lost"
              type="button"
              onClick={() => setType('lost')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                type === 'lost'
                  ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${type === 'lost' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Search size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">I Lost an Item</div>
                <p className="text-xs text-slate-500 mt-0.5">Report something you misplaced on campus</p>
              </div>
            </button>

            <button
              id="report-type-found"
              type="button"
              onClick={() => setType('found')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                type === 'found'
                  ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${type === 'found' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">I Found an Item</div>
                <p className="text-xs text-slate-500 mt-0.5">Help return an item found in classrooms/grounds</p>
              </div>
            </button>
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Item Information *
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Item Name *
            </label>
            <input
              id="create-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student ID Card (Emily Johnson), Blue Hydro Flask, Apple Pencil 2nd Gen"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                id="create-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-slate-500" />
                Date {type === 'lost' ? 'Lost' : 'Found'} *
              </label>
              <input
                id="create-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-slate-500" />
              Campus Location *
            </label>
            <input
              id="create-location-input"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Complex Room 204, Student Union 1st Floor, Library 2nd Floor Study Room 8"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              id="create-description-input"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide identifiable details (color, brand, distinctive stickers, scratches, case, approximate time of day)..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>3. Item Photo</span>
            <span className="text-[11px] font-normal text-slate-400">Multer file upload or URL</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
              <input
                id="create-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="create-image-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                  {uploadingImage ? 'Uploading image...' : 'Click to select photo'}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
              </label>
            </div>

            {/* Direct URL Input & Preview */}
            <div className="space-y-2">
              <input
                id="create-image-url-input"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image URL (https://...)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              {imageUrl ? (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md text-xs"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="h-28 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs gap-1.5">
                  <ImageIcon size={16} />
                  <span>No photo attached yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Preset Photo Quick Picker */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick test presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SAMPLE_PHOTOS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            4. Contact Information *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                Contact Name *
              </label>
              <input
                id="create-contact-name"
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail size={12} className="text-slate-400" />
                Campus Email *
              </label>
              <input
                id="create-contact-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                Phone (Optional)
              </label>
              <input
                id="create-contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            id="create-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="create-submit-btn"
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {submitting ? (
              'Submitting Report...'
            ) : (
              <>
                <CheckCircle2 size={16} />
                Publish {type === 'lost' ? 'Lost Item Post' : 'Found Item Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
