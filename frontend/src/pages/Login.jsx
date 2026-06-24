import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserCheck, AlertTriangle, Info, BookOpen } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // Student or Librarian
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      if (user.role === 'Librarian') {
        navigate('/librarian-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Parse query params
    const roleParam = searchParams.get('role');
    if (roleParam === 'Student' || roleParam === 'Librarian') {
      setRole(roleParam);
    }
    if (searchParams.get('expired')) {
      setExpiredMsg(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password, role);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  const handleQuickLogin = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Librarian') {
      setEmail('librarian@library.com');
      setPassword('password123');
    } else {
      setEmail('student@library.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center animate-fade-in px-4">
      <div className="glass-card max-w-md w-full rounded-2xl p-8 border border-slate-800 relative">
        
        {/* Decorative branding header inside card */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-500/20 mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your library resources</p>
        </div>

        {/* Alerts */}
        {expiredMsg && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex gap-3">
            <Info className="h-5 w-5 flex-shrink-0" />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Role Selector */}
        <div className="grid grid-cols-2 bg-slate-900/80 p-1 rounded-lg mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setRole('Student'); setError(''); }}
            className={`py-2 rounded-md text-sm font-semibold transition-all ${
              role === 'Student'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => { setRole('Librarian'); setError(''); }}
            className={`py-2 rounded-md text-sm font-semibold transition-all ${
              role === 'Librarian'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Librarian Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full gradient-btn py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <div className="h-5 w-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
            ) : (
              <>
                <UserCheck className="h-4.5 w-4.5" />
                Sign In to {role}
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Autofills */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-500 font-semibold block mb-3 uppercase tracking-wider">
            Quick Demo Autofill
          </span>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleQuickLogin('Student')}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold border border-slate-800/80 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleQuickLogin('Librarian')}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold border border-slate-800/80 text-purple-400 hover:text-purple-300 transition-colors"
            >
              Demo Librarian
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
