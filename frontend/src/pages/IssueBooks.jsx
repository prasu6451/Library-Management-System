import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Calendar, RotateCcw, CheckCircle, AlertTriangle, BookOpen, BookMarked, X, Info, ChevronRight, User } from 'lucide-react';

const IssueBooks = () => {
  const [issues, setIssues] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };

  // Filtering issues
  const [statusFilter, setStatusFilter] = useState('All'); // All, Issued, Returned

  // Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');
      setIssues(response.data);
    } catch (err) {
      setError('Failed to fetch book issue records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const response = await api.get('/books', {
        params: { limit: 100 }
      });
      // Filter books with stock
      const stockBooks = response.data.books.filter(b => b.available_quantity > 0);
      setAvailableBooks(stockBooks);
    } catch (err) {
      console.error('Failed to load books stock:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchAvailableBooks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };
    
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const handleOpenModal = () => {
    setStudentEmail('');
    setSelectedBookId('');
    setError('');
    setSuccess('');
    setDueDate('');
    
    setModalOpen(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = studentEmail.trim().toLowerCase();

    if (!trimmedEmail || !selectedBookId || !dueDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await api.post('/issues', {
        student_email: trimmedEmail,
        book_id: selectedBookId,
        due_date: dueDate
      });
      setSuccess(response.data.message || 'Book issued successfully.');
      setModalOpen(false);
      fetchIssues();
      fetchAvailableBooks(); // Reload stocks
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing book checkout.');
    }
  };

  const handleReturnBook = async (issueId) => {
    if (!window.confirm('Are you sure you want to register return for this book?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/issues/return/${issueId}`);
      setSuccess(response.data.message || 'Book returned successfully.');
      fetchIssues();
      fetchAvailableBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Error marking book as returned.');
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (statusFilter === 'All') return true;
    return issue.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <BookMarked className="h-7 w-7 text-indigo-400" />
            Issue & Loan Records
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Register new book checkouts and document student returns.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="gradient-btn px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Issue Book
        </button>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Options */}
      <div className="flex gap-2.5 bg-slate-900/60 p-1 border border-slate-800 rounded-lg w-fit">
        {['All', 'Issued', 'Returned'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFilter === status
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {status === 'Issued' ? 'Active Checked-Out' : status}
          </button>
        ))}
      </div>

      {/* Issue Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No transaction logs matching filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-slate-300 animate-fade-in">
            <thead className="text-xs uppercase bg-slate-900/60 border-b border-slate-850 text-slate-400 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">Borrower Student</th>
                <th scope="col" className="px-6 py-4 text-left">Book Title</th>
                <th scope="col" className="px-6 py-4 text-left">Status</th>
                <th scope="col" className="px-6 py-4 text-left">Issue Date</th>
                <th scope="col" className="px-6 py-4 text-left">Due Date</th>
                <th scope="col" className="px-6 py-4 text-left">Return Date</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredIssues.map((issue) => {
                const isActiveLoan = issue.status === 'Issued';
                const isOverdue = isActiveLoan && new Date(issue.due_date) < new Date();
                
                return (
                  <tr key={issue.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-200">{issue.student_name}</span>
                        <span className="text-xs text-slate-500">{issue.student_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-200 line-clamp-1 max-w-[200px]" title={issue.book_title}>{issue.book_title}</span>
                        <span className="text-xs text-slate-500 font-mono">ISBN: {issue.book_isbn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isActiveLoan
                            ? isOverdue
                              ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                        }`}
                      >
                        {isActiveLoan ? (isOverdue ? 'Overdue' : 'Issued') : 'Returned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {formatDisplayDate(issue.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {formatDisplayDate(issue.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                      {issue.return_date ? (
                        <span className="text-slate-450">{formatDisplayDate(issue.return_date)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      {isActiveLoan && (
                        <button
                          onClick={() => handleReturnBook(issue.id)}
                          className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Issue Modal For      {/* Issue Drawer Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80" onClick={handleBackdropClick}></div>
          
          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 h-full max-w-md w-full bg-slate-900 border-r border-slate-800 shadow-2xl z-50 animate-slide-in-left flex flex-col p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <BookMarked className="h-5.5 w-5.5 text-indigo-400" />
                  Issue Book
                </h3>
                <p className="text-xs text-slate-500 mt-1">Register checkout details to student profile</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-450 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs flex gap-3 animate-fade-in">
                <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="flex-grow flex flex-col justify-between overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-5 pr-1 py-1">
                {/* Student Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@library.com"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Book Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">
                    Select Catalog Book
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <select
                      required
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="block w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none transition-all duration-200"
                    >
                      <option value="">-- Select from inventory --</option>
                      {availableBooks.map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title} ({book.available_quantity} copies)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-slate-850 flex justify-end gap-3 mt-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                >
                  <CheckCircle className="h-4 w-4" />
                  Issue Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default IssueBooks;
