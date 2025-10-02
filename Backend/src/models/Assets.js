/**
 * ASSETS MODEL - Fixed Assets Management
 * 
 * This model handles:
 * - Fixed asset registration
 * - Asset depreciation calculations
 * - Asset maintenance and repairs
 * - Asset disposal and transfers
 * - Asset categories and classifications
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const AssetCategory = sequelize.define('AssetCategory', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  depreciation_method: {
    type: DataTypes.ENUM('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production'),
    allowNull: false,
    defaultValue: 'straight_line'
  },
  default_useful_life_years: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 50
    }
  },
  default_residual_value_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00,
    validate: {
      min: 0,
      max: 100
    }
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
  tableName: 'asset_categories',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['is_active'] }
  ]
});

const FixedAsset = sequelize.define('FixedAsset', {
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
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'asset_categories',
      key: 'id'
    }
  },
  asset_tag: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  custodian: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  acquisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  acquisition_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF'
  },
  useful_life_years: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 50
    }
  },
  residual_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  depreciation_method: {
    type: DataTypes.ENUM('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production'),
    allowNull: false,
    defaultValue: 'straight_line'
  },
  accumulated_depreciation: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  book_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    computed: true // acquisition_cost - accumulated_depreciation
  },
  status: {
    type: DataTypes.ENUM('active', 'disposed', 'transferred', 'under_maintenance', 'lost'),
    allowNull: false,
    defaultValue: 'active'
  },
  disposal_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  disposal_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  disposal_method: {
    type: DataTypes.ENUM('sale', 'scrap', 'donation', 'trade_in'),
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
  tableName: 'fixed_assets',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['category_id'] },
    { fields: ['asset_tag'] },
    { fields: ['status'] },
    { fields: ['acquisition_date'] },
    { fields: ['location'] }
  ]
});

const AssetMaintenance = sequelize.define('AssetMaintenance', {
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
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'fixed_assets',
      key: 'id'
    }
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'emergency', 'inspection'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  vendor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  technician: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  next_maintenance_date: {
    type: DataTypes.DATEONLY,
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
  tableName: 'asset_maintenance',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['asset_id'] },
    { fields: ['maintenance_type'] },
    { fields: ['maintenance_date'] },
    { fields: ['status'] }
  ]
});

// Instance methods
AssetCategory.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    name: this.name,
    description: this.description,
    depreciation_method: this.depreciation_method,
    default_useful_life_years: this.default_useful_life_years,
    default_residual_value_rate: parseFloat(this.default_residual_value_rate),
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

FixedAsset.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    category_id: this.category_id,
    asset_tag: this.asset_tag,
    name: this.name,
    description: this.description,
    serial_number: this.serial_number,
    model: this.model,
    manufacturer: this.manufacturer,
    location: this.location,
    department: this.department,
    custodian: this.custodian,
    acquisition_date: this.acquisition_date,
    acquisition_cost: parseFloat(this.acquisition_cost),
    currency: this.currency,
    useful_life_years: this.useful_life_years,
    residual_value: parseFloat(this.residual_value),
    depreciation_method: this.depreciation_method,
    accumulated_depreciation: parseFloat(this.accumulated_depreciation),
    book_value: parseFloat(this.book_value),
    status: this.status,
    disposal_date: this.disposal_date,
    disposal_value: this.disposal_value ? parseFloat(this.disposal_value) : null,
    disposal_method: this.disposal_method,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

AssetMaintenance.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    asset_id: this.asset_id,
    maintenance_type: this.maintenance_type,
    description: this.description,
    maintenance_date: this.maintenance_date,
    cost: parseFloat(this.cost),
    vendor: this.vendor,
    technician: this.technician,
    status: this.status,
    next_maintenance_date: this.next_maintenance_date,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
FixedAsset.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, category_id, location } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (category_id) whereClause.category_id = category_id;
  if (location) whereClause.location = { [sequelize.Op.iLike]: `%${location}%` };
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['acquisition_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

FixedAsset.getStatistics = async function(companyId) {
  const [
    totalAssets,
    totalValue,
    totalDepreciation,
    byStatus,
    byCategory,
    byLocation
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('acquisition_cost', { where: { company_id: companyId } }),
    this.sum('accumulated_depreciation', { where: { company_id: companyId } }),
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
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('acquisition_cost')), 'total_value']
      ],
      group: ['category_id'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'location',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['location'],
      raw: true
    })
  ]);
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  const categoryStats = {};
  byCategory.forEach(item => {
    categoryStats[item.category_id] = {
      count: parseInt(item.count),
      total_value: parseFloat(item.total_value || 0)
    };
  });
  
  const locationStats = {};
  byLocation.forEach(item => {
    locationStats[item.location] = parseInt(item.count);
  });
  
  return {
    total_assets: totalAssets,
    total_value: parseFloat(totalValue || 0),
    total_depreciation: parseFloat(totalDepreciation || 0),
    net_book_value: parseFloat((totalValue || 0) - (totalDepreciation || 0)),
    by_status: statusStats,
    by_category: categoryStats,
    by_location: locationStats
  };
};

export { AssetCategory, FixedAsset, AssetMaintenance };
