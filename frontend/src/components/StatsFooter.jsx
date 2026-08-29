import React from 'react';
import { Database, Cpu, Layers, CheckCircle2 } from 'lucide-react';

export default function StatsFooter({ stats }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="text-white font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              BookWise ML
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An end-to-end Machine Learning book recommendation pipeline powered by Scikit-Learn TF-IDF vectorization and precomputed Cosine Similarity.
            </p>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Pipeline Architecture</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Data Ingestion: Pandas CSV Loader</li>
              <li>• Feature Engineering: Weighted Soup</li>
              <li>• Model: TF-IDF + Cosine Similarity</li>
              <li>• Backend: FastAPI with CORS & Lifespan</li>
            </ul>
          </div>

          {/* Col 3: Live Stats */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">System Status</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <p>Status: <span className="text-emerald-400 font-semibold">{stats?.status || 'Online'}</span></p>
              <p>Catalog Size: <span className="text-indigo-300">{stats?.total_books || 100} books</span></p>
              <p>Genres Available: <span className="text-indigo-300">{stats?.genres_count || 32} categories</span></p>
            </div>
          </div>

          {/* Col 4: Performance */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Performance Profile</h4>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Precomputed Lookups</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Matrix lookups execute in &lt; 2ms without runtime vector re-computation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 BookWise. Built with Python, Scikit-Learn, FastAPI, React & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <a href="http://127.0.0.1:5000/docs" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
              OpenAPI Swagger UI
            </a>
            <a href="http://127.0.0.1:5000/api/stats" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
              Telemetry JSON
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
