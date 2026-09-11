import React from 'react';
import { BookOpen, Sparkles, Compass, Flame, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'explore', label: 'Explore Catalog', icon: Compass },
    { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
    { id: 'ml-recommender', label: 'ML Recommender', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-paper-50/95 backdrop-blur-sm border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('explore')}
          >
            <BookOpen className="w-6 h-6 text-accent" />
            <div className="flex items-baseline gap-2">
              <span className="text-xl display-font font-bold text-ink-900 tracking-tight">
                BookWise
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted hidden sm:inline-block">
                Curated
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 pb-1 text-[13px] font-semibold transition-colors duration-150 border-b-2 ${
                    isActive
                      ? 'border-accent text-ink-900'
                      : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action */}
          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:5000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-600 hover:text-ink-900 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              API
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-paper-200 bg-paper-50 px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 text-[11px] font-bold uppercase tracking-wider ${
                isActive ? 'text-accent' : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </header>
  );
}
