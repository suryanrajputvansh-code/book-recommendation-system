import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, ArrowRight, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from './BookCard';

export default function BookModal({ book, onClose, onSelectBook, onOpenStudioWithBook }) {
  const { user, setShowAuthModal } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // Rating states
  const [ratingStats, setRatingStats] = useState({
    average: book?.rating || 0.0,
    count: book?.ratings_count || 0,
    user_rating: null
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  useEffect(() => {
    if (!book) return;
    let isMounted = true;
    const bookId = book.id || book.book_id;

    setIsLoadingRecs(true);
    api.getRecommendations(bookId, 4)
      .then((data) => { if (isMounted) setRecommendations(data.recommendations || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setIsLoadingRecs(false); });

    // Fetch live rating details from backend
    api.getRating(bookId)
      .then((data) => {
        if (isMounted && data) {
          setRatingStats({
            average: data.average,
            count: data.count,
            user_rating: data.user_rating
          });
        }
      })
      .catch(console.error);

    return () => { isMounted = false; };
  }, [book, user]);

  if (!book) return null;
  const genresList = book.genres ? book.genres.split(',').map((g) => g.trim()) : [];
  const bookId = book.id || book.book_id;

  const handleStarClick = async (starValue) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsRatingLoading(true);
    try {
      if (ratingStats.user_rating === starValue) {
        // Clear rating on repeat click
        const data = await api.deleteRating(bookId);
        setRatingStats({
          average: data.average,
          count: data.count,
          user_rating: null
        });
      } else {
        // Set / update rating
        const data = await api.rateBook(bookId, starValue);
        setRatingStats({
          average: data.average,
          count: data.count,
          user_rating: data.user_rating
        });
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsRatingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-paper-50 border border-line shadow-paper-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-ink-500 hover:text-ink-900 transition-colors bg-paper-50 rounded-full"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
            
            {/* Book Cover */}
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

            {/* Book Metadata & Rating Control */}
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
                  <span className="editorial-label mb-1">Average Rating</span>
                  <span className="font-bold text-ink-900">{ratingStats.average.toFixed(2)} / 5</span>
                </div>
                <div className="flex flex-col border-l border-line pl-6">
                  <span className="editorial-label mb-1">Total Ratings</span>
                  <span className="text-ink-900">{ratingStats.count.toLocaleString()}</span>
                </div>
                {book.publication_year && (
                  <div className="flex flex-col border-l border-line pl-6">
                    <span className="editorial-label mb-1">Published</span>
                    <span className="text-ink-900">{book.publication_year}</span>
                  </div>
                )}
              </div>

              {/* 5-Star Interactive Rating Widget */}
              <div className="p-4 bg-paper-100 border border-paper-300 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="editorial-label text-ink-900">Your Rating</span>
                  <span className="text-xs text-muted font-medium">
                    {ratingStats.user_rating
                      ? `You rated this ${ratingStats.user_rating}/5 (click to clear)`
                      : user
                      ? 'Click a star to rate'
                      : 'Sign in to rate'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || ratingStats.user_rating || 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isRatingLoading}
                        aria-label={`Rate ${star} stars out of 5`}
                        className="p-1 rounded-sm hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'text-amber-600 fill-amber-500'
                              : 'text-paper-400 hover:text-amber-500'
                          }`}
                        />
                      </button>
                    );
                  })}

                  {isRatingLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted ml-2" />
                  )}
                </div>
              </div>

              <div>
                <h4 className="editorial-label mb-2">Synopsis</h4>
                <p className="text-sm text-ink-700 leading-relaxed font-serif">
                  {book.description || 'No description available for this volume.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { onClose(); onOpenStudioWithBook(book); }}
                  className="btn-primary"
                >
                  Analyze in ML Studio <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations */}
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
