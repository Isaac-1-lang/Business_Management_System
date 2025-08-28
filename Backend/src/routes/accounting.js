/**
 * ACCOUNTING ROUTES - Accounting Management
 * 
 * Handles accounting operations, ledgers, and financial records
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createTransactionValidation = [
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Invalid transaction type'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').trim().isLength({ min: 2, max: 500 }).withMessage('Description must be between 2 and 500 characters'),
  body('account').trim().isLength({ min: 2, max: 100 }).withMessage('Account must be between 2 and 100 characters')
];

// Hardcoded accounting data for testing
const transactions = [
  {
    id: '1',
    companyId: '1',
    type: 'income',
    amount: 5000000,
    description: 'Sales revenue - January 2024',
    account: 'Sales Revenue',
    category: 'Revenue',
    date: '2024-01-15',
    reference: 'INV-2024-001',
    status: 'posted'
  },
  {
    id: '2',
    companyId: '1',
    type: 'expense',
    amount: 1200000,
    description: 'Office rent payment',
    account: 'Rent Expense',
    category: 'Operating Expenses',
    date: '2024-01-01',
    reference: 'EXP-2024-001',
    status: 'posted'
  },
  {
    id: '3',
    companyId: '1',
    type: 'expense',
    amount: 800000,
    description: 'Employee salaries',
    account: 'Salary Expense',
    category: 'Personnel',
    date: '2024-01-31',
    reference: 'EXP-2024-002',
    status: 'posted'
  }
];

const accounts = [
  { id: '1', name: 'Cash', type: 'asset', balance: 3000000 },
  { id: '2', name: 'Accounts Receivable', type: 'asset', balance: 1500000 },
  { id: '3', name: 'Sales Revenue', type: 'revenue', balance: 5000000 },
  { id: '4', name: 'Rent Expense', type: 'expense', balance: 1200000 },
  { id: '5', name: 'Salary Expense', type: 'expense', balance: 800000 }
];

/**
 * GET /accounting/transactions
 * Get all transactions for the company
 */
router.get('/transactions', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { type, account, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  let filteredTransactions = transactions.filter(t => t.companyId === companyId);
  
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  
  if (account) {
    filteredTransactions = filteredTransactions.filter(t => t.account === account);
  }
  
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }
  
  // Sort by date descending
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Pagination
  const offset = (page - 1) * limit;
  const paginatedTransactions = filteredTransactions.slice(offset, offset + parseInt(limit));
  
  return successResponse(res, {
    transactions: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTransactions.length,
      pages: Math.ceil(filteredTransactions.length / limit)
    }
  }, 'Transactions retrieved successfully');
}));

/**
 * GET /accounting/transactions/:id
 * Get specific transaction details
 */
router.get('/transactions/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const transaction = transactions.find(t => t.id === id && t.companyId === companyId);
  
  if (!transaction) {
    return errorResponse(res, 'Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }
  
  return successResponse(res, { transaction }, 'Transaction details retrieved successfully');
}));

/**
 * POST /accounting/transactions
 * Create a new transaction
 */
router.post('/transactions', createTransactionValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  
  const newTransaction = {
    id: (transactions.length + 1).toString(),
    ...req.body,
    companyId,
    date: req.body.date || new Date().toISOString().split('T')[0],
    reference: req.body.reference || `${req.body.type.toUpperCase()}-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
    status: 'posted',
    createdAt: new Date().toISOString()
  };
  
  transactions.push(newTransaction);
  
  return successResponse(res, { transaction: newTransaction }, 'Transaction created successfully', 201);
}));

/**
 * GET /accounting/accounts
 * Get all accounts
 */
router.get('/accounts', requireCompanyAccess, asyncHandler(async (req, res) => {
  return successResponse(res, { accounts }, 'Accounts retrieved successfully');
}));

/**
 * GET /accounting/ledger
 * Get general ledger
 */
router.get('/ledger', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { startDate, endDate } = req.query;
  
  let filteredTransactions = transactions.filter(t => t.companyId === companyId);
  
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }
  
  // Group by account
  const ledger = accounts.map(account => {
    const accountTransactions = filteredTransactions.filter(t => t.account === account.name);
    const debits = accountTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const credits = accountTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      account: account.name,
      type: account.type,
      balance: account.balance,
      debits,
      credits,
      netChange: credits - debits
    };
  });
  
  return successResponse(res, { ledger }, 'General ledger retrieved successfully');
}));

/**
 * GET /accounting/trial-balance
 * Get trial balance
 */
router.get('/trial-balance', requireCompanyAccess, asyncHandler(async (req, res) => {
  const trialBalance = accounts.map(account => ({
    account: account.name,
    type: account.type,
    balance: account.balance,
    debit: account.type === 'asset' || account.type === 'expense' ? account.balance : 0,
    credit: account.type === 'liability' || account.type === 'revenue' || account.type === 'equity' ? account.balance : 0
  }));
  
  const totalDebits = trialBalance.reduce((sum, account) => sum + account.debit, 0);
  const totalCredits = trialBalance.reduce((sum, account) => sum + account.credit, 0);
  
  return successResponse(res, {
    trialBalance,
    totals: {
      debits: totalDebits,
      credits: totalCredits,
      difference: totalDebits - totalCredits
    }
  }, 'Trial balance retrieved successfully');
}));

/**
 * GET /accounting/income-statement
 * Get income statement
 */
router.get('/income-statement', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { startDate, endDate } = req.query;
  
  let filteredTransactions = transactions.filter(t => t.companyId === companyId);
  
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }
  
  const revenue = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = revenue - expenses;
  
  return successResponse(res, {
    incomeStatement: {
      revenue,
      expenses,
      netIncome,
      period: { startDate, endDate }
    }
  }, 'Income statement retrieved successfully');
}));

/**
 * GET /accounting/stats
 * Get accounting statistics
 */
router.get('/stats', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const companyTransactions = transactions.filter(t => t.companyId === companyId);
  
  const stats = {
    totalTransactions: companyTransactions.length,
    totalIncome: companyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: companyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    netIncome: companyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
               companyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    byMonth: companyTransactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      if (t.type === 'income') acc[month].income += t.amount;
      if (t.type === 'expense') acc[month].expenses += t.amount;
      return acc;
    }, {})
  };
  
  return successResponse(res, { stats }, 'Accounting statistics retrieved successfully');
}));

export default router;
