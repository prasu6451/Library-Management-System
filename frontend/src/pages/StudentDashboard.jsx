import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import BookCard from '../components/BookCard';
import { BookOpen, AlertCircle, History, Search, Filter, Calendar, CornerDownRight, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard states
  const [stats, setStats] = useState({ activeBorrows: 0, overdueCount: 0, historyCount: 0 });
  const [currentLoans, setCurrentLoans] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Catalog search states
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Fetch Dashboard Stats & Loans
  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const response = await api.get('/dashboard/student');
      setStats(response.data.stats);
      setCurrentLoans(response.data.currentLoans);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch Catalog Books
  const fetchCatalogData = async () => {
    try {
      setLoadingCatalog(true);
      const response = await api.get('/books', {
        params: {
          search: searchTerm,
          category: categoryFilter,
          page,
          limit: 6
        }
      });
      setBooks(response.data.books);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch catalog books:', error);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchCatalogData();
  }, [searchTerm, categoryFilter, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const categories = ['Computer Science', 'Fiction', 'Science', 'History', 'Biography'];

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Welcome Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h2>
          <p className="text-slate-400 text-sm mt-1 sm:mt-2">
            Explore new releases, search the database, and monitor active book loans.
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg uppercase tracking-wider">
          Student Account
        </div>
      </div>

      {/* Stats Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Active Borrowed Books"
          value={loadingDashboard ? '...' : stats.activeBorrows}
          icon={BookOpen}
          color="indigo"
        />
        <DashboardCard
          title="Overdue Books"
          value={loadingDashboard ? '...' : stats.overdueCount}
          icon={AlertCircle}
          color={stats.overdueCount > 0 ? 'rose' : 'emerald'}
        />
        <DashboardCard
          title="All-Time Borrow History"
          value={loadingDashboard ? '...' : stats.historyCount}
          icon={History}
          color="sky"
        />
      </div>

      {/* Grid of Borrowed Books & Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Currently Borrowed Books (1/3 width on large screens) */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              My Checked-Out Books
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
              {currentLoans.length} Loans
            </span>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex-grow">
            {loadingDashboard ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : currentLoans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">You do not have any active loans.</p>
                <p className="text-xs text-slate-600 mt-1">Browse the catalog to borrow books.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentLoans.map((loan) => {
                  const isOverdue = loan.days_left < 0;
                  return (
                    <div key={loan.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-2 relative overflow-hidden">
                      {isOverdue && (
                        <div className="absolute top-0 right-0 h-1.5 w-full bg-rose-500"></div>
                      )}
                      
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200 line-clamp-1 text-sm">{loan.title}</span>
                      </div>
                      
                      <span className="text-xs text-slate-400">by {loan.author}</span>
                      
                      <div className="mt-2 pt-2 border-t border-slate-900 flex flex-col gap-1 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            Due Date:
                          </span>
                          <span className={isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between font-medium">
                          <span>Status:</span>
                          {isOverdue ? (
                            <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">
                              Overdue by {Math.abs(loan.days_left)} days
                            </span>
                          ) : (
                            <span className="text-indigo-400 text-[10px] uppercase tracking-wider font-semibold">
                              {loan.days_left === 0 ? 'Due today' : `Due in ${loan.days_left} days`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Searchable Catalog (2/3 width on large screens) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-400" />
              Search Library Catalog
            </h3>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex-grow flex flex-col">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search text */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by Title, Author, or ISBN..."
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category dropdown */}
              <div className="relative min-w-[160px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Filter className="h-4 w-4" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="block w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            {loadingCatalog ? (
              <div className="flex-grow flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : books.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                <p className="text-sm text-slate-500">No books found matching your criteria.</p>
                <p className="text-xs text-slate-600 mt-1">Try refining your search terms or filters.</p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {books.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
