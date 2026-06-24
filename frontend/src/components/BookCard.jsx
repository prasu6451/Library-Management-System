import React from 'react';
import { BookOpen, User, Hash, Tag, Layers } from 'lucide-react';

const BookCard = ({ book }) => {
  const { title, author, isbn, category, quantity, available_quantity } = book;
  const isAvailable = available_quantity > 0;

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between h-full border border-slate-800 text-left">
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Tag className="h-3 w-3" />
            {category}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isAvailable
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Title & Author */}
        <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-200" title={title}>
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-400">
          <User className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
          <span className="line-clamp-1">{author}</span>
        </div>
      </div>

      {/* Book Metadata Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Hash className="h-3.5 w-3.5" />
            ISBN
          </span>
          <span className="font-mono text-slate-300">{isbn}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Layers className="h-3.5 w-3.5" />
            Copies
          </span>
          <span className="text-slate-300 font-semibold">
            {available_quantity} / {quantity} available
          </span>
        </div>

        {/* Progress Bar indicator for stock */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAvailable ? 'bg-gradient-to-r from-indigo-500 to-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${quantity > 0 ? (available_quantity / quantity) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
