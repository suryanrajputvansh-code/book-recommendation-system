import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Compass, Flame, User, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('bookwise_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bookwise_user');
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('bookwise_user', JSON.stringify(userData));
    setUser(userData);
    setShowAuthModal(false);
  };

  const navItems = [
    { id: 'explore', label: 'Explore Catalog', icon: Compass },
    { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
    { id: 'ml-recommender', label: 'ML Recommender', icon: Sparkles },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper-50/95 backdrop-blur-md border-b border-paper-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('explore')}>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl display-font font-bold text-ink-900 tracking-tight leading-none">BookWise</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted mt-0.5">Curated Discovery</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 pb-1 text-[14px] font-semibold transition-all duration-200 border-b-2 ${isActive ? 'border-accent text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800 hover:border-paper-400'}`}>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-ink-900">{user.name}</span>
                    <span className="text-[11px] text-muted">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 rounded-full hover:bg-paper-200 text-ink-600 hover:text-ink-900 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-paper-50 text-sm font-semibold rounded-md hover:bg-ink-800 transition-colors shadow-sm">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-around border-t border-paper-200 bg-paper-50 px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${isActive ? 'text-accent bg-accent/10' : 'text-ink-400 hover:text-ink-700'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button onClick={() => user ? handleLogout() : setShowAuthModal(true)} className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-ink-400 hover:text-ink-700">
            {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{user ? 'Logout' : 'Sign In'}</span>
          </button>
        </div>
      </header>
      {showAuthModal && !user && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />}
    </>
  );
}