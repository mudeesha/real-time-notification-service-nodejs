const userSockets = {};

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('register', (userId) => {
      if (!userId) return;
      
      // Initialize array if not exists
      if (!userSockets[userId]) {
        userSockets[userId] = [];
      }
      
      // Add new socket to array
      userSockets[userId].push(socket);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Find and remove disconnected socket from all users
      for (const userId in userSockets) {
        userSockets[userId] = userSockets[userId].filter(
          sock => sock.id !== socket.id
        );
        
        // Clean up empty arrays
        if (userSockets[userId].length === 0) {
          delete userSockets[userId];
        }
      }
    });
  });
}

function emitToUser(userId, event, payload) {
  const sockets = userSockets[userId];
  if (sockets && sockets.length > 0) {
    sockets.forEach(socket => {
      socket.emit(event, payload);
    });
  }
}

function isUserConnected(userId) {
  return userSockets[userId] && userSockets[userId].length > 0;
}

module.exports = {
  socketHandler,
  emitToUser,
  isUserConnected,
};
