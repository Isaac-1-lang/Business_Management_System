/**
 * DOCUMENT VAULT MODEL - Document Management System
 * 
 * This model handles:
 * - Document storage and organization
 * - Document categories and tags
 * - Version control and history
 * - Access permissions and sharing
 * - Document lifecycle management
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const DocumentCategory = sequelize.define('DocumentCategory', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'document_categories',
      key: 'id'
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#3B82F6',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'folder'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'document_categories',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['parent_id'] },
    { fields: ['is_active'] }
  ]
});

const Document = sequelize.define('Document', {
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
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'document_categories',
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  original_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  file_extension: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  is_current_version: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  parent_document_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  document_type: {
    type: DataTypes.ENUM('contract', 'agreement', 'report', 'invoice', 'receipt', 'certificate', 'license', 'permit', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived', 'deleted'),
    allowNull: false,
    defaultValue: 'active'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  access_level: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'),
    allowNull: false,
    defaultValue: 'internal'
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  reminder_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  download_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'documents',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['category_id'] },
    { fields: ['parent_document_id'] },
    { fields: ['status'] },
    { fields: ['document_type'] },
    { fields: ['access_level'] },
    { fields: ['uploaded_by'] },
    { fields: ['expiry_date'] },
    { fields: ['created_at'] }
  ]
});

const DocumentAccess = sequelize.define('DocumentAccess', {
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
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  access_type: {
    type: DataTypes.ENUM('read', 'write', 'admin'),
    allowNull: false,
    defaultValue: 'read'
  },
  granted_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  granted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'document_access',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['document_id'] },
    { fields: ['user_id'] },
    { fields: ['role_id'] },
    { fields: ['access_type'] },
    { fields: ['is_active'] }
  ]
});

const DocumentActivity = sequelize.define('DocumentActivity', {
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
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  activity_type: {
    type: DataTypes.ENUM('created', 'updated', 'downloaded', 'viewed', 'shared', 'deleted', 'restored', 'moved'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'document_activities',
  timestamps: true,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['document_id'] },
    { fields: ['user_id'] },
    { fields: ['activity_type'] },
    { fields: ['created_at'] }
  ]
});

// Instance methods
DocumentCategory.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    name: this.name,
    description: this.description,
    parent_id: this.parent_id,
    color: this.color,
    icon: this.icon,
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

Document.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    category_id: this.category_id,
    title: this.title,
    description: this.description,
    file_name: this.file_name,
    original_file_name: this.original_file_name,
    file_size: parseInt(this.file_size),
    mime_type: this.mime_type,
    file_extension: this.file_extension,
    version: this.version,
    is_current_version: this.is_current_version,
    parent_document_id: this.parent_document_id,
    document_type: this.document_type,
    status: this.status,
    tags: this.tags,
    metadata: this.metadata,
    access_level: this.access_level,
    expiry_date: this.expiry_date,
    reminder_date: this.reminder_date,
    uploaded_by: this.uploaded_by,
    download_count: this.download_count,
    last_accessed_at: this.last_accessed_at,
    notes: this.notes,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

DocumentAccess.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    document_id: this.document_id,
    user_id: this.user_id,
    role_id: this.role_id,
    access_type: this.access_type,
    granted_by: this.granted_by,
    granted_at: this.granted_at,
    expires_at: this.expires_at,
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

DocumentActivity.prototype.getPublicData = function() {
  return {
    id: this.id,
    company_id: this.company_id,
    document_id: this.document_id,
    user_id: this.user_id,
    activity_type: this.activity_type,
    description: this.description,
    metadata: this.metadata,
    ip_address: this.ip_address,
    user_agent: this.user_agent,
    created_at: this.created_at
  };
};

// Class methods
Document.getByCompany = async function(companyId, options = {}) {
  const { page = 1, limit = 10, category_id, document_type, status, access_level, search } = options;
  
  const whereClause = { company_id: companyId };
  
  if (category_id) whereClause.category_id = category_id;
  if (document_type) whereClause.document_type = document_type;
  if (status) whereClause.status = status;
  if (access_level) whereClause.access_level = access_level;
  if (search) {
    whereClause[sequelize.Op.or] = [
      { title: { [sequelize.Op.iLike]: `%${search}%` } },
      { description: { [sequelize.Op.iLike]: `%${search}%` } },
      { original_file_name: { [sequelize.Op.iLike]: `%${search}%` } }
    ];
  }
  
  const offset = (page - 1) * limit;
  
  return await this.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
};

Document.getStatistics = async function(companyId) {
  const [
    totalDocuments,
    totalSize,
    byType,
    byStatus,
    byCategory,
    expiringSoon
  ] = await Promise.all([
    this.count({ where: { company_id: companyId } }),
    this.sum('file_size', { where: { company_id: companyId } }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'document_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['document_type'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    this.findAll({
      where: { company_id: companyId },
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category_id'],
      raw: true
    }),
    this.count({
      where: {
        company_id: companyId,
        expiry_date: {
          [sequelize.Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      }
    })
  ]);
  
  const typeStats = {};
  byType.forEach(item => {
    typeStats[item.document_type] = parseInt(item.count);
  });
  
  const statusStats = {};
  byStatus.forEach(item => {
    statusStats[item.status] = parseInt(item.count);
  });
  
  const categoryStats = {};
  byCategory.forEach(item => {
    categoryStats[item.category_id] = parseInt(item.count);
  });
  
  return {
    total_documents: totalDocuments,
    total_size: parseInt(totalSize || 0),
    expiring_soon: expiringSoon,
    by_type: typeStats,
    by_status: statusStats,
    by_category: categoryStats
  };
};

export { DocumentCategory, Document, DocumentAccess, DocumentActivity };
