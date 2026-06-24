import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import { BookOpen, Users, BookMarked, Layers, AlertCircle, Plus, Calendar, RotateCcw, Clock } from 'lucide-react';

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

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Welcome & Actions Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Librarian <span className="gradient-text">Console</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1 sm:mt-2">
            Monitor inventory, process student requests, and audit book returns.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            to="/manage-books"
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Book
          </Link>
          <Link
            to="/issue-books"
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <BookMarked className="h-4.5 w-4.5" />
            Issue Book
          </Link>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Books"
          value={loading ? '...' : stats.totalBooks}
          icon={Layers}
          color="indigo"
        />
        <DashboardCard
          title="Available Stock"
          value={loading ? '...' : stats.availableBooks}
          icon={BookOpen}
          color="emerald"
        />
        <DashboardCard
          title="Active Checked-out"
          value={loading ? '...' : stats.issuedBooks}
          icon={BookMarked}
          color="sky"
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
          color={stats.overdueBooks > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-400" />
          Recent Library Actions
        </h3>

        <div className="glass-panel rounded-xl border border-slate-800 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-slate-500">No activity registered yet.</p>
              <p className="text-xs text-slate-600 mt-1">Check out books to see transactions here.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/60 border-b border-slate-850 text-slate-400 font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Student</th>
                  <th scope="col" className="px-6 py-4">Book Title</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Action Date</th>
                  <th scope="col" className="px-6 py-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {recentActivity.map((act) => {
                  const isReturned = act.status === 'Returned';
                  const dateToDisplay = isReturned ? act.return_date : act.issue_date;
                  return (
                    <tr key={act.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                        {act.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                        {act.book_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isReturned
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
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
                        {new Date(dateToDisplay).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                        {new Date(act.due_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
