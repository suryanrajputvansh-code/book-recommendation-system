import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onSearchSubmit, onSelectBook, onSelectGenre }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // entrance animation trigger
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) { setSuggestions([]); setIsOpen(false); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.searchBooks(query, 6);
        setSuggestions(data.results || []);
        setIsOpen(true);
      } catch (err) { console.error('Autocomplete error:', err); }
      finally { setIsLoading(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e) => { e.preventDefault(); setIsOpen(false); onSearchSubmit(query); };
  const handleClear = () => { setQuery(''); setSuggestions([]); setIsOpen(false); inputRef.current?.focus(); };

  const quickPills = ['Science Fiction', 'Fantasy', 'Mystery & Thriller', 'Classic Literature', 'Technology & Programming', 'Philosophy & Psychology'];

  return (
    <div className="hero-section pt-20 pb-16 md:pt-28 md:pb-24 border-b border-paper-300 overflow-hidden">

      {/* Ambient marquee strip just under the hero area — pure CSS, no libs */}
      <div className="hero-marquee-wrap" aria-hidden="true">
        <div className="hero-marquee">
          {/* Titles repeated twice so marquee loops seamlessly */}
          {[1, 2].map((n) => (
            <span key={n} className="hero-marquee-inner">
              {'Crime & Punishment · Dune · 1984 · The Hobbit · Foundation · Sapiens · The Trial · Neuromancer · Ender\'s Game · Brave New World · The Master & Margarita · Snow Crash · The Name of the Wind · Meditations · The Hitchhiker\'s Guide · The Shining · Left Hand of Darkness · Clean Code · Structure & Interpretation · Don Quixote · Middlemarch · To Kill a Mockingbird ·\u00a0'}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">

        {/* Eyebrow — animated, flanked by hairlines */}
        <div className={`hero-eyebrow mb-7 flex items-center justify-center gap-3 ${mounted ? 'hero-anim-in' : 'hero-anim-out'}`}
          style={{ animationDelay: '0ms' }}>
          <span className="hero-hairline" />
          <span className="eyebrow eyebrow--lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Discovery
          </span>
          <span className="hero-hairline" />
        </div>

        {/* Headline */}
        <h1 className={`editorial-title mb-7 ${mounted ? 'hero-anim-in' : 'hero-anim-out'}`}
          style={{ animationDelay: '120ms' }}>
          Find your next profound read.
        </h1>

        {/* Subtitle — more breathing room */}
        <p className={`editorial-subtitle max-w-2xl mx-auto mb-10 ${mounted ? 'hero-anim-in' : 'hero-anim-out'}`}
          style={{ animationDelay: '240ms' }}>
          Powered by a semantic similarity engine analyzing authors, themes, and narrative style.
        </p>

        {/* ── Search bar ─────────────────────────────────────────────────────────
            Rebuilt as a proper flex row. Icon is a flex item, NOT absolutely
            positioned, so it can never overlap the text cursor.
        ───────────────────────────────────────────────────────────────────────── */}
        <div ref={dropdownRef}
          className={`relative max-w-xl mx-auto mb-8 text-left ${mounted ? 'hero-anim-in' : 'hero-anim-out'}`}
          style={{ animationDelay: '360ms' }}>

          <form onSubmit={handleFormSubmit}
            className="search-bar-wrap">

            {/* Search icon — flex item, never overlaps */}
            <span className="search-bar-icon" aria-hidden="true">
              <Search className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </span>

            {/* Input takes remaining space */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, or keyword..."
              className="search-bar-input"
              aria-label="Search books"
            />

            {/* Clear button — only when there is text */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="search-bar-clear"
                aria-label="Clear search"
              >
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            )}

            {/* Submit */}
            <button type="submit" className="search-bar-submit">
              Search
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-paper-50 border border-paper-300 shadow-paper-lg overflow-hidden z-50" style={{ borderRadius: '4px' }}>
              <div className="p-1.5 divide-y divide-paper-200">
                {suggestions.map((book) => (
                  <div key={book.id}
                    onClick={() => { setIsOpen(false); onSelectBook(book); }}
                    className="p-3 hover:bg-paper-100 cursor-pointer flex items-center justify-between transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-13 book-cover flex-shrink-0" style={{ height: '52px' }}>
                        {book.image_url
                          ? <img src={book.image_url} alt={book.title} />
                          : <div className="w-full h-full flex items-center justify-center text-muted bg-paper-200"><BookOpen style={{ width: '14px', height: '14px' }} /></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900 text-sm group-hover:text-accent transition-colors">{book.title}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{book.author}</div>
                      </div>
                    </div>
                    <ArrowRight style={{ width: '15px', height: '15px' }} className="text-paper-400 group-hover:text-accent transition-all flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div onClick={handleFormSubmit}
                className="bg-paper-100 px-3 py-2.5 text-center text-[11px] text-ink-600 hover:text-ink-900 cursor-pointer font-bold uppercase tracking-widest border-t border-paper-300">
                View all results
              </div>
            </div>
          )}
        </div>

        {/* Trending pills */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="editorial-label mr-1">Trending:</span>
          {quickPills.map((genre) => (
            <button key={genre} onClick={() => onSelectGenre(genre)}
              className="text-[12px] font-medium text-ink-600 hover:text-accent underline decoration-paper-400 underline-offset-4 hover:decoration-accent transition-colors">
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}