/**
 * CREATE ALL TABLES MIGRATION
 * 
 * This migration creates all the necessary tables for the complete HR Dashboard system
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  // Create Users table first (base dependency)
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'owner', 'manager', 'accountant', 'hr', 'employee', 'viewer'),
      allowNull: false,
      defaultValue: 'employee'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_password_change: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  // Create Companies table (base dependency)
  await queryInterface.createTable('companies', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    trading_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    rdb_registration_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    rdb_registration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    business_type: {
      type: DataTypes.ENUM('Ltd', 'SARL', 'Cooperative', 'Partnership', 'Sole Proprietorship', 'Branch', 'Other'),
      allowNull: false,
      defaultValue: 'Ltd'
    },
    business_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tin: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    vat_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    tax_regime: {
      type: DataTypes.ENUM('Standard', 'Simplified', 'Exempt', 'Other'),
      allowNull: false,
      defaultValue: 'Standard'
    },
    currency: {
      type: DataTypes.ENUM('RWF', 'USD', 'EUR'),
      allowNull: false,
      defaultValue: 'RWF'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Rwanda'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'liquidated', 'merged'),
      allowNull: false,
      defaultValue: 'active'
    },
    compliance_status: {
      type: DataTypes.ENUM('compliant', 'non_compliant', 'pending', 'under_review'),
      allowNull: false,
      defaultValue: 'pending'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
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
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  // Create Persons table
  await queryInterface.createTable('persons', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'companies', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    middle_name: { type: DataTypes.STRING(100), allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
    nationality: { type: DataTypes.STRING(100), allowNull: true, defaultValue: 'Rwandan' },
    national_id: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    passport_number: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    occupation: { type: DataTypes.STRING(100), allowNull: true },
    employer: { type: DataTypes.STRING(255), allowNull: true },
    marital_status: { type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'), allowNull: true },
    emergency_contact: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    bank_details: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    tax_id: { type: DataTypes.STRING(20), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Locked Capitals table
  await queryInterface.createTable('locked_capitals', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    investor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'persons', key: 'id' } },
    investor_name: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    lock_period_months: { type: DataTypes.INTEGER, allowNull: false },
    lock_date: { type: DataTypes.DATEONLY, allowNull: false },
    unlock_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('locked', 'unlocked', 'early_withdrawal_requested', 'penalty_applied'), allowNull: false, defaultValue: 'locked' },
    base_roi_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 8.00 },
    bonus_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00 },
    total_roi_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    accrued_interest: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    early_withdrawal_penalty_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 2.00 },
    penalty_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: true, defaultValue: 0.00 },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Early Withdrawal Requests table
  await queryInterface.createTable('early_withdrawal_requests', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    locked_capital_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'locked_capitals', key: 'id' } },
    request_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    reason: { type: DataTypes.TEXT, allowNull: false },
    penalty_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
    reviewed_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    review_notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Currency Rates table
  await queryInterface.createTable('currency_rates', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    from_currency: { type: DataTypes.STRING(3), allowNull: false },
    to_currency: { type: DataTypes.STRING(3), allowNull: false },
    rate: { type: DataTypes.DECIMAL(15, 6), allowNull: false },
    rate_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    source: { type: DataTypes.ENUM('manual', 'api', 'bank'), allowNull: false, defaultValue: 'manual' },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Currency Transactions table
  await queryInterface.createTable('currency_transactions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    transaction_type: { type: DataTypes.ENUM('exchange', 'conversion', 'hedge', 'settlement'), allowNull: false },
    from_currency: { type: DataTypes.STRING(3), allowNull: false },
    to_currency: { type: DataTypes.STRING(3), allowNull: false },
    from_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    to_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    exchange_rate: { type: DataTypes.DECIMAL(15, 6), allowNull: false },
    transaction_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    reference_id: { type: DataTypes.STRING(255), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Dividend Declarations table
  await queryInterface.createTable('dividend_declarations', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    declaration_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    financial_year: { type: DataTypes.STRING(9), allowNull: false },
    dividend_type: { type: DataTypes.ENUM('interim', 'final', 'special'), allowNull: false, defaultValue: 'final' },
    total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    dividend_per_share: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
    total_shares: { type: DataTypes.BIGINT, allowNull: false },
    status: { type: DataTypes.ENUM('declared', 'approved', 'distributed', 'paid', 'cancelled'), allowNull: false, defaultValue: 'declared' },
    payment_date: { type: DataTypes.DATEONLY, allowNull: true },
    record_date: { type: DataTypes.DATEONLY, allowNull: true },
    ex_dividend_date: { type: DataTypes.DATEONLY, allowNull: true },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Dividend Distributions table
  await queryInterface.createTable('dividend_distributions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    declaration_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'dividend_declarations', key: 'id' } },
    shareholder_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'shareholders', key: 'id' } },
    shares_held: { type: DataTypes.BIGINT, allowNull: false },
    dividend_per_share: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
    gross_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    tax_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    net_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    payment_method: { type: DataTypes.ENUM('bank_transfer', 'check', 'cash', 'other'), allowNull: true },
    payment_reference: { type: DataTypes.STRING(255), allowNull: true },
    payment_proof_url: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Payroll Periods table
  await queryInterface.createTable('payroll_periods', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    period_name: { type: DataTypes.STRING(50), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    pay_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'processing', 'completed', 'cancelled'), allowNull: false, defaultValue: 'draft' },
    total_gross: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    total_deductions: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    total_net: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Payroll Records table
  await queryInterface.createTable('payroll_records', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    payroll_period_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'payroll_periods', key: 'id' } },
    employee_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'employees', key: 'id' } },
    basic_salary: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    overtime_hours: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0.00 },
    overtime_rate: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0.00 },
    overtime_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    allowances: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    total_allowances: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    gross_salary: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    income_tax: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    social_security: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    health_insurance: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    other_deductions: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    total_deductions: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    net_salary: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_method: { type: DataTypes.ENUM('bank_transfer', 'check', 'cash'), allowNull: false, defaultValue: 'bank_transfer' },
    bank_account: { type: DataTypes.STRING(255), allowNull: true },
    payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    payment_reference: { type: DataTypes.STRING(255), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Asset Categories table
  await queryInterface.createTable('asset_categories', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    parent_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'asset_categories', key: 'id' } },
    color: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#3B82F6' },
    icon: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'folder' },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Fixed Assets table
  await queryInterface.createTable('fixed_assets', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    category_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'asset_categories', key: 'id' } },
    asset_tag: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    serial_number: { type: DataTypes.STRING(100), allowNull: true },
    model: { type: DataTypes.STRING(100), allowNull: true },
    manufacturer: { type: DataTypes.STRING(100), allowNull: true },
    location: { type: DataTypes.STRING(255), allowNull: false },
    department: { type: DataTypes.STRING(100), allowNull: true },
    custodian: { type: DataTypes.STRING(255), allowNull: true },
    acquisition_date: { type: DataTypes.DATEONLY, allowNull: false },
    acquisition_cost: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    useful_life_years: { type: DataTypes.INTEGER, allowNull: false },
    residual_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    depreciation_method: { type: DataTypes.ENUM('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production'), allowNull: false, defaultValue: 'straight_line' },
    accumulated_depreciation: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    book_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'disposed', 'transferred', 'under_maintenance', 'lost'), allowNull: false, defaultValue: 'active' },
    disposal_date: { type: DataTypes.DATEONLY, allowNull: true },
    disposal_value: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    disposal_method: { type: DataTypes.ENUM('sale', 'scrap', 'donation', 'trade_in'), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Asset Maintenance table
  await queryInterface.createTable('asset_maintenance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    asset_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'fixed_assets', key: 'id' } },
    maintenance_type: { type: DataTypes.ENUM('preventive', 'corrective', 'emergency', 'inspection'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    maintenance_date: { type: DataTypes.DATEONLY, allowNull: false },
    cost: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    vendor: { type: DataTypes.STRING(255), allowNull: true },
    technician: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
    next_maintenance_date: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Directors table
  await queryInterface.createTable('directors', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    person_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'persons', key: 'id' } },
    director_type: { type: DataTypes.ENUM('executive', 'non_executive', 'independent', 'chairman', 'vice_chairman'), allowNull: false, defaultValue: 'non_executive' },
    appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
    resignation_date: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'resigned', 'removed', 'suspended'), allowNull: false, defaultValue: 'active' },
    board_committees: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    remuneration: { type: DataTypes.DECIMAL(15, 2), allowNull: true, defaultValue: 0.00 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Shareholders table
  await queryInterface.createTable('shareholders', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    person_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'persons', key: 'id' } },
    shareholder_type: { type: DataTypes.ENUM('individual', 'corporate', 'institutional', 'government'), allowNull: false, defaultValue: 'individual' },
    shares_held: { type: DataTypes.BIGINT, allowNull: false },
    share_percentage: { type: DataTypes.DECIMAL(8, 4), allowNull: false },
    acquisition_date: { type: DataTypes.DATEONLY, allowNull: false },
    acquisition_price_per_share: { type: DataTypes.DECIMAL(15, 4), allowNull: true },
    total_acquisition_cost: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'RWF' },
    status: { type: DataTypes.ENUM('active', 'transferred', 'sold', 'cancelled'), allowNull: false, defaultValue: 'active' },
    transfer_date: { type: DataTypes.DATEONLY, allowNull: true },
    beneficial_owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    nominee_details: { type: DataTypes.JSON, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Share Certificates table
  await queryInterface.createTable('share_certificates', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    shareholder_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'shareholders', key: 'id' } },
    certificate_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    shares_represented: { type: DataTypes.BIGINT, allowNull: false },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'cancelled', 'replaced', 'lost'), allowNull: false, defaultValue: 'active' },
    cancellation_date: { type: DataTypes.DATEONLY, allowNull: true },
    cancellation_reason: { type: DataTypes.STRING(255), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Beneficial Owners table
  await queryInterface.createTable('beneficial_owners', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    person_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'persons', key: 'id' } },
    ownership_percentage: { type: DataTypes.DECIMAL(8, 4), allowNull: false },
    ownership_type: { type: DataTypes.ENUM('direct', 'indirect', 'beneficial'), allowNull: false, defaultValue: 'direct' },
    control_type: { type: DataTypes.ENUM('voting', 'economic', 'both'), allowNull: false, defaultValue: 'both' },
    acquisition_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'ceased', 'transferred'), allowNull: false, defaultValue: 'active' },
    cessation_date: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Document Categories table
  await queryInterface.createTable('document_categories', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    parent_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'document_categories', key: 'id' } },
    color: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#3B82F6' },
    icon: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'folder' },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Documents table
  await queryInterface.createTable('documents', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    category_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'document_categories', key: 'id' } },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    original_file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_path: { type: DataTypes.TEXT, allowNull: false },
    file_size: { type: DataTypes.BIGINT, allowNull: false },
    mime_type: { type: DataTypes.STRING(100), allowNull: false },
    file_extension: { type: DataTypes.STRING(10), allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    is_current_version: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    parent_document_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'documents', key: 'id' } },
    document_type: { type: DataTypes.ENUM('contract', 'agreement', 'report', 'invoice', 'receipt', 'certificate', 'license', 'permit', 'other'), allowNull: false, defaultValue: 'other' },
    status: { type: DataTypes.ENUM('draft', 'active', 'archived', 'deleted'), allowNull: false, defaultValue: 'active' },
    tags: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    access_level: { type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'), allowNull: false, defaultValue: 'internal' },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
    reminder_date: { type: DataTypes.DATEONLY, allowNull: true },
    uploaded_by: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    download_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    last_accessed_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Document Access table
  await queryInterface.createTable('document_access', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    document_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'documents', key: 'id' } },
    user_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
    role_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'roles', key: 'id' } },
    access_type: { type: DataTypes.ENUM('read', 'write', 'admin'), allowNull: false, defaultValue: 'read' },
    granted_by: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    granted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Create Document Activities table
  await queryInterface.createTable('document_activities', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'companies', key: 'id' } },
    document_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'documents', key: 'id' } },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    activity_type: { type: DataTypes.ENUM('created', 'updated', 'downloaded', 'viewed', 'shared', 'deleted', 'restored', 'moved'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Add indexes for better performance
  await queryInterface.addIndex('persons', ['company_id']);
  await queryInterface.addIndex('persons', ['national_id']);
  await queryInterface.addIndex('persons', ['email']);
  await queryInterface.addIndex('locked_capitals', ['company_id']);
  await queryInterface.addIndex('locked_capitals', ['investor_id']);
  await queryInterface.addIndex('locked_capitals', ['status']);
  await queryInterface.addIndex('currency_rates', ['company_id']);
  await queryInterface.addIndex('currency_rates', ['from_currency', 'to_currency']);
  await queryInterface.addIndex('dividend_declarations', ['company_id']);
  await queryInterface.addIndex('dividend_declarations', ['status']);
  await queryInterface.addIndex('payroll_periods', ['company_id']);
  await queryInterface.addIndex('payroll_periods', ['status']);
  await queryInterface.addIndex('fixed_assets', ['company_id']);
  await queryInterface.addIndex('fixed_assets', ['asset_tag']);
  await queryInterface.addIndex('directors', ['company_id']);
  await queryInterface.addIndex('directors', ['person_id']);
  await queryInterface.addIndex('shareholders', ['company_id']);
  await queryInterface.addIndex('shareholders', ['person_id']);
  await queryInterface.addIndex('documents', ['company_id']);
  await queryInterface.addIndex('documents', ['category_id']);
  await queryInterface.addIndex('documents', ['status']);
};

export const down = async (queryInterface, Sequelize) => {
  // Drop tables in reverse order to handle foreign key constraints
  await queryInterface.dropTable('document_activities');
  await queryInterface.dropTable('document_access');
  await queryInterface.dropTable('documents');
  await queryInterface.dropTable('document_categories');
  await queryInterface.dropTable('beneficial_owners');
  await queryInterface.dropTable('share_certificates');
  await queryInterface.dropTable('shareholders');
  await queryInterface.dropTable('directors');
  await queryInterface.dropTable('asset_maintenance');
  await queryInterface.dropTable('fixed_assets');
  await queryInterface.dropTable('asset_categories');
  await queryInterface.dropTable('payroll_records');
  await queryInterface.dropTable('payroll_periods');
  await queryInterface.dropTable('dividend_distributions');
  await queryInterface.dropTable('dividend_declarations');
  await queryInterface.dropTable('currency_transactions');
  await queryInterface.dropTable('currency_rates');
  await queryInterface.dropTable('early_withdrawal_requests');
  await queryInterface.dropTable('locked_capitals');
  await queryInterface.dropTable('persons');
  // Drop base tables last
  await queryInterface.dropTable('companies');
  await queryInterface.dropTable('users');
};
