import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { Search, DollarSign, PlusCircle, MinusCircle } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  accountBalance: number;
}

const AccountOperations: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setAmount('');
    setMessage({ text: '', type: '' });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleOperation = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) return;
    
    setProcessing(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/account-operation`,
        {
          userId: selectedUser._id,
          amount: parseFloat(amount),
          operation: operationType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update user in the state
      const updatedUser = response.data.user;
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setSelectedUser(updatedUser);
      setAmount('');
      setMessage({
        text: `Successfully ${operationType === 'deposit' ? 'deposited' : 'withdrawn'} $${parseFloat(amount).toFixed(2)} ${operationType === 'deposit' ? 'to' : 'from'} user's account.`,
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || `Failed to perform ${operationType}. Please try again.`,
        type: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Operations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Selection */}
        <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select User</h2>
          
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="overflow-y-auto max-h-80 border border-gray-200 rounded-lg">
            {filteredUsers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li 
                    key={user._id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs font-medium text-gray-700 mt-1">
                      Balance: ${user.accountBalance?.toFixed(2) || '0.00'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found matching your search.
              </div>
            )}
          </div>
        </div>
        
        {/* Operation Form */}
        <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Perform Operation</h2>
          
          {selectedUser ? (
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Selected User:</p>
                  <p className="text-blue-700">{selectedUser.name} ({selectedUser.email})</p>
                  <p className="font-medium text-blue-800 mt-2">Current Balance:</p>
                  <p className="text-blue-700">${selectedUser.accountBalance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              {message.text && (
                <div className={`${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded`} role="alert">
                  <p>{message.text}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 border rounded-lg flex justify-center items-center space-x-2 ${
                        operationType === 'deposit'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setOperationType('deposit')}
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Deposit</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 border rounded-lg flex justify-center items-center space-x-2 ${
                        operationType === 'withdraw'
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setOperationType('withdraw')}
                    >
                      <MinusCircle className="h-5 w-5" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  {operationType === 'withdraw' && selectedUser.accountBalance < parseFloat(amount || '0') && (
                    <p className="mt-1 text-sm text-red-600">
                      Insufficient balance. The maximum amount available for withdrawal is ${selectedUser.accountBalance.toFixed(2)}.
                    </p>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleOperation}
                  disabled={!amount || parseFloat(amount) <= 0 || processing || (operationType === 'withdraw' && selectedUser.accountBalance < parseFloat(amount))}
                  className={`w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                    !amount || parseFloat(amount) <= 0 || processing || (operationType === 'withdraw' && selectedUser.accountBalance < parseFloat(amount))
                      ? 'bg-gray-300 cursor-not-allowed'
                      : operationType === 'deposit'
                      ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  {processing ? (
                    <span className="flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      {operationType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-center">Select a user from the list to perform account operations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountOperations;