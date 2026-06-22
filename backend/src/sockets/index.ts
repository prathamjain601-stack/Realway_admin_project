import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  id: number;
  role: string;
  socketId: string;
}

export const setupSockets = (io: Server) => {
  let connectedUsers = new Map<string, SocketUser>();

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_prod');
        socket.data.userId = decoded.id;
        socket.data.role = decoded.role;
      } catch (err) {
        // Allow unauthenticated connections for basic metrics
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    if (userId) {
      connectedUsers.set(socket.id, { id: userId, role, socketId: socket.id });
      // Auto-join user's private room
      socket.join(`user_${userId}`);

      // Admin users auto-join admin room
      if (role === 'Admin' || role === 'Manager') {
        socket.join('admin_room');
      }
    }

    console.log(`Socket connected: ${socket.id} (user: ${userId || 'anonymous'}). Total: ${connectedUsers.size}`);

    // Broadcast live user count
    io.emit('metrics:users', { count: connectedUsers.size });

    // User login event
    socket.on('user:login', (data) => {
      io.to('admin_room').emit('activity:log', {
        action: 'USER_LOGIN',
        userId: data.userId,
        email: data.email,
        timestamp: new Date(),
      });
    });

    // User logout event
    socket.on('user:logout', (data) => {
      io.to('admin_room').emit('activity:log', {
        action: 'USER_LOGOUT',
        userId: data.userId,
        timestamp: new Date(),
      });
    });

    // Admin chat message
    socket.on('admin:chat', (data) => {
      io.to('admin_room').emit('admin:chat:message', {
        userId: socket.data.userId,
        message: data.message,
        senderName: data.senderName,
        timestamp: new Date(),
      });
    });

    // Join specific room
    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log(`Socket disconnected: ${socket.id}. Total: ${connectedUsers.size}`);
      io.emit('metrics:users', { count: connectedUsers.size });
    });
  });

  // Export service functions for use from REST controllers
  return {
    emitNotification: (userId: number, payload: any) => {
      io.to(`user_${userId}`).emit('notification:new', payload);
    },
    emitSystemAlert: (payload: any) => {
      io.to('admin_room').emit('alert:system', payload);
    },
    emitActivityLog: (payload: any) => {
      io.to('admin_room').emit('activity:log', payload);
    },
    emitContentUpdate: (payload: any) => {
      io.emit('content:published', payload);
    },
    emitMetricsUpdate: (payload: any) => {
      io.emit('metrics:update', payload);
    },
    getConnectedCount: () => connectedUsers.size,
  };
};
