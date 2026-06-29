import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit2, Trash2, X, Save, Info, AlertTriangle, Layers, BookOpen, User, Hash, Tag, ChevronRight } from 'lucide-react';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books', {
        params: { search: searchTerm, page: 1, limit: 100 } // Fetch more on admin panel
      });
      setBooks(response.data.books);
    } catch (err) {
      setError('Failed to fetch library inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm]);

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

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setCategory('');
    setQuantity('');
    setEditMode(false);
    setSelectedBookId(null);
    setError('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  const handleOpenEditModal = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setCategory(book.category);
    setQuantity(book.quantity);
    setEditMode(true);
    setSelectedBookId(book.id);
    setError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    const trimmedIsbn = isbn.trim();
    const trimmedCategory = category.trim();

    if (!trimmedTitle || !trimmedAuthor || !trimmedIsbn || !trimmedCategory || quantity === '' || quantity === undefined) {
      setError('All fields are required.');
      return;
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setError('Quantity must be a non-negative integer.');
      return;
    }

    const bookData = {
      title: trimmedTitle,
      author: trimmedAuthor,
      isbn: trimmedIsbn,
      category: trimmedCategory,
      quantity: parsedQty
    };

    try {
      if (editMode) {
        await api.put(`/books/${selectedBookId}`, bookData);
        setSuccess('Book updated successfully.');
      } else {
        await api.post('/books', bookData);
        setSuccess('New book added to database.');
      }
      setModalOpen(false);
      resetForm();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book? This action is permanent.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/books/${id}`);
      setSuccess('Book deleted successfully.');
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete book. It might be issued currently.');
    }
  };

  const categories = ['Computer Science', 'Fiction', 'Science', 'History', 'Biography'];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-indigo-400" />
            Book Inventory
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Add, update, or remove publications from the system catalog.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="gradient-btn px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Add Catalog Book
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

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Title, Author, or ISBN..."
          className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No books registered in inventory.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/60 border-b border-slate-850 text-slate-400 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">Title</th>
                <th scope="col" className="px-6 py-4 text-left">Author</th>
                <th scope="col" className="px-6 py-4 text-left">ISBN</th>
                <th scope="col" className="px-6 py-4 text-left">Category</th>
                <th scope="col" className="px-6 py-4 text-center">Available / Total</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-200 font-semibold max-w-xs truncate" title={book.title}>
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate" title={book.author}>
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold">
                    <span className={book.available_quantity === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {book.available_quantity}
                    </span>
                    <span className="text-slate-500 font-medium"> / {book.quantity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex gap-2.5 justify-end">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Edit details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-rose-450 hover:text-rose-400 transition-colors"
                        title="Delete from stock"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal overlays for CRUD forms */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80" onClick={handleBackdropClick}></div>

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 h-full max-w-md w-full bg-slate-900 border-r border-slate-800 shadow-2xl z-50 animate-slide-in-left flex flex-col p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Layers className="h-5.5 w-5.5 text-indigo-400" />
                  {editMode ? 'Edit Book' : 'Register Book'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {editMode ? 'Modify catalog configuration data' : 'Add a new asset listing to inventory'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-455 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs flex gap-3 animate-fade-in">
                <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col justify-between overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-5 pr-1 py-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">Book Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Clean Code"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">Author Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Robert C. Martin"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* ISBN & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">ISBN Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Hash className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="e.g. 978-0132350884"
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Tag className="h-4 w-4" />
                      </div>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="block w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none transition-all duration-200"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-2">Total Copies / Quantity</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Layers className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                  {editMode && (
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      Editing total quantity automatically updates availability relative to active loans.
                    </p>
                  )}
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
                  <Save className="h-4 w-4" />
                  {editMode ? 'Save Changes' : 'Register Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBooks;
