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
        <div className="space-y-12">
          {/* Shelf Tier 1 (Ranks 1-6) */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 pt-3 px-2 items-end">
              {popularBooks.slice(0, 6).map((book, idx) => (
                <div key={book.id} className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-ink-900 text-paper-50 text-[9px] font-bold tracking-widest uppercase rounded-[2px] shadow-sm">
                    #{idx + 1}
                  </div>
                  <BookCard book={book} onSelect={onSelectBook} onFindSimilar={onFindSimilar} shelfMode={true} />
                </div>
              ))}
            </div>
            {/* 3D Realistic Wood Shelf Ledge */}
            <div className="relative w-full mt-2 select-none">
              <div className="h-2 w-full bg-[#E5DAC8] border-t border-[#F5EEDB] shadow-inner rounded-t-[1px]" />
              <div className="h-2.5 w-full bg-gradient-to-b from-[#CFC0AA] to-[#B8A78F] rounded-b-[2px] shadow-[0_8px_16px_rgba(30,20,10,0.14)]" />
            </div>
          </div>

          {/* Shelf Tier 2 (Ranks 7-12) */}
          {popularBooks.length > 6 && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 pt-3 px-2 items-end">
                {popularBooks.slice(6, 12).map((book, idx) => (
                  <div key={book.id} className="relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-paper-400 text-ink-900 text-[9px] font-bold tracking-widest uppercase rounded-[2px] shadow-sm">
                      #{idx + 7}
                    </div>
                    <BookCard book={book} onSelect={onSelectBook} onFindSimilar={onFindSimilar} shelfMode={true} />
                  </div>
                ))}
              </div>
              {/* 3D Realistic Wood Shelf Ledge */}
              <div className="relative w-full mt-2 select-none">
                <div className="h-2 w-full bg-[#E5DAC8] border-t border-[#F5EEDB] shadow-inner rounded-t-[1px]" />
                <div className="h-2.5 w-full bg-gradient-to-b from-[#CFC0AA] to-[#B8A78F] rounded-b-[2px] shadow-[0_8px_16px_rgba(30,20,10,0.14)]" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
