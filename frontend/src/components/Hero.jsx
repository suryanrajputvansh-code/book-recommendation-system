import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, Star, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onSearchSubmit, onSelectBook, onSelectGenre }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="eyebrow mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Curated Discovery
        </div>

        <h1 className="editorial-title mb-5">
          Find your next profound read.
        </h1>

        <p className="editorial-subtitle max-w-2xl mx-auto mb-10">
          Powered by a semantic similarity engine analyzing authors, themes, and narrative style.
        </p>

        <div ref={dropdownRef} className="relative max-w-xl mx-auto mb-8 text-left">
          <form onSubmit={handleFormSubmit} className="relative flex items-center shadow-paper-lg">
            <div className="absolute left-4 text-muted pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, or keyword..."
              className="input-paper w-full pl-11 pr-24 py-3.5 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); }}
                className="absolute right-[88px] text-muted hover:text-ink p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="btn-primary absolute right-1.5 py-2 px-4"
              style={{ minHeight: '34px' }}
            >
              Search
            </button>
          </form>

          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-paper-50 border border-paper-300 rounded-[3px] shadow-paper-lg overflow-hidden z-50">
              <div className="p-2 divide-y divide-paper-200">
                {suggestions.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => { setIsOpen(false); onSelectBook(book); }}
                    className="p-3 hover:bg-paper-100 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 book-cover flex-shrink-0">
                        {book.image_url ? (
                          <img src={book.image_url} alt={book.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted bg-paper-200">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900 text-sm group-hover:text-accent transition-colors">
                          {book.title}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          {book.author}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-paper-400 group-hover:text-accent transition-all" />
                  </div>
                ))}
              </div>
              <div 
                onClick={handleFormSubmit}
                className="bg-paper-100 p-2.5 text-center text-xs text-ink-600 hover:text-ink-900 cursor-pointer font-bold uppercase tracking-wider border-t border-paper-300"
              >
                View all results
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="editorial-label mr-2">Trending:</span>
          {quickPills.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className="text-[12px] font-medium text-ink-600 hover:text-accent underline decoration-paper-400 underline-offset-4 hover:decoration-accent transition-colors"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
