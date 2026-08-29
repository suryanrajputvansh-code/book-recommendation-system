import React from 'react';
import { BookOpen, Sparkles, Compass, Flame, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenRandom }) {
  const navItems = [
    { id: 'explore', label: 'Explore Catalog', icon: Compass },
    { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
    { id: 'ml-recommender', label: 'ML Recommender Studio', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('explore')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                BookWise
              </span>
              <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ML v1.0
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Action / Docs */}
          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:5000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              API Docs
            </a>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
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
