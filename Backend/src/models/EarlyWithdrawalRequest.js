/**
 * EARLY WITHDRAWAL REQUEST MODEL
 * 
 * This model handles early withdrawal requests for locked capital
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const EarlyWithdrawalRequest = sequelize.define('EarlyWithdrawalRequest', {
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
  locked_capital_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'locked_capitals',
      key: 'id'
    }
  },
  request_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  penalty_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  review_notes: {
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
  tableName: 'early_withdrawal_requests',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['locked_capital_id'] },
    { fields: ['status'] },
    { fields: ['request_date'] }
  ]
});

EarlyWithdrawalRequest.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    locked_capital_id: this.locked_capital_id,
    request_date: this.request_date,
    reason: this.reason,
    penalty_amount: parseFloat(this.penalty_amount),
    status: this.status,
    reviewed_by: this.reviewed_by,
    reviewed_at: this.reviewed_at,
    review_notes: this.review_notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

export default EarlyWithdrawalRequest;
