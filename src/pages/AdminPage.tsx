import React, { useState, useEffect } from 'react';
import { IListing, IUser } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CategoryBadge } from '../components/CategoryBadge.tsx';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCheck, 
  RefreshCw, 
  Users, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AdminPageProps {
  onSelectListing: (listing: IListing) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectListing }) => {
  const { user, openAuthModal, demoLogin } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<IListing[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoResolveDays, setAutoResolveDays] = useState(30);
  const [autoResolveMessage, setAutoResolveMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, listingsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminListings({ search, status: statusFilter }) as Promise<{ listings: IListing[]; total: number }>,
        api.getAdminUsers(),
      ]);
      setStats(statsData);
      setListings(listingsData.listings || []);
      setUsers(usersData);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, search, statusFilter]);

  const handleDeleteListing = async (id: string, title: string) => {
    if (confirm(`ADMIN ACTION: Permanently remove listing "${title}" for spam or policy violation?`)) {
      try {
        await api.adminDeleteListing(id);
        setListings(listings.filter((l) => l._id !== id));
        fetchAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete listing');
      }
    }
  };

  const handleStatusChange = async (id: string, status: 'Open' | 'Claimed' | 'Resolved') => {
    try {
      await api.updateListingStatus(id, status);
      setListings(listings.map((l) => (l._id === id ? { ...l, status } : l)));
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAutoResolve = async () => {
    if (confirm(`Run batch resolution for all Open items older than ${autoResolveDays} days?`)) {
      try {
        const res: any = await api.autoResolveOld(autoResolveDays);
        setAutoResolveMessage(res.message || `Archived ${res.modifiedCount ?? 0} stale listings.`);
        fetchAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to auto-resolve');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Administrator Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This portal section is restricted to Campus Security Officers and Administrators.
        </p>
        <button
          onClick={() => demoLogin('admin')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In as Demo Admin (Officer Vance)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      
      {/* Admin Title & Auto Resolve Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40">
            <ShieldAlert size={13} />
            <span>Campus Security &amp; Moderation Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Moderation Dashboard</h1>
          <p className="text-xs text-slate-400">
            Logged in as {user.name} ({user.email})
          </p>
        </div>

        {/* Auto-Resolve Tool Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 w-full md:w-auto space-y-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Clock size={13} className="text-indigo-400" />
            <span>Batch Auto-Resolve Stale Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={autoResolveDays}
              onChange={(e) => setAutoResolveDays(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-600 rounded-lg"
            >
              <option value="14">Older than 14 days</option>
              <option value="30">Older than 30 days</option>
              <option value="60">Older than 60 days</option>
              <option value="90">Older than 90 days</option>
            </select>
            <button
              onClick={handleAutoResolve}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              Run Auto-Resolve
            </button>
          </div>
        </div>
      </div>

      {autoResolveMessage && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <span>{autoResolveMessage}</span>
          <button
            onClick={() => setAutoResolveMessage(null)}
            className="text-indigo-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Listings</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.totalListings}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600 block uppercase">Open Items</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">{stats.openCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600 block uppercase">Claimed</span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">{stats.claimedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">Resolved</span>
            <span className="text-xl font-bold text-slate-700 mt-1 block">{stats.resolvedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-indigo-600 block uppercase">Total Users</span>
            <span className="text-xl font-bold text-indigo-900 mt-1 block">{stats.totalUsers}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-teal-600 block uppercase">Total Claims</span>
            <span className="text-xl font-bold text-teal-800 mt-1 block">{stats.totalClaims}</span>
          </div>
        </div>
      )}

      {/* Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Campus Listings ({listings.length})</h2>
            <p className="text-xs text-slate-500">Search, moderate spam, and oversee item statuses</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search title / user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Claimed">Claimed</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Item &amp; Type</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Location &amp; Date</th>
                <th className="py-3 px-3 font-semibold">Reported By</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText size={16} />
                        </div>
                      )}
                      <div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            item.type === 'found' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 
                          onClick={() => onSelectListing(item)}
                          className="font-semibold text-slate-900 truncate max-w-[200px] hover:text-teal-700 cursor-pointer"
                        >
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <CategoryBadge category={item.category} />
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 truncate max-w-[150px]">{item.location}</div>
                    <div className="text-[11px] text-slate-400">{item.date}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{item.userName}</div>
                    <div className="text-[11px] text-slate-400">{item.userEmail}</div>
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value as any)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-medium"
                    >
                      <option value="Open">🟢 Open</option>
                      <option value="Claimed">🟠 Claimed</option>
                      <option value="Resolved">⚪ Resolved</option>
                    </select>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectListing(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item._id, item.title)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md"
                        title="Delete Spam / Inappropriate Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-indigo-600" />
          Registered Campus Accounts ({users.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {users.map((u) => (
            <div key={u._id} className="p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                {u.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{u.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 capitalize font-medium">
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
