/**
 * EMPLOYEE ROUTES - Employee Management
 * 
 * Handles employee CRUD operations and HR management
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createEmployeeValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('phone').matches(/^(\+250|0)?7[2389][0-9]{7}$/).withMessage('Invalid Rwanda phone number'),
  body('position').trim().isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
  body('department').trim().isLength({ min: 2, max: 100 }).withMessage('Department must be between 2 and 100 characters'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
  body('startDate').isISO8601().withMessage('Invalid start date format')
];

// Hardcoded employee data for testing
const employees = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@techsol.rw',
    phone: '+250788111111',
    position: 'Software Developer',
    department: 'Engineering',
    salary: 1500000,
    startDate: '2023-01-15',
    status: 'active',
    companyId: '1'
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@techsol.rw',
    phone: '+250788222222',
    position: 'Marketing Manager',
    department: 'Marketing',
    salary: 2000000,
    startDate: '2023-03-01',
    status: 'active',
    companyId: '1'
  },
  {
    id: '3',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@techsol.rw',
    phone: '+250788333333',
    position: 'Accountant',
    department: 'Finance',
    salary: 1800000,
    startDate: '2023-02-10',
    status: 'active',
    companyId: '1'
  }
];

/**
 * GET /employees
 * Get all employees for the company
 */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { page = 1, limit = 10, department, status } = req.query;
  
  // Filter employees by company
  let filteredEmployees = employees.filter(emp => emp.companyId === companyId);
  
  // Apply filters
  if (department) {
    filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
  }
  
  if (status) {
    filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
  }
  
  // Pagination
  const offset = (page - 1) * limit;
  const paginatedEmployees = filteredEmployees.slice(offset, offset + parseInt(limit));
  
  return successResponse(res, {
    employees: paginatedEmployees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredEmployees.length,
      pages: Math.ceil(filteredEmployees.length / limit)
    }
  }, 'Employees retrieved successfully');
}));

/**
 * GET /employees/:id
 * Get specific employee details
 */
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const employee = employees.find(emp => emp.id === id && emp.companyId === companyId);
  
  if (!employee) {
    return errorResponse(res, 'Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }
  
  return successResponse(res, { employee }, 'Employee details retrieved successfully');
}));

/**
 * POST /employees
 * Create a new employee
 */
router.post('/', createEmployeeValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'hr']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  
  // Check if employee with email already exists
  const existingEmployee = employees.find(emp => emp.email === req.body.email && emp.companyId === companyId);
  if (existingEmployee) {
    return errorResponse(res, 'Employee with this email already exists', 409, 'EMPLOYEE_EXISTS');
  }
  
  const newEmployee = {
    id: (employees.length + 1).toString(),
    ...req.body,
    companyId,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  employees.push(newEmployee);
  
  return successResponse(res, { employee: newEmployee }, 'Employee created successfully', 201);
}));

/**
 * PUT /employees/:id
 * Update employee details
 */
router.put('/:id', createEmployeeValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'hr']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { id } = req.params;
  const { companyId } = req;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id && emp.companyId === companyId);
  
  if (employeeIndex === -1) {
    return errorResponse(res, 'Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }
  
  // Check if email is being changed and if it conflicts with another employee
  if (req.body.email && req.body.email !== employees[employeeIndex].email) {
    const emailExists = employees.find(emp => emp.email === req.body.email && emp.companyId === companyId && emp.id !== id);
    if (emailExists) {
      return errorResponse(res, 'Employee with this email already exists', 409, 'EMPLOYEE_EXISTS');
    }
  }
  
  employees[employeeIndex] = {
    ...employees[employeeIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  return successResponse(res, { employee: employees[employeeIndex] }, 'Employee updated successfully');
}));

/**
 * DELETE /employees/:id
 * Delete employee (soft delete)
 */
router.delete('/:id', requireCompanyAccess, requireRole(['admin', 'owner', 'hr']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id && emp.companyId === companyId);
  
  if (employeeIndex === -1) {
    return errorResponse(res, 'Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }
  
  // Soft delete - mark as inactive
  employees[employeeIndex].status = 'inactive';
  employees[employeeIndex].updatedAt = new Date().toISOString();
  
  return successResponse(res, null, 'Employee deleted successfully');
}));

/**
 * GET /employees/departments
 * Get all departments
 */
router.get('/departments', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const companyEmployees = employees.filter(emp => emp.companyId === companyId);
  const departments = [...new Set(companyEmployees.map(emp => emp.department))];
  
  return successResponse(res, { departments }, 'Departments retrieved successfully');
}));

/**
 * GET /employees/stats
 * Get employee statistics
 */
router.get('/stats', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const companyEmployees = employees.filter(emp => emp.companyId === companyId);
  
  const stats = {
    total: companyEmployees.length,
    active: companyEmployees.filter(emp => emp.status === 'active').length,
    inactive: companyEmployees.filter(emp => emp.status === 'inactive').length,
    departments: companyEmployees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {}),
    averageSalary: companyEmployees.length > 0 
      ? companyEmployees.reduce((sum, emp) => sum + emp.salary, 0) / companyEmployees.length 
      : 0
  };
  
  return successResponse(res, { stats }, 'Employee statistics retrieved successfully');
}));

export default router;
