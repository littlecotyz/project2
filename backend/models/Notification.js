const { DataTypes } = require('sequelize');
const { sequelize } = require('../server');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('task_assigned', 'deadline_approaching', 'comment_added'),
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;