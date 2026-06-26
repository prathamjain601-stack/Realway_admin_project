import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import { sequelize } from './models';
import { setupSwagger } from './swagger';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import contentRoutes from './routes/contentRoutes';
import metricRoutes from './routes/metricRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import { setupSockets } from './sockets';
import { apiLimiter } from './middleware/rateLimiter';
import { trackRequest, startMetricsCollector } from './services/metricsCollector';
import { ErrorLog } from './models';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export const socketService = setupSockets(io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// API response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    trackRequest(Date.now() - start);
  });
  next();
});

// Global rate limiter
app.use('/api/', apiLimiter);

// Setup Swagger
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Realway Aura API is running.', timestamp: new Date() });
});

// Global error handler — captures unhandled errors and logs them to ErrorLog
app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);

  try {
    await ErrorLog.create({
      level: 'error',
      message: err.message || 'Unknown error',
      stack: err.stack || null,
      endpoint: req.originalUrl || null,
      method: req.method || null,
      statusCode: err.status || 500,
      userId: (req as any).user?.id || null,
    });
  } catch (logErr) {
    console.error('Failed to save error log:', logErr);
  }

  // Emit system alert for critical errors
  if (socketService) {
    socketService.emitSystemAlert({
      type: 'error',
      severity: 'high',
      message: `Server error on ${req.method} ${req.originalUrl}: ${err.message}`,
      timestamp: new Date(),
    });
  }

  res.status(err.status || 500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  // Start metrics collection (every 60 seconds) with socket service for alerts
  startMetricsCollector(60000, socketService);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
