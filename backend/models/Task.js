const { DataTypes } = require('sequelize');
const { sequelize } = require('../server');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'done'),
    defaultValue: 'todo',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

Task.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

module.exports = Task;