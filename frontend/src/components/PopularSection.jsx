import React, { useState, useEffect } from 'react';
import { Flame, Loader2 } from 'lucide-react';
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
      .catch((err) => console.error(err))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="space-y-6">
      <div className="pb-4 border-b border-ink">
        <div className="editorial-label mb-2 flex items-center gap-1.5 text-accent">
          <Flame className="w-3.5 h-3.5" />
          Highly Regarded
        </div>
        <h2 className="display-font text-3xl sm:text-4xl text-ink-900">
          The Bestseller List
        </h2>
        <p className="text-sm text-ink-600 mt-2 max-w-2xl">
          Ranked by a Bayesian weighted average of community ratings and review volume.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-ink-300" />
          <span className="editorial-label">Compiling Rankings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {popularBooks.map((book, idx) => (
            <div key={book.id} className="relative mt-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 bg-ink-900 text-paper-50 text-[10px] font-bold tracking-widest uppercase border border-paper-100 shadow-sm">
                Rank {idx + 1}
              </div>
              <BookCard book={book} onSelect={onSelectBook} onFindSimilar={onFindSimilar} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
