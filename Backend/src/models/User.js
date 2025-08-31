/**
 * USER MODEL - Sequelize Model
 * 
 * This model represents users in the system with:
 * - Authentication credentials
 * - Personal information
 * - Role-based permissions
 * - Company associations
 * - Security features
 * 
 * FEATURES:
 * - Password hashing with bcrypt
 * - JWT token management
 * - Role-based access control
 * - Multi-company support
 * - Audit trail
 */

import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../database/connection.js';

class User extends Model {
  // Instance methods
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async hashPassword() {
    if (this.changed('password')) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Get full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Check if user is admin
  get isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is company owner
  get isCompanyOwner() {
    return this.role === 'owner';
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  // Personal Information
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^(\+250|0)?7[2389][0-9]{7}$/ // Rwanda phone format
    }
  },
  
  // Authentication
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255],
      notEmpty: true
    }
  },
  
  // Role and Permissions
  role: {
    type: DataTypes.ENUM('admin', 'owner', 'manager', 'accountant', 'hr', 'employee', 'viewer'),
    allowNull: false,
    defaultValue: 'employee',
    validate: {
      isIn: [['admin', 'owner', 'manager', 'accountant', 'hr', 'employee', 'viewer']]
    }
  },
  
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Permissions must be an array');
        }
      }
    }
  },
  
  // Account Status
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Security
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Profile
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      isPast: true
    }
  },
  
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Rwanda'
  },
  
  // Preferences
  language: {
    type: DataTypes.ENUM('en', 'rw', 'fr'),
    allowNull: false,
    defaultValue: 'en'
  },
  
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Africa/Kigali'
  },
  
  currency: {
    type: DataTypes.ENUM('RWF', 'USD', 'EUR'),
    allowNull: false,
    defaultValue: 'RWF'
  },
  
  // Notification preferences
  notificationPreferences: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      email: true,
      sms: false,
      push: true,
      inApp: true
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
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true, // Soft delete
  
  // Indexes
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ],
  
  // Hooks
  hooks: {
    beforeCreate: async (user) => {
      await user.hashPassword();
    },
    
    beforeUpdate: async (user) => {
      await user.hashPassword();
    },
    
    beforeSave: async (user) => {
      // Update last password change if password was modified
      if (user.changed('password')) {
        user.lastPasswordChange = new Date();
      }
    }
  }
});

// Class methods
User.findByEmail = async function(email) {
  return this.findOne({ where: { email: email.toLowerCase() } });
};

User.findActiveUsers = async function() {
  return this.findAll({ where: { isActive: true } });
};

User.findByRole = async function(role) {
  return this.findAll({ where: { role, isActive: true } });
};

User.findByCompany = async function(companyId) {
  return this.findAll({
    include: [{
      model: sequelize.models.Company,
      as: 'companies',
      where: { id: companyId },
      through: { attributes: ['role'] }
    }],
    where: { isActive: true }
  });
};

// Instance methods
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.passwordResetToken;
  delete values.passwordResetExpires;
  delete values.emailVerificationToken;
  delete values.emailVerificationExpires;
  return values;
};

User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt
  };
};

User.prototype.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

User.prototype.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.permissions.includes(permission));
};

User.prototype.hasAllPermissions = function(permissions) {
  return permissions.every(permission => this.permissions.includes(permission));
};

// Export the model
export { User };
