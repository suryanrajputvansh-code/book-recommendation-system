import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Compass, Flame, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, showAuthModal, setShowAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Monitor scroll state for gentle shadow elevation
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'explore', label: 'Explore Catalog', icon: Compass },
    { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
    { id: 'ml-recommender', label: 'ML Recommender', icon: Sparkles },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setDropdownOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          hasScrolled
            ? 'shadow-xs shadow-ink-900/5 border-b border-paper-300/80'
            : 'border-b border-paper-300/50'
        }`}
        style={{
          backgroundColor: 'rgba(247, 244, 238, 0.78)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group select-none" 
              onClick={() => handleNavClick('explore')}
            >
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl display-font font-bold text-ink-900 tracking-tight leading-none">
                  BookWise
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted mt-0.5">
                  Curated Discovery
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 pb-1 text-[14px] font-semibold transition-all duration-200 border-b-2 ${
                      isActive
                        ? 'border-accent text-ink-900'
                        : 'border-transparent text-ink-600 hover:text-ink-900 hover:border-paper-400'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Auth Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-paper-200/60 transition-colors text-left"
                    aria-label="User profile menu"
                    aria-expanded={dropdownOpen}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-paper-400 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent text-paper-50 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {user.name ? user.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs font-bold text-ink-900 leading-tight">{user.name}</span>
                      <span className="text-[10px] text-muted truncate max-w-[120px]">{user.email}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
                  </button>

                  {/* User Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-paper-50 border border-paper-300 rounded-md shadow-md py-1.5 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-paper-200 sm:hidden">
                        <p className="text-xs font-bold text-ink-900">{user.name}</p>
                        <p className="text-[10px] text-muted truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-accent hover:bg-paper-200/70 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-paper-50 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-ink-800 transition-colors shadow-xs"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navbar with close on click */}
        <div className="md:hidden flex items-center justify-around border-t border-paper-200/80 bg-paper-50/90 px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-accent bg-accent/10' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              if (user) logout();
              else setShowAuthModal(true);
            }}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-ink-500 hover:text-ink-800"
          >
            {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{user ? 'Sign Out' : 'Sign In'}</span>
          </button>
        </div>
      </header>

      {showAuthModal && !user && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}