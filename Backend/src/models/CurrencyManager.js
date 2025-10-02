/**
 * MULTI-CURRENCY MANAGER MODEL
 * 
 * This model handles multi-currency operations and exchange rates
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const CurrencyRate = sequelize.define('CurrencyRate', {
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
  from_currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      isIn: [['RWF', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']]
    }
  },
  to_currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      isIn: [['RWF', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']]
    }
  },
  rate: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    validate: {
      min: 0.000001
    }
  },
  rate_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  source: {
    type: DataTypes.ENUM('manual', 'api', 'bank'),
    allowNull: false,
    defaultValue: 'manual'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'currency_rates',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['from_currency', 'to_currency'] },
    { fields: ['rate_date'] },
    { fields: ['is_active'] }
  ]
});

const CurrencyTransaction = sequelize.define('CurrencyTransaction', {
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
  transaction_type: {
    type: DataTypes.ENUM('exchange', 'conversion', 'hedge', 'settlement'),
    allowNull: false
  },
  from_currency: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  to_currency: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  from_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  to_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reference_id: {
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
  tableName: 'currency_transactions',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['transaction_type'] },
    { fields: ['transaction_date'] },
    { fields: ['from_currency', 'to_currency'] }
  ]
});

// Instance methods
CurrencyRate.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    from_currency: this.from_currency,
    to_currency: this.to_currency,
    rate: parseFloat(this.rate),
    rate_date: this.rate_date,
    source: this.source,
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

CurrencyTransaction.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    transaction_type: this.transaction_type,
    from_currency: this.from_currency,
    to_currency: this.to_currency,
    from_amount: parseFloat(this.from_amount),
    to_amount: parseFloat(this.to_amount),
    exchange_rate: parseFloat(this.exchange_rate),
    transaction_date: this.transaction_date,
    reference_id: this.reference_id,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
CurrencyRate.getLatestRates = async function(companyId, baseCurrency = 'RWF') {
  const currencies = ['RWF', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const rates = {};
  
  for (const currency of currencies) {
    if (currency !== baseCurrency) {
      const rate = await this.findOne({
        where: {
          company_id: companyId,
          from_currency: baseCurrency,
          to_currency: currency,
          is_active: true
        },
        order: [['rate_date', 'DESC']]
      });
      
      if (rate) {
        rates[currency] = parseFloat(rate.rate);
      }
    }
  }
  
  return rates;
};

CurrencyTransaction.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, transaction_type, currency, start_date, end_date } = options;
  
  const whereClause = { company_id: companyId };
  
  if (transaction_type) whereClause.transaction_type = transaction_type;
  if (currency) {
    whereClause[sequelize.Op.or] = [
      { from_currency: currency },
      { to_currency: currency }
    ];
  }
  if (start_date || end_date) {
    whereClause.transaction_date = {};
    if (start_date) whereClause.transaction_date[sequelize.Op.gte] = start_date;
    if (end_date) whereClause.transaction_date[sequelize.Op.lte] = end_date;
  }
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['transaction_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

export { CurrencyRate, CurrencyTransaction };
