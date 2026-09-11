import React, { useState, useEffect } from 'react';
import { Compass, Loader2, ChevronLeft, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';
import GenreFilter from './GenreFilter';

export default function CatalogSection({ 
  genres, selectedGenre, onSelectGenre, searchQuery, onClearSearch, onSelectBook, onFindSimilar 
}) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => { setCurrentPage(1); }, [selectedGenre, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getBooks({ page: currentPage, limit: 18, genre: selectedGenre, search: searchQuery })
      .then((data) => {
        if (isMounted) {
          let loaded = data.books || [];
          if (sortBy === 'rating') loaded = [...loaded].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          else if (sortBy === 'title') loaded = [...loaded].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          else if (sortBy === 'year') loaded = [...loaded].sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
          
          setBooks(loaded);
          setTotalPages(data.total_pages || 1);
          setTotalBooks(data.total || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [currentPage, selectedGenre, searchQuery, sortBy]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-ink">
        <div>
          <div className="editorial-label mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Complete Library — {totalBooks} Titles
          </div>
          <h2 className="display-font text-3xl sm:text-4xl">The Catalog</h2>
          {searchQuery && (
            <p className="text-sm text-ink-600 mt-2">
              Results for: <span className="font-semibold text-ink-900">"{searchQuery}"</span>
              <button onClick={onClearSearch} className="ml-3 text-xs uppercase tracking-wider font-bold text-accent hover:underline">Clear</button>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="editorial-label">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-paper py-1.5 px-3 text-xs w-auto font-semibold border-paper-300 bg-paper-50"
          >
            <option value="default">Relevance</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Alphabetical</option>
            <option value="year">Publication Year</option>
          </select>
        </div>
      </div>

      <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={onSelectGenre} />

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-ink-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-ink-300" />
          <span className="editorial-label">Accessing Archives...</span>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {books.map((book) => (
            <BookCard key={book.id || book.book_id} book={book} onSelect={onSelectBook} onFindSimilar={onFindSimilar} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-paper-50 rounded-sm border border-paper-200">
          <BookOpen className="w-10 h-10 text-paper-400 mx-auto mb-4" />
          <h3 className="display-font text-2xl text-ink-900 mb-2">No volumes found</h3>
          <p className="text-sm text-ink-600 mb-6">The archives hold no records matching your criteria.</p>
          <button onClick={() => { onClearSearch(); onSelectGenre(''); }} className="btn-secondary">
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10 pb-6 border-t border-paper-200">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="btn-secondary px-3 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="editorial-label text-ink-900">
            Page {currentPage} of {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="btn-secondary px-3 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
