/**
 * CREATE MEETINGS TABLE MIGRATION
 * 
 * This migration creates the meetings table for storing meeting minutes
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('meetings', {
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
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
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
      allowNull: false
    },
    chairperson: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    secretary: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    attendees: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    agenda: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    discussions: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    decisions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    actionItems: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
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
  });

  // Add indexes for better performance
  await queryInterface.addIndex('meetings', ['company_id']);
  await queryInterface.addIndex('meetings', ['date']);
  await queryInterface.addIndex('meetings', ['type']);
  await queryInterface.addIndex('meetings', ['status']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('meetings');
};
