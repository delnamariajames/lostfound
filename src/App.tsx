import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CreateListingPage } from './pages/CreateListingPage.tsx';
import { ListingDetailPage } from './pages/ListingDetailPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { ApiDocsPage } from './pages/ApiDocsPage.tsx';
import { IListing } from '../server/models/types.js';
import { api } from './services/api.ts';
import { ShieldCheck, Heart, Github, Sparkles } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch pending claims count for notification badge
  useEffect(() => {
    if (user) {
      api.getReceivedClaims()
        .then((claims) => {
          const pending = claims.filter((c) => c.status === 'pending').length;
          setPendingClaimsCount(pending);
        })
        .catch(() => setPendingClaimsCount(0));
    } else {
      setPendingClaimsCount(0);
    }
  }, [user, activePage, refreshTrigger]);

  const handleSelectListing = (listing: IListing) => {
    setSelectedListingId(listing._id);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCreate = () => {
    setActivePage('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleListingCreated = (listingId: string) => {
    setSelectedListingId(listingId);
    setActivePage('detail');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleListingDeleted = () => {
    setSelectedListingId(null);
    setActivePage('home');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetSeed = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActivePage('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingClaimsCount={pendingClaimsCount}
        onResetSeed={handleResetSeed}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activePage === 'home' && (
          <HomePage
            key={`home-${refreshTrigger}`}
            onSelectListing={handleSelectListing}
            onNavigateCreate={handleNavigateCreate}
          />
        )}

        {activePage === 'create' && (
          <CreateListingPage
            onCreated={handleListingCreated}
            onCancel={() => setActivePage('home')}
          />
        )}

        {activePage === 'detail' && selectedListingId && (
          <ListingDetailPage
            key={`detail-${selectedListingId}-${refreshTrigger}`}
            listingId={selectedListingId}
            onBack={() => setActivePage('home')}
            onListingDeleted={handleListingDeleted}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            key={`dash-${refreshTrigger}`}
            onSelectListing={handleSelectListing}
            onNavigateCreate={handleNavigateCreate}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage
            key={`admin-${refreshTrigger}`}
            onSelectListing={handleSelectListing}
          />
        )}

        {activePage === 'apidocs' && <ApiDocsPage />}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
              LF
            </div>
            <span className="font-semibold text-slate-800">Campus Lost &amp; Found Portal</span>
            <span>•</span>
            <span>Node.js Express + MongoDB + React</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActivePage('apidocs')}
              className="hover:text-teal-700 font-medium transition-colors"
            >
              REST API Endpoints
            </button>
            <button
              onClick={handleResetSeed}
              className="hover:text-teal-700 font-medium transition-colors"
            >
              Reset Demo Fixtures
            </button>
            <span className="text-slate-400">© 2026 Campus Life Utility</span>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
