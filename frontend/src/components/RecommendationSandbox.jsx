import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, BookOpen, Star, Info, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import BookCard from './BookCard';

export default function RecommendationSandbox({ initialBook, onSelectBook }) {
  const [seedBookId, setSeedBookId] = useState(initialBook ? (initialBook.id || initialBook.book_id) : '1');
  const [topN, setTopN] = useState(6);
  const [allBooks, setAllBooks] = useState([]);
  const [recData, setRecData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (initialBook) setSeedBookId(initialBook.id || initialBook.book_id); }, [initialBook]);

  useEffect(() => {
    api.getBooks({ page: 1, limit: 100 }).then((data) => setAllBooks(data.books || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!seedBookId) return;
    let isMounted = true;
    setIsLoading(true); setError(null);

    api.getRecommendations(seedBookId, topN)
      .then((data) => { if (isMounted) setRecData(data); })
      .catch((err) => { if (isMounted) setError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [seedBookId, topN]);

  const sourceBook = recData?.source_book;
  const recommendations = recData?.recommendations || [];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-ink pb-6 flex flex-col md:flex-row justify-between gap-6">
        <div className="max-w-2xl">
          <div className="editorial-label mb-2 flex items-center gap-1.5 text-accent">
            <Cpu className="w-3.5 h-3.5" />
            Machine Learning Studio
          </div>
          <h2 className="display-font text-3xl sm:text-4xl text-ink-900 mb-3">
            Cosine Similarity Engine
          </h2>
          <p className="text-sm text-ink-600 leading-relaxed">
            Select a reference volume to generate vector similarity recommendations based on TF-IDF weighted author affinity, genre tags, and narrative embeddings.
          </p>
        </div>

        <div className="paper-panel p-4 h-fit flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-ink-900 mb-2">
            <CheckCircle2 className="w-4 h-4 text-ink-500" /> Precomputed Model
          </div>
          <p className="text-xs font-mono text-ink-600 mb-1">Alg: Pairwise Cosine Sim</p>
          <p className="text-xs font-mono text-ink-600">Space: TF-IDF (1,2) N-Grams</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 paper-panel bg-paper-50">
        <div className="md:col-span-2 space-y-2">
          <label className="editorial-label text-ink-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Reference Book
          </label>
          <select
            value={seedBookId}
            onChange={(e) => setSeedBookId(e.target.value)}
            className="input-paper font-medium"
          >
            {allBooks.map((b) => (
              <option key={b.id || b.book_id} value={b.id || b.book_id}>
                {b.title} — {b.author}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="editorial-label text-ink-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Output Limit
            </label>
            <span className="text-[10px] font-mono font-bold bg-ink-100 px-1.5 py-0.5">{topN}</span>
          </div>
          <input
            type="range"
            min="2" max="12"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="w-full h-1 bg-paper-300 rounded-none appearance-none cursor-pointer accent-ink-900 mt-4"
          />
          <div className="flex justify-between text-[10px] text-ink-400 font-mono pt-1">
            <span>2</span><span>6</span><span>12</span>
          </div>
        </div>
      </div>

      {/* Reference Book Summary */}
      {sourceBook && (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-line bg-paper-50">
          <div className="w-20 h-28 book-cover flex-shrink-0">
            {sourceBook.image_url ? (
              <img src={sourceBook.image_url} alt={sourceBook.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-paper-200 text-muted">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="editorial-label text-accent mb-1">Source Vector</div>
            <h3 className="display-font text-2xl text-ink-900">{sourceBook.title}</h3>
            <p className="text-sm text-ink-600 mt-1">{sourceBook.author}</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="editorial-label">Avg Rating</div>
            <div className="display-font text-2xl text-ink-900 flex items-center justify-center sm:justify-end gap-1 mt-1">
              {sourceBook.rating?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-end justify-between border-b border-line pb-3 mb-6">
          <h3 className="display-font text-2xl text-ink-900">Computed Results</h3>
          <span className="editorial-label">Sorted by Cosine Score ↓</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="editorial-label">Processing Vectors...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-accent-light text-accent-dark font-medium border border-accent text-sm">
            {error}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {recommendations.map((rec) => (
              <BookCard key={rec.id} book={rec} onSelect={onSelectBook} onFindSimilar={(b) => setSeedBookId(b.id || b.book_id)} isRecommendation />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10 font-serif italic">No significant vectors aligned.</p>
        )}
      </div>

      {/* Explainability */}
      <div className="p-6 md:p-8 paper-panel bg-paper-50 space-y-4">
        <div className="editorial-label text-ink-900 flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4" /> Methodology
        </div>
        <p className="text-sm text-ink-700 leading-relaxed max-w-4xl">
          The engine constructs high-dimensional TF-IDF vectors combining author affinity, genre categorizations, and narrative synopses. The similarity between any reference book <span className="font-mono bg-paper-200 px-1">A</span> and candidate <span className="font-mono bg-paper-200 px-1">B</span> is calculated as:
        </p>
        <div className="p-4 bg-ink-50 font-mono text-center text-ink-900 border border-line text-sm sm:text-base my-4">
          Similarity(A, B) = cos(θ) = (A · B) / (‖A‖ ‖B‖)
        </div>
        <p className="text-sm text-ink-700 leading-relaxed max-w-4xl">
          Scores strictly range from 0.0 to 1.0. The Top-N subset is retrieved via an offline-precomputed similarity matrix, guaranteeing sub-millisecond query execution.
        </p>
      </div>
    </div>
  );
}
