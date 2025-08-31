/**
 * COMPANY MODEL - Sequelize Model
 * 
 * This model represents companies in the system with:
 * - Rwanda-specific business information
 * - Tax and compliance details
 * - Financial configuration
 * - Multi-currency support
 * - Compliance tracking
 * 
 * RWANDA-SPECIFIC FEATURES:
 * - TIN (Tax Identification Number)
 * - RDB registration details
 * - RSSB compliance tracking
 * - Local tax regime settings
 * - Rwanda address format
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/connection.js';

class Company extends Model {
  // Instance methods
  get fullAddress() {
    const parts = [this.address, this.city, this.district, this.country].filter(Boolean);
    return parts.join(', ');
  }

  get isCompliant() {
    return this.complianceStatus === 'compliant';
  }

  get hasActiveTaxRegistration() {
    return this.taxRegistrationStatus === 'active';
  }

  // Check if company needs VAT registration
  get needsVATRegistration() {
    return this.annualTurnover >= 20000000; // 20M RWF threshold
  }
}

Company.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  // Basic Company Information
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200],
      notEmpty: true
    }
  },
  
  tradingName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [2, 200]
    }
  },
  
  // Rwanda Business Registration
  rdbRegistrationNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      len: [5, 50]
    },
    field: 'rdb_registration_number'
  },
  
  rdbRegistrationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      isPast: true
    },
    field: 'rdb_registration_date'
  },
  
  businessType: {
    type: DataTypes.ENUM('Ltd', 'SARL', 'Cooperative', 'Partnership', 'Sole Proprietorship', 'Branch', 'Other'),
    allowNull: false,
    defaultValue: 'Ltd',
    field: 'business_type'
  },
  
  businessCategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_category'
  },
  
  // Tax Information (Rwanda)
  tin: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [9, 20],
      is: /^[0-9]+$/ // Only numbers
    },
    field: 'tin'
  },
  
  vatNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [9, 20]
    },
    field: 'vat_number' 
  },
   
  taxRegime: {
    type: DataTypes.ENUM('Standard', 'Simplified', 'Exempt', 'Other'),
    allowNull: false,
    defaultValue: 'Standard',
    field: 'tax_regime'
  },
  
  vatRegistrationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    },
    field: 'vat_registration_date'
  },
  
  // Financial Configuration
  currency: {
    type: DataTypes.ENUM('RWF', 'USD', 'EUR'),
    allowNull: false,
    defaultValue: 'RWF',
    field: 'currency'
  },
  
  secondaryCurrencies: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Secondary currencies must be an array');
        }
      }
    }
  },
  
  fiscalYearStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: '01-01',
    validate: {
      isDate: true
    }
  },
  
  fiscalYearEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: '12-31',
    validate: {
      isDate: true
    }
  },
  
  annualTurnover: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  // Address Information (Rwanda)
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
  
  sector: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  cell: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Rwanda'
  },
  
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  
  // Contact Information
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^(\+250|0)?7[2389][0-9]{7}$/ // Rwanda phone format
    }
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  // Compliance Status
  complianceStatus: {
    type: DataTypes.ENUM('compliant', 'non_compliant', 'pending', 'under_review'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  taxRegistrationStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  rssbStatus: {
    type: DataTypes.ENUM('registered', 'not_registered', 'pending', 'suspended'),
    allowNull: false,
    defaultValue: 'not_registered'
  },
  
  // Compliance Tracking
  lastVATReturn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  lastCorporateTaxReturn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  lastRSSBContribution: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  nextVATDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  nextCorporateTaxDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  nextRSSBDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Company Status
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'liquidated', 'merged'),
    allowNull: false,
    defaultValue: 'active'
  },
  
  isVATRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  isRSSBRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Documents and Files
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  businessLicense: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  taxCertificate: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  // Settings and Preferences
  settings: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      autoVATCalculation: true,
      autoTaxReminders: true,
      multiCurrencyEnabled: false,
      complianceAlerts: true,
      language: 'en',
      timezone: 'Africa/Kigali'
    }
  },
  
  // Audit fields
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Company',
  tableName: 'companies',
  timestamps: true,
  paranoid: true, // Soft delete
  
  // Indexes
  indexes: [
    {
      unique: true,
      fields: ['tin']
    },
    {
      unique: true,
      fields: ['vat_number']
    },
    {
      unique: true,
      fields: ['rdb_registration_number']
    },
    {
      fields: ['status']
    },
    {
      fields: ['compliance_status']
    },
    {
      fields: ['business_type']
    },
    {
      fields: ['city']
    },
    {
      fields: ['created_at']
    }
  ],
  
  // Hooks
  hooks: {
    beforeCreate: async (company) => {
      // Set next compliance deadlines
      company.setNextComplianceDeadlines();
    },
    
    beforeUpdate: async (company) => {
      // Update compliance deadlines if fiscal year changes
      if (company.changed('fiscalYearStart') || company.changed('fiscalYearEnd')) {
        company.setNextComplianceDeadlines();
      }
    }
  }
});

// Instance methods
Company.prototype.setNextComplianceDeadlines = function() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // VAT deadline (15th of next month)
  const nextMonth = new Date(currentYear, now.getMonth() + 1, 15);
  this.nextVATDeadline = nextMonth;
  
  // Corporate tax deadline (90 days after fiscal year end)
  const fiscalYearEnd = new Date(currentYear, 11, 31); // December 31st
  const corporateTaxDeadline = new Date(fiscalYearEnd);
  corporateTaxDeadline.setDate(corporateTaxDeadline.getDate() + 90);
  this.nextCorporateTaxDeadline = corporateTaxDeadline;
  
  // RSSB deadline (15th of next month)
  this.nextRSSBDeadline = nextMonth;
};

Company.prototype.updateComplianceStatus = function() {
  const now = new Date();
  let compliant = true;
  
  // Check VAT compliance
  if (this.isVATRegistered && this.nextVATDeadline < now) {
    compliant = false;
  }
  
  // Check corporate tax compliance
  if (this.nextCorporateTaxDeadline < now) {
    compliant = false;
  }
  
  // Check RSSB compliance
  if (this.isRSSBRegistered && this.nextRSSBDeadline < now) {
    compliant = false;
  }
  
  this.complianceStatus = compliant ? 'compliant' : 'non_compliant';
  return this.complianceStatus;
};

Company.prototype.getComplianceSummary = function() {
  return {
    status: this.complianceStatus,
    vatStatus: this.isVATRegistered ? 'registered' : 'not_registered',
    rssbStatus: this.rssbStatus,
    nextDeadlines: {
      vat: this.nextVATDeadline,
      corporateTax: this.nextCorporateTaxDeadline,
      rssb: this.nextRSSBDeadline
    },
    lastSubmissions: {
      vat: this.lastVATReturn,
      corporateTax: this.lastCorporateTaxReturn,
      rssb: this.lastRSSBContribution
    }
  };
};

// Class methods
Company.findByTIN = async function(tin) {
  return this.findOne({ where: { tin } });
};

Company.findByVATNumber = async function(vatNumber) {
  return this.findOne({ where: { vatNumber } });
};

Company.findCompliant = async function() {
  return this.findAll({ where: { complianceStatus: 'compliant' } });
};

Company.findNonCompliant = async function() {
  return this.findAll({ where: { complianceStatus: 'non_compliant' } });
};

Company.findByDistrict = async function(district) {
  return this.findAll({ where: { district } });
};

Company.findByBusinessType = async function(businessType) {
  return this.findAll({ where: { businessType } });
};

// Export the model
export { Company };
