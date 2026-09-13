import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onSearchSubmit, onSelectBook, onSelectGenre }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  const quickPills = ['Science Fiction', 'Fantasy', 'Mystery & Thriller', 'Classic Literature', 'Technology & Programming', 'Philosophy & Psychology'];

  return (
    <div className="pt-20 pb-16 md:pt-28 md:pb-24 border-b border-paper-300 bg-gradient-to-b from-paper-50 to-transparent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="eyebrow mb-6 flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Curated Discovery</div>
        <h1 className="editorial-title mb-5">Find your next profound read.</h1>
        <p className="editorial-subtitle max-w-2xl mx-auto mb-10">Powered by a semantic similarity engine analyzing authors, themes, and narrative style.</p>

        <div ref={dropdownRef} className="relative max-w-xl mx-auto mb-8 text-left">
          <form onSubmit={handleFormSubmit} className="relative flex items-center shadow-lg shadow-ink-900/5">
            <div className="absolute left-5 text-muted pointer-events-none flex items-center justify-center h-full"><Search className="w-5 h-5" /></div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, author, or keyword..."
              className="input-paper w-full text-base sm:text-lg"
              style={{ paddingLeft: '52px', paddingRight: '110px', paddingTop: '16px', paddingBottom: '16px', borderRadius: '8px' }} />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-[90px] text-muted hover:text-ink-900 p-1.5 rounded-full hover:bg-paper-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="absolute right-2 btn-primary" style={{ minHeight: '44px', borderRadius: '6px' }}>Search</button>
          </form>

          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-paper-50 border border-paper-300 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-2 divide-y divide-paper-200">
                {suggestions.map((book) => (
                  <div key={book.id} onClick={() => { setIsOpen(false); onSelectBook(book); }} className="p-3 hover:bg-paper-100 cursor-pointer flex items-center justify-between transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 book-cover flex-shrink-0">
                        {book.image_url ? <img src={book.image_url} alt={book.title} /> : <div className="w-full h-full flex items-center justify-center text-muted bg-paper-200"><BookOpen className="w-4 h-4" /></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900 text-sm group-hover:text-accent transition-colors">{book.title}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{book.author}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-paper-400 group-hover:text-accent transition-all" />
                  </div>
                ))}
              </div>
              <div onClick={handleFormSubmit} className="bg-paper-100 p-2.5 text-center text-xs text-ink-600 hover:text-ink-900 cursor-pointer font-bold uppercase tracking-wider border-t border-paper-300">View all results</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="editorial-label mr-2">Trending:</span>
          {quickPills.map((genre) => (
            <button key={genre} onClick={() => onSelectGenre(genre)} className="text-[12px] font-medium text-ink-600 hover:text-accent underline decoration-paper-400 underline-offset-4 hover:decoration-accent transition-colors">{genre}</button>
          ))}
        </div>
      </div>
    </div>
  );
}