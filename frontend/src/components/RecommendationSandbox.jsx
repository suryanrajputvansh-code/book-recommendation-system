import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, ArrowRight, BookOpen, Star, Info, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';

export default function RecommendationSandbox({ initialBook, onSelectBook }) {
  const [seedBookId, setSeedBookId] = useState(initialBook ? (initialBook.id || initialBook.book_id) : '1');
  const [topN, setTopN] = useState(6);
  const [allBooks, setAllBooks] = useState([]);
  const [recData, setRecData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync initialBook if passed from outside
  useEffect(() => {
    if (initialBook) {
      setSeedBookId(initialBook.id || initialBook.book_id);
    }
  }, [initialBook]);

  // Load catalog options for the dropdown selector
  useEffect(() => {
    api.getBooks({ page: 1, limit: 100 })
      .then((data) => setAllBooks(data.books || []))
      .catch((err) => console.error('Failed to load books for studio:', err));
  }, []);

  // Fetch recommendations whenever seedBookId or topN changes
  useEffect(() => {
    if (!seedBookId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api.getRecommendations(seedBookId, topN)
      .then((data) => {
        if (isMounted) {
          setRecData(data);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [seedBookId, topN]);

  const sourceBook = recData?.source_book;
  const recommendations = recData?.recommendations || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Machine Learning Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cosine Similarity Recommendation Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Select any seed book in the catalog to generate vector similarity recommendations based on TF-IDF weighted author, genre tags, and narrative embeddings.
          </p>
        </div>

        {/* Model Info Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs space-y-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Precomputed Model Active</span>
          </div>
          <p className="text-slate-500 font-mono">Algorithm: Pairwise Cosine Similarity</p>
          <p className="text-slate-500 font-mono">Vector Space: TF-IDF (1, 2) N-Grams</p>
        </div>
      </div>

      {/* Control Panel: Seed Selection & Top-N Slider */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        {/* Seed Book Selector */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Seed Book for Similarity Comparison
          </label>
          <select
            value={seedBookId}
            onChange={(e) => setSeedBookId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {allBooks.map((b) => (
              <option key={b.id || b.book_id} value={b.id || b.book_id}>
                {b.title} — {b.author} ({b.genres ? b.genres.split(',')[0] : 'General'})
              </option>
            ))}
          </select>
        </div>

        {/* Top N Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Recommendations Limit (Top-N)
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              {topN} books
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2</span>
            <span>6</span>
            <span>12</span>
          </div>
        </div>
      </div>

      {/* Seed Book Inspection Banner */}
      {sourceBook && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 p-5 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-22 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
            {sourceBook.image_url ? (
              <img src={sourceBook.image_url} alt={sourceBook.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Current Reference Title</span>
            <h3 className="text-lg font-bold text-white font-serif">{sourceBook.title}</h3>
            <p className="text-xs text-slate-300">by {sourceBook.author} • <span className="text-slate-400">{sourceBook.genres}</span></p>
          </div>
          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-xs font-mono text-slate-400">Average Rating</div>
            <div className="text-lg font-bold text-amber-400 flex items-center justify-center sm:justify-end gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              {sourceBook.rating?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Generated Recommendations</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sorted by Cosine Similarity Score ↓
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Computing similarity rankings...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {recommendations.map((rec) => (
              <BookCard
                key={rec.id}
                book={rec}
                onSelect={onSelectBook}
                onFindSimilar={(b) => setSeedBookId(b.id || b.book_id)}
                isRecommendation={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No recommendation matches found.</p>
        )}
      </div>

      {/* Formula & Explainability Callout */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>How does this recommendation engine work?</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The recommendation engine constructs high-dimensional TF-IDF vectors combining weighted metadata: author affinity, categorized genres, narrative keywords, and book synopses. The similarity between any seed book <span className="text-indigo-300 font-mono">A</span> and candidate book <span className="text-indigo-300 font-mono">B</span> is calculated using Cosine Similarity:
        </p>
        <div className="p-4 rounded-2xl bg-slate-950 font-mono text-center text-indigo-300 border border-slate-800 text-sm sm:text-base">
          Similarity(A, B) = cos(θ) = (A · B) / (‖A‖ ‖B‖)
        </div>
        <p className="text-slate-400 leading-relaxed">
          Scores range from 0.0 (unrelated) to 1.0 (identical thematic profile). Top-N items with the highest angular alignment are returned with zero runtime latency due to offline matrix precomputation.
        </p>
      </div>
    </div>
  );
}
