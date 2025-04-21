import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Wallet, History, CreditCard } from 'lucide-react';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import TransferFunds from './TransferFunds';

const UserPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
    { path: '/dashboard/transactions', icon: <History size={20} />, label: 'Transaction History' },
    { path: '/dashboard/transfer', icon: <Wallet size={20} />, label: 'Deposit/Withdraw' }
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
        <h1 className="text-xl font-bold text-blue-900">User Dashboard</h1>
        <button onClick={toggleMobileMenu} className="p-2 rounded-md bg-blue-100 text-blue-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-lg z-10`}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-blue-900">Banking Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
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

        <div className="p-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-blue-900">Account Summary</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Account Number</span>
                <p className="text-sm font-medium">XXXX-XXXX-{user?._id.substring(user._id.length - 4)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Account Type</span>
                <p className="text-sm font-medium">Savings Account</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Account Status</span>
                <p className="text-sm font-medium">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transfer" element={<TransferFunds />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserPanel;