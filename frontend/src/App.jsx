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
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [studioSeedBook, setStudioSeedBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState(null);

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
    <div className="min-h-screen flex flex-col bg-paper-100 text-ink-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Hero
        onSearchSubmit={handleSearchSubmit}
        onSelectBook={setSelectedBook}
        onSelectGenre={handleSelectGenre}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {activeTab === 'explore' && (
          <CatalogSection
            genres={genres}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onSelectBook={setSelectedBook}
            onFindSimilar={setSelectedBook}
          />
        )}

        {activeTab === 'popular' && (
          <PopularSection
            onSelectBook={setSelectedBook}
            onFindSimilar={setSelectedBook}
          />
        )}

        {activeTab === 'ml-recommender' && (
          <RecommendationSandbox
            initialBook={studioSeedBook}
            onSelectBook={setSelectedBook}
          />
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

      <StatsFooter stats={stats} />
    </div>
  );
}
