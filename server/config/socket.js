// config/socket.js
// Holds a single Socket.IO instance so controllers can emit events
// without needing to import server.js directly (avoids circular deps).

let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: { origin: process.env.CLIENT_ORIGIN || '*' }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.IO not initialized — call init(server) first');
    return io;
  }
};