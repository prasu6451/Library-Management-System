import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import { BookOpen, Users, BookMarked, Layers, AlertCircle, Plus, Calendar, RotateCcw, Clock, ShieldCheck } from 'lucide-react';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalStudents: 0,
    overdueBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/librarian');
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch librarian dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[140%] bg-emerald-650/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[120%] bg-teal-650/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Librarian Administrative Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-450 via-teal-400 to-cyan-400">Librarian</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
              Athena Console gives you full command of physical stock. Register checkouts, monitor return compliance, and optimize inventory counts in real-time.
            </p>
          </div>
          
          {/* Main quick stats badges on banner */}
          <div className="flex gap-4 self-start md:self-auto bg-slate-900/60 p-4 border border-slate-850 rounded-2xl">
            <div className="text-center px-4 py-2 border-r border-slate-850">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Rate</span>
              <span className="text-lg font-extrabold text-slate-200">
                {stats.totalBooks > 0 ? Math.round((stats.issuedBooks / stats.totalBooks) * 100) : 0}%
              </span>
            </div>
            <div className="text-center px-4 py-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Stock Health</span>
              <span className="text-lg font-extrabold text-emerald-450">99.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        <DashboardCard
          title="Total Books"
          value={loading ? '...' : stats.totalBooks}
          icon={Layers}
          color="emerald"
        />
        <DashboardCard
          title="Available Stock"
          value={loading ? '...' : stats.availableBooks}
          icon={BookOpen}
          color="teal"
        />
        <DashboardCard
          title="Active Checked-out"
          value={loading ? '...' : stats.issuedBooks}
          icon={BookMarked}
          color="cyan"
        />
        <DashboardCard
          title="Total Students"
          value={loading ? '...' : stats.totalStudents}
          icon={Users}
          color="amber"
        />
        <DashboardCard
          title="Overdue Copies"
          value={loading ? '...' : stats.overdueBooks}
          icon={AlertCircle}
          color={stats.overdueBooks > 0 ? 'rose' : 'teal'}
        />
      </div>

      {/* Two-Column split screen main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2/3 Section: Recent Actions Feed */}
        <div className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Recent Library Transactions
          </h3>

          <div className="glass-panel rounded-xl border border-slate-800 overflow-x-auto shadow-xl">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-8 w-8 border-2 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-slate-500">No transactions recorded in the library yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-900/60 border-b border-slate-850 text-slate-400 font-semibold tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">Student Profile</th>
                    <th scope="col" className="px-6 py-4 text-left">Book Title</th>
                    <th scope="col" className="px-6 py-4 text-left">Status</th>
                    <th scope="col" className="px-6 py-4 text-left">Action Date</th>
                    <th scope="col" className="px-6 py-4 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {recentActivity.map((act) => {
                    const isReturned = act.status === 'Returned';
                    const dateToDisplay = isReturned ? act.return_date : act.issue_date;
                    return (
                      <tr key={act.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-405 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {getInitials(act.student_name)}
                            </div>
                            <span className="font-semibold text-slate-200">{act.student_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                          {act.book_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isReturned
                                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                            }`}
                          >
                            {isReturned ? (
                              <>
                                <RotateCcw className="h-3 w-3" />
                                Returned
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                Issued
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          {formatDisplayDate(dateToDisplay)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          {formatDisplayDate(act.due_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1/3 Section: Command Panel & Checklist */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-450" />
            Librarian Command Panel
          </h3>

          {/* Action Links Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col gap-4 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
            
            <Link
              to="/manage-books"
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-850 text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-450" />
                Add Book to Catalog
              </span>
              <span className="text-xs text-slate-500 group-hover:text-emerald-455 transition-colors">Go &rarr;</span>
            </Link>

            <Link
              to="/issue-books"
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-600/20 hover:text-emerald-200 transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-teal-400" />
                Issue Book Checkout
              </span>
              <span className="text-xs text-emerald-500 group-hover:text-emerald-455 transition-colors">Go &rarr;</span>
            </Link>
          </div>

          {/* Task Checklist reminders */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4 text-left shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
              Daily Operational Checks
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0 shadow-md shadow-rose-500/50"></span>
                <span>Audit overdue lists. Currently, <strong>{stats.overdueBooks}</strong> books exceed due limits and require notifications.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                <span>Track inventory limits. Register incoming book catalog assets and maintain accurate ISBN counts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <span>Document student checkouts and returns promptly to sustain high stock health metrics.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LibrarianDashboard;
