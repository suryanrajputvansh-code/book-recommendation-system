import React, { useState, useEffect } from 'react';
import { Compass, Loader2, ChevronLeft, ChevronRight, BookOpen, RotateCcw, Sparkles, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from './BookCard';
import GenreFilter from './GenreFilter';

export default function CatalogSection({ 
  genres, selectedGenre, onSelectGenre, searchQuery, onClearSearch, onSelectBook, onFindSimilar 
}) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  // Personalized recs state
  const [personalizedRecs, setPersonalizedRecs] = useState(null);

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

  // Fetch personalized recommendations if logged in
  useEffect(() => {
    if (!user) {
      setPersonalizedRecs(null);
      return;
    }
    
    let isMounted = true;
    
    const fetchRecs = () => {
      api.getPersonalizedRecommendations(6)
        .then((data) => {
          if (isMounted) setPersonalizedRecs(data);
        })
        .catch(console.error);
    };

    fetchRecs();

    window.addEventListener('rating-updated', fetchRecs);
    return () => { 
      isMounted = false; 
      window.removeEventListener('rating-updated', fetchRecs);
    };
  }, [user]);

  const [viewMode, setViewMode] = useState('shelves');

  // If user enters a search query or genre filter, switch to all books grid
  useEffect(() => {
    if (searchQuery || selectedGenre) {
      setViewMode('all');
    }
  }, [searchQuery, selectedGenre]);

  return (
    <section className="space-y-10">
      
      {/* Top Header / View Toggle Bar matching Readowl design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="flex items-center gap-3">
          <div className="bg-paper-200/80 p-1 rounded-full border border-paper-300 flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('shelves')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                viewMode === 'shelves'
                  ? 'bg-paper-50 text-ink-900 shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Shelves
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                viewMode === 'all'
                  ? 'bg-paper-50 text-ink-900 shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              All Books
            </button>
          </div>

          {searchQuery && (
            <span className="text-xs text-ink-600">
              Filtered by: <span className="font-bold text-ink-900">"{searchQuery}"</span>
              <button onClick={onClearSearch} className="ml-2 font-bold text-accent hover:underline">✕</button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="editorial-label">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-paper py-1.5 px-3 text-xs w-auto font-semibold border-paper-300 bg-paper-50 rounded-[4px]"
          >
            <option value="default">Curated</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Alphabetical</option>
            <option value="year">Publication Year</option>
          </select>
        </div>
      </div>

      {/* SHELVES MODE: Realistic Bookshelf experience matching the reference */}
      {viewMode === 'shelves' && !searchQuery && !selectedGenre ? (
        <div className="space-y-12">
          
          {/* Shelf 1: Recommendations / Currently Reading */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="display-font text-2xl font-bold text-ink-900">
                  {user ? 'Recommended for You' : 'Currently Reading & Featured'}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {user && personalizedRecs?.eligible 
                    ? 'Tailored to your rated reading preferences' 
                    : 'Handpicked volumes from our library'}
                </p>
              </div>
              <button 
                onClick={() => setViewMode('all')}
                className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-dark transition-colors"
              >
                Full shelf →
              </button>
            </div>

            {/* Books sitting on shelf */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 pt-3 px-2 items-end">
              {(personalizedRecs?.eligible && personalizedRecs.recommendations.length > 0 
                ? personalizedRecs.recommendations.slice(0, 6) 
                : books.slice(0, 6)
              ).map((book) => (
                <BookCard 
                  key={book.id || book.book_id} 
                  book={book} 
                  onSelect={onSelectBook} 
                  onFindSimilar={onFindSimilar} 
                  shelfMode={true}
                />
              ))}
            </div>

            {/* 3D Realistic Wood Shelf Ledge */}
            <div className="relative w-full mt-2 select-none">
              <div className="h-2 w-full bg-[#E5DAC8] border-t border-[#F5EEDB] shadow-inner rounded-t-[1px]" />
              <div className="h-2.5 w-full bg-gradient-to-b from-[#CFC0AA] to-[#B8A78F] rounded-b-[2px] shadow-[0_8px_16px_rgba(30,20,10,0.14)]" />
            </div>
          </div>

          {/* Shelf 2: Next Up / Popular & Acclaimed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="display-font text-2xl font-bold text-ink-900">Next Up</h3>
                <p className="text-xs text-muted mt-0.5">High-rated community staples and modern classics</p>
              </div>
              <button 
                onClick={() => setViewMode('all')}
                className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-dark transition-colors"
              >
                Full shelf →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 pt-3 px-2 items-end">
              {books.slice(6, 12).map((book) => (
                <BookCard 
                  key={book.id || book.book_id} 
                  book={book} 
                  onSelect={onSelectBook} 
                  onFindSimilar={onFindSimilar} 
                  shelfMode={true}
                />
              ))}
            </div>

            {/* 3D Realistic Wood Shelf Ledge */}
            <div className="relative w-full mt-2 select-none">
              <div className="h-2 w-full bg-[#E5DAC8] border-t border-[#F5EEDB] shadow-inner rounded-t-[1px]" />
              <div className="h-2.5 w-full bg-gradient-to-b from-[#CFC0AA] to-[#B8A78F] rounded-b-[2px] shadow-[0_8px_16px_rgba(30,20,10,0.14)]" />
            </div>
          </div>

          {/* Shelf 3: Finished / Timeless Archives */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="display-font text-2xl font-bold text-ink-900">Timeless Archives</h3>
                <p className="text-xs text-muted mt-0.5">Literary triumphs and essential knowledge</p>
              </div>
              <button 
                onClick={() => setViewMode('all')}
                className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-dark transition-colors"
              >
                Full shelf →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 pt-3 px-2 items-end">
              {books.slice(12, 18).map((book) => (
                <BookCard 
                  key={book.id || book.book_id} 
                  book={book} 
                  onSelect={onSelectBook} 
                  onFindSimilar={onFindSimilar} 
                  shelfMode={true}
                />
              ))}
            </div>

            {/* 3D Realistic Wood Shelf Ledge */}
            <div className="relative w-full mt-2 select-none">
              <div className="h-2 w-full bg-[#E5DAC8] border-t border-[#F5EEDB] shadow-inner rounded-t-[1px]" />
              <div className="h-2.5 w-full bg-gradient-to-b from-[#CFC0AA] to-[#B8A78F] rounded-b-[2px] shadow-[0_8px_16px_rgba(30,20,10,0.14)]" />
            </div>
          </div>

        </div>
      ) : (
        /* ALL BOOKS GRID MODE */
        <div className="space-y-6">
          <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={onSelectGenre} />

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
