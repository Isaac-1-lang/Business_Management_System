/**
 * MODEL ASSOCIATIONS - Sequelize Model Relationships
 * 
 * This file defines all the relationships between models in the system.
 * It should be imported and executed after all models are defined.
 */

import { User } from './User.js';
import { Company } from './Company.js';
import sequelize from '../database/connection.js';

// User-Company Many-to-Many relationship with UserCompany model
// Users can belong to multiple companies, and companies can have multiple users
User.belongsToMany(Company, {
  through: 'user_companies',
  as: 'companies',
  foreignKey: 'userId',
  otherKey: 'companyId'
});

Company.belongsToMany(User, {
  through: 'user_companies',
  as: 'users',
  foreignKey: 'companyId',
  otherKey: 'userId'
});

// Note: Using string-based junction table for now
// Direct associations can be added later when UserCompany model is properly set up

// Company-User One-to-Many relationship for audit fields
Company.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
  targetKey: 'id'
});

Company.belongsTo(User, {
  as: 'updater',
  foreignKey: 'updatedBy',
  targetKey: 'id'
});

User.hasMany(Company, {
  as: 'createdCompanies',
  foreignKey: 'createdBy',
  sourceKey: 'id'
});

User.hasMany(Company, {
  as: 'updatedCompanies',
  foreignKey: 'updatedBy',
  sourceKey: 'id'
});

// User-User One-to-Many relationship for audit fields
User.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
  targetKey: 'id'
});

User.belongsTo(User, {
  as: 'updater',
  foreignKey: 'updatedBy',
  targetKey: 'id'
});

User.hasMany(User, {
  as: 'createdUsers',
  foreignKey: 'createdBy',
  sourceKey: 'id'
});

User.hasMany(User, {
  as: 'updatedUsers',
  foreignKey: 'updatedBy',
  sourceKey: 'id'
});

export { User, Company };
