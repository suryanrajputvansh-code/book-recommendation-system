import React, { useState, useEffect } from 'react';
import { Flame, Star, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';

export default function PopularSection({ onSelectBook, onFindSimilar }) {
  const [popularBooks, setPopularBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getPopular(12)
      .then((data) => {
        if (isMounted) setPopularBooks(data.popular_books || []);
      })
      .catch((err) => console.error('Failed to load popular books:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular & Top-Rated Books</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Ranked by Bayesian weighted average of community ratings and review volume
            </p>
          </div>
        </div>
      </div>

      {/* Grid or Loader */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading popular books...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {popularBooks.map((book, idx) => (
            <div key={book.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 z-20 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-900">
                #{idx + 1}
              </div>
              <BookCard
                book={book}
                onSelect={onSelectBook}
                onFindSimilar={onFindSimilar}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
