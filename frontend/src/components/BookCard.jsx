import React, { useState } from 'react';
import { Star, Sparkles, BookOpen, Calendar, ArrowUpRight } from 'lucide-react';

export default function BookCard({ book, onSelect, onFindSimilar, isRecommendation = false }) {
  const [imgError, setImgError] = useState(false);

  const genresList = book.genres
    ? book.genres.split(',').map((g) => g.trim()).slice(0, 2)
    : [];

  const matchPercent = book.match_percentage ?? (book.similarity_score ? Math.round(book.similarity_score * 1000) / 10 : null);

  // Determine badge color based on match %
  const getBadgeColor = (percent) => {
    if (percent >= 70) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (percent >= 40) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/40">
      {/* Top Cover / Header */}
      <div 
        className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 mb-3.5 cursor-pointer"
        onClick={() => onSelect(book)}
      >
        {!imgError && book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 text-left">
            <BookOpen className="w-8 h-8 text-indigo-400/60" />
            <div>
              <p className="font-bold text-white text-sm line-clamp-3 font-serif">{book.title}</p>
              <p className="text-xs text-indigo-300/80 mt-1">{book.author}</p>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500">BookWise</div>
          </div>
        )}

        {/* Cosine Similarity Pill (if recommendation) */}
        {matchPercent !== null && (
          <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg flex items-center gap-1 ${getBadgeColor(matchPercent)}`}>
            <Sparkles className="w-3 h-3" />
            <span>{matchPercent}% Match</span>
          </div>
        )}

        {/* Publication year tag */}
        {book.publication_year && !matchPercent && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-300 backdrop-blur-sm">
            {book.publication_year}
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1">
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Genre tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {genresList.map((genre) => (
              <span
                key={genre}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(book)}
            className="font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer hover:text-indigo-300 transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
            by {book.author}
          </p>
        </div>

        {/* Bottom Bar: Rating & Recommendation CTA */}
        <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{book.rating > 0 ? book.rating.toFixed(2) : '4.0'}</span>
            {book.ratings_count > 0 && (
              <span className="text-[11px] text-slate-500">
                ({(book.ratings_count / 1000).toFixed(0)}k)
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFindSimilar(book);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Similar
          </button>
        </div>
      </div>
    </div>
  );
}
