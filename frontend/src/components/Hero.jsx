import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, Star, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onSearchSubmit, onSelectBook, onSelectGenre }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search for instant autocomplete
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.searchBooks(query, 6);
        setSuggestions(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    onSearchSubmit(query);
  };

  const quickPills = [
    'Science Fiction',
    'High Fantasy',
    'Psychological Thriller',
    'Classic',
    'Computer Science',
    'Self-Help'
  ];

  return (
    <div className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vector Similarity & Cosine Recommendation Engine</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Discover Books You’ll <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Genuinely Love</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-normal">
          Trained on comprehensive book metadata, semantic tags, authors, and narrative synopses. Find similar reads powered by Scikit-learn Cosine Similarity.
        </p>

        {/* Search Bar Container */}
        <div ref={dropdownRef} className="relative max-w-2xl mx-auto mb-6">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, genre, or keyword (e.g. 'Dune', 'Sanderson', 'Psychology')..."
              className="w-full pl-12 pr-28 py-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base shadow-xl shadow-slate-950/50 backdrop-blur-md transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); }}
                className="absolute right-24 text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              Search
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
              <div className="p-2 divide-y divide-slate-800">
                {suggestions.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      setIsOpen(false);
                      onSelectBook(book);
                    }}
                    className="p-3 hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-slate-800 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                        {book.image_url ? (
                          <img
                            src={book.image_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                          {book.title}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{book.author}</span>
                          {book.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {book.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
              <div 
                onClick={handleFormSubmit}
                className="bg-slate-950/60 p-2.5 text-center text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium border-t border-slate-800"
              >
                View all results for "{query}" →
              </div>
            </div>
          )}
        </div>

        {/* Quick Genre Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="font-medium mr-1 text-slate-500">Popular Genres:</span>
          {quickPills.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
