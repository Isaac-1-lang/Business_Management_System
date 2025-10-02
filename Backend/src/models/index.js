/**
 * MODELS INDEX FILE
 * 
 * Exports all Sequelize models for easy importing
 */

// Core models
export { default as User } from './User.js';
export { default as Company } from './Company.js';
export { default as UserCompany } from './UserCompany.js';

// Meeting models
export { default as Meeting } from './Meeting.js';

// Capital Management models
export { default as LockedCapital } from './LockedCapital.js';
export { default as EarlyWithdrawalRequest } from './EarlyWithdrawalRequest.js';

// Multi-Currency models
export { CurrencyRate, CurrencyTransaction } from './CurrencyManager.js';

// Dividends models
export { DividendDeclaration, DividendDistribution } from './Dividends.js';

// Payroll models
export { PayrollPeriod, PayrollRecord } from './Payroll.js';

// Assets models
export { AssetCategory, FixedAsset, AssetMaintenance } from './Assets.js';

// Directors & Shareholders models
export { Director, Shareholder, ShareCertificate, BeneficialOwner } from './DirectorsShareholders.js';

// Document Vault models
export { DocumentCategory, Document, DocumentAccess, DocumentActivity } from './DocumentVault.js';

// Person model
export { default as Person } from './Person.js';

// Employee model
export { default as Employee } from './Employee.js';
