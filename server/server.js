import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 0 },
  interestRate: { type: Number, default: 3.5 }, // Default interest rate: 3.5%
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'interest'], required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  balance: { type: Number, required: true } // Balance after transaction
});

const interestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  balanceUsed: { type: Number, required: true }, // Balance used for calculation
  rateUsed: { type: Number, required: true }, // Interest rate used
  isMonthly: { type: Boolean, default: false }, // Whether this is a monthly credit
  date: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Interest = mongoose.model('Interest', interestSchema);
const Setting = mongoose.model('Setting', settingSchema);

// Initialize admin user and default settings
const initializeAdmin = async () => {
  try {
    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'anand@gmail.com' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'anand',
        email: 'anand@gmail.com',
        password: hashedPassword,
        role: 'admin',
        accountBalance: 1000,
        interestRate: 5.0
      });
      
      console.log('Admin user created');
    }
    
    // Create default interest rate setting if not exists
    const defaultInterestRateExists = await Setting.findOne({ key: 'defaultInterestRate' });
    
    if (!defaultInterestRateExists) {
      await Setting.create({
        key: 'defaultInterestRate',
        value: 3.5
      });
      
      console.log('Default interest rate setting created');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Initialize data
initializeAdmin();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findOne({ _id: decoded.id });
    
    if (!user) {
      throw new Error();
    }
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Admin middleware
const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Get default interest rate
    const defaultInterestRateSetting = await Setting.findOne({ key: 'defaultInterestRate' });
    const defaultInterestRate = defaultInterestRateSetting ? defaultInterestRateSetting.value : 3.5;
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      interestRate: defaultInterestRate
    });
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/user', auth, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// Admin routes
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    // Delete user's transactions and interest records
    await Transaction.deleteMany({ userId: user._id });
    await Interest.deleteMany({ userId: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/default-interest-rate', auth, adminOnly, async (req, res) => {
  try {
    const { rate } = req.body;
    
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ message: 'Invalid interest rate' });
    }
    
    await Setting.findOneAndUpdate(
      { key: 'defaultInterestRate' },
      { value: rate },
      { upsert: true }
    );
    
    res.json({ message: 'Default interest rate updated successfully' });
  } catch (error) {
    console.error('Error updating default interest rate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/user-interest-rate/:id', auth, adminOnly, async (req, res) => {
  try {
    const { rate } = req.body;
    const userId = req.params.id;
    
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ message: 'Invalid interest rate' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { interestRate: rate },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User interest rate updated successfully', user });
  } catch (error) {
    console.error('Error updating user interest rate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/interest-history/:id', auth, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const interestHistory = await Interest.find({ userId })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(interestHistory);
  } catch (error) {
    console.error('Error fetching interest history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/account-operation', auth, adminOnly, async (req, res) => {
  try {
    const { userId, amount, operation } = req.body;
    
    if (!userId || !amount || !operation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (operation !== 'deposit' && operation !== 'withdraw') {
      return res.status(400).json({ message: 'Invalid operation type' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has sufficient balance for withdrawal
    if (operation === 'withdraw' && user.accountBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Update user balance
    const newBalance = operation === 'deposit'
      ? user.accountBalance + amount
      : user.accountBalance - amount;
    
    user.accountBalance = newBalance;
    await user.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      amount: operation === 'deposit' ? amount : -amount,
      type: operation,
      description: `Admin ${operation} of $${amount.toFixed(2)}`,
      balance: newBalance
    });
    
    res.json({ 
      message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} completed successfully`,
      user,
      transaction 
    });
  } catch (error) {
    console.error(`Error performing ${req.body.operation}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/dashboard-stats', auth, adminOnly, async (req, res) => {
  try {
    // Get total number of users (excluding admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total balance across all user accounts
    const balanceAggregation = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: '$accountBalance' } } }
    ]);
    const totalBalance = balanceAggregation.length > 0 ? balanceAggregation[0].total : 0;
    
    // Get average interest rate
    const rateAggregation = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, avg: { $avg: '$interestRate' } } }
    ]);
    const avgInterestRate = rateAggregation.length > 0 ? rateAggregation[0].avg : 0;
    
    // Get monthly interest paid (last 30 days)
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    const interestAggregation = await Interest.aggregate([
      { 
        $match: { 
          isMonthly: true,
          date: { $gte: lastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyInterestPaid = interestAggregation.length > 0 ? interestAggregation[0].total : 0;
    
    res.json({
      totalUsers,
      totalBalance,
      avgInterestRate,
      monthlyInterestPaid
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/users/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate daily interest
    const dailyRate = user.interestRate / 100 / 365;
    const dailyInterest = user.accountBalance * dailyRate;
    
    // Calculate projected monthly interest
    const daysInMonth = 30;
    const monthlyInterest = dailyInterest * daysInMonth;
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(5);
    
    // Get recent interest history
    const interestHistory = await Interest.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    res.json({
      accountBalance: user.accountBalance,
      interestRate: user.interestRate,
      dailyInterest,
      monthlyInterest,
      recentTransactions,
      interestHistory
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/transaction', auth, async (req, res) => {
  try {
    const { amount, description, type } = req.body;
    
    if (!amount || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (type !== 'deposit' && type !== 'withdraw') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }
    
    // Check if user has sufficient balance for withdrawal
    if (type === 'withdraw' && req.user.accountBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Update user balance
    const newBalance = type === 'deposit'
      ? req.user.accountBalance + amount
      : req.user.accountBalance - amount;
    
    req.user.accountBalance = newBalance;
    await req.user.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: type === 'deposit' ? amount : -amount,
      type,
      description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      balance: newBalance
    });
    
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({ 
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} completed successfully`,
      transaction,
      user
    });
  } catch (error) {
    console.error(`Error performing ${req.body.type}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Interest calculation functions
const calculateDailyInterest = async () => {
  try {
    console.log('Calculating daily interest...');
    
    // Get all users with positive balance
    const users = await User.find({ accountBalance: { $gt: 0 } });
    
    for (const user of users) {
      // Calculate daily interest
      const dailyRate = user.interestRate / 100 / 365;
      const interestAmount = user.accountBalance * dailyRate;
      
      // Record the interest calculation
      await Interest.create({
        userId: user._id,
        amount: interestAmount,
        balanceUsed: user.accountBalance,
        rateUsed: user.interestRate,
        isMonthly: false
      });
      
      console.log(`Daily interest calculated for user ${user._id}: $${interestAmount.toFixed(4)}`);
    }
    
    console.log('Daily interest calculation completed');
  } catch (error) {
    console.error('Error calculating daily interest:', error);
  }
};

const creditMonthlyInterest = async () => {
  try {
    console.log('Crediting monthly interest...');
    
    // Get all users
    const users = await User.find();
    
    for (const user of users) {
      // Get all daily interest calculations for this user in the last month
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      
      const dailyInterests = await Interest.find({
        userId: user._id,
        isMonthly: false,
        date: { $gte: lastMonth }
      });
      
      // Calculate total interest to credit
      const totalInterest = dailyInterests.reduce((sum, record) => sum + record.amount, 0);
      
      if (totalInterest > 0) {
        // Update user balance
        user.accountBalance += totalInterest;
        await user.save();
        
        // Record the monthly interest credit
        await Interest.create({
          userId: user._id,
          amount: totalInterest,
          balanceUsed: user.accountBalance - totalInterest, // Balance before crediting
          rateUsed: user.interestRate,
          isMonthly: true
        });
        
        // Create transaction record
        await Transaction.create({
          userId: user._id,
          amount: totalInterest,
          type: 'interest',
          description: 'Monthly interest credit',
          balance: user.accountBalance
        });
        
        console.log(`Monthly interest credited for user ${user._id}: $${totalInterest.toFixed(2)}`);
      }
    }
    
    console.log('Monthly interest crediting completed');
  } catch (error) {
    console.error('Error crediting monthly interest:', error);
  }
};

// Schedule daily interest calculation (once a day at midnight)
cron.schedule('0 0 * * *', calculateDailyInterest);

// Schedule monthly interest crediting (first day of each month at 00:01)
cron.schedule('1 0 1 * *', creditMonthlyInterest);

// For development/demo purposes, calculate interest on server start
setTimeout(async () => {
  await calculateDailyInterest();
  // For demo, we'll also credit monthly interest immediately
  await creditMonthlyInterest();
}, 5000);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});