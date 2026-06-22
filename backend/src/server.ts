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
import { setupSockets } from './sockets';
import { apiLimiter } from './middleware/rateLimiter';
import { trackRequest, startMetricsCollector } from './services/metricsCollector';

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

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Realway Aura API is running.', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  // Start metrics collection (every 60 seconds)
  startMetricsCollector(60000);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
