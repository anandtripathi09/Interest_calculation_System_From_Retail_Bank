import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Percent, CreditCard, BarChart4 } from 'lucide-react';
import UserManagement from './UserManagement';
import InterestRates from './InterestRates';
import AccountOperations from './AccountOperations';
import AdminDashboard from './AdminDashboard';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: '/admin', icon: <BarChart4 size={20} />, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/interest-rates', icon: <Percent size={20} />, label: 'Interest Rates' },
    { path: '/admin/account-operations', icon: <CreditCard size={20} />, label: 'Account Operations' }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden p-4 bg-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">Admin Panel</h1>
        <button onClick={toggleMobileMenu} className="p-2 rounded-md bg-blue-100 text-blue-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-lg z-10`}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-blue-900">Admin Control Panel</h2>
          <p className="text-sm text-gray-600 mt-1">Anand Tripathi</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-700 hover:bg-blue-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/interest-rates" element={<InterestRates />} />
          <Route path="/account-operations" element={<AccountOperations />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;

// {user?.name}