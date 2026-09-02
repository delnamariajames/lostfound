import React, { useState, useEffect } from 'react';
import { IListing, ItemCategory, ListingStatus, ListingType } from '../../server/models/types.js';
import { api } from '../services/api.ts';
import { ListingCard } from '../components/ListingCard.tsx';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowUpDown, 
  Sparkles, 
  RefreshCw,
  Clock,
  CheckCircle2,
  CheckCheck,
  FolderOpen
} from 'lucide-react';

interface HomePageProps {
  onSelectListing: (listing: IListing) => void;
  onNavigateCreate: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectListing, onNavigateCreate }) => {
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getListings({
        search: searchQuery,
        type: selectedType,
        category: selectedCategory,
        status: selectedStatus,
        sort: sortOrder,
      });
      setListings(data.listings);
    } catch (err: any) {
      setError(err.message || 'Could not load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedType, selectedCategory, selectedStatus, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortOrder('newest');
  };

  // Stats calculation
  const totalCount = listings.length;
  const openCount = listings.filter((l) => l.status === 'Open').length;
  const claimedCount = listings.filter((l) => l.status === 'Claimed').length;
  const resolvedCount = listings.filter((l) => l.status === 'Resolved').length;

  const categories: ItemCategory[] = ['ID Card', 'Electronics', 'Bottle', 'Book', 'Stationery', 'Other'];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Search & Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles size={13} />
            <span>Campus Item Recovery Network</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Find What You Lost. Return What You Found.
          </h1>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Search active reports for student IDs, electronics, water bottles, keys, textbooks, and personal belongings across campus facilities.
          </p>

          {/* Search bar input */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                id="home-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords (e.g. 'AirPods', 'Library', 'Student ID', 'Hydro Flask')..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
              />
            </div>
            <button
              id="home-search-submit-btn"
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs shrink-0 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Search Items
            </button>
          </form>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        {/* Top Type Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              id="filter-type-all"
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Listings
            </button>
            <button
              id="filter-type-lost"
              type="button"
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedType === 'lost'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Items
            </button>
            <button
              id="filter-type-found"
              type="button"
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedType === 'found'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Items
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="home-create-shortcut-btn"
              type="button"
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle size={14} />
              Report Lost/Found
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">🟢 Open</option>
              <option value="Claimed">🟠 Claimed</option>
              <option value="Resolved">⚪ Resolved</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort Order</label>
            <select
              id="filter-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="newest">Most Recent First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Clear & Refresh */}
          <div className="flex items-end gap-2">
            <button
              id="filter-clear-btn"
              type="button"
              onClick={handleClearFilters}
              className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} />
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {/* Live Feed Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">
            Showing {listings.length} {listings.length === 1 ? 'item' : 'items'}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
            <Clock size={12} /> {openCount} Open
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
            <CheckCircle2 size={12} /> {claimedCount} Claimed
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
            <CheckCheck size={12} /> {resolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchListings}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry Loading
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800">No items match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing filters to view all campus reports.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Clear All Filters
            </button>
            <button
              onClick={onNavigateCreate}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              Report an Item
            </button>
          </div>
        </div>
      ) : (
        <div 
          id="listings-feed-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {listings.map((item) => (
            <ListingCard
              key={item._id}
              listing={item}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}
    </div>
  );
};
