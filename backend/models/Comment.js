const { DataTypes } = require('sequelize');
const { sequelize } = require('../server');
const User = require('./User');
const Task = require('./Task');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Task,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

module.exports = Comment;