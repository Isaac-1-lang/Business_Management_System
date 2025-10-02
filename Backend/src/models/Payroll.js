/**
 * PAYROLL MODEL - Employee Payroll Management
 * 
 * This model handles:
 * - Employee payroll records
 * - Salary calculations
 * - Tax deductions
 * - Benefits and allowances
 * - Payroll periods and processing
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const PayrollPeriod = sequelize.define('PayrollPeriod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  period_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pay_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'processing', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  total_gross: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_deductions: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_net: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payroll_periods',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['start_date', 'end_date'] },
    { fields: ['status'] },
    { fields: ['pay_date'] }
  ]
});

const PayrollRecord = sequelize.define('PayrollRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  payroll_period_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'payroll_periods',
      key: 'id'
    }
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  basic_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  overtime_rate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  overtime_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  allowances: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  total_allowances: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  gross_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  income_tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  social_security: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  health_insurance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  other_deductions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  total_deductions: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  net_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'check', 'cash'),
    allowNull: false,
    defaultValue: 'bank_transfer'
  },
  bank_account: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payroll_records',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['payroll_period_id'] },
    { fields: ['employee_id'] },
    { fields: ['payment_status'] },
    { fields: ['payment_date'] }
  ]
});

// Instance methods
PayrollPeriod.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    period_name: this.period_name,
    start_date: this.start_date,
    end_date: this.end_date,
    pay_date: this.pay_date,
    status: this.status,
    total_gross: parseFloat(this.total_gross),
    total_deductions: parseFloat(this.total_deductions),
    total_net: parseFloat(this.total_net),
    currency: this.currency,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

PayrollRecord.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    payroll_period_id: this.payroll_period_id,
    employee_id: this.employee_id,
    basic_salary: parseFloat(this.basic_salary),
    overtime_hours: parseFloat(this.overtime_hours),
    overtime_rate: parseFloat(this.overtime_rate),
    overtime_amount: parseFloat(this.overtime_amount),
    allowances: this.allowances,
    total_allowances: parseFloat(this.total_allowances),
    gross_salary: parseFloat(this.gross_salary),
    income_tax: parseFloat(this.income_tax),
    social_security: parseFloat(this.social_security),
    health_insurance: parseFloat(this.health_insurance),
    other_deductions: this.other_deductions,
    total_deductions: parseFloat(this.total_deductions),
    net_salary: parseFloat(this.net_salary),
    payment_method: this.payment_method,
    bank_account: this.bank_account,
    payment_status: this.payment_status,
    payment_date: this.payment_date,
    payment_reference: this.payment_reference,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
PayrollPeriod.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, year } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (year) {
    whereClause.start_date = {
      [sequelize.Op.gte]: `${year}-01-01`,
      [sequelize.Op.lte]: `${year}-12-31`
    };
  }
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['start_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

PayrollRecord.getByPeriod = async function(periodId) {
  return await this.findAll({
    where: { payroll_period_id: periodId },
    order: [['net_salary', 'DESC']]
  });
};

PayrollPeriod.getStatistics = async function(companyId) {
  const [
    totalPeriods,
    totalGross,
    totalNet,
    byStatus,
    byYear
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('total_gross', { where: { company_id: companyId } }),
    this.sum('total_net', { where: { company_id: companyId } }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM start_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('total_gross')), 'total_gross'],
        [sequelize.fn('SUM', sequelize.col('total_net')), 'total_net']
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM start_date'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM start_date')), 'DESC']],
      raw: true
    })
  ]);
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  const yearStats = {};
  byYear.forEach(item => {
    yearStats[item.year] = {
      total_gross: parseFloat(item.total_gross || 0),
      total_net: parseFloat(item.total_net || 0)
    };
  });
  
  return {
    total_periods: totalPeriods,
    total_gross: parseFloat(totalGross || 0),
    total_net: parseFloat(totalNet || 0),
    by_status: statusStats,
    by_year: yearStats
  };
};

export { PayrollPeriod, PayrollRecord };
