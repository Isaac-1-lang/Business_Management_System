/**
 * DIRECTORS AND SHAREHOLDERS MODEL
 * 
 * This model handles:
 * - Director information and roles
 * - Shareholder ownership details
 * - Share certificates and transfers
 * - Board meetings and resolutions
 * - Beneficial ownership tracking
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Director = sequelize.define('Director', {
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
  person_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  director_type: {
    type: DataTypes.ENUM('executive', 'non_executive', 'independent', 'chairman', 'vice_chairman'),
    allowNull: false,
    defaultValue: 'non_executive'
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  resignation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'resigned', 'removed', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  board_committees: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  remuneration: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
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
  tableName: 'directors',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['person_id'] },
    { fields: ['status'] },
    { fields: ['director_type'] },
    { fields: ['appointment_date'] }
  ]
});

const Shareholder = sequelize.define('Shareholder', {
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
  person_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  shareholder_type: {
    type: DataTypes.ENUM('individual', 'corporate', 'institutional', 'government'),
    allowNull: false,
    defaultValue: 'individual'
  },
  shares_held: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  share_percentage: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false,
    validate: {
      min: 0.0001,
      max: 100
    }
  },
  acquisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  acquisition_price_per_share: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true
  },
  total_acquisition_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF'
  },
  status: {
    type: DataTypes.ENUM('active', 'transferred', 'sold', 'cancelled'),
    allowNull: false,
    defaultValue: 'active'
  },
  transfer_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  beneficial_owner: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  nominee_details: {
    type: DataTypes.JSON,
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
  tableName: 'shareholders',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['person_id'] },
    { fields: ['status'] },
    { fields: ['shareholder_type'] },
    { fields: ['beneficial_owner'] },
    { fields: ['acquisition_date'] }
  ]
});

const ShareCertificate = sequelize.define('ShareCertificate', {
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
  shareholder_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'shareholders',
      key: 'id'
    }
  },
  certificate_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  shares_represented: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'replaced', 'lost'),
    allowNull: false,
    defaultValue: 'active'
  },
  cancellation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  cancellation_reason: {
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
  tableName: 'share_certificates',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['shareholder_id'] },
    { fields: ['certificate_number'] },
    { fields: ['status'] },
    { fields: ['issue_date'] }
  ]
});

const BeneficialOwner = sequelize.define('BeneficialOwner', {
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
  person_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  ownership_percentage: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false,
    validate: {
      min: 0.0001,
      max: 100
    }
  },
  ownership_type: {
    type: DataTypes.ENUM('direct', 'indirect', 'beneficial'),
    allowNull: false,
    defaultValue: 'direct'
  },
  control_type: {
    type: DataTypes.ENUM('voting', 'economic', 'both'),
    allowNull: false,
    defaultValue: 'both'
  },
  acquisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'ceased', 'transferred'),
    allowNull: false,
    defaultValue: 'active'
  },
  cessation_date: {
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
  tableName: 'beneficial_owners',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['person_id'] },
    { fields: ['status'] },
    { fields: ['ownership_type'] },
    { fields: ['acquisition_date'] }
  ]
});

// Instance methods
Director.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    person_id: this.person_id,
    director_type: this.director_type,
    appointment_date: this.appointment_date,
    resignation_date: this.resignation_date,
    status: this.status,
    board_committees: this.board_committees,
    remuneration: parseFloat(this.remuneration || 0),
    currency: this.currency,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

Shareholder.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    person_id: this.person_id,
    shareholder_type: this.shareholder_type,
    shares_held: parseInt(this.shares_held),
    share_percentage: parseFloat(this.share_percentage),
    acquisition_date: this.acquisition_date,
    acquisition_price_per_share: this.acquisition_price_per_share ? parseFloat(this.acquisition_price_per_share) : null,
    total_acquisition_cost: this.total_acquisition_cost ? parseFloat(this.total_acquisition_cost) : null,
    currency: this.currency,
    status: this.status,
    transfer_date: this.transfer_date,
    beneficial_owner: this.beneficial_owner,
    nominee_details: this.nominee_details,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

ShareCertificate.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    shareholder_id: this.shareholder_id,
    certificate_number: this.certificate_number,
    shares_represented: parseInt(this.shares_represented),
    issue_date: this.issue_date,
    status: this.status,
    cancellation_date: this.cancellation_date,
    cancellation_reason: this.cancellation_reason,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

BeneficialOwner.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    person_id: this.person_id,
    ownership_percentage: parseFloat(this.ownership_percentage),
    ownership_type: this.ownership_type,
    control_type: this.control_type,
    acquisition_date: this.acquisition_date,
    status: this.status,
    cessation_date: this.cessation_date,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Class methods
Director.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, director_type } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (director_type) whereClause.director_type = director_type;
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['appointment_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

Shareholder.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, status, shareholder_type, beneficial_owner } = options;
  
  const whereClause = { company_id: companyId };
  
  if (status) whereClause.status = status;
  if (shareholder_type) whereClause.shareholder_type = shareholder_type;
  if (beneficial_owner !== undefined) whereClause.beneficial_owner = beneficial_owner;
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['share_percentage', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

Director.getStatistics = async function(companyId) {
  const [
    totalDirectors,
    activeDirectors,
    byType,
    byStatus
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.count({ where: { company_id: companyId, status: 'active' } }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'director_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['director_type'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    })
  ]);
  
  const typeStats = {};
  byType.forEach(item => {
    typeStats[item.director_type] = parseInt(item.count);
  });
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  return {
    total_directors: totalDirectors,
    active_directors: activeDirectors,
    by_type: typeStats,
    by_status: statusStats
  };
};

Shareholder.getStatistics = async function(companyId) {
  const [
    totalShareholders,
    totalShares,
    byType,
    byStatus,
    beneficialOwners
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('shares_held', { where: { company_id: companyId } }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'shareholder_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['shareholder_type'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    this.count({ where: { company_id: companyId, beneficial_owner: true } })
  ]);
  
  const typeStats = {};
  byType.forEach(item => {
    typeStats[item.shareholder_type] = parseInt(item.count);
  });
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  return {
    total_shareholders: totalShareholders,
    total_shares: parseInt(totalShares || 0),
    beneficial_owners: beneficialOwners,
    by_type: typeStats,
    by_status: statusStats
  };
};

export { Director, Shareholder, ShareCertificate, BeneficialOwner };
