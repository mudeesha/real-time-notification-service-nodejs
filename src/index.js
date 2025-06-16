const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for now, restrict later
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(bodyParser.json());

// Store connected sockets by user ID
const userSockets = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);
    userSockets[userId] = socket;
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove disconnected socket
    for (const userId in userSockets) {
      if (userSockets[userId].id === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

// Receive notification and broadcast
app.post('/notify', async (req, res) => {
  try {
    const { id, notifiable_id, notifiable_type, type, data } = req.body;

    await db.execute(
      'INSERT INTO notifications (id, notifiable_id, notifiable_type, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, notifiable_id, notifiable_type, type, data, new Date(), new Date()]
    );


    // Emit to the correct user
    const socket = userSockets[notifiable_id];
    if (socket) {
      socket.emit('notification.sent', {
        id,
        notifiable_id,
        notifiable_type,
        type,
        data
      });
      console.log(`Notification sent to user ${notifiable_id}`);
    }

    res.status(201).json({ message: 'Notification stored and emitted' });
  } catch (err) {
    console.error('Notify error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
