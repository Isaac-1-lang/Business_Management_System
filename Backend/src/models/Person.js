/**
 * PERSON MODEL - Individual Person Information
 * 
 * This model handles:
 * - Personal information for directors, shareholders, employees
 * - Contact details and addresses
 * - Identification documents
 * - Rwanda-specific information (National ID, etc.)
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Person = sequelize.define('Person', {
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
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  middle_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Rwandan'
  },
  national_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [16, 20]
    }
  },
  passport_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^(\+250|0)?7[2389][0-9]{7}$/
    }
  },
  address: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      street: '',
      city: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      postal_code: ''
    }
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  employer: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  },
  bank_details: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      bank_name: '',
      account_number: '',
      account_name: '',
      branch: ''
    }
  },
  tax_id: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'persons',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['national_id'] },
    { fields: ['passport_number'] },
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['is_active'] },
    { fields: ['first_name', 'last_name'] }
  ]
});

// Instance methods
Person.prototype.getFullName = function() {
  const parts = [this.first_name, this.middle_name, this.last_name].filter(Boolean);
  return parts.join(' ');
};

Person.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    first_name: this.first_name,
    last_name: this.last_name,
    middle_name: this.middle_name,
    full_name: this.getFullName(),
    date_of_birth: this.date_of_birth,
    gender: this.gender,
    nationality: this.nationality,
    national_id: this.national_id,
    passport_number: this.passport_number,
    email: this.email,
    phone: this.phone,
    address: this.address,
    occupation: this.occupation,
    employer: this.employer,
    marital_status: this.marital_status,
    emergency_contact: this.emergency_contact,
    bank_details: this.bank_details,
    tax_id: this.tax_id,
    is_active: this.is_active,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

Person.prototype.getMinimalData = function() {
  return {
    id: this.id,
    first_name: this.first_name,
    last_name: this.last_name,
    full_name: this.getFullName(),
    email: this.email,
    phone: this.phone
  };
};

// Class methods
Person.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, search, is_active } = options;
  
  const whereClause = { company_id: companyId };
  
  if (is_active !== undefined) whereClause.is_active = is_active;
  if (search) {
    whereClause[sequelize.Op.or] = [
      { first_name: { [sequelize.Op.iLike]: `%${search}%` } },
      { last_name: { [sequelize.Op.iLike]: `%${search}%` } },
      { email: { [sequelize.Op.iLike]: `%${search}%` } },
      { phone: { [sequelize.Op.iLike]: `%${search}%` } },
      { national_id: { [sequelize.Op.iLike]: `%${search}%` } }
    ];
  }
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['first_name', 'ASC'], ['last_name', 'ASC']],
    limit: parseInt(limit),
    offset: offset
  });
};

Person.searchByName = async function(companyId, name) {
  return await this.findAll({
    where: {
      company_id: companyId,
      is_active: true,
      [sequelize.Op.or]: [
        { first_name: { [sequelize.Op.iLike]: `%${name}%` } },
        { last_name: { [sequelize.Op.iLike]: `%${name}%` } },
        sequelize.literal(`CONCAT(first_name, ' ', last_name) ILIKE '%${name}%'`)
      ]
    },
    order: [['first_name', 'ASC'], ['last_name', 'ASC']],
    limit: 20
  });
};

Person.getStatistics = async function(companyId) {
  const [
    totalPersons,
    activePersons,
    byGender,
    byNationality
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.count({ where: { company_id: companyId, is_active: true } }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['gender'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'nationality',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['nationality'],
      raw: true
    })
  ]);
  
  const genderStats = {};
  byGender.forEach(item => {
    genderStats[item.gender || 'unknown'] = parseInt(item.count);
  });
  
  const nationalityStats = {};
  byNationality.forEach(item => {
    nationalityStats[item.nationality || 'unknown'] = parseInt(item.count);
  });
  
  return {
    total_persons: totalPersons,
    active_persons: activePersons,
    by_gender: genderStats,
    by_nationality: nationalityStats
  };
};

export default Person;
