import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogSection from './components/CatalogSection';
import PopularSection from './components/PopularSection';
import RecommendationSandbox from './components/RecommendationSandbox';
import BookModal from './components/BookModal';
import StatsFooter from './components/StatsFooter';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'popular' | 'ml-recommender'
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [studioSeedBook, setStudioSeedBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch genres list
    api.getGenres()
      .then((data) => setGenres(data.genres || []))
      .catch((err) => console.error('Failed to load genres:', err));

    // Fetch backend telemetry/stats
    api.getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setActiveTab('explore');
  };

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    setActiveTab('explore');
  };

  const handleOpenStudioWithBook = (book) => {
    setStudioSeedBook(book);
    setActiveTab('ml-recommender');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Header & Live Search */}
      <Hero
        onSearchSubmit={handleSearchSubmit}
        onSelectBook={(book) => setSelectedBook(book)}
        onSelectGenre={handleSelectGenre}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'explore' && (
          <CatalogSection
            genres={genres}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onSelectBook={(book) => setSelectedBook(book)}
            onFindSimilar={(book) => setSelectedBook(book)}
          />
        )}

        {activeTab === 'popular' && (
          <PopularSection
            onSelectBook={(book) => setSelectedBook(book)}
            onFindSimilar={(book) => setSelectedBook(book)}
          />
        )}

        {activeTab === 'ml-recommender' && (
          <RecommendationSandbox
            initialBook={studioSeedBook}
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}
      </main>

      {/* Book Detail & Similar Recommendations Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSelectBook={(book) => setSelectedBook(book)}
          onOpenStudioWithBook={handleOpenStudioWithBook}
        />
      )}

      {/* Stats Footer */}
      <StatsFooter stats={stats} />
    </div>
  );
}
