import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Users, Sparkles, BookOpen, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';

export default function BookModal({ book, onClose, onSelectBook, onOpenStudioWithBook }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!book) return;

    let isMounted = true;
    setIsLoadingRecs(true);
    setImgError(false);

    api.getRecommendations(book.id || book.book_id, 4)
      .then((data) => {
        if (isMounted) {
          setRecommendations(data.recommendations || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load modal recommendations:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRecs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [book]);

  if (!book) return null;

  const genresList = book.genres
    ? book.genres.split(',').map((g) => g.trim())
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Book Detail Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Book Cover */}
            <div className="w-full max-w-[240px] mx-auto md:max-w-none aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-xl flex-shrink-0">
              {!imgError && book.image_url ? (
                <img
                  src={book.image_url}
                  alt={book.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
                  <BookOpen className="w-10 h-10 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-white text-base font-serif">{book.title}</h3>
                    <p className="text-xs text-indigo-300 mt-1">{book.author}</p>
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500">BookWise</div>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="md:col-span-2 space-y-4">
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genresList.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Title & Author */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-serif">
                  {book.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-1">
                  by <span className="font-semibold text-indigo-400">{book.author}</span>
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{book.rating ? Number(book.rating).toFixed(2) : '4.0'}</span>
                  <span className="text-slate-500 text-xs font-normal">/ 5.0</span>
                </div>
                {book.ratings_count > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{book.ratings_count.toLocaleString()} ratings</span>
                  </div>
                )}
                {book.publication_year && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Published {book.publication_year}</span>
                  </div>
                )}
                <div className="text-slate-500 text-xs font-mono ml-auto">
                  ID: #{book.id || book.book_id}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Synopsis
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/40">
                  {book.description || 'No description available for this book.'}
                </p>
              </div>

              {/* Action Button: Explore in Studio */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenStudioWithBook(book);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Launch in ML Recommender Studio
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Inline Similar Books Section */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Similar Books You Might Enjoy
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Cosine Similarity Top 4
              </span>
            </div>

            {isLoadingRecs ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-sm">Calculating vector similarity scores...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendations.map((rec) => (
                  <BookCard
                    key={rec.id}
                    book={rec}
                    onSelect={(b) => onSelectBook(b)}
                    onFindSimilar={(b) => onSelectBook(b)}
                    isRecommendation={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No similar books found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
