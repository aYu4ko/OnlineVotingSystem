const { Server } = require('socket.io');

let io;

module.exports = {
  // Initializes the Socket.io server
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST']
      }
    });
    
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        
        socket.on('join_event_room', (eventId) => {
            socket.join(eventId);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    
    return io;
  },
  
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io instance not initialized!');
    }
    return io;
  },
  
  emitVoteUpdate: (eventId, newResults) => {
    if (io) {
        io.to(eventId).emit('vote_update', { eventId, results: newResults });
    }
  }
};