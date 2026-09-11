import React from 'react';
import { Tag } from 'lucide-react';

export default function GenreFilter({
  genres,
  selectedGenre,
  onSelectGenre
}) {
  const allOptions = ['All', ...(genres || [])];

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-paper-300 pb-3 pt-1">
      <div className="flex items-center gap-2 pr-2 flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
        <Tag className="w-3.5 h-3.5" />
        <span>Browse by</span>
      </div>

      {allOptions.map((genre) => {
        const isSelected =
          selectedGenre === genre ||
          (genre === 'All' && !selectedGenre);

        return (
          <button
            key={genre}
            onClick={() =>
              onSelectGenre(
                genre === 'All' ? '' : genre
              )
            }
            className={`
              flex-shrink-0
              px-3
              py-1.5
              rounded-[3px]
              border
              text-[11px]
              font-semibold
              whitespace-nowrap
              transition-colors
              duration-150

              ${
                isSelected
                  ? `
                    bg-ink-900
                    text-paper-50
                    border-ink-900
                  `
                  : `
                    bg-transparent
                    text-ink-600
                    border-paper-300
                    hover:bg-paper-200
                    hover:border-paper-400
                    hover:text-ink-900
                  `
              }
            `}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
