/**
 * CAPITAL MANAGEMENT MODEL - Capital Locking System
 * 
 * This model handles:
 * - Capital locking/unlocking operations
 * - Investor capital management
 * - ROI calculations and interest accrual
 * - Early withdrawal requests and penalties
 * 
 * FEATURES:
 * - Multi-currency support
 * - Flexible lock periods
 * - ROI rate management
 * - Early withdrawal penalty system
 * - Interest accrual calculations
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const LockedCapital = sequelize.define('LockedCapital', {
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
  investor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  investor_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF',
    validate: {
      isIn: [['RWF', 'USD', 'EUR', 'GBP']]
    }
  },
  lock_period_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 60
    }
  },
  lock_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  unlock_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('locked', 'unlocked', 'early_withdrawal_requested', 'penalty_applied'),
    allowNull: false,
    defaultValue: 'locked'
  },
  base_roi_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 8.00,
    validate: {
      min: 0,
      max: 50
    }
  },
  bonus_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 10
    }
  },
  total_roi_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    computed: true // base_roi_rate + bonus_rate
  },
  accrued_interest: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  early_withdrawal_penalty_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 2.00,
    validate: {
      min: 0,
      max: 20
    }
  },
  penalty_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
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
  tableName: 'locked_capitals',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['investor_id'] },
    { fields: ['status'] },
    { fields: ['lock_date'] },
    { fields: ['unlock_date'] },
    { fields: ['currency'] }
  ]
});

// Instance methods
LockedCapital.prototype.calculateAccruedInterest = function() {
  const lockDate = new Date(this.lock_date);
  const now = new Date();
  const monthsElapsed = (now.getTime() - lockDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const annualRate = this.total_roi_rate / 100;
  const monthlyRate = annualRate / 12;
  
  return this.amount * monthlyRate * monthsElapsed;
};

LockedCapital.prototype.calculateEarlyWithdrawalPenalty = function() {
  if (!this.early_withdrawal_penalty_rate) return 0;
  return this.amount * (this.early_withdrawal_penalty_rate / 100);
};

LockedCapital.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    investor_id: this.investor_id,
    investor_name: this.investor_name,
    amount: parseFloat(this.amount),
    currency: this.currency,
    lock_period_months: this.lock_period_months,
    lock_date: this.lock_date,
    unlock_date: this.unlock_date,
    status: this.status,
    base_roi_rate: parseFloat(this.base_roi_rate),
    bonus_rate: parseFloat(this.bonus_rate),
    total_roi_rate: parseFloat(this.total_roi_rate),
    accrued_interest: parseFloat(this.accrued_interest),
    early_withdrawal_penalty_rate: parseFloat(this.early_withdrawal_penalty_rate || 0),
    penalty_amount: parseFloat(this.penalty_amount || 0),
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
LockedCapital.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, currency, investor_id } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (currency) whereClause.currency = currency;
  if (investor_id) whereClause.investor_id = investor_id;
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['lock_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

LockedCapital.getStatistics = async function(companyId) {
  const [
    totalLocked,
    totalAmount,
    totalAccruedInterest,
    byStatus,
    byCurrency,
    upcomingUnlocks
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('amount', { where: { company_id: companyId } }),
    this.sum('accrued_interest', { where: { company_id: companyId } }),
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
        'currency',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['currency'],
      raw: true
    }),
    this.count({
      where: {
        company_id: companyId,
        unlock_date: {
          [sequelize.Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      }
    })
  ]);
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  const currencyStats = {};
  byCurrency.forEach(item => {
    currencyStats[item.currency] = parseFloat(item.total_amount || 0);
  });
  
  return {
    total_locked: totalLocked,
    total_amount: parseFloat(totalAmount || 0),
    total_accrued_interest: parseFloat(totalAccruedInterest || 0),
    by_status: statusStats,
    by_currency: currencyStats,
    upcoming_unlocks: upcomingUnlocks
  };
};

export default LockedCapital;
