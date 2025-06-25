const userSockets = {};

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('register', (userId) => {
      if (!userId) return;
      console.log(`User ${userId} registered with socket ${socket.id}`);
      userSockets[userId] = socket;
    });

    socket.on('disconnect', () => {
      for (const userId in userSockets) {
        if (userSockets[userId].id === socket.id) {
          console.log(`User ${userId} disconnected`);
          delete userSockets[userId];
          break;
        }
      }
    });
  });
}

function emitToUser(userId, event, payload) {
  const socket = userSockets[userId];
  if (socket) {
    socket.emit(event, payload);
  }
}

function isUserConnected(userId) {
  return !!userSockets[userId];
}

module.exports = {
  socketHandler,
  emitToUser,
  isUserConnected,
};
