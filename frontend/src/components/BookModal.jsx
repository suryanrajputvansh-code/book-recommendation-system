import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';

export default function BookModal({ book, onClose, onSelectBook, onOpenStudioWithBook }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  useEffect(() => {
    if (!book) return;
    let isMounted = true;
    setIsLoadingRecs(true);
    api.getRecommendations(book.id || book.book_id, 4)
      .then((data) => { if (isMounted) setRecommendations(data.recommendations || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setIsLoadingRecs(false); });
    return () => { isMounted = false; };
  }, [book]);

  if (!book) return null;
  const genresList = book.genres ? book.genres.split(',').map((g) => g.trim()) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-paper-50 border border-line shadow-paper-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-ink-500 hover:text-ink-900 transition-colors bg-paper-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
            <div className="w-full max-w-[240px] mx-auto md:max-w-none aspect-[2/3] book-cover">
              {book.image_url ? (
                <img src={book.image_url} alt={book.title} />
              ) : (
                <div className="w-full h-full p-6 flex flex-col justify-between bg-paper-200 border-b border-paper-300">
                  <BookOpen className="w-8 h-8 text-ink-300" />
                  <div>
                    <h3 className="display-font text-ink-900 text-lg leading-snug">{book.title}</h3>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {genresList.map((g) => (
                  <span key={g} className="editorial-label border-b border-line pb-0.5">
                    {g}
                  </span>
                ))}
              </div>

              <div>
                <h2 className="display-font text-3xl sm:text-5xl text-ink-900 leading-none mb-3">
                  {book.title}
                </h2>
                <p className="text-base text-ink-600 font-medium">
                  By <span className="text-ink-900">{book.author}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-line text-sm">
                <div className="flex flex-col">
                  <span className="editorial-label mb-1">Rating</span>
                  <span className="font-bold text-ink-900">{book.rating ? Number(book.rating).toFixed(2) : '4.0'} / 5</span>
                </div>
                {book.ratings_count > 0 && (
                  <div className="flex flex-col border-l border-line pl-6">
                    <span className="editorial-label mb-1">Reviews</span>
                    <span className="text-ink-900">{book.ratings_count.toLocaleString()}</span>
                  </div>
                )}
                {book.publication_year && (
                  <div className="flex flex-col border-l border-line pl-6">
                    <span className="editorial-label mb-1">Published</span>
                    <span className="text-ink-900">{book.publication_year}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="editorial-label mb-2">Synopsis</h4>
                <p className="text-sm text-ink-700 leading-relaxed font-serif">
                  {book.description || 'No description available for this volume.'}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { onClose(); onOpenStudioWithBook(book); }}
                  className="btn-primary"
                >
                  Analyze in ML Studio <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 mt-10 border-t border-ink">
            <div className="flex items-end justify-between mb-6">
              <h3 className="display-font text-2xl text-ink-900">Similar Volumes</h3>
              <span className="editorial-label hidden sm:block">Cosine Similarity Analysis</span>
            </div>

            {isLoadingRecs ? (
              <div className="flex items-center justify-center py-12 text-ink-500 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="editorial-label">Consulting matrix...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendations.map((rec) => (
                  <BookCard key={rec.id} book={rec} onSelect={onSelectBook} onFindSimilar={onSelectBook} isRecommendation />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500 italic font-serif">No similar books identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
