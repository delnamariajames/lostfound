import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Compass, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldAlert, 
  Code2, 
  LogOut, 
  User, 
  ChevronDown, 
  Bell, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.ts';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  pendingClaimsCount?: number;
  onResetSeed?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  pendingClaimsCount = 0,
  onResetSeed,
}) => {
  const { user, logout, openAuthModal, demoLogin } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset all listings and claims to initial campus demo data?')) {
      try {
        await api.resetSeed();
        if (onResetSeed) onResetSeed();
        alert('Database reset to initial sample items!');
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-2xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="nav-logo-btn"
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                <span>🎓</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-slate-900 tracking-tight">Campus Lost &amp; Found</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-teal-100 text-teal-800 tracking-wider">Portal</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Campus Security &amp; Student Union Utility</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-link-browse"
                onClick={() => setActivePage('home')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activePage === 'home'
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass size={15} />
                Browse Feed
              </button>

              <button
                id="nav-link-create"
                onClick={() => setActivePage('create')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activePage === 'create'
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle size={15} className="text-teal-600" />
                Report Lost / Found
              </button>

              {user && (
                <button
                  id="nav-link-dashboard"
                  onClick={() => setActivePage('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors relative ${
                    activePage === 'dashboard'
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  My Dashboard
                  {pendingClaimsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                      {pendingClaimsCount}
                    </span>
                  )}
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  id="nav-link-admin"
                  onClick={() => setActivePage('admin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activePage === 'admin'
                      ? 'bg-indigo-50 text-indigo-800 font-bold'
                      : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50/50'
                  }`}
                >
                  <ShieldAlert size={15} />
                  Admin Panel
                </button>
              )}

              <button
                id="nav-link-apidocs"
                onClick={() => setActivePage('apidocs')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activePage === 'apidocs'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Code2 size={14} />
                REST API Docs
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                id="demo-switcher-toggle"
                onClick={() => {
                  setDemoDropdownOpen(!demoDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50/70 text-teal-900 text-xs font-medium hover:bg-teal-100 transition-colors"
                title="Quickly switch between Student and Admin accounts"
              >
                <Sparkles size={13} className="text-teal-600" />
                <span>Test Role: <strong>{user ? user.role : 'Guest'}</strong></span>
                <ChevronDown size={12} />
              </button>

              {demoDropdownOpen && (
                <div 
                  id="demo-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                >
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Instant 1-Click Role Switch
                  </p>
                  <button
                    id="switch-student-alex"
                    onClick={() => {
                      demoLogin('student');
                      setDemoDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-teal-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Alex Rivera (Student)</div>
                      <div className="text-[10px] text-slate-500">alex.rivera@campus.edu</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Student</span>
                  </button>
                  <button
                    id="switch-student-sarah"
                    onClick={() => {
                      demoLogin('student2');
                      setDemoDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-teal-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Sarah Chen (Student)</div>
                      <div className="text-[10px] text-slate-500">sarah.chen@campus.edu</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Student</span>
                  </button>
                  <button
                    id="switch-admin-vance"
                    onClick={() => {
                      demoLogin('admin');
                      setDemoDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-indigo-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-indigo-950">Campus Admin (Officer Vance)</div>
                      <div className="text-[10px] text-slate-500">admin@campus.edu</div>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
                  </button>
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleResetData}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      Reset to Sample Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Login Trigger */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-toggle"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setDemoDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-teal-700 font-medium capitalize">{user.role}</div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        id="profile-my-dashboard-btn"
                        onClick={() => {
                          setActivePage('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} />
                        My Posts &amp; Claims
                      </button>

                      {user.role === 'admin' && (
                        <button
                          id="profile-admin-panel-btn"
                          onClick={() => {
                            setActivePage('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <ShieldAlert size={14} />
                          Admin Moderation
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        id="user-logout-btn"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => setActivePage('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              activePage === 'home' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActivePage('create')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              activePage === 'create' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
            }`}
          >
            Report Item
          </button>
          {user && (
            <button
              onClick={() => setActivePage('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 ${
                activePage === 'dashboard' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
              }`}
            >
              Dashboard
              {pendingClaimsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => setActivePage('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
                activePage === 'admin' ? 'bg-indigo-50 text-indigo-800' : 'text-indigo-600'
              }`}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => setActivePage('apidocs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              activePage === 'apidocs' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
            }`}
          >
            API Docs
          </button>
        </div>
      </div>
    </header>
  );
};
