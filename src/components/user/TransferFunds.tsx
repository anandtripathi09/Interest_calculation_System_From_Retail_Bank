import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, PlusCircle, MinusCircle } from 'lucide-react';

interface UserData {
  accountBalance: number;
}

const TransferFunds: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/account`, {
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: 'Please enter a valid amount.', type: 'error' });
      return;
    }
    
    if (operationType === 'withdraw' && userData && parseFloat(amount) > userData.accountBalance) {
      setMessage({ text: 'Insufficient balance for this withdrawal.', type: 'error' });
      return;
    }
    
    setProcessing(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/users/transaction`,
        {
          amount: parseFloat(amount),
          description: description || `${operationType === 'deposit' ? 'Deposit' : 'Withdrawal'} transaction`,
          type: operationType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUserData(response.data.user);
      setAmount('');
      setDescription('');
      setMessage({
        text: `Successfully ${operationType === 'deposit' ? 'deposited' : 'withdrawn'} $${parseFloat(amount).toFixed(2)}.`,
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
        <p>Failed to load account data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Deposit or Withdraw Funds</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          {message.text && (
            <div className={`${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded`} role="alert">
              <p>{message.text}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 border rounded-lg flex justify-center items-center space-x-2 transition-colors ${
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
                  className={`flex-1 py-3 px-4 border rounded-lg flex justify-center items-center space-x-2 transition-colors ${
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
                  required
                />
              </div>
              {operationType === 'withdraw' && userData.accountBalance < parseFloat(amount || '0') && (
                <p className="mt-1 text-sm text-red-600">
                  Insufficient balance. The maximum amount available for withdrawal is ${userData.accountBalance.toFixed(2)}.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter description for this ${operationType}`}
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || processing || (operationType === 'withdraw' && userData.accountBalance < parseFloat(amount))}
              className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                !amount || parseFloat(amount) <= 0 || processing || (operationType === 'withdraw' && userData.accountBalance < parseFloat(amount))
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
                operationType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'
              )}
            </button>
          </form>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Summary</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm text-gray-500">Current Balance</span>
                <span className="block text-xl font-bold text-gray-900">
                  ${userData.accountBalance.toFixed(2)}
                </span>
              </div>
              
              {amount && !isNaN(parseFloat(amount)) && (
                <div>
                  <span className="block text-sm text-gray-500">
                    {operationType === 'deposit' ? 'Balance After Deposit' : 'Balance After Withdrawal'}
                  </span>
                  <span className={`block text-xl font-bold ${operationType === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    ${(operationType === 'deposit' 
                      ? userData.accountBalance + parseFloat(amount) 
                      : userData.accountBalance - parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <h3 className="text-md font-medium text-blue-800 mb-2">Important Information</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Deposits are processed immediately.</li>
              <li>• Withdrawals may take up to 24 hours to process.</li>
              <li>• Daily withdrawal limit: $10,000</li>
              <li>• Interest is calculated daily based on your end-of-day balance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferFunds;