import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books', {
        params: {
          search: searchTerm,
          category: categoryFilter,
          page,
          limit: 8
        }
      });
      setBooks(response.data.books);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load books catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, categoryFilter, page]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategory = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const categories = ['Computer Science', 'Fiction', 'Science', 'History', 'Biography'];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-indigo-400" />
          Library Catalog
        </h2>
        <p className="text-slate-400 text-sm mt-1.5">
          Browse through our entire collection of physical and digital volumes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by book title, author, or ISBN..."
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Category */}
        <div className="relative w-full md:w-60">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Filter className="h-4.5 w-4.5" />
          </div>
          <select
            value={categoryFilter}
            onChange={handleCategory}
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="h-10 w-10 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel py-24 text-center rounded-xl border border-slate-800">
          <p className="text-slate-500 text-sm">No books found matching your current query.</p>
          <p className="text-xs text-slate-650 mt-1">Try clearing your filters or testing other terms.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-5 text-sm text-slate-400">
              <span>
                Showing page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
