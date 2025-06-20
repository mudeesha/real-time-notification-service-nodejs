// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const bodyParser = require('body-parser');
// const db = require('./db');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Allow all for now, restrict later
//     methods: ['GET', 'POST']
//   }
// });

// app.use(cors());
// app.use(bodyParser.json());

// // Store connected sockets by user ID
// const userSockets = {};

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('register', (userId) => {
//     console.log(`User ${userId} registered with socket ${socket.id}`);
//     userSockets[userId] = socket;
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//     // Remove disconnected socket
//     for (const userId in userSockets) {
//       if (userSockets[userId].id === socket.id) {
//         delete userSockets[userId];
//         break;
//       }
//     }
//   });
// });

// // Receive notification and broadcast
// app.post('/notifications', async (req, res) => {
//   console.log("hi...");
  
//   try {
//     const { id, notifiable_id, notifiable_type, type, data } = req.body;

//     await db.execute(
//       'INSERT INTO notifications (id, notifiable_id, notifiable_type, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
//       [id, notifiable_id, notifiable_type, type, data, new Date(), new Date()]
//     );


//     // Emit to the correct user
//     const socket = userSockets[notifiable_id];
//     if (socket) {
//       socket.emit('notification.sent', {
//         id,
//         notifiable_id,
//         notifiable_type,
//         type,
//         data
//       });
//       console.log(`Notification sent to user ${notifiable_id}`);
//     }

//     res.status(201).json({ message: 'Notification stored and emitted' });
//   } catch (err) {
//     console.error('Notifications error:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// //Get notifications for a user
// app.get('/notifications', async (req, res) => {
//   const userId = req.query.user_id;

//   if (!userId) {
//     return res.status(400).json({ error: 'user_id query param is required' });
//   }

//   try {
//     const [notifications] = await db.query(
//       'SELECT * FROM notifications WHERE notifiable_id = ? ORDER BY created_at DESC',
//       [userId]
//     );

//     const parsedNotifications = notifications.map(notification => {
//       if (notification.data) {
//         try {
//           notification.data = JSON.parse(notification.data);
//         } catch (err) {
//           console.error('Error parsing data field:', err);
//         }
//       }
//       return notification;
//     });

//     res.json(parsedNotifications);
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // PUT /notifications/clear-all?user_id=4
// app.put('/notifications/clear-all', async (req, res) => {
//   const userId = req.body.user_id;
//   console.log('Clear notifications for user:', userId);

//   if (!userId) {
//       return res.status(400).json({ message: 'Missing user_id' });
//   }

//   try {
//       const [result] = await db.query(
//           'UPDATE notifications SET read_at = ? WHERE notifiable_id = ? AND read_at IS NULL',
//           [new Date(), userId]
//       );

//       res.json({
//           message: 'All unread notifications marked as read.',
//           affectedRows: result.affectedRows
//       });
//   } catch (err) {
//       console.error('Error clearing notifications:', err);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // src/index.js or routes file
// app.put('/notifications/read/:id', async (req, res) => {
//   const notificationId = req.params.id;

//   try {
//     const [result] = await db.query(
//       'UPDATE notifications SET read_at = ? WHERE id = ?',
//       [new Date(), notificationId]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }

//     return res.json({ message: 'Notification marked as read' });
//   } catch (err) {
//     console.error('Error marking notification as read:', err);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });



// server.listen(process.env.PORT || 4000, process.env.HOST, () => {
//   console.log(`Server running on port ${process.env.PORT || 4000}`);
// });
