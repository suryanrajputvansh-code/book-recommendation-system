import React from 'react';
import { Tag } from 'lucide-react';

export default function GenreFilter({ genres, selectedGenre, onSelectGenre }) {
  const allOptions = ['All', ...(genres || [])];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 flex-shrink-0">
        <Tag className="w-3.5 h-3.5" />
        <span>Filter:</span>
      </div>
      {allOptions.map((genre) => {
        const isSelected = selectedGenre === genre || (genre === 'All' && !selectedGenre);
        return (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre === 'All' ? '' : genre)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
