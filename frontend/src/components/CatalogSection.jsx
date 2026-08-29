import React, { useState, useEffect } from 'react';
import { Compass, Search, Filter, Loader2, ChevronLeft, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';
import GenreFilter from './GenreFilter';

export default function CatalogSection({ 
  genres, 
  selectedGenre, 
  onSelectGenre, 
  searchQuery, 
  onClearSearch,
  onSelectBook, 
  onFindSimilar 
}) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'rating', 'title', 'year'

  // Reset to page 1 whenever filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getBooks({
      page: currentPage,
      limit: 18,
      genre: selectedGenre,
      search: searchQuery
    })
      .then((data) => {
        if (isMounted) {
          let loaded = data.books || [];
          // Client-side sort if requested
          if (sortBy === 'rating') {
            loaded = [...loaded].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else if (sortBy === 'title') {
            loaded = [...loaded].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          } else if (sortBy === 'year') {
            loaded = [...loaded].sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
          }
          setBooks(loaded);
          setTotalPages(data.total_pages || 1);
          setTotalBooks(data.total || 0);
        }
      })
      .catch((err) => console.error('Failed to load books catalog:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, selectedGenre, searchQuery, sortBy]);

  return (
    <section className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Book Catalog</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {totalBooks} titles
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1.5">
              <span>Showing results matching "{searchQuery}"</span>
              <button 
                onClick={onClearSearch}
                className="underline hover:text-indigo-300 text-slate-400 text-xs ml-1"
              >
                (Clear search)
              </button>
            </p>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="default">Relevance / Default</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Alphabetical (A-Z)</option>
            <option value="year">Publication Year</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <GenreFilter
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={onSelectGenre}
      />

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Fetching catalog items...</span>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id || book.book_id}
              book={book}
              onSelect={onSelectBook}
              onFindSimilar={onFindSimilar}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No books found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different genre category.
          </p>
          <button
            onClick={() => {
              onClearSearch();
              onSelectGenre('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-medium text-slate-400 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
            Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
