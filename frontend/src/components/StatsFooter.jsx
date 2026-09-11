import React from 'react';
import { Database, Cpu, CheckCircle2 } from 'lucide-react';

export default function StatsFooter({ stats }) {
  return (
    <footer className="border-t border-ink bg-ink-900 text-paper-400 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="display-font text-2xl text-paper-50 tracking-tight">
              BookWise
            </div>
            <p className="text-xs text-ink-300 leading-relaxed max-w-xs">
              An editorial machine learning pipeline leveraging Scikit-Learn TF-IDF vectorization and precomputed Cosine Similarity matrices.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="text-paper-100 font-bold uppercase tracking-widest text-[10px]">Architecture</h4>
            <ul className="space-y-2 text-ink-300">
              <li className="border-b border-ink-700 pb-1">Ingestion: Pandas CSV</li>
              <li className="border-b border-ink-700 pb-1">Features: Weighted Text</li>
              <li className="border-b border-ink-700 pb-1">Model: TF-IDF + Cosine</li>
              <li className="border-b border-ink-700 pb-1">Backend: FastAPI</li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="text-paper-100 font-bold uppercase tracking-widest text-[10px]">Telemetry</h4>
            <div className="space-y-2 text-ink-300 font-mono">
              <p>Status: <span className="text-paper-100">{stats?.status || 'Online'}</span></p>
              <p>Catalog: <span className="text-paper-100">{stats?.total_books || 100}</span> titles</p>
              <p>Genres: <span className="text-paper-100">{stats?.genres_count || 32}</span> listed</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="text-paper-100 font-bold uppercase tracking-widest text-[10px]">Performance</h4>
            <div className="p-4 bg-ink-800 border border-ink-700 space-y-2">
              <div className="flex items-center gap-1.5 text-paper-50 font-bold tracking-widest uppercase text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Precomputed Lookups
              </div>
              <p className="text-[11px] text-ink-300 font-mono leading-relaxed">
                Matrix lookups execute in &lt; 2ms without runtime vector re-computation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-ink-800 flex flex-col md:flex-row items-center justify-between text-[11px] font-medium text-ink-500 gap-6">
          <div className="flex flex-col gap-1.5 text-center md:text-left max-w-2xl leading-relaxed">
            <p className="text-paper-100 font-bold tracking-wider">
              © {new Date().getFullYear()} Vanch Suryan. All Rights Reserved.
            </p>
            <p>
              Proprietary software protected under international intellectual property and patent laws.
              Unauthorized duplication, reproduction, or distribution of this system is strictly prohibited.
            </p>
            <p className="mt-1">
              Contact: <a href="mailto:suryanrajputvansh@gmail.com" className="hover:text-paper-100 transition-colors underline underline-offset-4">suryanrajputvansh@gmail.com</a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 uppercase tracking-wider font-bold shrink-0">
            <a href="http://127.0.0.1:5000/docs" target="_blank" rel="noreferrer" className="hover:text-paper-100 transition-colors">
              API Docs
            </a>
            <a href="http://127.0.0.1:5000/api/stats" target="_blank" rel="noreferrer" className="hover:text-paper-100 transition-colors">
              Telemetry
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
