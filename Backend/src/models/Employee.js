/**
 * EMPLOYEE MODEL
 * 
 * This model represents employees in the company
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Employee = sequelize.define('Employee', {
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
  employee_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF'
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'terminated', 'on_leave', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'check', 'cash'),
    allowNull: false,
    defaultValue: 'bank_transfer'
  },
  bank_account: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  housing_allowance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  transport_allowance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  meal_allowance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
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
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Employee.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    person_id: this.person_id,
    employee_id: this.employee_id,
    position: this.position,
    department: this.department,
    salary: this.salary,
    currency: this.currency,
    hire_date: this.hire_date,
    termination_date: this.termination_date,
    status: this.status,
    payment_method: this.payment_method,
    bank_account: this.bank_account,
    housing_allowance: this.housing_allowance,
    transport_allowance: this.transport_allowance,
    meal_allowance: this.meal_allowance,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Static methods
Employee.getStatistics = async function(companyId) {
  const totalEmployees = await this.count({ where: { company_id: companyId } });
  const activeEmployees = await this.count({ 
    where: { company_id: companyId, status: 'active' } 
  });
  
  return {
    totalEmployees,
    activeEmployees,
    terminatedEmployees: totalEmployees - activeEmployees
  };
};

export default Employee;
