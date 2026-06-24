import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, ShieldCheck, Sparkles, BookMarked, ArrowRight } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    return user.role === 'Librarian' ? '/librarian-dashboard' : '/student-dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mt-6 sm:mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Introducing Modern Library Management
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Manage and Explore Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Entire Library Catalog
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Athena LMS provides a seamless platform for librarians to catalog assets, track checkouts, and student borrowers to discover resources and check their loan histories.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={getDashboardPath()}
            className="w-full sm:w-auto gradient-btn px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold hover:shadow-indigo-500/30"
          >
            Access Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!isAuthenticated && (
            <div className="flex w-full sm:w-auto items-center justify-center gap-2 sm:gap-4">
              <Link
                to="/login?role=Student"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Demo Student
              </Link>
              <Link
                to="/login?role=Librarian"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Demo Librarian
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="glass-card p-6 rounded-xl text-left border border-slate-800/80">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 w-fit mb-5">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Interactive Catalog</h3>
          <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
            Quickly filter, paginate, and search the entire inventory database by author, title, or unique ISBN numbers.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl text-left border border-slate-800/80">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20 w-fit mb-5">
            <BookMarked className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Seamless Issuing</h3>
          <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
            Librarians can easily check out volumes to student profiles and record returns inside a transactional safe log system.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl text-left border border-slate-800/80">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20 w-fit mb-5">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Role Protections</h3>
          <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
            Strict endpoints and component security ensures students only see checkout listings while admins control catalogs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
