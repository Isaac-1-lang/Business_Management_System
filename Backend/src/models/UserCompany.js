/**
 * USER COMPANY MODEL - Junction Table Model
 * 
 * This model represents the many-to-many relationship between users and companies
 * with additional role information for each user within a company.
 * 
 * FEATURES:
 * - User-Company association with role
 * - Timestamps for audit trail
 * - Role-based permissions within company context
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/connection.js';

class UserCompany extends Model {}

UserCompany.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'manager', 'accountant', 'hr', 'employee', 'viewer'),
    allowNull: false,
    defaultValue: 'employee'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'joined_at'
  },
  
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'left_at'
  }
}, {
  sequelize,
  modelName: 'UserCompany',
  tableName: 'user_companies',
  timestamps: true,
  underscored: true,
  
  indexes: [
    {
      unique: true,
      fields: ['userId', 'companyId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['companyId']
    },
    {
      fields: ['role']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Class methods
UserCompany.findByUserAndCompany = async function(userId, companyId) {
  return this.findOne({
    where: {
      userId,
      companyId,
      isActive: true
    }
  });
};

UserCompany.findByUser = async function(userId) {
  return this.findAll({
    where: {
      userId,
      isActive: true
    }
  });
};

UserCompany.findByCompany = async function(companyId) {
  return this.findAll({
    where: {
      companyId,
      isActive: true
    }
  });
};

// Instance methods
UserCompany.prototype.deactivate = async function() {
  this.isActive = false;
  this.leftAt = new Date();
  await this.save();
};

UserCompany.prototype.activate = async function() {
  this.isActive = true;
  this.leftAt = null;
  await this.save();
};

export { UserCompany };
