import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogSection from './components/CatalogSection';
import PopularSection from './components/PopularSection';
import RecommendationSandbox from './components/RecommendationSandbox';
import BookModal from './components/BookModal';
import StatsFooter from './components/StatsFooter';
import { api } from './services/api';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [studioSeedBook, setStudioSeedBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState(null);

  // Sync tab with URL hash on load & hash changes
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (['explore', 'popular', 'ml-recommender'].includes(hash)) {
        return hash;
      }
      return 'explore';
    };

    const initialTab = parseHash();
    setActiveTab(initialTab);

    const handleHashChange = () => {
      const currentTab = parseHash();
      setActiveTab(currentTab);
      const targetEl = document.getElementById(currentTab);
      if (targetEl) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        targetEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    api
      .getGenres()
      .then((data) => setGenres(data.genres || []))
      .catch(console.error);

    api
      .getStats()
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (window.location.hash !== `#${tabId}`) {
      window.history.pushState(null, '', `#${tabId}`);
    }
    const targetEl = document.getElementById(tabId);
    if (targetEl) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      targetEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    handleTabChange('explore');
  };

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    handleTabChange('explore');
  };

  const handleOpenStudioWithBook = (book) => {
    setStudioSeedBook(book);
    handleTabChange('ml-recommender');
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 text-ink-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <Hero
        onSearchSubmit={handleSearchSubmit}
        onSelectBook={setSelectedBook}
        onSelectGenre={handleSelectGenre}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {activeTab === 'explore' && (
          <div id="explore" className="scroll-mt-24">
            <CatalogSection
              genres={genres}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onSelectBook={setSelectedBook}
              onFindSimilar={setSelectedBook}
            />
          </div>
        )}

        {activeTab === 'popular' && (
          <div id="popular" className="scroll-mt-24">
            <PopularSection
              onSelectBook={setSelectedBook}
              onFindSimilar={setSelectedBook}
            />
          </div>
        )}

        {activeTab === 'ml-recommender' && (
          <div id="ml-recommender" className="scroll-mt-24">
            <RecommendationSandbox
              initialBook={studioSeedBook}
              onSelectBook={setSelectedBook}
            />
          </div>
        )}
      </main>

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSelectBook={setSelectedBook}
          onOpenStudioWithBook={handleOpenStudioWithBook}
        />
      )}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={(user) => {
            setShowAuth(false);
            console.log('Logged in:', user);
          }}
        />
      )}

      <StatsFooter stats={stats} onNavigateTab={handleTabChange} />
    </div>
  );
}

