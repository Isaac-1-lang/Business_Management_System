/**
 * PAYROLL MANAGEMENT ROUTES
 * 
 * Handles payroll periods and employee payroll records
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { PayrollPeriod, PayrollRecord, Employee } from '../models/index.js';

const router = express.Router();

// Validation rules
const periodValidation = [
  body('period_name').notEmpty().withMessage('Period name is required'),
  body('start_date').isISO8601().withMessage('Valid start date required'),
  body('end_date').isISO8601().withMessage('Valid end date required'),
  body('pay_date').isISO8601().withMessage('Valid pay date required'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Valid currency code required')
];

const recordValidation = [
  body('payroll_period_id').isUUID().withMessage('Valid payroll period ID required'),
  body('employee_id').isUUID().withMessage('Valid employee ID required'),
  body('basic_salary').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid basic salary required'),
  body('gross_salary').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid gross salary required'),
  body('net_salary').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid net salary required')
];

// Get all payroll periods for a company
router.get('/periods', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, year, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (year) {
    whereClause.start_date = {
      [Op.gte]: new Date(`${year}-01-01`),
      [Op.lte]: new Date(`${year}-12-31`)
    };
  }
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: periods } = await PayrollPeriod.findAndCountAll({
    where: whereClause,
    order: [['start_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    periods: periods.map(period => period.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Payroll periods retrieved');
}));

// Get specific payroll period
router.get('/periods/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const period = await PayrollPeriod.findOne({
    where: { id, company_id: companyId },
    include: [
      {
        model: PayrollRecord,
        as: 'records',
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employee_id', 'first_name', 'last_name', 'position', 'department']
          }
        ]
      }
    ]
  });
  
  if (!period) {
    return errorResponse(res, 'Payroll period not found', 404);
  }
  
  return successResponse(res, { period: period.getPublicData() }, 'Payroll period retrieved');
}));

// Create new payroll period
router.post('/periods', periodValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Check for overlapping periods
  const overlappingPeriod = await PayrollPeriod.findOne({
    where: {
      company_id: companyId,
      [Op.or]: [
        {
          start_date: {
            [Op.between]: [payload.start_date, payload.end_date]
          }
        },
        {
          end_date: {
            [Op.between]: [payload.start_date, payload.end_date]
          }
        }
      ]
    }
  });
  
  if (overlappingPeriod) {
    return errorResponse(res, 'Payroll period overlaps with existing period', 400);
  }
  
  const period = await PayrollPeriod.create({
    company_id: companyId,
    period_name: payload.period_name,
    start_date: payload.start_date,
    end_date: payload.end_date,
    pay_date: payload.pay_date,
    status: payload.status || 'draft',
    currency: payload.currency || 'RWF',
    notes: payload.notes
  });
  
  return successResponse(res, { period: period.getPublicData() }, 'Payroll period created', 201);
}));

// Update payroll period
router.put('/periods/:id', periodValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const period = await PayrollPeriod.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!period) {
    return errorResponse(res, 'Payroll period not found', 404);
  }
  
  if (period.status === 'completed') {
    return errorResponse(res, 'Cannot update completed payroll period', 400);
  }
  
  await period.update({
    period_name: payload.period_name,
    start_date: payload.start_date,
    end_date: payload.end_date,
    pay_date: payload.pay_date,
    status: payload.status || period.status,
    currency: payload.currency || period.currency,
    notes: payload.notes
  });
  
  return successResponse(res, { period: period.getPublicData() }, 'Payroll period updated');
}));

// Generate payroll records for a period
router.post('/periods/:id/generate-records', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const period = await PayrollPeriod.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!period) {
    return errorResponse(res, 'Payroll period not found', 404);
  }
  
  if (period.status !== 'draft') {
    return errorResponse(res, 'Only draft periods can have records generated', 400);
  }
  
  // Get all active employees
  const employees = await Employee.findAll({
    where: { 
      company_id: companyId,
      status: 'active'
    }
  });
  
  if (employees.length === 0) {
    return errorResponse(res, 'No active employees found', 400);
  }
  
  // Create payroll records for each employee
  const records = [];
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  
  for (const employee of employees) {
    const basicSalary = employee.salary || 0;
    const overtimeHours = 0; // This would be calculated based on timesheets
    const overtimeRate = basicSalary / 160; // Assuming 160 hours per month
    const overtimeAmount = overtimeHours * overtimeRate;
    
    const allowances = {
      housing: employee.housing_allowance || 0,
      transport: employee.transport_allowance || 0,
      meal: employee.meal_allowance || 0,
      other: 0
    };
    
    const totalAllowances = Object.values(allowances).reduce((sum, amount) => sum + amount, 0);
    const grossSalary = basicSalary + overtimeAmount + totalAllowances;
    
    // Calculate deductions
    const incomeTax = (grossSalary * 0.20); // 20% tax rate
    const socialSecurity = (grossSalary * 0.05); // 5% social security
    const healthInsurance = (grossSalary * 0.03); // 3% health insurance
    
    const otherDeductions = {
      loan_deduction: 0,
      advance_deduction: 0,
      other: 0
    };
    
    const totalDeductionsAmount = incomeTax + socialSecurity + healthInsurance + 
                                 Object.values(otherDeductions).reduce((sum, amount) => sum + amount, 0);
    
    const netSalary = grossSalary - totalDeductionsAmount;
    
    const record = await PayrollRecord.create({
      company_id: companyId,
      payroll_period_id: id,
      employee_id: employee.id,
      basic_salary: basicSalary,
      overtime_hours: overtimeHours,
      overtime_rate: overtimeRate,
      overtime_amount: overtimeAmount,
      allowances: allowances,
      total_allowances: totalAllowances,
      gross_salary: grossSalary,
      income_tax: incomeTax,
      social_security: socialSecurity,
      health_insurance: healthInsurance,
      other_deductions: otherDeductions,
      total_deductions: totalDeductionsAmount,
      net_salary: netSalary,
      payment_method: employee.payment_method || 'bank_transfer',
      bank_account: employee.bank_account,
      payment_status: 'pending'
    });
    
    records.push(record.getPublicData());
    
    totalGross += grossSalary;
    totalDeductions += totalDeductionsAmount;
    totalNet += netSalary;
  }
  
  // Update period totals
  await period.update({
    total_gross: totalGross,
    total_deductions: totalDeductions,
    total_net: totalNet,
    status: 'processing'
  });
  
  return successResponse(res, { 
    records,
    period: period.getPublicData()
  }, 'Payroll records generated successfully', 201);
}));

// Get payroll records
router.get('/records', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { payroll_period_id, employee_id, payment_status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (payroll_period_id) whereClause.payroll_period_id = payroll_period_id;
  if (employee_id) whereClause.employee_id = employee_id;
  if (payment_status) whereClause.payment_status = payment_status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: records } = await PayrollRecord.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: PayrollPeriod,
        as: 'payrollPeriod',
        attributes: ['id', 'period_name', 'start_date', 'end_date', 'pay_date']
      },
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_id', 'first_name', 'last_name', 'position', 'department']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    records: records.map(record => record.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Payroll records retrieved');
}));

// Update payroll record
router.put('/records/:id', recordValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const record = await PayrollRecord.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!record) {
    return errorResponse(res, 'Payroll record not found', 404);
  }
  
  await record.update({
    basic_salary: payload.basic_salary,
    overtime_hours: payload.overtime_hours || 0,
    overtime_rate: payload.overtime_rate || 0,
    overtime_amount: payload.overtime_amount || 0,
    allowances: payload.allowances || {},
    total_allowances: payload.total_allowances || 0,
    gross_salary: payload.gross_salary,
    income_tax: payload.income_tax || 0,
    social_security: payload.social_security || 0,
    health_insurance: payload.health_insurance || 0,
    other_deductions: payload.other_deductions || {},
    total_deductions: payload.total_deductions || 0,
    net_salary: payload.net_salary,
    payment_method: payload.payment_method || record.payment_method,
    bank_account: payload.bank_account,
    notes: payload.notes
  });
  
  return successResponse(res, { record: record.getPublicData() }, 'Payroll record updated');
}));

// Update payment status
router.put('/records/:id/payment', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { payment_status, payment_reference } = req.body;
  
  if (!['paid', 'failed'].includes(payment_status)) {
    return errorResponse(res, 'Invalid payment status', 400);
  }
  
  const record = await PayrollRecord.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!record) {
    return errorResponse(res, 'Payroll record not found', 404);
  }
  
  const updateData = { payment_status };
  if (payment_status === 'paid') {
    updateData.payment_date = new Date();
    updateData.payment_reference = payment_reference;
  }
  
  await record.update(updateData);
  
  return successResponse(res, { record: record.getPublicData() }, 'Payment status updated');
}));

// Complete payroll period
router.post('/periods/:id/complete', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const period = await PayrollPeriod.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!period) {
    return errorResponse(res, 'Payroll period not found', 404);
  }
  
  if (period.status !== 'processing') {
    return errorResponse(res, 'Only processing periods can be completed', 400);
  }
  
  await period.update({ status: 'completed' });
  
  return successResponse(res, { period: period.getPublicData() }, 'Payroll period completed');
}));

// Get payroll statistics
router.get('/statistics', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await PayrollPeriod.getStatistics(companyId);
  
  return successResponse(res, stats, 'Payroll statistics retrieved');
}));

// Get employee payroll history
router.get('/employee/:employeeId/history', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { employeeId } = req.params;
  
  const records = await PayrollRecord.findAll({
    where: { 
      company_id: companyId,
      employee_id: employeeId
    },
    include: [
      {
        model: PayrollPeriod,
        as: 'payrollPeriod',
        attributes: ['id', 'period_name', 'start_date', 'end_date', 'pay_date', 'status']
      }
    ],
    order: [['created_at', 'DESC']]
  });
  
  return successResponse(res, {
    records: records.map(record => record.getPublicData())
  }, 'Employee payroll history retrieved');
}));

export default router;
