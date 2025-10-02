/**
 * MEETING MODEL - Meeting Minutes Database Model
 * 
 * This model handles:
 * - Meeting minutes storage
 * - Company association
 * - Attendee management
 * - Agenda and decisions tracking
 * 
 * FEATURES:
 * - Sequelize ORM integration
 * - Company relationship
 * - JSON fields for complex data
 * - Timestamps and validation
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  type: {
    type: DataTypes.ENUM('AGM', 'EGM', 'Board', 'Committee', 'Special'),
    allowNull: false,
    defaultValue: 'Board'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  chairperson: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  secretary: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  attendees: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidAttendees(value) {
        if (!Array.isArray(value)) {
          throw new Error('Attendees must be an array');
        }
        value.forEach((attendee, index) => {
          if (!attendee.name || !attendee.role) {
            throw new Error(`Attendee ${index + 1} must have name and role`);
          }
        });
      }
    }
  },
  agenda: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidAgenda(value) {
        if (!Array.isArray(value)) {
          throw new Error('Agenda must be an array');
        }
        value.forEach((item, index) => {
          // Accept both string and object formats
          if (typeof item === 'string') {
            if (item.trim() === '') {
              throw new Error(`Agenda item ${index + 1} must be a non-empty string`);
            }
          } else if (typeof item === 'object' && item !== null) {
            if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
              throw new Error(`Agenda item ${index + 1} must have a non-empty description`);
            }
          } else {
            throw new Error(`Agenda item ${index + 1} must be a string or object with description`);
          }
        });
      }
    }
  },
  discussions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  decisions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidDecisions(value) {
        if (!Array.isArray(value)) {
          throw new Error('Decisions must be an array');
        }
        value.forEach((item, index) => {
          // Accept both string and object formats
          if (typeof item === 'string') {
            if (item.trim() === '') {
              throw new Error(`Decision ${index + 1} must be a non-empty string`);
            }
          } else if (typeof item === 'object' && item !== null) {
            if (!item.decision || typeof item.decision !== 'string' || item.decision.trim() === '') {
              throw new Error(`Decision ${index + 1} must have a non-empty decision field`);
            }
          } else {
            throw new Error(`Decision ${index + 1} must be a string or object with decision field`);
          }
        });
      }
    }
  },
  actionItems: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidActionItems(value) {
        if (!Array.isArray(value)) {
          throw new Error('Action items must be an array');
        }
        value.forEach((item, index) => {
          // Accept both string and object formats
          if (typeof item === 'string') {
            if (item.trim() === '') {
              throw new Error(`Action item ${index + 1} must be a non-empty string`);
            }
          } else if (typeof item === 'object' && item !== null) {
            if (!item.task || typeof item.task !== 'string' || item.task.trim() === '') {
              throw new Error(`Action item ${index + 1} must have a non-empty task field`);
            }
          } else {
            throw new Error(`Action item ${index + 1} must be a string or object with task field`);
          }
        });
      }
    }
  },
  nextMeetingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Scheduled'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'meetings',
  timestamps: true,
  indexes: [
    {
      fields: ['company_id']
    },
    {
      fields: ['date']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    }
  ]
});

// Instance methods
Meeting.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    title: this.title,
    type: this.type,
    date: this.date,
    time: this.time,
    location: this.location,
    chairperson: this.chairperson,
    secretary: this.secretary,
    attendees: this.attendees,
    agenda: this.agenda,
    discussions: this.discussions,
    decisions: this.decisions,
    actionItems: this.actionItems,
    nextMeetingDate: this.nextMeetingDate,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Class methods
Meeting.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, type, status, startDate, endDate } = options;
  
  const whereClause = { company_id: companyId };
  
  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (startDate) whereClause.date = { ...whereClause.date, [sequelize.Op.gte]: startDate };
  if (endDate) whereClause.date = { ...whereClause.date, [sequelize.Op.lte]: endDate };
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

Meeting.getStatistics = async function(companyId) {
  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  
  const [
    total,
    completed,
    scheduled,
    thisYearCount,
    thisMonthCount,
    byType
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.count({ where: { company_id: companyId, status: 'Completed' } }),
    this.count({ where: { company_id: companyId, status: 'Scheduled' } }),
    this.count({ 
      where: { 
        company_id: companyId,
        date: {
          [sequelize.Op.gte]: `${thisYear}-01-01`,
          [sequelize.Op.lte]: `${thisYear}-12-31`
        }
      } 
    }),
    this.count({ 
      where: { 
        company_id: companyId,
        date: {
          [sequelize.Op.gte]: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}-01`,
          [sequelize.Op.lte]: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}-31`
        }
      } 
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    })
  ]);
  
  const typeStats = {};
  byType.forEach(item => {
    typeStats[item.type] = parseInt(item.count);
  });
  
  return {
    total,
    completed,
    scheduled,
    thisYear: thisYearCount,
    thisMonth: thisMonthCount,
    byType: typeStats
  };
};

export default Meeting;
