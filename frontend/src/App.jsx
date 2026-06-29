import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import Books from './pages/Books';
import ManageBooks from './pages/ManageBooks';
import IssueBooks from './pages/IssueBooks';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <Books />
                </ProtectedRoute>
              }
            />

            {/* Librarian Protected Routes */}
            <Route
              path="/librarian-dashboard"
              element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                  <LibrarianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-books"
              element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                  <ManageBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issue-books"
              element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                  <IssueBooks />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
