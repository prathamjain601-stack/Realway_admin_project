import { Server, Socket } from 'socket.io';

export const setupSockets = (io: Server) => {
  let connectedUsers = 0;

  io.on('connection', (socket: Socket) => {
    connectedUsers++;
    console.log(`Socket connected: ${socket.id}. Total: ${connectedUsers}`);
    
    // Broadcast live user count
    io.emit('metrics:users', { count: connectedUsers });

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      connectedUsers--;
      console.log(`Socket disconnected: ${socket.id}. Total: ${connectedUsers}`);
      io.emit('metrics:users', { count: connectedUsers });
    });
  });

  // Export a function to allow emitting events from REST controllers
  return {
    emitNotification: (userId: number, payload: any) => {
      io.to(`user_${userId}`).emit('notification', payload);
    },
    emitSystemAlert: (payload: any) => {
      io.to('admin_room').emit('alert:system', payload);
    }
  };
};
