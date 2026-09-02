import React, { useState, useEffect } from 'react';
import { IListing, IClaim } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CategoryBadge } from '../components/CategoryBadge.tsx';
import { EditListingModal } from '../components/EditListingModal.tsx';
import { 
  FileText, 
  Inbox, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Phone,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  Search,
  PlusCircle
} from 'lucide-react';

interface DashboardPageProps {
  onSelectListing: (listing: IListing) => void;
  onNavigateCreate: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectListing,
  onNavigateCreate,
}) => {
  const { user, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'posts' | 'received' | 'claims'>('posts');
  const [myPosts, setMyPosts] = useState<IListing[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<IClaim[]>([]);
  const [myClaims, setMyClaims] = useState<IClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [selectedEditListing, setSelectedEditListing] = useState<IListing | null>(null);
  const [claimActionLoading, setClaimActionLoading] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [postsRes, receivedRes, myClaimsRes] = await Promise.all([
        api.getListings({ userId: user._id }),
        api.getReceivedClaims(),
        api.getMyClaims(),
      ]);
      setMyPosts(postsRes.listings);
      setReceivedClaims(receivedRes);
      setMyClaims(myClaimsRes);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.deleteListing(id);
        setMyPosts(myPosts.filter((p) => p._id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete post');
      }
    }
  };

  const handleClaimResponse = async (claimId: string, status: 'accepted' | 'rejected') => {
    try {
      setClaimActionLoading(claimId);
      const note = responseNotes[claimId] || '';
      const result = await api.updateClaimStatus(claimId, status, note);
      
      // Update local state
      setReceivedClaims((prev) =>
        prev.map((c) => (c._id === claimId ? result.claim : c))
      );

      // Refresh posts if listing was updated to Claimed
      if (result.listing) {
        setMyPosts((prev) =>
          prev.map((p) => (p._id === result.listing?._id ? result.listing! : p))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update claim');
    } finally {
      setClaimActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <User size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Dashboard Requires Login</h2>
        <p className="text-xs text-slate-500">
          Sign in to view and manage your reported lost/found items and response claims.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In to Portal
        </button>
      </div>
    );
  }

  const pendingReceivedCount = receivedClaims.filter((c) => c.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email} {user.phone && `• ${user.phone}`}</p>
          </div>
        </div>

        <button
          onClick={onNavigateCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          <PlusCircle size={15} />
          Create New Post
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          id="dashboard-tab-posts"
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'posts'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          My Posts ({myPosts.length})
        </button>

        <button
          id="dashboard-tab-received"
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'received'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Inbox size={15} />
          Claims on My Posts ({receivedClaims.length})
          {pendingReceivedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingReceivedCount} new
            </span>
          )}
        </button>

        <button
          id="dashboard-tab-claims"
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'claims'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send size={15} />
          Claims I've Sent ({myClaims.length})
        </button>
      </div>

      {/* Tab 1: My Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FileText size={36} className="text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No Posts Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have you lost an item or found someone's belongings? Publish a report to start.
              </p>
              <button
                onClick={onNavigateCreate}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                Report Lost or Found Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        {post.type === 'found' ? <Sparkles size={20} /> : <Search size={20} />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            post.type === 'found'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {post.type}
                        </span>
                        <StatusBadge status={post.status} size="sm" />
                      </div>
                      <h4 
                        onClick={() => onSelectListing(post)}
                        className="text-sm font-semibold text-slate-900 truncate hover:text-teal-700 cursor-pointer"
                      >
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{post.location}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Date: {post.date}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectListing(post)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setSelectedEditListing(post)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                        title="Edit Listing"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Claims (Claims made on user's posts) */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedClaims.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <Inbox size={36} className="text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No Received Claims Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When other students or faculty claim items from your posts, their verification requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Claim Request from {claim.claimantName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            claim.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Target Item: <strong className="text-slate-700">{claim.listingTitle}</strong> ({claim.listingType})
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message & Proof Box */}
                  <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">Claimant's Message:</span>
                      <p className="text-slate-600 mt-0.5">{claim.message}</p>
                    </div>

                    {claim.proofDetails && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="font-semibold text-teal-800 block">Identifying Marks / Proof:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{claim.proofDetails}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <a href={`mailto:${claim.claimantEmail}`} className="text-teal-700 hover:underline">
                          {claim.claimantEmail}
                        </a>
                      </span>
                      {claim.claimantPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          <span>{claim.claimantPhone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Pending Claims */}
                  {claim.status === 'pending' ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="Optional response note to claimant (e.g. 'Meet me at library front desk')..."
                        value={responseNotes[claim._id] || ''}
                        onChange={(e) =>
                          setResponseNotes({ ...responseNotes, [claim._id]: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={claimActionLoading === claim._id}
                          onClick={() => handleClaimResponse(claim._id, 'rejected')}
                          className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Reject Claim
                        </button>
                        <button
                          disabled={claimActionLoading === claim._id}
                          onClick={() => handleClaimResponse(claim._id, 'accepted')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <CheckCircle size={13} />
                          Accept Claim &amp; Mark Item Claimed
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Claim has been {claim.status}. {claim.responseNote && `Note: "${claim.responseNote}"`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Claims (Claims current user submitted) */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <Send size={36} className="text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No Claims Submitted</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you click "Claim" or "This is Mine" on listings, your claim tracking status will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{claim.listingTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        claim.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {claim.status === 'accepted' ? 'Accepted ✅' : claim.status === 'rejected' ? 'Rejected ❌' : 'Pending Review ⏳'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1">
                    <p><strong className="text-slate-800">Your Message:</strong> {claim.message}</p>
                    {claim.proofDetails && (
                      <p><strong className="text-slate-800">Verification details:</strong> {claim.proofDetails}</p>
                    )}
                    {claim.responseNote && (
                      <p className="pt-1 text-teal-800 font-medium border-t border-slate-200/60">
                        <strong>Poster Response:</strong> {claim.responseNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Listing Modal */}
      {selectedEditListing && (
        <EditListingModal
          listing={selectedEditListing}
          isOpen={!!selectedEditListing}
          onClose={() => setSelectedEditListing(null)}
          onUpdated={(updated) => {
            setMyPosts((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
            setSelectedEditListing(null);
          }}
        />
      )}
    </div>
  );
};
