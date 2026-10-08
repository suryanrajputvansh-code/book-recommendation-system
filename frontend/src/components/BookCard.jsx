import React, { useState } from 'react';
import { Star, Sparkles, BookOpen, ArrowUpRight } from 'lucide-react';

export default function BookCard({ book, onSelect, onFindSimilar, isRecommendation = false }) {
  const [imgError, setImgError] = useState(false);

  const genresList = book.genres
    ? book.genres.split(',').map((g) => g.trim()).slice(0, 2)
    : [];

  const matchPercent = book.match_percentage ?? (book.similarity_score ? Math.round(book.similarity_score * 1000) / 10 : null);

  return (
    <div 
      className="group flex flex-col paper-panel paper-panel-hover p-3.5 sm:p-4 h-full relative cursor-pointer border border-line rounded-[4px] bg-paper-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      onClick={() => onSelect(book)}
    >
      {/* Cover container with editorial book spine effect */}
      <div className="relative w-full aspect-[2/3] mb-3.5 book-cover rounded-[2px] overflow-hidden shadow-sm shadow-ink-900/10">
        {/* Book spine highlight on left edge */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-20 pointer-events-none" />

        {!imgError && book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-paper-200 text-left border-b border-paper-300">
            <BookOpen className="w-6 h-6 text-ink-300" />
            <div>
              <p className="display-font text-ink-900 text-sm line-clamp-3">{book.title}</p>
              <p className="text-[10px] text-ink-600 mt-1 uppercase tracking-wider">{book.author}</p>
            </div>
          </div>
        )}

        {/* Cosine Similarity Tag */}
        {matchPercent !== null && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-paper-50/95 border border-paper-300 text-[10px] font-bold text-ink-900 shadow-xs flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>{matchPercent}%</span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-ink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
          <div className="bg-paper-50 px-2.5 py-1 border border-paper-300 text-[10px] font-bold tracking-widest uppercase text-ink-900 shadow-sm flex items-center gap-1">
            View <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <h3 
          className="display-font text-ink-900 text-base leading-snug line-clamp-2 mb-1 group-hover:text-accent transition-colors" 
          title={book.title}
        >
          {book.title}
        </h3>
        
        {/* Author */}
        <p className="text-xs text-ink-600 mb-3 font-medium italic line-clamp-1">
          {book.author}
        </p>

        <div className="mt-auto">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {genresList.map((genre) => (
              <span key={genre} className="text-[9px] uppercase font-bold tracking-wider text-muted border-b border-paper-300 pb-0.5">
                {genre}
              </span>
            ))}
          </div>

          <div className="pt-2.5 border-t border-paper-200 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-bold text-ink-900">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{book.rating ? Number(book.rating).toFixed(2) : '4.0'}</span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onFindSimilar(book); }}
              className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-dark transition-colors flex items-center gap-1"
            >
              Similar <Sparkles className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
