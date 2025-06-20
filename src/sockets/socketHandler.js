const userSockets = {};

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('register', (userId) => {
      console.log(`User ${userId} registered with socket ${socket.id}`);
      userSockets[userId] = socket;
    });

    socket.on('disconnect', () => {
      for (const userId in userSockets) {
        if (userSockets[userId].id === socket.id) {
          delete userSockets[userId];
          break;
        }
      }
    });
  });
}

// ✅ Export both handler and utility
function emitToUser(userId, event, payload) {
  const socket = userSockets[userId];
  if (socket) {
    socket.emit(event, payload);
  }
}

module.exports = {
  socketHandler,
  emitToUser,
};
