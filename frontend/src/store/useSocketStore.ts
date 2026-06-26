import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface ActivityEvent {
  action: string;
  userId?: number;
  email?: string;
  userName?: string;
  entityType?: string;
  entityId?: number;
  message?: string;
  timestamp: string;
}

interface SystemAlert {
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

interface ChatMsg {
  id: number;
  senderId: number;
  message: string;
  createdAt: string;
  sender?: { id: number; email: string; firstName: string; lastName: string; role: string } | null;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  liveUsers: number;
  recentActivity: ActivityEvent[];
  systemAlerts: SystemAlert[];
  chatMessages: ChatMsg[];
  unreadChat: number;
  connect: (token?: string) => void;
  disconnect: () => void;
  addChatMessage: (msg: ChatMsg) => void;
  clearUnreadChat: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  liveUsers: 0,
  recentActivity: [],
  systemAlerts: [],
  chatMessages: [],
  unreadChat: 0,
  connect: (token?: string) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('metrics:users', (data: { count: number }) => {
      set({ liveUsers: data.count });
    });

    // Real-time activity feed
    socket.on('activity:log', (data: ActivityEvent) => {
      set((state) => ({
        recentActivity: [data, ...state.recentActivity].slice(0, 50),
      }));
    });

    // System alerts
    socket.on('alert:system', (data: SystemAlert) => {
      set((state) => ({
        systemAlerts: [data, ...state.systemAlerts].slice(0, 20),
      }));
    });

    // Admin chat messages
    socket.on('admin:chat:message', (data: ChatMsg) => {
      set((state) => ({
        chatMessages: [...state.chatMessages, data],
        unreadChat: state.unreadChat + 1,
      }));
    });

    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  addChatMessage: (msg: ChatMsg) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    }));
  },
  clearUnreadChat: () => {
    set({ unreadChat: 0 });
  },
}));
