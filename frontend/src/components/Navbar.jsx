import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, Database, BookMarked, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
      isActive(path)
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600/30 text-indigo-400 border-l-4 border-indigo-500'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-lg px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Branding */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300 tracking-tight">
            Athena<span className="text-indigo-400 font-semibold">LMS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-2">
            {user.role === 'Librarian' ? (
              <>
                <Link to="/librarian-dashboard" className={linkClass('/librarian-dashboard')}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/manage-books" className={linkClass('/manage-books')}>
                  <Database className="h-4 w-4" />
                  Manage Books
                </Link>
                <Link to="/issue-books" className={linkClass('/issue-books')}>
                  <BookMarked className="h-4 w-4" />
                  Issue Records
                </Link>
              </>
            ) : (
              <>
                <Link to="/student-dashboard" className={linkClass('/student-dashboard')}>
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </Link>
                <Link to="/books" className={linkClass('/books')}>
                  <BookOpen className="h-4 w-4" />
                  Catalog
                </Link>
              </>
            )}
          </div>
        )}

        {/* User Menu / Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                <span className="text-xs text-indigo-400 font-medium">{user.role}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                <User className="h-4 w-4" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all duration-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-900/95 py-3 px-2 space-y-1 animate-fade-in">
          {isAuthenticated ? (
            <>
              {user.role === 'Librarian' ? (
                <>
                  <Link
                    to="/librarian-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/librarian-dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/manage-books"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/manage-books')}
                  >
                    <Database className="h-5 w-5" />
                    Manage Books
                  </Link>
                  <Link
                    to="/issue-books"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/issue-books')}
                  >
                    <BookMarked className="h-5 w-5" />
                    Issue Records
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/student-dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    My Dashboard
                  </Link>
                  <Link
                    to="/books"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/books')}
                  >
                    <BookOpen className="h-5 w-5" />
                    Catalog
                  </Link>
                </>
              )}

              {/* User details for mobile */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                    <span className="text-xs text-indigo-400 font-medium">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 py-2 text-sm font-medium text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="py-2 px-4 space-y-2.5">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all duration-200"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
