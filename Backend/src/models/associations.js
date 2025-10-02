/**
 * MODEL ASSOCIATIONS - Sequelize Model Relationships
 * 
 * This file defines all the relationships between models in the system.
 * It should be imported and executed after all models are defined.
 */

import  User  from './User.js';
import  Company  from './Company.js';
import Meeting from './Meeting.js';
import LockedCapital from './LockedCapital.js';
import EarlyWithdrawalRequest from './EarlyWithdrawalRequest.js';
import { CurrencyRate, CurrencyTransaction } from './CurrencyManager.js';
import { DividendDeclaration, DividendDistribution } from './Dividends.js';
import { PayrollPeriod, PayrollRecord } from './Payroll.js';
import { AssetCategory, FixedAsset, AssetMaintenance } from './Assets.js';
import { Director, Shareholder, ShareCertificate, BeneficialOwner } from './DirectorsShareholders.js';
import { DocumentCategory, Document, DocumentAccess, DocumentActivity } from './DocumentVault.js';
import Person from './Person.js';
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

// Company-Meeting One-to-Many relationship
Company.hasMany(Meeting, {
  as: 'meetings',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

Meeting.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

// Capital Management Associations
Company.hasMany(LockedCapital, {
  as: 'lockedCapitals',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

LockedCapital.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

LockedCapital.hasMany(EarlyWithdrawalRequest, {
  as: 'withdrawalRequests',
  foreignKey: 'locked_capital_id',
  sourceKey: 'id'
});

EarlyWithdrawalRequest.belongsTo(LockedCapital, {
  as: 'lockedCapital',
  foreignKey: 'locked_capital_id',
  targetKey: 'id'
});

// Currency Management Associations
Company.hasMany(CurrencyRate, {
  as: 'currencyRates',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

CurrencyRate.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

Company.hasMany(CurrencyTransaction, {
  as: 'currencyTransactions',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

CurrencyTransaction.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

// Dividends Associations
Company.hasMany(DividendDeclaration, {
  as: 'dividendDeclarations',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

DividendDeclaration.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

DividendDeclaration.hasMany(DividendDistribution, {
  as: 'distributions',
  foreignKey: 'declaration_id',
  sourceKey: 'id'
});

DividendDistribution.belongsTo(DividendDeclaration, {
  as: 'declaration',
  foreignKey: 'declaration_id',
  targetKey: 'id'
});

// Payroll Associations
Company.hasMany(PayrollPeriod, {
  as: 'payrollPeriods',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

PayrollPeriod.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

PayrollPeriod.hasMany(PayrollRecord, {
  as: 'payrollRecords',
  foreignKey: 'payroll_period_id',
  sourceKey: 'id'
});

PayrollRecord.belongsTo(PayrollPeriod, {
  as: 'payrollPeriod',
  foreignKey: 'payroll_period_id',
  targetKey: 'id'
});

// Assets Associations
Company.hasMany(AssetCategory, {
  as: 'assetCategories',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

AssetCategory.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

AssetCategory.hasMany(FixedAsset, {
  as: 'assets',
  foreignKey: 'category_id',
  sourceKey: 'id'
});

FixedAsset.belongsTo(AssetCategory, {
  as: 'category',
  foreignKey: 'category_id',
  targetKey: 'id'
});

Company.hasMany(FixedAsset, {
  as: 'fixedAssets',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

FixedAsset.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

FixedAsset.hasMany(AssetMaintenance, {
  as: 'maintenanceRecords',
  foreignKey: 'asset_id',
  sourceKey: 'id'
});

AssetMaintenance.belongsTo(FixedAsset, {
  as: 'asset',
  foreignKey: 'asset_id',
  targetKey: 'id'
});

// Directors and Shareholders Associations
Company.hasMany(Person, {
  as: 'persons',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

Person.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

Company.hasMany(Director, {
  as: 'directors',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

Director.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

Director.belongsTo(Person, {
  as: 'person',
  foreignKey: 'person_id',
  targetKey: 'id'
});

Person.hasMany(Director, {
  as: 'directorships',
  foreignKey: 'person_id',
  sourceKey: 'id'
});

Company.hasMany(Shareholder, {
  as: 'shareholders',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

Shareholder.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

Shareholder.belongsTo(Person, {
  as: 'person',
  foreignKey: 'person_id',
  targetKey: 'id'
});

Person.hasMany(Shareholder, {
  as: 'shareholdings',
  foreignKey: 'person_id',
  sourceKey: 'id'
});

Shareholder.hasMany(ShareCertificate, {
  as: 'certificates',
  foreignKey: 'shareholder_id',
  sourceKey: 'id'
});

ShareCertificate.belongsTo(Shareholder, {
  as: 'shareholder',
  foreignKey: 'shareholder_id',
  targetKey: 'id'
});

Company.hasMany(BeneficialOwner, {
  as: 'beneficialOwners',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

BeneficialOwner.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

BeneficialOwner.belongsTo(Person, {
  as: 'person',
  foreignKey: 'person_id',
  targetKey: 'id'
});

Person.hasMany(BeneficialOwner, {
  as: 'beneficialOwnerships',
  foreignKey: 'person_id',
  sourceKey: 'id'
});

// Document Vault Associations
Company.hasMany(DocumentCategory, {
  as: 'documentCategories',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

DocumentCategory.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

DocumentCategory.hasMany(Document, {
  as: 'documents',
  foreignKey: 'category_id',
  sourceKey: 'id'
});

Document.belongsTo(DocumentCategory, {
  as: 'category',
  foreignKey: 'category_id',
  targetKey: 'id'
});

Company.hasMany(Document, {
  as: 'documents',
  foreignKey: 'company_id',
  sourceKey: 'id'
});

Document.belongsTo(Company, {
  as: 'company',
  foreignKey: 'company_id',
  targetKey: 'id'
});

Document.belongsTo(User, {
  as: 'uploader',
  foreignKey: 'uploaded_by',
  targetKey: 'id'
});

User.hasMany(Document, {
  as: 'uploadedDocuments',
  foreignKey: 'uploaded_by',
  sourceKey: 'id'
});

Document.hasMany(DocumentAccess, {
  as: 'accessRecords',
  foreignKey: 'document_id',
  sourceKey: 'id'
});

DocumentAccess.belongsTo(Document, {
  as: 'document',
  foreignKey: 'document_id',
  targetKey: 'id'
});

Document.hasMany(DocumentActivity, {
  as: 'activities',
  foreignKey: 'document_id',
  sourceKey: 'id'
});

DocumentActivity.belongsTo(Document, {
  as: 'document',
  foreignKey: 'document_id',
  targetKey: 'id'
});

DocumentActivity.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
  targetKey: 'id'
});

User.hasMany(DocumentActivity, {
  as: 'documentActivities',
  foreignKey: 'user_id',
  sourceKey: 'id'
});

export { 
  User, 
  Company, 
  Meeting, 
  LockedCapital, 
  EarlyWithdrawalRequest,
  CurrencyRate, 
  CurrencyTransaction,
  DividendDeclaration, 
  DividendDistribution,
  PayrollPeriod, 
  PayrollRecord,
  AssetCategory, 
  FixedAsset, 
  AssetMaintenance,
  Director, 
  Shareholder, 
  ShareCertificate, 
  BeneficialOwner,
  DocumentCategory, 
  Document, 
  DocumentAccess, 
  DocumentActivity,
  Person
};
