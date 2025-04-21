import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Percent, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface UserData {
  accountBalance: number;
  interestRate: number;
  dailyInterest: number;
  monthlyInterest: number;
  recentTransactions: {
    _id: string;
    amount: number;
    type: string;
    description: string;
    date: string;
  }[];
  interestHistory: {
    _id: string;
    amount: number;
    date: string;
    isMonthly: boolean;
  }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user data', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
        <p>Failed to load user data. Please try again later.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Account Balance Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg shadow-md p-6 text-white transition-transform hover:scale-105">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Account Balance</h3>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold">${userData.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 text-blue-200 text-sm">
            <Link to="/dashboard/transfer" className="flex items-center hover:text-white">
              <span>Deposit/Withdraw</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Interest Rate Card */}
        <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg shadow-md p-6 text-white transition-transform hover:scale-105">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Current Interest Rate</h3>
            <Percent className="h-8 w-8 text-purple-200" />
          </div>
          <p className="text-2xl font-bold">{userData.interestRate.toFixed(2)}%</p>
          <div className="mt-4 text-purple-200 text-sm">
            <span>Annual Percentage Rate</span>
          </div>
        </div>
        
        {/* Daily Interest Card */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-lg shadow-md p-6 text-white transition-transform hover:scale-105">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Daily Interest</h3>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
          <p className="text-2xl font-bold">${userData.dailyInterest.toLocaleString('en-US', { minimumFractionDigits: 4 })}</p>
          <div className="mt-4 text-green-200 text-sm">
            <span>Based on current balance</span>
          </div>
        </div>
        
        {/* Monthly Interest Card */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-md p-6 text-white transition-transform hover:scale-105">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Monthly Interest</h3>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
          <p className="text-2xl font-bold">${userData.monthlyInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 text-orange-200 text-sm">
            <span>Projected this month</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <Link to="/dashboard/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {userData.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {userData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full mr-4 ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'deposit' ? (
                      <ArrowUpRight className={`h-6 w-6 ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <ArrowDownRight className={`h-6 w-6 ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                  </div>
                  <div className={`text-sm font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet.</p>
            </div>
          )}
        </div>
        
        {/* Interest History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Interest History</h2>
          </div>
          
          {userData.interestHistory.length > 0 ? (
            <div className="space-y-4">
              {userData.interestHistory.map((interest) => (
                <div key={interest._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full mr-4 ${interest.isMonthly ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {interest.isMonthly ? (
                      <Calendar className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Percent className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {interest.isMonthly ? 'Monthly Interest Credit' : 'Daily Interest Calculation'}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(interest.date)}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +${interest.amount.toFixed(interest.isMonthly ? 2 : 4)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No interest history yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;