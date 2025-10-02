/**
 * DIVIDENDS MODEL - Dividend Management System
 * 
 * This model handles:
 * - Dividend declarations
 * - Dividend distributions to shareholders
 * - Payment tracking and status
 * - Tax calculations
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const DividendDeclaration = sequelize.define('DividendDeclaration', {
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
  declaration_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  financial_year: {
    type: DataTypes.STRING(9),
    allowNull: false,
    validate: {
      pattern: /^\d{4}-\d{4}$/
    }
  },
  dividend_type: {
    type: DataTypes.ENUM('interim', 'final', 'special'),
    allowNull: false,
    defaultValue: 'final'
  },
  total_amount: {
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
  dividend_per_share: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    validate: {
      min: 0.0001
    }
  },
  total_shares: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  status: {
    type: DataTypes.ENUM('declared', 'approved', 'distributed', 'paid', 'cancelled'),
    allowNull: false,
    defaultValue: 'declared'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  record_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  ex_dividend_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00,
    validate: {
      min: 0,
      max: 50
    }
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
  tableName: 'dividend_declarations',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['declaration_date'] },
    { fields: ['financial_year'] },
    { fields: ['status'] },
    { fields: ['dividend_type'] }
  ]
});

const DividendDistribution = sequelize.define('DividendDistribution', {
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
  declaration_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'dividend_declarations',
      key: 'id'
    }
  },
  shareholder_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'shareholders',
      key: 'id'
    }
  },
  shares_held: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  dividend_per_share: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    validate: {
      min: 0.0001
    }
  },
  gross_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  net_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'check', 'cash', 'other'),
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  payment_proof_url: {
    type: DataTypes.TEXT,
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
  tableName: 'dividend_distributions',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['declaration_id'] },
    { fields: ['shareholder_id'] },
    { fields: ['payment_status'] },
    { fields: ['payment_date'] }
  ]
});

// Instance methods
DividendDeclaration.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    declaration_date: this.declaration_date,
    financial_year: this.financial_year,
    dividend_type: this.dividend_type,
    total_amount: parseFloat(this.total_amount),
    currency: this.currency,
    dividend_per_share: parseFloat(this.dividend_per_share),
    total_shares: parseInt(this.total_shares),
    status: this.status,
    payment_date: this.payment_date,
    record_date: this.record_date,
    ex_dividend_date: this.ex_dividend_date,
    tax_rate: parseFloat(this.tax_rate),
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

DividendDistribution.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    declaration_id: this.declaration_id,
    shareholder_id: this.shareholder_id,
    shares_held: parseInt(this.shares_held),
    dividend_per_share: parseFloat(this.dividend_per_share),
    gross_amount: parseFloat(this.gross_amount),
    tax_amount: parseFloat(this.tax_amount),
    net_amount: parseFloat(this.net_amount),
    payment_status: this.payment_status,
    payment_date: this.payment_date,
    payment_method: this.payment_method,
    payment_reference: this.payment_reference,
    payment_proof_url: this.payment_proof_url,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
DividendDeclaration.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, dividend_type, financial_year } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (dividend_type) whereClause.dividend_type = dividend_type;
  if (financial_year) whereClause.financial_year = financial_year;
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['declaration_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

DividendDistribution.getByDeclaration = async function(declarationId) {
  return await this.findAll({
    where: { declaration_id: declarationId },
    order: [['net_amount', 'DESC']]
  });
};

DividendDeclaration.getStatistics = async function(companyId) {
  const [
    totalDeclarations,
    totalAmount,
    byStatus,
    byType,
    byYear
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('total_amount', { where: { company_id: companyId } }),
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
        'dividend_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['dividend_type'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'financial_year',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
      ],
      group: ['financial_year'],
      order: [['financial_year', 'DESC']],
      raw: true
    })
  ]);
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  const typeStats = {};
  byType.forEach(item => {
    typeStats[item.dividend_type] = parseInt(item.count);
  });
  
  const yearStats = {};
  byYear.forEach(item => {
    yearStats[item.financial_year] = parseFloat(item.total_amount || 0);
  });
  
  return {
    total_declarations: totalDeclarations,
    total_amount: parseFloat(totalAmount || 0),
    by_status: statusStats,
    by_type: typeStats,
    by_year: yearStats
  };
};

export { DividendDeclaration, DividendDistribution };
