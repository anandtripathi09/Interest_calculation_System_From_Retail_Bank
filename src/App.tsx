import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminPanel from './components/admin/AdminPanel';
import UserPanel from './components/user/UserPanel';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/admin/*" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <UserPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
