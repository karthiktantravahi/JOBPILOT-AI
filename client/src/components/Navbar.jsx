import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Briefcase,
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  RefreshCw,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { syncService } from '../services/extraServices';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncService.triggerSync('all');
      // trigger page refresh or notification
      window.location.reload();
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    { name: 'Discover Jobs', path: '/jobs', icon: Search },
    { name: 'Recommended', path: '/recommended', icon: Sparkles, authOnly: true, badge: 'AI' },
    { name: 'Applications', path: '/applications', icon: Briefcase, authOnly: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, authOnly: true },
    { name: 'Resume AI', path: '/resume', icon: FileText, authOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-base-content flex items-center gap-1.5">
                JOBPILOT <span className="text-primary font-black text-xs px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">AI</span>
              </div>
              <p className="text-[10px] text-base-content/50 -mt-1 hidden sm:block">Find right. Apply smarter.</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="badge badge-accent badge-xs font-bold text-[9px] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Sync Button (for authenticated users) */}
          {isAuthenticated && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="btn btn-ghost btn-sm gap-1.5 text-xs hidden sm:flex text-base-content/80 hover:text-primary"
              title="Sync latest live postings from Greenhouse, Lever, Remotive & Arbeitnow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync Jobs'}</span>
            </button>
          )}

          {/* In-App Notifications */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu / Auth Buttons */}
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar btn-sm border border-base-300">
                <div className="w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-50 p-2 shadow-xl menu menu-sm dropdown-content bg-base-200 border border-base-300 rounded-box w-52"
              >
                <li className="menu-title px-3 py-1">
                  <span className="text-xs font-bold text-base-content truncate">{user?.name}</span>
                  <span className="text-[10px] text-base-content/50 truncate font-normal">{user?.email}</span>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Match Settings
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button onClick={logout} className="text-error flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm text-xs">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm text-xs shadow-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-sm btn-circle md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-300 bg-base-100 p-4 space-y-2">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path) ? 'bg-primary/10 text-primary font-bold' : 'text-base-content/70'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {link.name}
                </span>
                {link.badge && <span className="badge badge-accent badge-xs">{link.badge}</span>}
              </Link>
            );
          })}
          {isAuthenticated && (
            <div className="pt-2 border-t border-base-300">
              <button
                onClick={handleManualSync}
                className="w-full btn btn-outline btn-sm gap-2 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing Public Jobs...' : 'Trigger Manual Sync'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
