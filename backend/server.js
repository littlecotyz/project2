const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const { Sequelize } = require('sequelize');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/teams');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://taskuser:taskpass@localhost:5432/taskdb', {
  dialect: 'postgres',
  logging: false,
});

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync(); // Sync models
  })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io for chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinTask', (taskId) => {
    socket.join(taskId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.taskId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { sequelize };