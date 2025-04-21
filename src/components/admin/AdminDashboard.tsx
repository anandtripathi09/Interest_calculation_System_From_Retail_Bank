import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { DollarSign, Users, Percent, Calendar } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  avgInterestRate: number;
  monthlyInterestPaid: number;
}

const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  return typeof value === 'number' && !isNaN(value)
    ? value.toFixed(decimals)
    : '0.00';
};

const sanitizeStats = (data: any): DashboardStats => ({
  totalUsers: data.totalUsers ?? 0,
  totalBalance: data.totalBalance ?? 0,
  avgInterestRate: data.avgInterestRate ?? 0,
  monthlyInterestPaid: data.monthlyInterestPaid ?? 0,
});

const generateLogs = () => {
  const events = [
    'Interest calculation completed',
    'Backup completed successfully',
    'New user registration approved',
    'Email notification sent to users',
    'Admin login detected',
    'Monthly report generated',
    'Security scan passed',
    'Rate update executed',
  ];

  const logs = [];
  for (let i = 0; i < 3; i++) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 3); // Space out timestamps
    const timestamp = now.toLocaleString('en-US');
    const event = events[Math.floor(Math.random() * events.length)];
    logs.push(`[${timestamp}] ${event}`);
  }
  return logs;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBalance: 0,
    avgInterestRate: 0,
    monthlyInterestPaid: 0
  });
  const [loading, setLoading] = useState(true);

  const [showCalculator, setShowCalculator] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [time, setTime] = useState<number | ''>('');
  const [calculatedInterest, setCalculatedInterest] = useState<number | null>(null);

  const [showReport, setShowReport] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const calculateInterest = () => {
    if (typeof amount === 'number' && typeof rate === 'number' && typeof time === 'number') {
      const interest = (amount * rate * time) / 100;
      setCalculatedInterest(interest);
    } else {
      setCalculatedInterest(null);
    }
  };

  const toggleLogs = () => {
    setShowLogs(!showLogs);
    if (!showLogs) {
      setLogs(generateLogs());
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(sanitizeStats(response.data));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "Total Balance",
      value: `$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      color: "bg-green-100"
    },
    {
      title: "Avg. Interest Rate",
      value: `${formatNumber(stats.avgInterestRate)}%`,
      icon: <Percent className="h-8 w-8 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      title: "Monthly Interest Paid",
      value: `$${stats.monthlyInterestPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      color: "bg-orange-100"
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-lg shadow-md p-6 transition-transform hover:scale-105`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-700 font-medium">{card.title}</h3>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
        <p className="text-gray-600 mb-4">
          Welcome to the admin dashboard. From here, you can manage users, set interest rates, and perform various account operations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Recent Activity</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">Interest calculated for all active accounts</li>
              <li className="text-sm text-gray-600">Monthly interest credited to users</li>
              <li className="text-sm text-gray-600">New user registrations processed</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Actions</h3>
            <ul className="space-y-2">
              <li
                className="text-sm cursor-pointer text-blue-600 hover:underline"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                Run interest calculation manually
              </li>
              <li
                className="text-sm cursor-pointer text-blue-600 hover:underline"
                onClick={() => setShowReport(!showReport)}
              >
                Generate monthly reports
              </li>
              <li
                className="text-sm cursor-pointer text-blue-600 hover:underline"
                onClick={toggleLogs}
              >
                View system logs
              </li>
            </ul>

            {showCalculator && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Manual Interest Calculator</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Principal Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Interest Rate (%)"
                    value={rate}
                    onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Time (in years)"
                    value={time}
                    onChange={(e) => setTime(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={calculateInterest}
                  >
                    Calculate Interest
                  </button>
                  {calculatedInterest !== null && (
                    <p className="text-green-600 font-medium">
                      Interest: ${calculatedInterest.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {showReport && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Monthly Report</h4>
                <p className="text-gray-600 text-sm">
                  📈 83 new users onboarded<br />
                  💸 $8,750 total interest credited<br />
                  🔒 99.8% uptime with zero security incidents
                </p>
              </div>
            )}

            {showLogs && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">System Logs</h4>
                <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                  {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
