require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { socketHandler } = require('./sockets/socketHandler');
const initializeTables = require('./dbInit');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach Socket.IO logic
socketHandler(io);

// Run DB init before starting server
initializeTables().then(() => {
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, process.env.HOST, () => {
    console.log(`Server running on port ${PORT}`);
  });
});